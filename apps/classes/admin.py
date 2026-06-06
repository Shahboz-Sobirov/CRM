from django.contrib import admin
from django.utils.html import format_html
from .models import Group


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_display', 'teacher_display', 'student_count_display', 'status_badge', 'start_date', 'end_date']
    list_filter = ['is_active', 'start_date', 'created_at', 'teacher']
    search_fields = ['name', 'teacher__user__first_name', 'teacher__user__last_name']
    ordering = ['-created_at']
    date_hierarchy = 'start_date'
    list_per_page = 25
    filter_horizontal = ['students']

    fieldsets = (
        ('📚 Group Information', {
            'fields': ('name', 'teacher', 'start_date', 'end_date', 'is_active'),
            'classes': ('wide',)
        }),
        ('👥 Students', {
            'fields': ('students',),
            'classes': ('wide',)
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def name_display(self, obj):
        return format_html(
            '<strong style="color: #0d6efd; font-size: 13px;">📚 {}</strong>',
            obj.name
        )
    name_display.short_description = 'Group Name'
    name_display.admin_order_field = 'name'

    def teacher_display(self, obj):
        if obj.teacher:
            return format_html(
                '<span style="color: #0dcaf0;">👨‍🏫 {}</span>',
                obj.teacher.full_name
            )
        return format_html('<span style="color: #dc3545;">No Teacher</span>')
    teacher_display.short_description = 'Teacher'
    teacher_display.admin_order_field = 'teacher__user__first_name'

    def student_count_display(self, obj):
        count = obj.student_count
        if count == 0:
            color = '#6c757d'
        elif count < 10:
            color = '#198754'
        elif count < 20:
            color = '#0dcaf0'
        else:
            color = '#fd7e14'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold;">👥 {} students</span>',
            color, count
        )
    student_count_display.short_description = 'Students'

    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #198754; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px;">✓ ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px;">✗ INACTIVE</span>'
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_active'
