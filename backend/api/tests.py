from django.core.cache import cache
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from courses.models import Subject, ClassLevel, Course
from users.models import StudentProfile, TeacherProfile
from enrollments.models import StudentRequirement
from messaging.models import Conversation

User = get_user_model()

class BackendApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Admin user
        self.admin = User.objects.create_superuser(
            username='admin@learnique.com', email='admin@learnique.com', password='adminpassword123', role='ADMIN'
        )
        # Teacher user
        self.teacher_user = User.objects.create_user(
            username='teacher@learnique.com', email='teacher@learnique.com', password='teacherpassword123', role='TEACHER'
        )
        self.teacher_profile = TeacherProfile.objects.create(
            user=self.teacher_user, qualification='M.Sc', experience=5, bio='Teacher Bio'
        )
        # Student user
        self.student_user = User.objects.create_user(
            username='student@learnique.com', email='student@learnique.com', password='studentpassword123', role='STUDENT'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user, class_level='Class 10'
        )
        # Subject & ClassLevel
        self.subject = Subject.objects.create(name='Mathematics')
        self.class_level = ClassLevel.objects.create(name='Class 10')

    def test_register_student_and_teacher(self):
        # Register student
        res1 = self.client.post('/api/auth/register/', {
            'email': 'newstudent@learnique.com',
            'password': 'password123',
            'first_name': 'New',
            'last_name': 'Student',
            'role': 'STUDENT',
            'class_level': 'Class 10'
        })
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res1.data['role'], 'STUDENT')
        self.assertTrue(StudentProfile.objects.filter(user__email='newstudent@learnique.com').exists())

        # Register teacher
        res2 = self.client.post('/api/auth/register/', {
            'email': 'newteacher@learnique.com',
            'password': 'password123',
            'first_name': 'New',
            'last_name': 'Teacher',
            'role': 'TEACHER',
            'qualification': 'Ph.D'
        })
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.data['role'], 'TEACHER')
        self.assertTrue(TeacherProfile.objects.filter(user__email='newteacher@learnique.com').exists())

    def test_create_and_update_course_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post('/api/owner/courses/', {
            'title': 'Calculus 101',
            'description': 'Introductory Calculus',
            'teacher': self.teacher_profile.id,
            'subject': self.subject.id,
            'class_level': self.class_level.id,
            'price': '49.99',
            'duration': '4 Weeks',
            'schedule': 'Mon/Wed 4 PM',
            'is_active': True,
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        course_id = res.data['id']
        self.assertEqual(res.data['title'], 'Calculus 101')
        self.assertEqual(res.data['teacher']['id'], self.teacher_profile.id)
        self.assertEqual(res.data['subject']['id'], self.subject.id)

        # Update course
        res_update = self.client.patch(f'/api/owner/courses/{course_id}/', {
            'title': 'Advanced Calculus 101'
        })
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update.data['title'], 'Advanced Calculus 101')

    def test_student_requirement_lifecycle(self):
        # Student creates requirement
        self.client.force_authenticate(user=self.student_user)
        res_create = self.client.post('/api/requirements/', {
            'subject_id': self.subject.id,
            'class_level_id': self.class_level.id,
            'requirement_text': 'Need help with algebra and trigonometry equations'
        })
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        req_id = res_create.data['id']
        self.assertEqual(res_create.data['status'], 'PENDING')

        # Admin approves and assigns teacher
        self.client.force_authenticate(user=self.admin)
        res_approve = self.client.post(f'/api/owner/requirements/{req_id}/approve/', {
            'action': 'approve',
            'teacher_id': self.teacher_profile.id
        })
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)
        self.assertEqual(res_approve.data['status'], 'ACTIVE')
        self.assertIsNotNone(res_approve.data['assigned_teacher'])
        self.assertEqual(res_approve.data['assigned_teacher']['id'], self.teacher_profile.id)

        # Verify conversation was automatically created
        self.assertTrue(Conversation.objects.filter(requirement_id=req_id, status='ACTIVE').exists())

        # Admin closes requirement
        res_close = self.client.post(f'/api/owner/requirements/{req_id}/approve/', {
            'action': 'close'
        })
        self.assertEqual(res_close.status_code, status.HTTP_200_OK)
        self.assertEqual(res_close.data['status'], 'COMPLETED')


class AdminSetupTests(TestCase):
    """POST /api/auth/admin-setup/ -- dynamic, secret-code admin promotion."""

    SECRET = 'test-setup-code-12345'

    def setUp(self):
        self.client = APIClient()
        cache.clear()
        self.url = '/api/auth/admin-setup/'
        self.payload = {
            'code': self.SECRET,
            'email': 'owner@learnique.com',
            'password': 'supersecret123',
        }

    def _override(self):
        return override_settings(ADMIN_SETUP_CODE=self.SECRET)

    def test_creates_new_admin_account(self):
        with self._override():
            res = self.client.post(self.url, self.payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user = User.objects.get(email='owner@learnique.com')
        self.assertEqual(user.role, 'ADMIN')
        self.assertTrue(user.is_staff)
        self.assertTrue(user.check_password('supersecret123'))

    def test_promotes_existing_account_after_password_check(self):
        User.objects.create_user(
            username='teacher@learnique.com', email='teacher@learnique.com',
            password='teacherpass123', role='TEACHER',
        )
        with self._override():
            res = self.client.post(
                self.url,
                {**self.payload, 'email': 'teacher@learnique.com', 'password': 'teacherpass123'},
            )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user = User.objects.get(email='teacher@learnique.com')
        self.assertEqual(user.role, 'ADMIN')
        self.assertTrue(user.is_staff)

    def test_rejects_wrong_password_for_existing_account(self):
        User.objects.create_user(
            username='x@learnique.com', email='x@learnique.com',
            password='rightpassword1', role='STUDENT',
        )
        with self._override():
            res = self.client.post(
                self.url, {**self.payload, 'email': 'x@learnique.com', 'password': 'wrongpassword1'}
            )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(email='x@learnique.com')
        self.assertEqual(user.role, 'STUDENT')  # unchanged

    def test_rejects_wrong_code(self):
        with self._override():
            res = self.client.post(self.url, {**self.payload, 'code': 'wrong-code'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='owner@learnique.com').exists())

    def test_rejects_when_code_not_configured(self):
        with override_settings(ADMIN_SETUP_CODE=''):
            res = self.client.post(self.url, self.payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rejects_short_password(self):
        with self._override():
            res = self.client.post(self.url, {**self.payload, 'password': 'short'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rate_limit_blocks_after_five_attempts(self):
        with self._override():
            for _ in range(5):
                self.client.post(self.url, {**self.payload, 'code': 'bad'})
            res = self.client.post(self.url, self.payload)
        self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_does_not_leak_which_field_was_wrong(self):
        User.objects.create_user(
            username='owner@learnique.com', email='owner@learnique.com',
            password='supersecret123', role='STUDENT',
        )
        with self._override():
            res_wrong_code = self.client.post(self.url, {**self.payload, 'code': 'nope'})
            res_wrong_pw = self.client.post(
                self.url, {**self.payload, 'password': 'wrongpassword1'}
            )
        self.assertEqual(res_wrong_code.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res_wrong_code.json(), res_wrong_pw.json())


class OwnerStudentActionsTests(TestCase):
    """PATCH/DELETE /api/owner/students/<id>/ must actually affect the account."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin2@learnique.com', email='admin2@learnique.com',
            password='adminpassword123', role='ADMIN',
        )
        self.student_user = User.objects.create_user(
            username='s2@learnique.com', email='s2@learnique.com',
            password='studentpass123', role='STUDENT', first_name='Sam',
        )
        self.profile = StudentProfile.objects.create(user=self.student_user, class_level='Class 9')
        self.client.force_authenticate(user=self.admin)

    def test_patch_deactivates_the_user_account(self):
        res = self.client.patch(f'/api/owner/students/{self.profile.id}/', {'is_active': False})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.student_user.refresh_from_db()
        self.assertFalse(self.student_user.is_active)

    def test_patch_can_edit_name(self):
        res = self.client.patch(
            f'/api/owner/students/{self.profile.id}/', {'first_name': 'Samuel'}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.student_user.refresh_from_db()
        self.assertEqual(self.student_user.first_name, 'Samuel')

    def test_delete_removes_the_login_account_too(self):
        res = self.client.delete(f'/api/owner/students/{self.profile.id}/')
        self.assertIn(res.status_code, (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT))
        self.assertFalse(User.objects.filter(pk=self.student_user.pk).exists())
        self.assertFalse(StudentProfile.objects.filter(pk=self.profile.pk).exists())

    def test_non_admin_cannot_modify_students(self):
        self.client.force_authenticate(user=self.student_user)
        res = self.client.patch(f'/api/owner/students/{self.profile.id}/', {'is_active': False})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_teacher_create_validates_password(self):
        res = self.client.post('/api/owner/teachers/', {
            'email': 'newteacher@learnique.com', 'password': 'short',
            'first_name': 'New', 'last_name': 'Teacher', 'qualification': 'B.Ed',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('8 characters', res.data.get('error', ''))
