from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Employee, Task, LogEntry, Exhibit, Movement
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

class LoginSerializer(serializers.Serializer):
    shoulder_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            shoulder_number=data['shoulder_number'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        # attach user for the view
        data['user'] = user  
        return data

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"

class TaskSerializer(serializers.ModelSerializer):
    incident = serializers.StringRelatedField()
    reciever = EmployeeSerializer(read_only=True)
    sender = EmployeeSerializer(read_only=True)
    reciever_shoulder_number = serializers.CharField(write_only=True)

    class Meta: 
        model = Task
        fields = ["incident", "reciever", "title", "sender", "reciever_shoulder_number", "id", "completed"]
        read_only_fields = ["sender", "incident", "id", "completed"]

    def create(self, validated_data):
        reciever_shoulder_number = validated_data.pop("reciever_shoulder_number")
        employee = get_object_or_404(Employee, shoulder_number=reciever_shoulder_number)
        return Task.objects.create(
            sender = self.context["sender"], 
            incident = self.context["incident"],
            reciever = employee, 
            **validated_data
        )

class ExhibitSerializer(serializers.ModelSerializer):
    seizing_officer = EmployeeSerializer(read_only=True)

    class Meta: 
        model = Exhibit
        fields = "__all__"
        read_only_fields = ["incident"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        exhibit = self.instance or Exhibit(incident=self.context["incident"], 
                                           seizing_officer = self.context["employee"], 
                                           **attrs)
        try:
            exhibit.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return attrs

    def create(self, validated_data):
        return Exhibit.objects.create(
            incident=self.context["incident"],
            seizing_officer = self.context["employee"],
            **validated_data
        )

class LogEntrySerializer(serializers.ModelSerializer):
    # Default read-only parameter
    author = serializers.StringRelatedField()

    class Meta:
        model = LogEntry
        fields = "__all__"
        read_only_fields = ["incident"]

    def create(self, validated_data):
        return LogEntry.objects.create(
            author=self.context["employee"],
            incident=self.context["incident"],
            **validated_data
        )
        
class MovementSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Movement
        fields = "__all__"
        read_only_fields = ["exhibit"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        movement = Movement(exhibit=self.context["exhibit"], 
                            from_location=self.context["exhibit"].current_location,
                            **attrs)
        try:
            movement.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return attrs

    def create(self, validated_data):
        return Movement.objects.create(
            exhibit=self.context["exhibit"],
            **validated_data
        )

    