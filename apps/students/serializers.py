from rest_framework import serializers
from .models import Student
from django.contrib.auth import get_user_model

User = get_user_model()


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    parent_name = serializers.CharField(source='parent.full_name', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'birth_date', 'age',
            'parent', 'parent_name', 'phone', 'address', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_parent(self, value):
        if value and value.role != 'parent':
            raise serializers.ValidationError("Selected user must have 'parent' role")
        return value


class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['first_name', 'last_name', 'birth_date', 'parent', 'phone', 'address']

    def validate_parent(self, value):
        if value and value.role != 'parent':
            raise serializers.ValidationError("Selected user must have 'parent' role")
        return value


class StudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    parent_name = serializers.CharField(source='parent.full_name', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'full_name', 'birth_date', 'parent_name', 'phone']
