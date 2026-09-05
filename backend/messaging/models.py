from django.db import models
from django.conf import settings
from users.models import User
from courses.models import Subject
from enrollments.models import StudentRequirement

class Conversation(models.Model):
    student = models.ForeignKey(User, related_name='student_conversations', on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, related_name='teacher_conversations', on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='conversations', null=True, blank=True)
    requirement = models.ForeignKey(StudentRequirement, on_delete=models.CASCADE, related_name='conversations', null=True, blank=True)
    status = models.CharField(max_length=20, default='ACTIVE', choices=[
        ('ACTIVE', 'Active'),
        ('ARCHIVED', 'Archived'),
        ('CLOSED', 'Closed'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Note: unique_together with nullable fields requires partial unique indexes in some DBs
        # For simplicity, we remove the unique constraint and handle duplicates in application logic
        ordering = ['-updated_at']

    def __str__(self):
        subject_name = self.subject.name if self.subject else 'Unknown'
        return f"Chat: {self.student.username} & {self.teacher.username} - {subject_name}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Msg by {self.sender.username} at {self.timestamp}"
