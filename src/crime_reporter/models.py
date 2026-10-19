from django.db import models
from noren.validators import alphabet_validator, number_validator, address_validator, email_validator, optional_date_in_past_validator, mandatory_date_and_time_in_past_validator
from django.core.exceptions import ValidationError
from datetime import date
from django.utils import timezone
from django.db import transaction


# Create your models here.

class Person(models.Model):
    name = models.CharField(max_length=80, validators=[alphabet_validator])
    address = models.CharField(max_length=255, blank=True, validators=[address_validator])
    date_of_birth = models.DateField(blank=True, null=True, validators=[optional_date_in_past_validator])
    contact_number = models.CharField(max_length=255, blank=True, null=True, validators=[number_validator])
    email = models.CharField(max_length=255, blank=True, null=True, validators=[email_validator])
    
    # clean here is validation
    def clean(self):
        if self.name == "":
            raise ValidationError("Name cannot be empty.")
        
    def is_valid(self):
        return self.name != "" and (self.date_of_birth == None or self.date_of_birth <= date.today())

    def __str__(self):
        return f"{self.name} (DOB: {self.date_of_birth})" 
    

class IncidentSequence(models.Model):
    date = models.DateField(unique=True)
    last_number = models.PositiveIntegerField(default=0)
    
class Incident(models.Model):
    victim = models.ManyToManyField(Person, blank=True, related_name="incidents_as_victim")
    suspect = models.ManyToManyField(Person, blank=True, related_name="incidents_as_suspect")
    witness = models.ManyToManyField(Person, blank=True, related_name="incidents_as_witness")
    reporting_person = models.ForeignKey(Person, related_name="incidents_as_reporting_person", on_delete=models.CASCADE)
    incident_reference = models.CharField(max_length=20, editable=False)
    class IncidentType(models.TextChoices):
        homicide = 'Homicide'
        grevious_bodily_harm = 'Grevious Bodily Harm'
        arson = 'Arson'
        sexual_assault = 'Sexual Assault'
        sudden_death = 'Sudden Death'
    incident_type = models.CharField(max_length=50, choices=IncidentType.choices)
    location = models.CharField(max_length=255, validators=[address_validator])
    date_and_time_of_incident = models.DateTimeField(default=timezone.now, 
                                                     validators=[mandatory_date_and_time_in_past_validator])
        
    def is_valid(self):
        return self.location != "" and self.date_and_time_of_incident <= timezone.now()

    def __str__(self):
        return f"{self.incident_reference}: {self.incident_type} in {self.location}"
    
    def save(self, *args, **kwargs):
        if not self.incident_reference:
            today = timezone.now().date()

            with transaction.atomic():
                seq, created = IncidentSequence.objects.select_for_update().get_or_create(
                    date=today
                )
                seq.last_number += 1
                seq.save()
                self.incident_reference = f"{today.strftime('%Y%m%d')}-{seq.last_number:04d}"
        super().save(*args, **kwargs)
    
class Vehicle(models.Model):
    make = models.CharField(max_length=50, validators=[alphabet_validator]) 
    model = models.CharField(max_length=50)
    vehicle_reg = models.CharField(max_length=15, validators=[address_validator])
    vin_number= models.CharField(max_length=50, validators=[address_validator])
    incidents = models.ManyToManyField(Incident, blank=True, related_name="involved_vehicles")

    def __str__(self):
        return self.vehicle_reg

    