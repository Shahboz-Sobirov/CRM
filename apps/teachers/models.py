from django.db import models
from django.conf import settings


class Teacher(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_profile',
        limit_choices_to={'role': 'teacher'}
    )
    specialty = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    hire_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teachers'
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.specialty}"

    @property
    def full_name(self):
        return self.user.full_name

    @property
    def email(self):
        return self.user.email

