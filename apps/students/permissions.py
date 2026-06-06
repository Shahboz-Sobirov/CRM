from rest_framework import permissions


class CanManageStudents(permissions.BasePermission):
    """
    Admin and Manager can manage students
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager']


class IsStudentParent(permissions.BasePermission):
    """
    Parent can only view their own children
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'parent':
            return obj.parent == request.user
        return True
