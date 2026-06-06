from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view

from core.permissions import IsManager
from .models import Group
from apps.students.serializers import StudentListSerializer
from .serializers import AddStudentSerializer, GroupCreateSerializer, GroupListSerializer, GroupSerializer


@extend_schema_view(
    get=extend_schema(
        tags=['Groups'],
        summary='List all groups',
        description='Get a list of all groups/classes. Teachers see only their groups, parents see groups their children are in.',
        parameters=[
            OpenApiParameter(
                name='is_active',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filter by active status'
            )
        ]
    ),
    post=extend_schema(
        tags=['Groups'],
        summary='Create a new group',
        description='Create a new group/class (Manager/Admin only)'
    )
)
class GroupListCreateView(generics.ListCreateAPIView):
    queryset = Group.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroupCreateSerializer
        return GroupListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Group.objects.all()

        if user.role == 'teacher':
            queryset = queryset.filter(teacher__user=user)
        elif user.role == 'parent':
            queryset = queryset.filter(students__parent=user).distinct()

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset


@extend_schema_view(
    get=extend_schema(
        tags=['Groups'],
        summary='Get group details',
        description='Retrieve details of a specific group/class'
    ),
    put=extend_schema(
        tags=['Groups'],
        summary='Update group',
        description='Update group information (Manager/Admin only)'
    ),
    patch=extend_schema(
        tags=['Groups'],
        summary='Partially update group',
        description='Partially update group information (Manager/Admin only)'
    ),
    delete=extend_schema(
        tags=['Groups'],
        summary='Delete group',
        description='Delete a group/class (Manager/Admin only)'
    )
)
class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return Group.objects.filter(teacher__user=user)
        if user.role == 'parent':
            return Group.objects.filter(students__parent=user).distinct()
        return Group.objects.all()


@extend_schema(
    tags=['Groups'],
    summary='Manage group students',
    description='GET: List all students in a group. POST: Add a student to a group (Manager/Admin only)',
    parameters=[
        OpenApiParameter(
            name='pk',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description='Group ID'
        )
    ],
    request=AddStudentSerializer,
    responses={
        200: StudentListSerializer(many=True),
        403: {'description': 'Permission denied'},
        404: {'description': 'Group not found'}
    }
)
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def group_students(request, pk):
    """
    GET: List all students in a group
    POST: Add a student to a group
    """
    try:
        group = Group.objects.get(pk=pk)
    except Group.DoesNotExist:
        return Response(
            {"detail": "Group not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    user = request.user
    if user.role == 'teacher' and (group.teacher is None or group.teacher.user != user):
        return Response(
            {"detail": "You can only manage your own groups"},
            status=status.HTTP_403_FORBIDDEN
        )
    if user.role == 'parent' and not group.students.filter(parent=user).exists():
        return Response(
            {"detail": "You don't have permission to view this group"},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        students = group.students.all()
        if user.role == 'parent':
            students = students.filter(parent=user)

        serializer = StudentListSerializer(students, many=True)
        return Response(serializer.data)

    if user.role not in ['admin', 'manager']:
        return Response(
            {"detail": "You don't have permission to add students"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = AddStudentSerializer(data=request.data)
    if serializer.is_valid():
        from apps.students.models import Student

        student = Student.objects.get(id=serializer.validated_data['student_id'])
        group.students.add(student)
        return Response(
            {"detail": "Student added to group successfully"},
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
