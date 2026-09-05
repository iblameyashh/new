from django.db import models
from users.models import TeacherProfile

class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class ClassLevel(models.Model):
    name = models.CharField(max_length=50) # e.g., "Class 10"

    def __str__(self):
        return self.name

class Course(models.Model):
    title = models.CharField(max_length=200)
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='courses')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True)
    class_level = models.ForeignKey(ClassLevel, on_delete=models.SET_NULL, null=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    duration = models.CharField(max_length=100, help_text="e.g., 3 Months")
    schedule = models.CharField(max_length=200, help_text="e.g., Mon/Wed/Fri 5 PM")
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
