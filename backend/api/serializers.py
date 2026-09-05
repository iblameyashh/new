from rest_framework import serializers
from courses.models import ClassLevel, Course, Subject
from enrollments.models import Enrollment, Review, StudentRequirement
from messaging.models import Conversation, Message
from users.models import StudentProfile, TeacherProfile, User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone_number', 'profile_image', 'is_active'
        )
        read_only_fields = ('id', 'username', 'role')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    profile_image = serializers.ImageField(source='user.profile_image', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = TeacherProfile
        fields = ('id', 'user', 'name', 'qualification', 'experience', 'bio', 'profile_image', 'is_active')

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    profile_image = serializers.ImageField(source='user.profile_image', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ('id', 'user', 'name', 'class_level', 'student_id', 'profile_image', 'is_active')

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class ClassLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLevel
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=TeacherProfile.objects.all(), required=False
    )
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=TeacherProfile.objects.all(), source='teacher', write_only=True, required=False
    )
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False, allow_null=True
    )
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True, required=False, allow_null=True
    )
    class_level = serializers.PrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(), required=False, allow_null=True
    )
    class_level_id = serializers.PrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(), source='class_level', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Course
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['teacher'] = TeacherProfileSerializer(instance.teacher).data if instance.teacher else None
        rep['subject'] = SubjectSerializer(instance.subject).data if instance.subject else None
        rep['class_level'] = ClassLevelSerializer(instance.class_level).data if instance.class_level else None
        return rep


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = StudentProfileSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    teacher = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'student', 'course', 'teacher', 'rating', 'review_text', 'created_at')
        read_only_fields = ('student', 'teacher', 'created_at')

    def get_teacher(self, obj):
        return TeacherProfileSerializer(obj.course.teacher).data


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sender', 'timestamp', 'is_read')


class ConversationSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    teacher = UserSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    requirement = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'student', 'teacher', 'subject', 'requirement', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'student', 'teacher', 'subject', 'requirement', 'status', 'created_at', 'updated_at')

    def get_requirement(self, obj):
        if obj.requirement:
            return {
                'id': obj.requirement.id,
                'requirement_text': obj.requirement.requirement_text,
                'status': obj.requirement.status,
            }
        return None


class StudentRequirementSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    class_level = ClassLevelSerializer(read_only=True)
    assigned_teacher = serializers.SerializerMethodField()
    approved_by = UserSerializer(read_only=True)

    class Meta:
        model = StudentRequirement
        fields = '__all__'
        read_only_fields = ('id', 'student', 'status', 'assigned_teacher', 'approved_by', 'approved_at', 'created_at', 'updated_at')

    def get_assigned_teacher(self, obj):
        if obj.assigned_teacher:
            return TeacherProfileSerializer(obj.assigned_teacher).data
        return None


class StudentRequirementCreateSerializer(serializers.ModelSerializer):
    subject_id = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), source='subject', write_only=True)
    class_level_id = serializers.PrimaryKeyRelatedField(queryset=ClassLevel.objects.all(), source='class_level', write_only=True)

    class Meta:
        model = StudentRequirement
        fields = ('id', 'subject_id', 'class_level_id', 'requirement_text', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')

    def create(self, validated_data):
        if 'student' not in validated_data and 'request' in self.context:
            user = self.context['request'].user
            validated_data['student'] = StudentProfile.objects.get(user=user)
        return super().create(validated_data)


class StudentRequirementAssignSerializer(serializers.Serializer):
    teacher_id = serializers.IntegerField(required=False, allow_null=True)
    action = serializers.ChoiceField(choices=['approve', 'reject', 'reassign', 'suspend', 'close'])

    def validate(self, attrs):
        action = attrs.get('action')
        teacher_id = attrs.get('teacher_id')
        if action in ['approve', 'reassign']:
            if not teacher_id:
                raise serializers.ValidationError({"teacher_id": "teacher_id is required for approve and reassign actions."})
            try:
                TeacherProfile.objects.get(id=teacher_id)
            except TeacherProfile.DoesNotExist:
                raise serializers.ValidationError({"teacher_id": "Teacher not found."})
        return attrs
