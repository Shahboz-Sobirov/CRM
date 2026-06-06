from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'amount', 'payment_date',
            'payment_method', 'status', 'description', 'receipt_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero")
        return value


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'student', 'amount', 'payment_date', 'payment_method',
            'status', 'description', 'receipt_number'
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'receipt_number': {'required': False, 'allow_blank': True},
            'status': {'required': False},
        }

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero")
        return value


class PaymentListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'amount', 'payment_date',
            'payment_method', 'status', 'created_at'
        ]
