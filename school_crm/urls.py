"""
URL configuration for school_crm project.
"""
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

# Admin site customization
admin.site.site_header = "Oxford CRM Administration"
admin.site.site_title = "Oxford CRM Admin"
admin.site.index_title = "Welcome to Oxford CRM Management System"

urlpatterns = [
    path('admin/', admin.site.urls),

    # API URLs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/teachers/', include('apps.teachers.urls')),
    path('api/classes/', include('apps.classes.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/payments/', include('apps.payments.urls')),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Frontend SPA — serve index.html for all non-API routes (React Router handles routing)
    re_path(r'^(?!api/|admin/|static/|media/).*$', TemplateView.as_view(template_name='index.html'), name='spa'),
]
