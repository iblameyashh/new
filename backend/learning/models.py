from django.db import models
from courses.models import Course
from users.models import StudentProfile

class CourseModule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    video_url = models.URLField(blank=True, null=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=250)
    description = models.TextField()
    due_date = models.DateTimeField()
    max_marks = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.course.title})"

class StudentProgress(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'lesson')

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    marks_obtained = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ('assignment', 'student')
