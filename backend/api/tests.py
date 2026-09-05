from django.test import TestCase
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
