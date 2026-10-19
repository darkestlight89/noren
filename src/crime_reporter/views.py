from django.shortcuts import render
from django.http import JsonResponse
from .models import Incident, Person
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from .serializers import IncidentSerializer, PersonSerializer


# Create your views here.
## API ##
# GET #
def get_articles(request, start_int, end_int):
    data = []
    for i in range(start_int, end_int+1):
        data.append(f"Some NewsheadLine #{i}") 
    return JsonResponse({"Posts": data}, status=200, safe=False)

def get_incident_types(request):
    incident_types = Incident._meta.get_field('incident_type')
    updated_incident_types = []
    for incident in incident_types.choices:
        updated_incident_types.append(incident[1])
    return JsonResponse({"incident_types": updated_incident_types}, status=200, safe=False) 

# SET #
@api_view(['POST'])
@ensure_csrf_cookie
def set_report(request):
    serializer = IncidentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Nested people are handled automatically
        return JsonResponse({"message": "Report successful."}, status=201)
    # Return validation errors if invalid
    return JsonResponse({"errors": serializer.errors}, status=400)

# Auxillary Views
@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({"message": "CSRF cookie set"})




