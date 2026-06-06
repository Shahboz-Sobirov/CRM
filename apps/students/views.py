from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view

from apps.attendance.serializers import AttendanceSerializer
from apps.payments.serializers import PaymentSerializer
from core.permissions import IsManager
from .models import Student
from .serializers import StudentCreateSerializer, StudentListSerializer, StudentSerializer


@extend_schema_view(
    get=extend_schema(
        tags=['Students'],
        summary='List all students',
        description='Get a list of all students. Parents see only their children, teachers see students in their groups.'
    ),
    post=extend_schema(
        tags=['Students'],
        summary='Create a new student',
        description='Create a new student record (Manager/Admin only)'
    )
)
class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudentCreateSerializer
        return StudentListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return Student.objects.filter(parent=user)
        if user.role == 'teacher':
            return Student.objects.filter(groups__teacher__user=user).distinct()
        return Student.objects.all()


@extend_schema_view(
    get=extend_schema(
        tags=['Students'],
        summary='Get student details',
        description='Retrieve details of a specific student'
    ),
    put=extend_schema(
        tags=['Students'],
        summary='Update student',
        description='Update student information (Manager/Admin only)'
    ),
    patch=extend_schema(
        tags=['Students'],
        summary='Partially update student',
        description='Partially update student information (Manager/Admin only)'
    ),
    delete=extend_schema(
        tags=['Students'],
        summary='Delete student',
        description='Delete a student record (Manager/Admin only)'
    )
)
class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return Student.objects.filter(parent=user)
        if user.role == 'teacher':
            return Student.objects.filter(groups__teacher__user=user).distinct()
        return Student.objects.all()


@extend_schema(
    tags=['Students'],
    summary='Get student attendance',
    description='Retrieve all attendance records for a specific student',
    parameters=[
        OpenApiParameter(
            name='pk',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description='Student ID'
        )
    ],
    responses={
        200: AttendanceSerializer(many=True),
        403: {'description': 'Permission denied'},
        404: {'description': 'Student not found'}
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_attendance(request, pk):
    try:
        student = Student.objects.get(pk=pk)
        user = request.user

        if user.role == 'parent' and student.parent != user:
            return Response(
                {"detail": "You don't have permission to view this student's attendance"},
                status=status.HTTP_403_FORBIDDEN
            )
        if user.role == 'teacher' and not student.groups.filter(teacher__user=user).exists():
            return Response(
                {"detail": "You don't have permission to view this student's attendance"},
                status=status.HTTP_403_FORBIDDEN
            )

        attendance = student.attendance_records.all()
        if user.role == 'teacher':
            attendance = attendance.filter(group__teacher__user=user)

        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Students'],
    summary='Get student payments',
    description='Retrieve all payment records for a specific student',
    parameters=[
        OpenApiParameter(
            name='pk',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description='Student ID'
        )
    ],
    responses={
        200: PaymentSerializer(many=True),
        403: {'description': 'Permission denied'},
        404: {'description': 'Student not found'}
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_payments(request, pk):
    try:
        student = Student.objects.get(pk=pk)
        user = request.user

        if user.role == 'parent' and student.parent != user:
            return Response(
                {"detail": "You don't have permission to view this student's payments"},
                status=status.HTTP_403_FORBIDDEN
            )
        if user.role == 'teacher' and not student.groups.filter(teacher__user=user).exists():
            return Response(
                {"detail": "You don't have permission to view this student's payments"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PaymentSerializer(student.payments.all(), many=True)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
