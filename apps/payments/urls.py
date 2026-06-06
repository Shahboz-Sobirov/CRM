from django.urls import path

from .views import (
    PaymentDetailView,
    PaymentListCreateView,
    approve_payment,
    payment_statistics,
    reject_payment,
)

urlpatterns = [
    path('', PaymentListCreateView.as_view(), name='payment_list_create'),
    path('statistics/', payment_statistics, name='payment_statistics'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
    path('<int:pk>/approve/', approve_payment, name='approve_payment'),
    path('<int:pk>/reject/', reject_payment, name='reject_payment'),
]
