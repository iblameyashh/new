import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, StudentProfile, TeacherProfile
from courses.models import Subject, ClassLevel, Course

# Create teachers
t1, _ = User.objects.get_or_create(username='john_math', email='john@learnique.edu', first_name='John', last_name='Doe', role='TEACHER')
t1.set_password('password')
t1.save()
TeacherProfile.objects.get_or_create(user=t1, qualification='M.Sc Mathematics', experience=10, bio='Expert math tutor.')

t2, _ = User.objects.get_or_create(username='sarah_phy', email='sarah@learnique.edu', first_name='Sarah', last_name='Smith', role='TEACHER')
t2.set_password('password')
t2.save()
TeacherProfile.objects.get_or_create(user=t2, qualification='Ph.D Physics', experience=5, bio='Passionate about physics.')

# Create student
s1, _ = User.objects.get_or_create(username='rahul_stu', email='rahul@learnique.edu', first_name='Rahul', last_name='Sharma', role='STUDENT')
s1.set_password('password')
s1.save()
StudentProfile.objects.get_or_create(user=s1, class_level='Class 10')

s2, _ = User.objects.get_or_create(username='priya_stu', email='priya@learnique.edu', first_name='Priya', last_name='Verma', role='STUDENT')
s2.set_password('password')
s2.save()
StudentProfile.objects.get_or_create(user=s2, class_level='Class 12')

# Create Subjects
sub1, _ = Subject.objects.get_or_create(name='Mathematics')
sub2, _ = Subject.objects.get_or_create(name='Physics')

# Create Class Levels
cl1, _ = ClassLevel.objects.get_or_create(name='Class 10')
cl2, _ = ClassLevel.objects.get_or_create(name='Class 12')

# Create Courses
c1, _ = Course.objects.get_or_create(
    title='Advanced Class 10 Mathematics',
    teacher=t1.teacher_profile,
    subject=sub1,
    class_level=cl1,
    description='Master Class 10 Math with practical problem solving.',
    price=99.99,
    duration='3 Months',
    schedule='Mon/Wed/Fri 5 PM'
)


c2, _ = Course.objects.get_or_create(
    title='Physics Fundamentals Class 12',
    teacher=t2.teacher_profile,
    subject=sub2,
    class_level=cl2,
    description='Deep dive into modern physics and mechanics.',
    price=149.99,
    duration='6 Months',
    schedule='Tue/Thu 4 PM'
)

from learning.models import CourseModule, Lesson, Assignment
import datetime
from django.utils import timezone

m1, _ = CourseModule.objects.get_or_create(course=c1, title="Week 1: Algebra Intro", order=1, description="Introduction to algebra concepts")
l1, _ = Lesson.objects.get_or_create(module=m1, title="Variables and Constants", content="Understanding the basics.", order=1)
l2, _ = Lesson.objects.get_or_create(module=m1, title="Equations", content="Solving linear equations.", order=2)

Assignment.objects.get_or_create(course=c1, title="Algebra Assignment 1", description="Solve the equations from lesson 2", due_date=timezone.now() + datetime.timedelta(days=7))

print("Seed data successfully populated.")
