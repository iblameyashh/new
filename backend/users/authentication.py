"""Authentication backends.

The site logs users in with the email field, but seeded/demo accounts can
have a username that differs from their email (e.g. username ``john_math``,
email ``john@learnique.edu``). SimpleJWT's default flow authenticates with
the ``username`` field only, which silently locked those users out of the
UI. This backend resolves the submitted value as an email first, then as a
username, so both forms always work.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailOrUsernameBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None:
            return None
        try:
            user = User.objects.get(email__iexact=username)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            user = None
        if user is None:
            try:
                user = User.objects.get(username__iexact=username)
            except User.DoesNotExist:
                return None
        if self.user_can_authenticate(user) and user.check_password(password):
            return user
        return None
