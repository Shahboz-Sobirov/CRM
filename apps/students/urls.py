from django.urls import path
from .views import (
    StudentListCreateView,
    StudentDetailView,
    student_attendance,
    student_payments,
)

urlpatterns = [
    path('', StudentListCreateView.as_view(), name='student_list_create'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student_detail'),
    path('<int:pk>/attendance/', student_attendance, name='student_attendance'),
    path('<int:pk>/payments/', student_payments, name='student_payments'),
]
