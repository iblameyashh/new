from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from users.models import User, StudentProfile, TeacherProfile
from courses.models import Course, Subject
from enrollments.models import Enrollment, Review, StudentRequirement
from messaging.models import Conversation
from .permissions import IsAdminOwner
from .serializers import (
    TeacherProfileSerializer, 
    CourseSerializer, 
    StudentProfileSerializer, 
    UserSerializer,
    EnrollmentSerializer,
    ReviewSerializer,
    StudentRequirementSerializer,
    StudentRequirementAssignSerializer,
)

class OwnerTeacherViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOwner]
    serializer_class = TeacherProfileSerializer
    queryset = TeacherProfile.objects.all()

    def get_queryset(self):
        queryset = TeacherProfile.objects.select_related('user').all()
        search = self.request.query_params.get('search')
        status = self.request.query_params.get('status')
        
        if search:
            queryset = queryset.filter(
                user__first_name__icontains=search
            ) | queryset.filter(
                user__last_name__icontains=search
            ) | queryset.filter(
                user__email__icontains=search
            )
        
        if status:
            is_active = status == 'active'
            queryset = queryset.filter(user__is_active=is_active)
            
        return queryset

    def create(self, request, *args, **kwargs):
        # Handle custom creating of Teacher (User + Profile)
        data = request.data
        try:
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            
            # Check if user exists
            if User.objects.filter(email=email).exists():
                return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects.create_user(
                username=email, email=email, password=password,
                first_name=first_name, last_name=last_name, role='TEACHER'
            )
            
            profile = TeacherProfile.objects.create(
                user=user, 
                qualification=data.get('qualification', ''),
                experience=data.get('experience', 0),
                bio=data.get('bio', '')
            )
            return Response(TeacherProfileSerializer(profile).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        user = profile.user
        for field in ('first_name', 'last_name', 'email', 'is_active'):
            if field in request.data:
                val = request.data.get(field)
                setattr(user, field, val)
                if field == 'email' and val:
                    user.username = val
        user.save()
        for field in ('qualification', 'experience', 'bio'):
            if field in request.data:
                setattr(profile, field, request.data.get(field))
        profile.save()
        return Response(TeacherProfileSerializer(profile).data)

class OwnerCourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOwner]
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

    def get_queryset(self):
        queryset = Course.objects.select_related('teacher__user', 'subject', 'class_level').all()
        search = self.request.query_params.get('search')
        status = self.request.query_params.get('status')
        teacher = self.request.query_params.get('teacher')
        subject = self.request.query_params.get('subject')
        class_level = self.request.query_params.get('class_level')
        
        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                description__icontains=search
            )
            
        if status:
            is_active = status == 'active'
            queryset = queryset.filter(is_active=is_active)
            
        if teacher:
            queryset = queryset.filter(teacher_id=teacher)
            
        if subject:
            queryset = queryset.filter(subject_id=subject)
            
        if class_level:
            queryset = queryset.filter(class_level_id=class_level)
            
        return queryset

class OwnerStudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOwner]
    serializer_class = StudentProfileSerializer
    queryset = StudentProfile.objects.all()

    def get_queryset(self):
        queryset = StudentProfile.objects.select_related('user').all()
        search = self.request.query_params.get('search')
        class_level = self.request.query_params.get('class_level')
        status = self.request.query_params.get('status')
        
        if search:
            queryset = queryset.filter(
                user__first_name__icontains=search
            ) | queryset.filter(
                user__last_name__icontains=search
            ) | queryset.filter(
                user__email__icontains=search
            ) | queryset.filter(
                student_id__icontains=search
            )
        
        if class_level:
            queryset = queryset.filter(class_level=class_level)
            
        if status:
            is_active = status == 'active'
            queryset = queryset.filter(user__is_active=is_active)
            
        return queryset

class OwnerEnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOwner]
    serializer_class = EnrollmentSerializer
    queryset = Enrollment.objects.all()

    def get_queryset(self):
        queryset = Enrollment.objects.select_related(
            'student__user', 
            'course__teacher__user', 
            'course__subject', 
            'course__class_level'
        ).all()
        search = self.request.query_params.get('search')
        course = self.request.query_params.get('course')
        student = self.request.query_params.get('student')
        status = self.request.query_params.get('status')
        
        if search:
            queryset = queryset.filter(
                student__user__first_name__icontains=search
            ) | queryset.filter(
                student__user__last_name__icontains=search
            ) | queryset.filter(
                course__title__icontains=search
            )
            
        if course:
            queryset = queryset.filter(course_id=course)
            
        if student:
            queryset = queryset.filter(student_id=student)
            
        if status:
            is_active = status == 'active'
            queryset = queryset.filter(is_active=is_active)
            
        return queryset

class OwnerReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOwner]
    serializer_class = ReviewSerializer
    queryset = Review.objects.all()

    def get_queryset(self):
        queryset = Review.objects.select_related(
            'student__user', 
            'course__teacher__user', 
            'course'
        ).all()
        search = self.request.query_params.get('search')
        course = self.request.query_params.get('course')
        rating = self.request.query_params.get('rating')
        
        if search:
            queryset = queryset.filter(
                student__user__first_name__icontains=search
            ) | queryset.filter(
                student__user__last_name__icontains=search
            ) | queryset.filter(
                course__title__icontains=search
            ) | queryset.filter(
                review_text__icontains=search
            )
            
        if course:
            queryset = queryset.filter(course_id=course)
            
        if rating:
            queryset = queryset.filter(rating=rating)
            
        return queryset

class OwnerDashboardStats(viewsets.ViewSet):
    permission_classes = [IsAdminOwner]

    def list(self, request):
        return Response({
            'total_students': StudentProfile.objects.count(),
            'total_teachers': TeacherProfile.objects.count(),
            'total_courses': Course.objects.count(),
            'total_enrollments': Enrollment.objects.count(),
        })

class OwnerAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOwner]

    def list(self, request):
        # In a real implementation, this would calculate actual analytics
        # For now, we'll return placeholder data
        return Response({
            'total_revenue': 12500.00,
            'revenue_change': 12.5,
            'active_students': 156,
            'student_change': 8.3,
            'completion_rate': 78.2,
            'completion_change': 5.1,
            'teacher_satisfaction': 4.6,
            'satisfaction_change': 0.3,
            'recent_activities': [
                {
                    'id': 1,
                    'description': 'New teacher registered: Dr. Sarah Chen',
                    'time': '2 hours ago',
                    'icon': '👨🏫'
                },
                {
                    'id': 2,
                    'description': 'Course completed: Advanced Mathematics',
                    'time': '5 hours ago',
                    'icon': '📚'
                },
                {
                    'id': 3,
                    'description': 'New enrollment: John Smith in Physics 101',
                    'time': '1 day ago',
                    'icon': '📝'
                }
            ]
        })

class OwnerSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOwner]

    def list(self, request):
        # Return current settings
        return Response({
            'settings': {
                'siteName': 'Learnique',
                'siteDescription': 'Premium Online Learning Platform',
                'contactEmail': 'contact@learnique.com',
                'supportEmail': 'support@learnique.com',
                'aiEnabled': True,
                'aiProvider': 'openai',
                'maintenanceMode': False,
                'allowRegistration': True
            },
            'api_keys': {
                'openai': '***HIDDEN***',
                'anthropic': '***HIDDEN***'
            }
        })

    def create(self, request):
        # Update settings
        # In a real implementation, this would save to database or environment
        # For now, we'll just return success
        settings = request.data.get('settings', {})
        api_keys = request.data.get('api_keys', {})
        
        # Here you would typically save these to a database or configuration file
        # For this example, we'll just acknowledge the update
        
        return Response({
            'message': 'Settings updated successfully',
            'settings': settings,
            'api_keys': {key: '***HIDDEN***' for key in api_keys.keys()}
        })


class OwnerRequirementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOwner]
    serializer_class = StudentRequirementSerializer
    queryset = StudentRequirement.objects.all()

    def get_queryset(self):
        queryset = StudentRequirement.objects.select_related(
            'student__user', 'subject', 'class_level', 'assigned_teacher__user', 'approved_by'
        ).all().order_by('-created_at')
        
        search = self.request.query_params.get('search')
        status = self.request.query_params.get('status')
        subject = self.request.query_params.get('subject')
        class_level = self.request.query_params.get('class_level')
        
        if search:
            queryset = queryset.filter(
                student__user__first_name__icontains=search
            ) | queryset.filter(
                student__user__last_name__icontains=search
            ) | queryset.filter(
                student__student_id__icontains=search
            ) | queryset.filter(
                requirement_text__icontains=search
            )
        
        if status:
            queryset = queryset.filter(status=status)
        
        if subject:
            queryset = queryset.filter(subject_id=subject)
        
        if class_level:
            queryset = queryset.filter(class_level_id=class_level)
        
        return queryset

    @action(detail=True, methods=['get'])
    def matching_teachers(self, request, pk=None):
        requirement = self.get_object()
        teachers = TeacherProfile.objects.filter(
            user__is_active=True,
            user__role='TEACHER'
        ).select_related('user')
        
        # Could add more sophisticated matching logic here
        return Response(TeacherProfileSerializer(teachers, many=True).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        requirement = self.get_object()
        serializer = StudentRequirementAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        teacher_id = serializer.validated_data.get('teacher_id')
        action = serializer.validated_data.get('action', 'approve')
        
        if action == 'reject':
            requirement.status = 'REJECTED'
            requirement.approved_by = request.user
            requirement.approved_at = timezone.now()
            requirement.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
            return Response(StudentRequirementSerializer(requirement).data)
        
        if action in ['approve', 'reassign']:
            if not teacher_id:
                return Response({'error': 'teacher_id is required for approve/reassign.'}, status=status.HTTP_400_BAD_REQUEST)
            
            teacher = get_object_or_404(TeacherProfile, id=teacher_id)
            
            with transaction.atomic():
                requirement.assigned_teacher = teacher
                requirement.status = 'ACTIVE'
                requirement.approved_by = request.user
                requirement.approved_at = timezone.now()
                requirement.save(update_fields=['assigned_teacher', 'status', 'approved_by', 'approved_at', 'updated_at'])
                
                # Create or get conversation
                student_user = requirement.student.user
                teacher_user = teacher.user
                subject = requirement.subject
                
                conversation, created = Conversation.objects.get_or_create(
                    student=student_user,
                    teacher=teacher_user,
                    subject=subject,
                    requirement=requirement,
                    defaults={'status': 'ACTIVE'}
                )
                
                if not created:
                    conversation.status = 'ACTIVE'
                    conversation.save(update_fields=['status', 'updated_at'])
            
            return Response(StudentRequirementSerializer(requirement).data)
        
        if action == 'suspend':
            requirement.status = 'CANCELLED'
            requirement.save(update_fields=['status', 'updated_at'])
            
            # Archive conversations
            Conversation.objects.filter(requirement=requirement).update(status='ARCHIVED')
            
            return Response(StudentRequirementSerializer(requirement).data)
        
        if action == 'close':
            requirement.status = 'COMPLETED'
            requirement.save(update_fields=['status', 'updated_at'])
            
            # Close conversations
            Conversation.objects.filter(requirement=requirement).update(status='CLOSED')
            
            return Response(StudentRequirementSerializer(requirement).data)
        
        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)