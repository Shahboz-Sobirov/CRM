from django.db import models
from apps.teachers.models import Teacher
from apps.students.models import Student


class Group(models.Model):
    name = models.CharField(max_length=200)
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        related_name='groups'
    )
    students = models.ManyToManyField(
        Student,
        related_name='groups',
        blank=True
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'groups'
        verbose_name = 'Group'
        verbose_name_plural = 'Groups'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.teacher.full_name if self.teacher else 'No Teacher'}"

    @property
    def student_count(self):
        return self.students.count()

