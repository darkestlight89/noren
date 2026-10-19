from django.test import TestCase
from .models import Employee, Task, Exhibit, Movement
from crime_reporter.models import Incident, Person
from django.contrib.auth.models import User
from django.utils import timezone
import os
import pathlib
import time
from datetime import date
from datetime import timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from django.core.exceptions import ValidationError

# Create your tests here.
class ExhibitTestCase(TestCase):
     
    def setUp(self):
        # Create Users
        User.objects.create_user(
            username="testemployee",
            password="testpassword"
        )

        # Create People
        test_employee = User.objects.get(username="testemployee")
        reporting_person = Person.objects.create(name="reporting_person")
        Employee.objects.create(user=test_employee, shoulder_number="t")
        Incident.objects.create(incident_type="Homicide", reporting_person=reporting_person, location='location1', date_and_time_of_incident=timezone.now())

        # Create Exhbits
        incident = Incident.objects.get(incident_type="Homicide")
        employee = Employee.objects.get(shoulder_number="t")
        Exhibit.objects.create(exhibit_reference="ABC/1", 
                                           exhibit_description="ABC/1", 
                                           seizure_location="Leighton Buzzard", 
                                           date_and_time_of_seizure=timezone.now(),
                                           incident=incident, 
                                           seizing_officer=employee
                                           )
        
    def test_is_Exhibit_valid(self):
        exhibit = Exhibit.objects.get(exhibit_reference="ABC/1")

        # Will fail if validation fails
        exhibit.full_clean()

    def test_duplicate_exhibit_reference_is_invalid(self):
        incident = Incident.objects.get(incident_type="Homicide")
        employee = Employee.objects.get(shoulder_number="t")

        duplicate = Exhibit.objects.create(
            exhibit_reference="ABC/1",
            exhibit_description="Duplicate exhibit",
            seizure_location="Leighton Buzzard",
            date_and_time_of_seizure=timezone.now(),
            incident=incident,
            seizing_officer=employee
        )

        # Will fail as same exhibit_reference
        with self.assertRaises(ValidationError):
            duplicate.full_clean()

    def test_exhibit_reference_is_valid(self):
        incident = Incident.objects.get(incident_type="Homicide")
        employee = Employee.objects.get(shoulder_number="t")

        exhibit = Exhibit.objects.create(
            exhibit_reference="ABC/2",
            exhibit_description="Duplicate exhibit",
            seizure_location="Leighton Buzzard",
            date_and_time_of_seizure=timezone.now(),
            incident=incident,
            seizing_officer=employee
        )

        # Will fail if validation fails
        exhibit.full_clean()
    
class MovementTestCase(TestCase):

    def setUp(self):
        # Create User
        User.objects.create_user(
            username="testemployee",
            password="testpassword"
        )

        # Create Employees from User
        test_employee = User.objects.get(username="testemployee")
        reporting_person = Person.objects.create(name="reporting_person")
        Employee.objects.create(user=test_employee, shoulder_number="t")
        Incident.objects.create(incident_type="Homicide", reporting_person=reporting_person, location='location1', date_and_time_of_incident=timezone.now())

        # Create Exhbits
        incident = Incident.objects.get(incident_type="Homicide")
        employee = Employee.objects.get(shoulder_number="t")
        Exhibit.objects.create(exhibit_reference="ABC/1", 
                                           exhibit_description="ABC/1", 
                                           seizure_location="Leighton Buzzard", 
                                           date_and_time_of_seizure=timezone.now(),
                                           incident=incident, 
                                           seizing_officer=employee
                                           )
        
    def test_movement_is_valid(self):
        exhibit = Exhibit.objects.get(exhibit_reference="ABC/1")
        movement = Movement.objects.create(from_location="Police Station", 
                                        to_location="Evidence Management Unit", 
                                        exhibit=exhibit, 
                                        movement_date=date.today())
        # Will fail if validation fails
        movement.full_clean()

    def test_movement_is_not_valid(self):
        exhibit = Exhibit.objects.get(exhibit_reference="ABC/1")
        movement = Movement.objects.create(
                                        to_location=exhibit.current_location, 
                                        exhibit=exhibit, 
                                        movement_date=date.today())
        
        # Will fail if validation fails
        with self.assertRaises(ValidationError):
            movement.full_clean()
