from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.classes.models import Group
from apps.payments.models import Payment
from apps.students.models import Student
from apps.teachers.models import Teacher

User = get_user_model()


class StudentAccessTests(APITestCase):
    def setUp(self):
        self.parent_user = User.objects.create_user(
            email='parent@example.com',
            password='password123',
            first_name='Parent',
            last_name='One',
            role='parent',
        )
        self.other_parent_user = User.objects.create_user(
            email='other-parent@example.com',
            password='password123',
            first_name='Parent',
            last_name='Two',
            role='parent',
        )
        self.teacher_user = User.objects.create_user(
            email='teacher@example.com',
            password='password123',
            first_name='Teacher',
            last_name='One',
            role='teacher',
        )
        self.other_teacher_user = User.objects.create_user(
            email='other-teacher@example.com',
            password='password123',
            first_name='Teacher',
            last_name='Two',
            role='teacher',
        )

        self.teacher = Teacher.objects.create(
            user=self.teacher_user,
            specialty='English',
            hire_date=date(2024, 1, 1),
        )
        self.other_teacher = Teacher.objects.create(
            user=self.other_teacher_user,
            specialty='History',
            hire_date=date(2024, 1, 1),
        )

        self.student = Student.objects.create(
            first_name='Aziza',
            last_name='Nur',
            birth_date=date(2012, 2, 2),
            parent=self.parent_user,
        )
        self.other_student = Student.objects.create(
            first_name='Sardor',
            last_name='Bek',
            birth_date=date(2011, 3, 3),
            parent=self.other_parent_user,
        )

        self.group = Group.objects.create(
            name='English A',
            teacher=self.teacher,
            start_date=date(2026, 1, 1),
        )
        self.group.students.add(self.student)

        self.other_group = Group.objects.create(
            name='History A',
            teacher=self.other_teacher,
            start_date=date(2026, 1, 1),
        )
        self.other_group.students.add(self.other_student)

        self.payment = Payment.objects.create(
            student=self.student,
            amount='120.00',
            payment_date=date(2026, 5, 18),
            payment_method='cash',
        )

    def test_parent_cannot_view_other_student_attendance(self):
        self.client.force_authenticate(self.parent_user)

        response = self.client.get(reverse('student_attendance', args=[self.other_student.id]))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_view_unassigned_student_payments(self):
        self.client.force_authenticate(self.teacher_user)

        response = self.client.get(reverse('student_payments', args=[self.other_student.id]))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_parent_can_view_own_student_payments(self):
        self.client.force_authenticate(self.parent_user)

        response = self.client.get(reverse('student_payments', args=[self.student.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.payment.id)
