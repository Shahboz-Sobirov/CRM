from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'group', 'group_name',
            'date', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AttendanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['student', 'group', 'date', 'status', 'notes']

    def validate(self, data):
        # Check if student is in the group
        if not data['group'].students.filter(id=data['student'].id).exists():
            raise serializers.ValidationError("Student is not enrolled in this group")
        return data


class AttendanceListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'group', 'group_name',
            'date', 'status', 'created_at'
        ]


class BulkAttendanceSerializer(serializers.Serializer):
    class AttendanceRecordSerializer(serializers.Serializer):
        student_id = serializers.IntegerField()
        status = serializers.ChoiceField(choices=Attendance.STATUS_CHOICES, required=False, default='present')
        notes = serializers.CharField(required=False, allow_blank=True)

    group = serializers.IntegerField()
    date = serializers.DateField()
    attendance_records = AttendanceRecordSerializer(many=True)
