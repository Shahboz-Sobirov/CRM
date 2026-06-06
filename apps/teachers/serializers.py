from rest_framework import serializers
from .models import Teacher
from apps.accounts.serializers import UserSerializer


class TeacherSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'user_details', 'full_name', 'email',
            'specialty', 'bio', 'hire_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_user(self, value):
        if value.role != 'teacher':
            raise serializers.ValidationError("Selected user must have 'teacher' role")
        if hasattr(value, 'teacher_profile'):
            raise serializers.ValidationError("This user already has a teacher profile")
        return value


class TeacherCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['user', 'specialty', 'bio', 'hire_date']

    def validate_user(self, value):
        if value.role != 'teacher':
            raise serializers.ValidationError("Selected user must have 'teacher' role")
        if hasattr(value, 'teacher_profile'):
            raise serializers.ValidationError("This user already has a teacher profile")
        return value


class TeacherListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)

    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'email', 'specialty', 'hire_date']
