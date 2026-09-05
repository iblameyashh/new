import os

from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat(request):
    question = str(request.data.get('question', '')).strip()
    if not question:
        return Response({'error': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)

    api_key = os.getenv('AI_API_KEY', '').strip()
    model = os.getenv('AI_MODEL', 'gpt-4o-mini').strip()

    if not api_key:
        return Response(
            {'error': 'Learnique AI is not configured yet. Add AI_API_KEY on the backend.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are Learnique AI Assistant, an educational assistant. '
                        'Be helpful and clear. Never claim to be a human teacher and do not invent private Learnique data.'
                    ),
                },
                {'role': 'user', 'content': question},
            ],
        )
        reply = completion.choices[0].message.content or 'I could not generate a response.'
        return Response({'reply': reply})
    except Exception:
        return Response(
            {'error': 'The AI service is temporarily unavailable. Please try again.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )
