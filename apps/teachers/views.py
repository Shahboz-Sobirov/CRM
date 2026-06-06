from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from apps.classes.serializers import GroupSerializer
from .models import Teacher
from .serializers import TeacherSerializer, TeacherCreateSerializer, TeacherListSerializer
from core.permissions import IsAdmin, IsManager


@extend_schema_view(
    get=extend_schema(
        tags=['Teachers'],
        summary='List all teachers',
        description='Get a list of all teachers'
    ),
    post=extend_schema(
        tags=['Teachers'],
        summary='Create a new teacher',
        description='Create a new teacher profile (Admin only)'
    )
)
class TeacherListCreateView(generics.ListCreateAPIView):
    queryset = Teacher.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TeacherCreateSerializer
        return TeacherListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


@extend_schema_view(
    get=extend_schema(
        tags=['Teachers'],
        summary='Get teacher details',
        description='Retrieve details of a specific teacher'
    ),
    put=extend_schema(
        tags=['Teachers'],
        summary='Update teacher',
        description='Update teacher information (Admin only)'
    ),
    patch=extend_schema(
        tags=['Teachers'],
        summary='Partially update teacher',
        description='Partially update teacher information (Admin only)'
    ),
    delete=extend_schema(
        tags=['Teachers'],
        summary='Delete teacher',
        description='Delete a teacher profile (Admin only)'
    )
)
class TeacherDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


@extend_schema(
    tags=['Teachers'],
    summary='Get teacher groups',
    description='Retrieve all groups/classes assigned to a specific teacher',
    parameters=[
        OpenApiParameter(
            name='pk',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description='Teacher ID'
        )
    ],
    responses={
        200: GroupSerializer(many=True),
        403: {'description': 'Permission denied'},
        404: {'description': 'Teacher not found'}
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def teacher_groups(request, pk):
    try:
        teacher = Teacher.objects.get(pk=pk)

        if request.user.role == 'teacher' and teacher.user != request.user:
            return Response(
                {"detail": "You can only view your own groups"},
                status=status.HTTP_403_FORBIDDEN
            )

        groups = teacher.groups.all()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)
    except Teacher.DoesNotExist:
        return Response({"detail": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

