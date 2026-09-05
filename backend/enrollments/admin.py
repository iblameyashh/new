from django.contrib import admin
from .models import Enrollment, Review, StudentRequirement


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrollment_date', 'is_active', 'progress')
    list_filter = ('is_active', 'course')
    search_fields = ('student__user__first_name', 'student__user__last_name', 'student__student_id', 'course__title')
    autocomplete_fields = ('student', 'course')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'rating', 'created_at')
    list_filter = ('rating', 'course')
    search_fields = ('student__user__first_name', 'student__user__last_name', 'course__title', 'review_text')
    autocomplete_fields = ('student', 'course')


@admin.register(StudentRequirement)
class StudentRequirementAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'class_level', 'status', 'assigned_teacher', 'approved_by', 'created_at')
    list_filter = ('status', 'subject', 'class_level', 'assigned_teacher')
    search_fields = ('student__user__first_name', 'student__user__last_name', 'student__student_id', 'subject__name', 'requirement_text')
    autocomplete_fields = ('student', 'subject', 'class_level', 'assigned_teacher', 'approved_by')
    readonly_fields = ('created_at', 'updated_at', 'approved_at')
