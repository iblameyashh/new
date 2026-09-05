from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response

from courses.models import ClassLevel, Course, Subject
from enrollments.models import Enrollment, Review, StudentRequirement
from learning.models import Assignment, CourseModule, Lesson, StudentProgress, AssignmentSubmission
from messaging.models import Conversation, Message
from users.models import StudentProfile, TeacherProfile, User
from .learning_serializers import AssignmentSerializer, CourseModuleSerializer
from .serializers import (
    ClassLevelSerializer, ConversationSerializer, CourseSerializer, EnrollmentSerializer,
    MessageSerializer, ReviewSerializer, StudentProfileSerializer, SubjectSerializer,
    TeacherProfileSerializer, UserSerializer,
    StudentRequirementSerializer, StudentRequirementCreateSerializer, StudentRequirementAssignSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.is_authenticated and (request.user.is_staff or request.user.role == 'ADMIN'))


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Course.objects.select_related('teacher__user', 'subject', 'class_level').order_by('-created_at')
        if self.request.query_params.get('active', 'true').lower() != 'false':
            qs = qs.filter(is_active=True)
        for key, field in [('subject', 'subject_id'), ('class_level', 'class_level_id'), ('teacher', 'teacher_id')]:
            value = self.request.query_params.get(key)
            if value:
                qs = qs.filter(**{field: value})
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)
        return qs


class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = TeacherProfile.objects.select_related('user').all()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(user__first_name__icontains=search) | qs.filter(user__last_name__icontains=search)
        return qs.distinct()


class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return StudentProfile.objects.select_related('user').all()
        if user.role == 'TEACHER':
            return StudentProfile.objects.filter(enrollments__course__teacher__user=user).select_related('user').distinct()
        return StudentProfile.objects.filter(user=user).select_related('user')


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]


class ClassLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClassLevel.objects.all().order_by('name')
    serializer_class = ClassLevelSerializer
    permission_classes = [permissions.AllowAny]


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.select_related('student__user', 'course__teacher__user', 'course__subject', 'course__class_level')
        if user.is_staff or user.role == 'ADMIN': return qs
        if user.role == 'TEACHER': return qs.filter(course__teacher__user=user)
        return qs.filter(student__user=user)

    def create(self, request, *args, **kwargs):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Only students can enroll in courses.'}, status=status.HTTP_403_FORBIDDEN)
        course = get_object_or_404(Course, id=request.data.get('course_id'), is_active=True)
        student = get_object_or_404(StudentProfile, user=request.user)
        enrollment, created = Enrollment.objects.get_or_create(student=student, course=course)
        if not created and not enrollment.is_active:
            enrollment.is_active = True; enrollment.save(update_fields=['is_active'])
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        if request.user.role not in ('TEACHER', 'ADMIN') and not request.user.is_staff:
            return Response({'error': 'You do not have permission to modify enrollments.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Review.objects.select_related('student__user', 'course__teacher__user', 'course').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Only students can submit reviews.'}, status=status.HTTP_403_FORBIDDEN)
        course = get_object_or_404(Course, id=request.data.get('course'))
        student = get_object_or_404(StudentProfile, user=request.user)
        if not Enrollment.objects.filter(student=student, course=course, is_active=True).exists():
            return Response({'error': 'You must be enrolled in this course to review it.'}, status=status.HTTP_403_FORBIDDEN)
        if Review.objects.filter(student=student, course=course).exists():
            return Response({'error': 'You have already reviewed this course.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data); serializer.is_valid(raise_exception=True)
        review = serializer.save(student=student, course=course)
        return Response(self.get_serializer(review).data, status=status.HTTP_201_CREATED)



class CourseLearningViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        qs = CourseModule.objects.filter(course_id=course_id).prefetch_related('lessons')
        if self.request.user.is_staff or self.request.user.role == 'ADMIN': return qs
        if self.request.user.role == 'STUDENT': return qs.filter(course__enrollments__student__user=self.request.user, course__enrollments__is_active=True).distinct()
        if self.request.user.role == 'TEACHER': return qs.filter(course__teacher__user=self.request.user)
        return qs.none()


class AssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        qs = Assignment.objects.filter(course_id=course_id)
        if self.request.user.is_staff or self.request.user.role == 'ADMIN': return qs
        if self.request.user.role == 'STUDENT': return qs.filter(course__enrollments__student__user=self.request.user, course__enrollments__is_active=True).distinct()
        if self.request.user.role == 'TEACHER': return qs.filter(course__teacher__user=self.request.user)
        return qs.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_message_count(request):
    conversation = get_object_or_404(Conversation, id=request.query_params.get('conversation_id'))
    if request.user not in (conversation.student, conversation.teacher):
        return Response({'error': 'You are not a participant in this conversation.'}, status=status.HTTP_403_FORBIDDEN)
    count = Message.objects.filter(conversation=conversation, is_read=False).exclude(sender=request.user).count()
    return Response({'count': count})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    data = request.data
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email__iexact=email).exists() or User.objects.filter(username=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
    role = str(data.get('role', 'STUDENT')).upper()
    if role not in ('STUDENT', 'TEACHER'):
        role = 'STUDENT'
    try:
        user = User.objects.create_user(
            username=email, email=email, password=password,
            first_name=str(data.get('first_name', '')).strip(),
            last_name=str(data.get('last_name', '')).strip(),
            phone_number=str(data.get('phone_number', '')).strip(),
            role=role
        )
        if role == 'TEACHER':
            TeacherProfile.objects.create(user=user, qualification=str(data.get('qualification', 'Teacher')).strip() or 'Teacher', experience=0)
        else:
            StudentProfile.objects.create(user=user, class_level=str(data.get('class_level', '')).strip())
    except IntegrityError:
        return Response({'error': 'Unable to create account. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    data = UserSerializer(request.user).data
    if request.user.role == 'STUDENT':
        profile = StudentProfile.objects.filter(user=request.user).first()
        data['student_profile'] = StudentProfileSerializer(profile).data if profile else None
        data['teacher_profile'] = None
    elif request.user.role == 'TEACHER':
        profile = TeacherProfile.objects.filter(user=request.user).first()
        data['teacher_profile'] = TeacherProfileSerializer(profile).data if profile else None
        data['student_profile'] = None
    else:
        data['student_profile'] = None; data['teacher_profile'] = None
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def password_change(request):
    if not (request.user.is_staff or request.user.role == 'ADMIN'):
        return Response({'error':'Only an owner/admin can change another user password.'}, status=status.HTTP_403_FORBIDDEN)
    user_id = request.data.get('user_id'); password = str(request.data.get('password',''))
    if not user_id or len(password) < 8: return Response({'error':'user_id and password of at least 8 characters are required.'}, status=status.HTTP_400_BAD_REQUEST)
    target = get_object_or_404(User, id=user_id); target.set_password(password); target.save(update_fields=['password'])
    return Response({'message':'Password updated successfully.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_lesson_complete(request, lesson_id):
    if request.user.role != 'STUDENT': return Response({'error':'Only students can mark lessons complete.'}, status=status.HTTP_403_FORBIDDEN)
    lesson = get_object_or_404(Lesson, id=lesson_id); student = get_object_or_404(StudentProfile, user=request.user)
    if not Enrollment.objects.filter(student=student, course=lesson.module.course, is_active=True).exists(): return Response({'error':'You are not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)
    progress, _ = StudentProgress.objects.get_or_create(student=student, lesson=lesson)
    progress.is_completed = True; progress.save()
    total = Lesson.objects.filter(module__course=lesson.module.course).count()
    done = StudentProgress.objects.filter(student=student, lesson__module__course=lesson.module.course, is_completed=True).count()
    enrollment = Enrollment.objects.filter(student=student, course=lesson.module.course).first()
    pct = int(done * 100 / total) if total else 0
    if enrollment: enrollment.progress = pct; enrollment.save(update_fields=['progress'])
    return Response({'message':'Lesson marked as completed.', 'progress':pct})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_assignment(request, assignment_id):
    if request.user.role != 'STUDENT': return Response({'error':'Only students can submit assignments.'}, status=status.HTTP_403_FORBIDDEN)
    assignment = get_object_or_404(Assignment, id=assignment_id); student = get_object_or_404(StudentProfile, user=request.user)
    if not Enrollment.objects.filter(student=student, course=assignment.course, is_active=True).exists(): return Response({'error':'You are not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)
    content = str(request.data.get('content','')).strip()
    if not content: return Response({'error':'Submission content is required.'}, status=status.HTTP_400_BAD_REQUEST)
    sub, _ = AssignmentSubmission.objects.update_or_create(assignment=assignment, student=student, defaults={'content':content})
    return Response({'id':sub.id,'message':'Assignment submitted successfully.','content':sub.content})


class StudentRequirementViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentRequirementCreateSerializer
        return StudentRequirementSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return StudentRequirement.objects.select_related(
                'student__user', 'subject', 'class_level', 'assigned_teacher__user', 'approved_by'
            ).all().order_by('-created_at')
        if user.role == 'TEACHER':
            return StudentRequirement.objects.filter(
                assigned_teacher__user=user
            ).select_related('student__user', 'subject', 'class_level', 'assigned_teacher__user', 'approved_by')
        return StudentRequirement.objects.filter(
            student__user=user
        ).select_related('student__user', 'subject', 'class_level', 'assigned_teacher__user', 'approved_by')

    def perform_create(self, serializer):
        student = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student=student)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        requirement = self.get_object()
        if requirement.student.user != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        if requirement.status not in ['PENDING', 'APPROVED']:
            return Response({'error': 'Cannot cancel requirement in current state.'}, status=status.HTTP_400_BAD_REQUEST)
        requirement.status = 'CANCELLED'
        requirement.save(update_fields=['status', 'updated_at'])
        return Response(StudentRequirementSerializer(requirement).data)


class TeacherMatchingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        subject_id = request.query_params.get('subject_id')
        class_level_id = request.query_params.get('class_level_id')
        if not subject_id:
            return Response({'error': 'subject_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        teachers = TeacherProfile.objects.filter(
            user__is_active=True,
            user__role='TEACHER'
        ).select_related('user')
        
        if class_level_id:
            # Could filter by teacher's courses that match class_level
            pass
        
        # For now, return all teachers matching subject
        # In a real implementation, you'd have a many-to-many for teacher subjects
        return Response(TeacherProfileSerializer(teachers, many=True).data)


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Conversation.objects.filter(student=user) | Conversation.objects.filter(teacher=user)
        
        requirement_id = self.request.query_params.get('requirement_id')
        if requirement_id:
            qs = qs.filter(requirement_id=requirement_id)
        
        return qs.select_related('student', 'teacher', 'subject', 'requirement').distinct().order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        teacher_id = request.data.get('teacher_id')
        student_id = request.data.get('student_id')
        requirement_id = request.data.get('requirement_id')

        if requirement_id:
            req = get_object_or_404(StudentRequirement, id=requirement_id)
            if request.user not in (req.student.user, req.assigned_teacher.user if req.assigned_teacher else None) and request.user.role != 'ADMIN':
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            if not req.assigned_teacher:
                return Response({'error': 'Requirement is not yet assigned to a teacher.'}, status=status.HTTP_400_BAD_REQUEST)
            conv, created = Conversation.objects.get_or_create(
                student=req.student.user,
                teacher=req.assigned_teacher.user,
                requirement=req,
                defaults={'subject': req.subject, 'status': 'ACTIVE'}
            )
            return Response(self.get_serializer(conv).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        if request.user.role == 'STUDENT':
            student = request.user
            teacher = get_object_or_404(User, id=teacher_id, role='TEACHER')
        elif request.user.role == 'TEACHER':
            teacher = request.user
            student = get_object_or_404(User, id=student_id)
        elif request.user.role == 'ADMIN':
            student = get_object_or_404(User, id=student_id)
            teacher = get_object_or_404(User, id=teacher_id, role='TEACHER')
        else:
            return Response({'error': 'Only students and teachers can start conversations.'}, status=status.HTTP_403_FORBIDDEN)
        
        conv = Conversation.objects.filter(student=student, teacher=teacher, requirement__isnull=True).first()
        if conv:
            return Response(self.get_serializer(conv).data, status=status.HTTP_200_OK)
        conversation = Conversation.objects.create(student=student, teacher=teacher)
        return Response(self.get_serializer(conversation).data, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.filter(conversation__student=user) | Message.objects.filter(conversation__teacher=user)
        
        conversation_id = self.request.query_params.get('conversation_id')
        if conversation_id:
            qs = qs.filter(conversation_id=conversation_id)
        return qs.select_related('sender').order_by('timestamp').distinct()

    def create(self, request, *args, **kwargs):
        conversation = get_object_or_404(Conversation, id=request.data.get('conversation'))
        user = request.user
        
        if user not in (conversation.student, conversation.teacher) and user.role != 'ADMIN':
            return Response({'error': 'You are not a participant in this conversation.'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status == 'CLOSED':
            return Response({'error': 'Conversation is closed.'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.requirement and conversation.requirement.status not in ['APPROVED', 'ACTIVE']:
            return Response({'error': 'Associated requirement is not active.'}, status=status.HTTP_403_FORBIDDEN)
        
        content = str(request.data.get('content', '')).strip()
        if not content:
            return Response({'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        msg = Message.objects.create(conversation=conversation, sender=user, content=content)
        
        conversation.updated_at = msg.timestamp
        conversation.save(update_fields=['updated_at'])
        
        return Response(self.get_serializer(msg).data, status=status.HTTP_201_CREATED)

