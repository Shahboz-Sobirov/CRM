from django.urls import path
from .views import (
    AttendanceListCreateView,
    AttendanceDetailView,
    mark_attendance
)

urlpatterns = [
    path('', AttendanceListCreateView.as_view(), name='attendance_list_create'),
    path('<int:pk>/', AttendanceDetailView.as_view(), name='attendance_detail'),
    path('mark/', mark_attendance, name='mark_attendance'),
]
