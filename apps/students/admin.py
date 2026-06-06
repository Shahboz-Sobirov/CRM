from django.contrib import admin
from django.utils.html import format_html
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name_display', 'age_display', 'parent_display', 'phone', 'created_at']
    list_filter = ['created_at', 'birth_date']
    search_fields = ['first_name', 'last_name', 'phone', 'parent__email', 'parent__first_name', 'parent__last_name']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 25

    fieldsets = (
        ('👤 Personal Information', {
            'fields': ('first_name', 'last_name', 'birth_date', 'phone', 'address'),
            'classes': ('wide',)
        }),
        ('👨‍👩‍👧 Parent Information', {
            'fields': ('parent',),
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
            '<strong style="color: #0d6efd;">{}</strong>',
            obj.full_name
        )
    full_name_display.short_description = 'Full Name'
    full_name_display.admin_order_field = 'first_name'

    def age_display(self, obj):
        age = obj.age
        if age < 10:
            color = '#198754'
        elif age < 15:
            color = '#0dcaf0'
        else:
            color = '#fd7e14'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">{} years</span>',
            color, age
        )
    age_display.short_description = 'Age'

    def parent_display(self, obj):
        if obj.parent:
            return format_html(
                '<span style="color: #6f42c1;">👤 {}</span>',
                obj.parent.full_name
            )
        return format_html('<span style="color: #dc3545;">No Parent</span>')
    parent_display.short_description = 'Parent'
    parent_display.admin_order_field = 'parent__first_name'
