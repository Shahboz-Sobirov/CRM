from rest_framework import permissions


class IsAccountOwner(permissions.BasePermission):
    """
    Permission to only allow users to edit their own account
    """
    def has_object_permission(self, request, view, obj):
        return obj == request.user


class CanManageUsers(permissions.BasePermission):
    """
    Only admins can manage users
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'
