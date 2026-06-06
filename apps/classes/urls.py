from django.urls import path
from .views import (
    GroupListCreateView,
    GroupDetailView,
    group_students
)

urlpatterns = [
    path('', GroupListCreateView.as_view(), name='group_list_create'),
    path('<int:pk>/', GroupDetailView.as_view(), name='group_detail'),
    path('<int:pk>/students/', group_students, name='group_students'),
]
