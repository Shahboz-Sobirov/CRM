from django.urls import path
from .views import (
    TeacherListCreateView,
    TeacherDetailView,
    teacher_groups
)

urlpatterns = [
    path('', TeacherListCreateView.as_view(), name='teacher_list_create'),
    path('<int:pk>/', TeacherDetailView.as_view(), name='teacher_detail'),
    path('<int:pk>/groups/', teacher_groups, name='teacher_groups'),
]
