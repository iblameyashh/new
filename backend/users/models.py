from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('TEACHER', 'Teacher'),
        ('ADMIN', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    phone_number = models.CharField(max_length=20, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def is_student(self):
        return self.role == 'STUDENT'

    def is_teacher(self):
        return self.role == 'TEACHER'

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    class_level = models.CharField(max_length=50, blank=True)
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.student_id:
            self.student_id = f"LQ-STU-{self.pk + 1000}"
            self.save(update_fields=['student_id'])

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.class_level}"

class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    qualification = models.CharField(max_length=200)
    experience = models.IntegerField(default=0, help_text="Years of experience")
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return f"Teacher: {self.user.get_full_name() or self.user.username}"
