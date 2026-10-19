from django.db import models, transaction
from django.contrib.auth.models import User
from noren.validators import alphabet_validator, number_validator, address_validator, email_validator, alphanumeric_validator, mandatory_date_in_past_validator, mandatory_date_and_time_in_past_validator
from crime_reporter.models import Incident
from django.utils import timezone
from datetime import date
from django.core.exceptions import ValidationError

# Create your models here.

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    shoulder_number = models.CharField(max_length=10, unique=True, validators=[alphanumeric_validator])

    def __str__(self):
        return self.shoulder_number

class LogEntry(models.Model):
    author = models.ForeignKey(Employee, 
                               related_name="posted_log_entries", 
                               on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    content = models.TextField()
    incident = models.ForeignKey(Incident, related_name="incident_log_entries", on_delete=models.CASCADE)

class Task(models.Model):
    sender = models.ForeignKey(Employee, related_name="sent_tasks", on_delete=models.CASCADE)
    reciever = models.ForeignKey(Employee, related_name="received_tasks", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    incident = models.ForeignKey(Incident, related_name="incident_tasks", on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)

class Exhibit(models.Model):
    exhibit_reference = models.CharField(max_length=50)
    exhibit_description = models.CharField(max_length=500)
    seizure_location = models.CharField(max_length=500, validators=[address_validator])
    date_and_time_of_seizure = models.DateTimeField(default=timezone.now, validators=[mandatory_date_and_time_in_past_validator])
    current_location = models.CharField(default="Scene", max_length=50, editable=False)
    incident = models.ForeignKey(Incident, related_name="exhibits", on_delete=models.CASCADE)
    seizing_officer = models.ForeignKey(Employee, related_name="seized_exhbits", on_delete=models.CASCADE)

    # clean here is validation
    def clean(self):
        # Access exhibits of incident where exhibit references are the same (not itself)
        if self.incident.exhibits.filter(exhibit_reference=self.exhibit_reference).exclude(pk=self.pk).exists():
            raise ValidationError("Exhibit reference already exists for this incident")

    def __str__(self):
        return f"{self.exhibit_reference} - {self.exhibit_description}"

class Movement(models.Model):
    from_location = models.CharField(max_length=50, editable=False)
    class Pre_Determined_Locations(models.TextChoices):
        police_station = "Police Station"
        secure_store = "Secure Store"
        evidence_management_unit = "Evidence Management Unit"
    to_location = models.CharField(max_length=50, choices=Pre_Determined_Locations.choices)
    exhibit = models.ForeignKey(Exhibit, related_name="movements", on_delete=models.CASCADE)
    movement_date = models.DateField(default=date.today, validators=[mandatory_date_in_past_validator])

    def clean(self):
        if self.from_location == self.to_location:
            raise ValidationError("The exhibit is already at this location.")

    def save(self,*args,**kwargs):
        with transaction.atomic():
            self.from_location = self.exhibit.current_location
            # Save movement
            super().save(*args, **kwargs)
            self.exhibit.current_location = self.to_location
            # Save exhibit
            self.exhibit.save(update_fields=["current_location"])
        
