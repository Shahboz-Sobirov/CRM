from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.html import format_html

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['phone', 'full_name_display', 'role_badge', 'email', 'status_badge', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-date_joined']
    list_per_page = 25
    date_hierarchy = 'date_joined'

    fieldsets = (
        ('🔐 Account Information', {
            'fields': ('phone', 'password'),
            'classes': ('wide',)
        }),
        ('👤 Personal Information', {
            'fields': ('first_name', 'last_name', 'email'),
            'classes': ('wide',)
        }),
        ('🎭 Role & Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('📅 Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        ('Create New User', {
            'classes': ('wide',),
            'fields': ('phone', 'first_name', 'last_name', 'email', 'role', 'password1', 'password2'),
        }),
    )

    def full_name_display(self, obj):
        return format_html(
            '<strong>{}</strong>',
            obj.full_name
        )
    full_name_display.short_description = 'Full Name'

    def role_badge(self, obj):
        colors = {
            'admin': '#dc3545',
            'manager': '#fd7e14',
            'teacher': '#0dcaf0',
            'parent': '#6f42c1',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.role, '#6c757d'),
            obj.get_role_display().upper()
        )
    role_badge.short_description = 'Role'

    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #198754; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px;">✓ ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px;">✗ INACTIVE</span>'
        )
    status_badge.short_description = 'Status'
