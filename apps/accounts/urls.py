from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    UserListCreateView,
    UserDetailView,
    current_user,
    change_password
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', current_user, name='current_user'),
    path('change-password/', change_password, name='change_password'),
    path('users/', UserListCreateView.as_view(), name='user_list_create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
