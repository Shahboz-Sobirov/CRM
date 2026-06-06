from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'date_joined', 'full_name']
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'role', 'password']
        extra_kwargs = {
            'email': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def validate_phone(self, value):
        if not value:
            raise serializers.ValidationError("Telefon raqami majburiy")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Normalize empty email to None to avoid unique('') clashes
        if not validated_data.get('email'):
            validated_data['email'] = None
        phone = validated_data.pop('phone')
        user = User.objects.create_user(phone=phone, password=password, **validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'phone'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['phone'] = user.phone
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, min_length=8)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match"})
        return attrs