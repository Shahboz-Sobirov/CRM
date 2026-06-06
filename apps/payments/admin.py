from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'amount', 'payment_date', 'payment_method', 'status', 'receipt_number']
    list_filter = ['status', 'payment_method', 'payment_date', 'created_at']
    search_fields = ['student__first_name', 'student__last_name', 'receipt_number', 'description']
    ordering = ['-payment_date', '-created_at']
    list_per_page = 25
