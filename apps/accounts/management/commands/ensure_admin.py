"""
Create (or update) a default admin user without an interactive shell.

Useful for platforms where a shell is not available (e.g. Render free tier).
Credentials can be overridden via environment variables:
    ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME
"""
from decouple import config
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Ensure a default admin user exists (non-interactive)."

    def handle(self, *args, **options):
        phone = config('ADMIN_PHONE', default='+998901234567')
        password = config('ADMIN_PASSWORD', default='admin12345')
        first_name = config('ADMIN_FIRST_NAME', default='Admin')
        last_name = config('ADMIN_LAST_NAME', default='User')

        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )

        # Always make sure the account is a usable admin with the configured password
        user.first_name = user.first_name or first_name
        user.last_name = user.last_name or last_name
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Admin yaratildi: {phone}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Admin yangilandi: {phone}"))
