from django.contrib import admin
from .models import Assignment, AssignmentSubmission, CourseModule, Lesson, StudentProgress


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    inlines = (LessonInline,)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order', 'video_url')
    list_filter = ('module__course',)
    search_fields = ('title', 'module__title', 'module__course__title')
    autocomplete_fields = ('module',)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'due_date', 'max_marks', 'created_at')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    autocomplete_fields = ('course',)


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submitted_at', 'marks_obtained')
    list_filter = ('assignment',)
    search_fields = ('assignment__title', 'student__user__username', 'student__student_id')
    autocomplete_fields = ('assignment', 'student')


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'is_completed', 'completed_at')
    list_filter = ('is_completed',)
    search_fields = ('student__user__username', 'student__student_id', 'lesson__title')
    autocomplete_fields = ('student', 'lesson')
