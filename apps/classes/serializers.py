from rest_framework import serializers
from .models import Group
from apps.teachers.serializers import TeacherListSerializer
from apps.students.serializers import StudentListSerializer


class GroupSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    students_list = StudentListSerializer(source='students', many=True, read_only=True)
    teacher_details = TeacherListSerializer(source='teacher', read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'teacher', 'teacher_name', 'teacher_details',
            'students', 'students_list', 'student_count',
            'start_date', 'end_date', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name', 'teacher', 'start_date', 'end_date', 'is_active']


class GroupListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    student_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'teacher_name', 'student_count', 'start_date', 'is_active']


class AddStudentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()

    def validate_student_id(self, value):
        from apps.students.models import Student
        try:
            Student.objects.get(id=value)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Student not found")
        return value
