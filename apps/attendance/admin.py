from django.contrib import admin
from django.utils.html import format_html
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'student_display', 'group_display', 'date', 'status_badge', 'created_at']
    list_filter = ['status', 'date', 'group', 'created_at']
    search_fields = ['student__first_name', 'student__last_name', 'group__name', 'notes']
    ordering = ['-date', '-created_at']
    date_hierarchy = 'date'
    list_per_page = 50

    fieldsets = (
        ('📋 Attendance Information', {
            'fields': ('student', 'group', 'date', 'status'),
            'classes': ('wide',)
        }),
        ('📝 Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def student_display(self, obj):
        return format_html(
            '<strong style="color: #0d6efd;">🎓 {}</strong>',
            obj.student.full_name
        )
    student_display.short_description = 'Student'
    student_display.admin_order_field = 'student__first_name'

    def group_display(self, obj):
        return format_html(
            '<span style="color: #6f42c1;">📚 {}</span>',
            obj.group.name
        )
    group_display.short_description = 'Group'
    group_display.admin_order_field = 'group__name'

    def status_badge(self, obj):
        status_colors = {
            'present': '#198754',
            'absent': '#dc3545',
            'late': '#ffc107',
            'excused': '#0dcaf0',
        }
        status_icons = {
            'present': '✓',
            'absent': '✗',
            'late': '⏰',
            'excused': '📝',
        }
        color = status_colors.get(obj.status, '#6c757d')
        icon = status_icons.get(obj.status, '?')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
