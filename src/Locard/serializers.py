from rest_framework import serializers
from .models import ForensicEmployee

class ForensicEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForensicEmployee
        fields = "__all__"
