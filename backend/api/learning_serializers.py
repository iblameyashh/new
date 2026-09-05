from rest_framework import serializers
from learning.models import Assignment, AssignmentSubmission, CourseModule, Lesson, StudentProgress


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'


class CourseModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = CourseModule
        fields = '__all__'


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        read_only_fields = ('student', 'submitted_at')


class StudentProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProgress
        fields = '__all__'
        read_only_fields = ('student', 'completed_at')
