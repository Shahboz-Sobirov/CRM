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


class PaymentAPITests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_staff=True,
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
        self.teacher_user = User.objects.create_user(
            email='teacher@example.com',
            password='password123',
            first_name='Teacher',
            last_name='User',
            role='teacher',
        )
        self.other_teacher_user = User.objects.create_user(
            email='other-teacher@example.com',
            password='password123',
            first_name='Teacher',
            last_name='Other',
            role='teacher',
        )

        self.teacher = Teacher.objects.create(
            user=self.teacher_user,
            specialty='Math',
            hire_date=date(2024, 1, 1),
        )
        self.other_teacher = Teacher.objects.create(
            user=self.other_teacher_user,
            specialty='Science',
            hire_date=date(2024, 1, 1),
        )

        self.student = Student.objects.create(
            first_name='Ali',
            last_name='Valiyev',
            birth_date=date(2012, 1, 1),
            parent=self.parent_user,
        )
        self.other_student = Student.objects.create(
            first_name='Salim',
            last_name='Karimov',
            birth_date=date(2011, 2, 2),
            parent=self.other_parent_user,
        )

        self.group = Group.objects.create(
            name='Math Group',
            teacher=self.teacher,
            start_date=date(2026, 1, 1),
        )
        self.group.students.add(self.student)

        self.other_group = Group.objects.create(
            name='Science Group',
            teacher=self.other_teacher,
            start_date=date(2026, 1, 1),
        )
        self.other_group.students.add(self.other_student)

        self.payment = Payment.objects.create(
            student=self.student,
            amount='150.00',
            payment_date=date(2026, 5, 18),
            payment_method='cash',
            status='pending',
        )
        self.other_payment = Payment.objects.create(
            student=self.other_student,
            amount='80.00',
            payment_date=date(2026, 5, 18),
            payment_method='card',
            status='approved',
        )

    def test_manager_can_create_payment_with_generated_receipt(self):
        self.client.force_authenticate(self.manager_user)

        response = self.client.post(
            reverse('payment_list_create'),
            {
                'student': self.student.id,
                'amount': '210.00',
                'payment_date': '2026-05-18',
                'payment_method': 'bank_transfer',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        payment = Payment.objects.get(amount='210.00')
        self.assertTrue(payment.receipt_number.startswith('PAY-'))

    def test_parent_only_sees_own_payments(self):
        self.client.force_authenticate(self.parent_user)

        response = self.client.get(reverse('payment_list_create'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.payment.id)

    def test_teacher_only_sees_payments_for_assigned_students(self):
        self.client.force_authenticate(self.teacher_user)

        response = self.client.get(reverse('payment_list_create'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.payment.id)

    def test_admin_can_approve_and_reject_payment(self):
        self.client.force_authenticate(self.admin_user)

        approve_response = self.client.post(reverse('approve_payment', args=[self.payment.id]))
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'approved')

        reject_response = self.client.post(reverse('reject_payment', args=[self.payment.id]))
        self.assertEqual(reject_response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'rejected')

    def test_payment_statistics_requires_manager_role(self):
        self.client.force_authenticate(self.teacher_user)
        forbidden_response = self.client.get(reverse('payment_statistics'))
        self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.manager_user)
        allowed_response = self.client.get(reverse('payment_statistics'))

        self.assertEqual(allowed_response.status_code, status.HTTP_200_OK)
        self.assertEqual(allowed_response.data['total_payments'], 2)
        self.assertEqual(allowed_response.data['approved_payments'], 1)
        self.assertEqual(allowed_response.data['pending_payments'], 1)
