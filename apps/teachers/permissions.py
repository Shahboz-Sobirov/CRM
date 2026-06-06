from rest_framework import permissions


class CanManageTeachers(permissions.BasePermission):
    """
    Only Admin can manage teachers
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsTeacherOwner(permissions.BasePermission):
    """
    Teacher can only view their own profile
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'teacher':
            return obj.user == request.user
        return True
