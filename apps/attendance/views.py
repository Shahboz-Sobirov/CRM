from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view

from apps.classes.models import Group
from core.permissions import IsAdminManagerOrTeacher
from .models import Attendance
from .serializers import (
    AttendanceCreateSerializer,
    AttendanceListSerializer,
    AttendanceSerializer,
    BulkAttendanceSerializer,
)


def notify_parent_of_absence(attendance):
    student = attendance.student
    parent = student.parent
    if not parent or not parent.email:
        return

    subject = f"Absence notification for {student.full_name}"
    message = (
        f"Dear {parent.full_name},\n\n"
        f"We would like to inform you that {student.full_name} was marked absent on {attendance.date} "
        f"for the {attendance.group.name} group.\n"
        f"If you have any questions, please contact the school administration.\n\n"
        "Best regards,\nSchool Administration"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@schoolcrm.local')
    send_mail(subject, message, from_email, [parent.email], fail_silently=True)


@extend_schema_view(
    get=extend_schema(
        tags=['Attendance'],
        summary='List all attendance records',
        description='Get a list of all attendance records. Parents see only their children\'s attendance, teachers see attendance for their groups.',
        parameters=[
            OpenApiParameter(
                name='group',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter by group ID'
            ),
            OpenApiParameter(
                name='student',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter by student ID'
            ),
            OpenApiParameter(
                name='date',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='Filter by date (YYYY-MM-DD)'
            )
        ]
    ),
    post=extend_schema(
        tags=['Attendance'],
        summary='Create attendance record',
        description='Create a new attendance record (Manager/Admin/Teacher for owned groups)'
    )
)
class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AttendanceCreateSerializer
        return AttendanceListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminManagerOrTeacher()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.all()

        if user.role == 'parent':
            queryset = queryset.filter(student__parent=user)
        elif user.role == 'teacher':
            queryset = queryset.filter(group__teacher__user=user)

        group_id = self.request.query_params.get('group')
        student_id = self.request.query_params.get('student')
        date = self.request.query_params.get('date')

        if group_id:
            queryset = queryset.filter(group_id=group_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if date:
            queryset = queryset.filter(date=date)

        return queryset

    def perform_create(self, serializer):
        group = serializer.validated_data['group']
        user = self.request.user

        if user.role == 'teacher' and (group.teacher is None or group.teacher.user != user):
            raise PermissionDenied("You can only mark attendance for your own groups")

        attendance = serializer.save()
        if attendance.status == 'absent':
            notify_parent_of_absence(attendance)


@extend_schema_view(
    get=extend_schema(
        tags=['Attendance'],
        summary='Get attendance details',
        description='Retrieve details of a specific attendance record'
    ),
    put=extend_schema(
        tags=['Attendance'],
        summary='Update attendance',
        description='Update attendance record (Manager/Admin/Teacher for owned groups)'
    ),
    patch=extend_schema(
        tags=['Attendance'],
        summary='Partially update attendance',
        description='Partially update attendance record (Manager/Admin/Teacher for owned groups)'
    ),
    delete=extend_schema(
        tags=['Attendance'],
        summary='Delete attendance',
        description='Delete an attendance record (Manager/Admin/Teacher for owned groups)'
    )
)
class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminManagerOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        attendance = serializer.save()
        if attendance.status == 'absent':
            notify_parent_of_absence(attendance)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return Attendance.objects.filter(student__parent=user)
        if user.role == 'teacher':
            return Attendance.objects.filter(group__teacher__user=user)
        return Attendance.objects.all()


@extend_schema(
    tags=['Attendance'],
    summary='Bulk mark attendance',
    description='Mark attendance for multiple students in a group on a specific date (Manager/Admin/Teacher for owned groups)',
    request=BulkAttendanceSerializer,
    responses={
        201: AttendanceSerializer(many=True),
        400: {'description': 'Invalid data'},
        404: {'description': 'Group not found'}
    }
)
@api_view(['POST'])
@permission_classes([IsAdminManagerOrTeacher])
def mark_attendance(request):
    """
    Bulk mark attendance for a group on a specific date
    """
    serializer = BulkAttendanceSerializer(data=request.data)
    if serializer.is_valid():
        group_id = serializer.validated_data['group']
        date = serializer.validated_data['date']
        attendance_records = serializer.validated_data['attendance_records']

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response(
                {"detail": "Group not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        if user.role == 'teacher' and (group.teacher is None or group.teacher.user != user):
            return Response(
                {"detail": "You can only mark attendance for your own groups"},
                status=status.HTTP_403_FORBIDDEN
            )

        created_records = []
        for record in attendance_records:
            student_id = record.get('student_id')
            attendance_status = record.get('status', 'present')
            notes = record.get('notes', '')

            if not group.students.filter(id=student_id).exists():
                return Response(
                    {"detail": f"Student {student_id} is not enrolled in this group"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            attendance, _created = Attendance.objects.update_or_create(
                student_id=student_id,
                group=group,
                date=date,
                defaults={
                    'status': attendance_status,
                    'notes': notes
                }
            )
            if attendance.status == 'absent':
                notify_parent_of_absence(attendance)
            created_records.append(attendance)

        response_serializer = AttendanceSerializer(created_records, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
