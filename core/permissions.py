from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission class for Admin role
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsManager(permissions.BasePermission):
    """
    Permission class for Manager role
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager']


class IsTeacher(permissions.BasePermission):
    """
    Permission class for Teacher role
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'teacher']


class IsAdminManagerOrTeacher(permissions.BasePermission):
    """
    Admins, managers, and teachers can access the endpoint.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager', 'teacher']


class IsParent(permissions.BasePermission):
    """
    Permission class for Parent role
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'parent'


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin can do anything, others can only read
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'admin'
