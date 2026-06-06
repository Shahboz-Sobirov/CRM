from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, extend_schema, extend_schema_view

from core.permissions import IsAdmin, IsManager
from .models import Payment
from .serializers import PaymentCreateSerializer, PaymentListSerializer, PaymentSerializer


@extend_schema_view(
    get=extend_schema(
        tags=['Payments'],
        summary='List all payments',
        description='Get a list of all payments. Parents see only their children\'s payments, teachers see payments for students in their groups.'
    ),
    post=extend_schema(
        tags=['Payments'],
        summary='Create a new payment',
        description='Create a new payment record (Manager/Admin only)'
    )
)
class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.select_related('student', 'student__parent')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.select_related('student', 'student__parent')

        if user.role == 'parent':
            queryset = queryset.filter(student__parent=user)
        elif user.role == 'teacher':
            queryset = queryset.filter(student__groups__teacher__user=user).distinct()

        return queryset


@extend_schema_view(
    get=extend_schema(
        tags=['Payments'],
        summary='Get payment details',
        description='Retrieve details of a specific payment'
    ),
    put=extend_schema(
        tags=['Payments'],
        summary='Update payment',
        description='Update payment information (Manager/Admin only)'
    ),
    patch=extend_schema(
        tags=['Payments'],
        summary='Partially update payment',
        description='Partially update payment information (Manager/Admin only)'
    ),
    delete=extend_schema(
        tags=['Payments'],
        summary='Delete payment',
        description='Delete a payment record (Manager/Admin only)'
    )
)
class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.select_related('student', 'student__parent')
    serializer_class = PaymentSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.select_related('student', 'student__parent')

        if user.role == 'parent':
            queryset = queryset.filter(student__parent=user)
        elif user.role == 'teacher':
            queryset = queryset.filter(student__groups__teacher__user=user).distinct()

        return queryset


@extend_schema(
    tags=['Payments'],
    summary='Get payment statistics',
    description='Get aggregated payment statistics including total amount, total payments, approved, pending, and rejected payments (Manager/Admin only)',
    responses={200: OpenApiTypes.OBJECT},
    examples=[
        OpenApiExample(
            'Payment statistics',
            value={
                'total_amount': 150000.0,
                'total_payments': 45,
                'approved_payments': 40,
                'pending_payments': 5,
                'rejected_payments': 0,
            }
        )
    ]
)
@api_view(['GET'])
@permission_classes([IsManager])
def payment_statistics(request):
    queryset = Payment.objects.all()
    totals = queryset.aggregate(total_amount=Sum('amount'))

    return Response({
        'total_amount': totals['total_amount'] or 0,
        'total_payments': queryset.count(),
        'approved_payments': queryset.filter(status='approved').count(),
        'pending_payments': queryset.filter(status='pending').count(),
        'rejected_payments': queryset.filter(status='rejected').count(),
    })


@extend_schema(
    tags=['Payments'],
    summary='Approve payment',
    description='Mark a payment as approved (Admin only)',
    request=None,
    parameters=[
        OpenApiParameter(
            name='pk',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description='Payment ID'
        )
    ],
    responses={200: PaymentSerializer}
)
@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_payment(request, pk):
    try:
        payment = Payment.objects.get(pk=pk)
    except Payment.DoesNotExist:
        return Response({"detail": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

    payment.status = 'approved'
    payment.save(update_fields=['status', 'updated_at'])
    return Response(PaymentSerializer(payment).data)


@extend_schema(
    tags=['Payments'],
    summary='Reject payment',
    description='Mark a payment as rejected (Admin only)',
    request=None,
    parameters=[
        OpenApiParameter(
            name='pk',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description='Payment ID'
        )
    ],
    responses={200: PaymentSerializer}
)
@api_view(['POST'])
@permission_classes([IsAdmin])
def reject_payment(request, pk):
    try:
        payment = Payment.objects.get(pk=pk)
    except Payment.DoesNotExist:
        return Response({"detail": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

    payment.status = 'rejected'
    payment.save(update_fields=['status', 'updated_at'])
    return Response(PaymentSerializer(payment).data)
