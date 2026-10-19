from django.core.validators import RegexValidator, EmailValidator
from django.core.exceptions import ValidationError
from datetime import date
from django.utils import timezone

alphabet_validator = RegexValidator(r"^[a-zA-Z ]*$", "Only alphabetic [A-Z, a-z] characters are allowed.")
address_validator = RegexValidator(r"^[a-zA-Z0-9 ,]*$", "Only alphanumeric characters are allowed.")
alphanumeric_validator  = RegexValidator(r"^[a-zA-Z0-9]*$", "Only alphanumeric characters are allowed.")
number_validator = RegexValidator(r"^[0-9]{11}$", "Only numeric characters [0-9] are allowed. Numbers must be 11 digits.")
email_validator = EmailValidator()

def optional_date_in_past_validator(value):
    if value and value > date.today():
        raise ValidationError(
            "Date must be in the past."
        )

def mandatory_date_in_past_validator(value):
    if value > date.today():
        raise ValidationError(
            "Date must be in the past."
        )
    
def optional_date_and_time_in_past_validator(value):
    if value and value >= timezone.now():
        raise ValidationError(
            "Date and time must be in the past."
        )
    
def mandatory_date_and_time_in_past_validator(value):
    if value >= timezone.now():
        raise ValidationError(
            "Date and time must be in the past."
        )
    