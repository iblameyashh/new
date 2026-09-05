from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, TeacherViewSet, StudentViewSet, EnrollmentViewSet, ReviewViewSet,
    ConversationViewSet, MessageViewSet, CourseLearningViewSet, AssignmentViewSet,
    SubjectViewSet, ClassLevelViewSet, me, register, unread_message_count,
    password_change, mark_lesson_complete, submit_assignment,
    StudentRequirementViewSet, TeacherMatchingViewSet,
)
from chatbot.views import chat
from .owner_views import (
    OwnerTeacherViewSet, OwnerCourseViewSet, OwnerDashboardStats, OwnerStudentViewSet,
    OwnerEnrollmentViewSet, OwnerReviewViewSet, OwnerAnalyticsViewSet, OwnerSettingsViewSet,
    OwnerRequirementViewSet,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='courses')
router.register(r'teachers', TeacherViewSet, basename='teachers')
router.register(r'students', StudentViewSet, basename='students')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'conversations', ConversationViewSet, basename='conversations')
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'subjects', SubjectViewSet, basename='subjects')
router.register(r'class_levels', ClassLevelViewSet, basename='class-levels')
router.register(r'requirements', StudentRequirementViewSet, basename='requirements')
router.register(r'teachers/matching', TeacherMatchingViewSet, basename='teacher-matching')
router.register(r'owner/teachers', OwnerTeacherViewSet, basename='owner-teachers')
router.register(r'owner/courses', OwnerCourseViewSet, basename='owner-courses')
router.register(r'owner/students', OwnerStudentViewSet, basename='owner-students')
router.register(r'owner/enrollments', OwnerEnrollmentViewSet, basename='owner-enrollments')
router.register(r'owner/reviews', OwnerReviewViewSet, basename='owner-reviews')
router.register(r'owner/requirements', OwnerRequirementViewSet, basename='owner-requirements')
router.register(r'owner/analytics', OwnerAnalyticsViewSet, basename='owner-analytics')
router.register(r'owner/settings', OwnerSettingsViewSet, basename='owner-settings')
router.register(r'owner/stats', OwnerDashboardStats, basename='owner-stats')

urlpatterns = [
    path('messages/unread/', unread_message_count, name='unread-message-count'),
    path('auth/me/', me, name='auth-me'),
    path('auth/register/', register, name='auth-register'),
    path('auth/password-change/', password_change, name='password-change'),
    path('ai/chat/', chat, name='ai-chat'),
    path('courses/<int:course_pk>/modules/', CourseLearningViewSet.as_view({'get': 'list'}), name='course-modules'),
    path('courses/<int:course_pk>/assignments/', AssignmentViewSet.as_view({'get': 'list'}), name='course-assignments'),
    path('lessons/<int:lesson_id>/complete/', mark_lesson_complete, name='lesson-complete'),
    path('assignments/<int:assignment_id>/submit/', submit_assignment, name='assignment-submit'),
    path('', include(router.urls)),
]
