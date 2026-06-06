from django.contrib import admin
from django.utils.html import format_html
from .models import Teacher


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name_display', 'email_display', 'specialty_badge', 'hire_date', 'created_at']
    list_filter = ['specialty', 'hire_date', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'specialty']
    ordering = ['-created_at']
    date_hierarchy = 'hire_date'
    list_per_page = 25

    fieldsets = (
        ('👤 User Information', {
            'fields': ('user',),
            'classes': ('wide',)
        }),
        ('👨‍🏫 Professional Information', {
            'fields': ('specialty', 'bio', 'hire_date'),
            'classes': ('wide',)
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def full_name_display(self, obj):
        return format_html(
            '<strong style="color: #0dcaf0;">👨‍🏫 {}</strong>',
            obj.full_name
        )
    full_name_display.short_description = 'Full Name'
    full_name_display.admin_order_field = 'user__first_name'

    def email_display(self, obj):
        return format_html(
            '<a href="mailto:{}" style="color: #6f42c1; text-decoration: none;">📧 {}</a>',
            obj.email, obj.email
        )
    email_display.short_description = 'Email'
    email_display.admin_order_field = 'user__email'

    def specialty_badge(self, obj):
        return format_html(
            '<span style="background-color: #0dcaf0; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold;">📚 {}</span>',
            obj.specialty
        )
    specialty_badge.short_description = 'Specialty'
    specialty_badge.admin_order_field = 'specialty'
