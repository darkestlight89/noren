from django.db import models
from crime_manager.models import Employee

# Create your models here.
class ForensicEmployee(models.Model):
    user = models.OneToOneField(Employee, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user}"