# OXFORD CRM - School Management System

A comprehensive school management system built with Django REST Framework and PostgreSQL.

## Features

- **User Management**: Role-based access control (Admin, Manager, Teacher, Parent)
- **Student Management**: Complete student profiles with parent relationships
- **Teacher Management**: Teacher profiles and group assignments
- **Class Management**: Group creation and student enrollment
- **Attendance Tracking**: Daily attendance with bulk operations
- **Payment System**: Payment tracking with approval workflow

## Technology Stack

- Python 3.11+
- Django 5.0+
- Django REST Framework 3.14+
- PostgreSQL 15+
- JWT Authentication
- OpenAPI 3.0 Documentation

## Team Structure

- **Developer 1 (@javik999)**: Accounts, Authentication, Core
- **Developer 2 (@Abbos_0162)**: Students, Teachers
- **Developer 3 (@one_sobirov)**: Classes, Attendance, Payments

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 4. Create Database

```bash
createdb oxford_crm
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

### 8. Access Application

- Admin Panel: http://localhost:8000/admin/
- API Documentation: http://localhost:8000/api/swagger/
- API Root: http://localhost:8000/api/

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user info

### Students
- `GET /api/students/` - List students
- `POST /api/students/` - Create student
- `GET /api/students/{id}/` - Get student detail
- `PUT /api/students/{id}/` - Update student
- `DELETE /api/students/{id}/` - Delete student

### Teachers
- `GET /api/teachers/` - List teachers
- `POST /api/teachers/` - Create teacher
- `GET /api/teachers/{id}/` - Get teacher detail

### Groups
- `GET /api/classes/groups/` - List groups
- `POST /api/classes/groups/` - Create group
- `POST /api/classes/groups/{id}/add-student/` - Add student to group

### Attendance
- `GET /api/attendance/` - List attendance records
- `POST /api/attendance/` - Create attendance
- `POST /api/attendance/bulk-create/` - Bulk create attendance

### Payments
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Create payment
- `POST /api/payments/{id}/approve/` - Approve payment (admin only)
- `POST /api/payments/{id}/reject/` - Reject payment (admin only)

## Role Permissions

### Admin
- Full access to all resources
- Approve/Reject payments
- Manage all users

### Manager
- Add/Edit students
- Create payments
- View students and groups
- Cannot approve payments

### Teacher
- View assigned groups only
- Mark attendance for own groups
- View student list in own groups

### Parent
- View own child's information only
- View own child's attendance and payments
- Read-only access

## License

MIT
