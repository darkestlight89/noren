from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from .models import Employee  # note: relative import

User = get_user_model()

class ShoulderNumberBackend(ModelBackend):
    def authenticate(self, request, shoulder_number=None, password=None, **kwargs):
        try:
            employee = Employee.objects.get(shoulder_number=shoulder_number)
            user = employee.user

            if user.check_password(password):
                return user
        except Employee.DoesNotExist:
            return None