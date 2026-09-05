from django.db import models
from django.conf import settings
from users.models import StudentProfile, TeacherProfile
from courses.models import Course, Subject, ClassLevel

class StudentRequirement(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='requirements')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='requirements')
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='requirements')
    requirement_text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    assigned_teacher = models.ForeignKey(TeacherProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requirements')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_requirements')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} - {self.subject} ({self.status})"


class Enrollment(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    progress = models.IntegerField(default=0, help_text="0-100 percentage")

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student} -> {self.course}"

class Review(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.rating} stars for {self.course} by {self.student}"
