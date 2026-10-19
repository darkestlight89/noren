from rest_framework import serializers
from .models import Incident, Person, Vehicle
from noren.validators import alphabet_validator, number_validator, address_validator, email_validator
from datetime import date
from django.core.exceptions import ValidationError

def has_meaningful_data(person):
    return any(v not in ("", None) and str(v).strip() != "" for v in person.values())

class PersonSerializer(serializers.ModelSerializer):

    # Ensure that data is protected if GET is used using write only 
    first_name = serializers.CharField(write_only=True, validators=[alphabet_validator])
    family_name = serializers.CharField(write_only=True, validators=[alphabet_validator])
    date_of_birth = serializers.DateField()
    contact_number = serializers.CharField(required=False, validators=[number_validator])
    email = serializers.CharField(required=False, validators=[email_validator])

    # Only for GET, not POST
    name = serializers.CharField(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        role = self.context.get("role")
        if role == "reporting_person":
            self.fields["contact_number"].required = True
            self.fields["email"].required = True

   # Config for rest_framework
    class Meta:
        model = Person
        fields = ['first_name', 'family_name', 'name', 'date_of_birth', 'contact_number', 'email', 'id']

    # Auto-runs - to clean data
    def to_internal_value(self, data):
        if "email" in data and data["email"] == "":
            data["email"] = None
        # Return to normal DRF processing
        return super().to_internal_value(data)
    
    # Full clean allows for model level validation using clean()
    def validate(self, attrs):
        attrs = super().validate(attrs)
        person = Person(
            name=f"{attrs['first_name']} {attrs['family_name']}",
            date_of_birth=attrs.get('date_of_birth'),
            contact_number=attrs.get('contact_number'),
            email=attrs.get('email'),
        )
        try:
            person.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return attrs

    # Create new person
    def create(self, validated_data):
        name = f"{validated_data['first_name']} {validated_data['family_name']}"
        date_of_birth = validated_data['date_of_birth']
        contact_number = validated_data.get("contact_number")
        email = validated_data.get("email")

        # Check if person already exists
        person = Person.objects.filter(name=name, date_of_birth=date_of_birth).first()
        if person:
            return person
        return Person.objects.create(name=name, 
                                     date_of_birth=date_of_birth, 
                                     contact_number=contact_number, 
                                     email=email)
    
class VehicleSerializer(serializers.ModelSerializer):
    incidents = serializers.StringRelatedField(many=True)
    class Meta: 
        model = Vehicle
        fields = "__all__"

    # Catch entries with white space only
    def validate(self, attrs):
        if attrs.get("make", "").strip() == "":
            raise ValidationError("Make cannot be blank")
        if attrs.get("model", "").strip == "":
            raise ValidationError("Model cannot be blank")
        if attrs.get("vehicle_reg", "").strip == "":
            raise ValidationError("Vehicle reg cannot be blank")
        if attrs.get("vin_number", "").strip == "":
            raise ValidationError("VIN number cannot be blank")
        return attrs


class IncidentSerializer(serializers.ModelSerializer):

    location = serializers.CharField(validators=[address_validator])
    incident_type = serializers.ChoiceField(choices=Incident.IncidentType.choices)
    victim_self_switch = serializers.BooleanField(default=False)
    date_and_time_of_incident = serializers.DateTimeField()
    involved_vehicles = VehicleSerializer(
        many=True, 
        required=False
    )
    
    # Runs all of the validate functions in PersonSerializer 
    victim = PersonSerializer(many=True, required=False)
    suspect = PersonSerializer(many=True, required=False)
    witness = PersonSerializer(many=True, required=False)
    reporting_person = PersonSerializer()

    class Meta:
        model = Incident
        fields = [
            'reporting_person',
            'incident_type',
            'location',
            'date_and_time_of_incident',
            'victim',
            'suspect',
            'witness',
            'victim_self_switch', 
            'pk',
            'incident_reference', 
            'involved_vehicles'
        ]

    # List of nested person fields for DRY processing
    M2M_FIELDS = ['victim', 'suspect', 'witness']

    def validate(self, attrs):
       # Override M2M validate for nested keys:
        for field_name in self.M2M_FIELDS:
            data = attrs.get(field_name)

            # Ignore if empty
            if not data:
                continue

            # Filter out completely empty dicts
            filtered_data = [p for p in data if has_meaningful_data(p)]
            if filtered_data:
                attrs[field_name] = filtered_data
            else:
                attrs.pop(field_name, None)
        return attrs

    def create(self, validated_data):
        # Create reporting person
        reporting_person_data = validated_data.pop("reporting_person")

        reporting_person_serializer = PersonSerializer(
            data=reporting_person_data,
            context={"role": "reporting_person"}
        )
        reporting_person_serializer.is_valid(raise_exception=True)
        reporting_person = reporting_person_serializer.save()

        self_victim = validated_data.pop("victim_self_switch", False)

        # Create the incident without nested persons first 
        incident = Incident.objects.create(
            reporting_person=reporting_person,
            incident_type=validated_data['incident_type'],
            location=validated_data['location'],
            date_and_time_of_incident=validated_data['date_and_time_of_incident']
        )

        # Loop through all nested person fields and create/add them (Victims, Witnesses, Suspects)
        for field_name in self.M2M_FIELDS:

            people_data = validated_data.pop(field_name, None)
            if not people_data:
                continue

            saved_people = []

            for person_data in people_data:
                serializer = PersonSerializer(
                    data=person_data,
                    context={"role": field_name}
                )
                serializer.is_valid(raise_exception=True)

                # Preset DRF function 
                saved_people.append(serializer.save())

            getattr(incident, field_name).set(saved_people)

        # Has to go after set to prevent being overwritten. 
        # Cannot directly add it to incident upon making it as M2M field    
        if self_victim:
            incident.victim.add(reporting_person)

        return incident
    
