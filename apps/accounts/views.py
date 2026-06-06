from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer
)
from core.permissions import IsAdmin

User = get_user_model()


@extend_schema(
    tags=['Authentication'],
    summary='Register a new user',
    description='Create a new user account with email and password',
    request=UserCreateSerializer,
    responses={201: UserSerializer}
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]


@extend_schema(
    tags=['Authentication'],
    summary='Login',
    description='Obtain JWT access and refresh tokens',
    request=CustomTokenObtainPairSerializer,
    responses={200: CustomTokenObtainPairSerializer}
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema_view(
    get=extend_schema(
        tags=['Users'],
        summary='List all users',
        description='Get a list of all users (Admin only)'
    ),
    post=extend_schema(
        tags=['Users'],
        summary='Create a new user',
        description='Create a new user account (Admin only)'
    )
)
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer


@extend_schema_view(
    get=extend_schema(
        tags=['Users'],
        summary='Get user details',
        description='Retrieve details of a specific user (Admin only)'
    ),
    put=extend_schema(
        tags=['Users'],
        summary='Update user',
        description='Update user information (Admin only)'
    ),
    patch=extend_schema(
        tags=['Users'],
        summary='Partially update user',
        description='Partially update user information (Admin only)'
    ),
    delete=extend_schema(
        tags=['Users'],
        summary='Delete user',
        description='Delete a user account (Admin only)'
    )
)
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


@extend_schema(
    tags=['Authentication'],
    summary='Get current user',
    description='Get the currently authenticated user information',
    responses={200: UserSerializer}
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@extend_schema(
    tags=['Authentication'],
    summary='Change password',
    description='Change the password for the currently authenticated user',
    request=ChangePasswordSerializer,
    responses={
        200: {'description': 'Password changed successfully'},
        400: {'description': 'Invalid password'}
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"old_password": "Wrong password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

