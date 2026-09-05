from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('student', 'teacher', 'subject', 'requirement', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'subject')
    search_fields = ('student__username', 'teacher__username', 'subject__name')
    autocomplete_fields = ('student', 'teacher', 'subject', 'requirement')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'timestamp', 'is_read')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'content')
    autocomplete_fields = ('conversation', 'sender')
