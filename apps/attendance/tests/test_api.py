from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.attendance.models import Attendance
from apps.classes.models import Group
from apps.students.models import Student
from apps.teachers.models import Teacher

User = get_user_model()


class AttendanceAPITests(APITestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            email='teacher@example.com',
            password='password123',
            first_name='Teach',
            last_name='One',
            role='teacher',
        )
        self.other_teacher_user = User.objects.create_user(
            email='other-teacher@example.com',
            password='password123',
            first_name='Teach',
            last_name='Two',
            role='teacher',
        )
        self.manager_user = User.objects.create_user(
            email='manager@example.com',
            password='password123',
            first_name='Manager',
            last_name='User',
            role='manager',
        )
        self.parent_user = User.objects.create_user(
            email='parent@example.com',
            password='password123',
            first_name='Parent',
            last_name='User',
            role='parent',
        )
        self.other_parent_user = User.objects.create_user(
            email='other-parent@example.com',
            password='password123',
            first_name='Other',
            last_name='Parent',
            role='parent',
        )

        self.teacher = Teacher.objects.create(
            user=self.teacher_user,
            specialty='Math',
            hire_date=date(2024, 1, 10),
        )
        self.other_teacher = Teacher.objects.create(
            user=self.other_teacher_user,
            specialty='Science',
            hire_date=date(2024, 1, 10),
        )

        self.student = Student.objects.create(
            first_name='Ali',
            last_name='Valiyev',
            birth_date=date(2012, 5, 1),
            parent=self.parent_user,
        )
        self.other_student = Student.objects.create(
            first_name='Hasan',
            last_name='Karimov',
            birth_date=date(2011, 7, 1),
            parent=self.other_parent_user,
        )

        self.group = Group.objects.create(
            name='Math A',
            teacher=self.teacher,
            start_date=date(2026, 1, 1),
        )
        self.group.students.add(self.student)

        self.other_group = Group.objects.create(
            name='Science B',
            teacher=self.other_teacher,
            start_date=date(2026, 1, 1),
        )
        self.other_group.students.add(self.other_student)

    def test_teacher_can_mark_attendance_for_own_group(self):
        self.client.force_authenticate(self.teacher_user)

        response = self.client.post(
            reverse('mark_attendance'),
            {
                'group': self.group.id,
                'date': '2026-05-18',
                'attendance_records': [
                    {'student_id': self.student.id, 'status': 'late', 'notes': 'Traffic'}
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)
        attendance = Attendance.objects.get()
        self.assertEqual(attendance.group, self.group)
        self.assertEqual(attendance.student, self.student)
        self.assertEqual(attendance.status, 'late')

    def test_teacher_cannot_mark_attendance_for_other_group(self):
        self.client.force_authenticate(self.teacher_user)

        response = self.client.post(
            reverse('mark_attendance'),
            {
                'group': self.other_group.id,
                'date': '2026-05-18',
                'attendance_records': [
                    {'student_id': self.other_student.id, 'status': 'present'}
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Attendance.objects.count(), 0)

    def test_bulk_attendance_rejects_students_outside_group(self):
        self.client.force_authenticate(self.manager_user)

        response = self.client.post(
            reverse('mark_attendance'),
            {
                'group': self.group.id,
                'date': '2026-05-18',
                'attendance_records': [
                    {'student_id': self.other_student.id, 'status': 'absent'}
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not enrolled', response.data['detail'])
