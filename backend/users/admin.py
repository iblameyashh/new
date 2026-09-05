from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import StudentProfile, TeacherProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Learnique', {'fields': ('role', 'phone_number', 'profile_image')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Learnique', {'fields': ('email', 'first_name', 'last_name', 'role', 'phone_number', 'profile_image')}),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_id', 'class_level')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'student_id')
    list_filter = ('class_level',)
    autocomplete_fields = ('user',)


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'qualification', 'experience')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'qualification')
    list_filter = ('experience',)
    autocomplete_fields = ('user',)
