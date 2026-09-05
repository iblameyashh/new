from django.contrib import admin
from .models import ClassLevel, Course, Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'subject', 'class_level', 'price', 'duration', 'is_active', 'created_at')
    list_filter = ('subject', 'class_level', 'is_active')
    search_fields = ('title', 'description', 'teacher__user__first_name', 'teacher__user__last_name')
    autocomplete_fields = ('teacher', 'subject', 'class_level')
