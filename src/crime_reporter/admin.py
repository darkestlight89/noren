from django.contrib import admin
from .models import Person, Incident, Vehicle

# Register your models here.
admin.site.register(Person)
admin.site.register(Incident)
admin.site.register(Vehicle)