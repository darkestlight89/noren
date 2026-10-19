from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout as django_logout
from django.http import JsonResponse
from django.urls import reverse
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import LoginSerializer, EmployeeSerializer, TaskSerializer, LogEntrySerializer, ExhibitSerializer, MovementSerializer
from Locard.serializers import ForensicEmployeeSerializer
from Locard.models import ForensicEmployee
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from crime_reporter.serializers import IncidentSerializer, PersonSerializer, VehicleSerializer
from crime_reporter.models import Person, Incident, Vehicle
from .models import Employee, Task, LogEntry, Exhibit, Movement
from django.db.models import Q

# Create your views here.

@api_view(['POST'])
@ensure_csrf_cookie
def authorise_login(request):
    employee_serializer = LoginSerializer(data=request.data, context={'request': request})
    if employee_serializer.is_valid():
        user = employee_serializer.validated_data['user']
        login(request, user)
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({"error": "Employee profile missing"}, status=404)
        employee_serializer = EmployeeSerializer(employee)
        try: 
            forensic_employee = ForensicEmployee.objects.get(user=employee)
        except ForensicEmployee.DoesNotExist:
            return Response({
                "message": "login as non-forensic employee successful",
                "employee": employee_serializer.data
            }, status=200)
        forensic_serializer = ForensicEmployeeSerializer(forensic_employee)
        return Response({
                "message": "login as forensic employee successful",
                "employee": employee_serializer.data,
                "forensic_employee": forensic_serializer.data
            }, status=200)
    # Return detailed validation errors if invalid
    return JsonResponse({"errors": employee_serializer.errors}, status=400)
  
@api_view(['GET'])
# Keep user logged in
def current_user(request):
    if request.user.is_authenticated:
        employee = get_object_or_404(Employee, user=request.user)
        employee_serializer = EmployeeSerializer(employee)
        try: 
            forensic_employee = ForensicEmployee.objects.get(user=employee)
        except ForensicEmployee.DoesNotExist:
            return Response({
            "authenticated": True,
            "employee": employee_serializer.data
        })
        forensic_serializer = ForensicEmployeeSerializer(forensic_employee)
        return Response({
            "authenticated": True,
            "employee": employee_serializer.data,
            "forensic_employee":forensic_serializer.data
        })
    return JsonResponse({
        "authenticated": False
    }, status=401)

@api_view(['POST'])
def logout_view(request):
    print("LOGOUT VIEW HIT")
    django_logout(request)
    return JsonResponse({"message": "logged out"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_incidents(request):
    filter = request.GET.get("filter")
    query = request.GET.get("query")
    match filter: 
        case 'location':
            incidents = Incident.objects.filter(location=query)
        case 'incident_type':
            incidents = Incident.objects.filter(incident_type=query)
        case 'incident_reference':
            try:
                incident = Incident.objects.get(incident_reference=query)
                serializer = IncidentSerializer(incident)
                return Response({"incident": serializer.data}, status=200)   
            except Incident.DoesNotExist:
                incidents = Incident.objects.none()
        case 'date':
            incidents = Incident.objects.filter(date_and_time_of_incident__date=query)
        case 'incidents_as_reporting_person':
            try: 
                person = Person.objects.get(id=query)
                incidents = Incident.objects.filter(reporting_person=person)
            except Person.DoesNotExist:
                incidents = Incident.objects.none()
        case 'incidents_as_victim':
            try: 
                person = Person.objects.get(id=query)
                incidents = Incident.objects.filter(victim=person)
            except Person.DoesNotExist:
                incidents = Incident.objects.none()
        case 'incidents_as_suspect':
            try: 
                person = Person.objects.get(id=query)
                incidents = Incident.objects.filter(suspect=person)
            except Person.DoesNotExist:
                incidents = Incident.objects.none()
        case 'incidents_as_witness':
            try: 
                person = Person.objects.get(id=query)
                incidents = Incident.objects.filter(witness=person)
            except Person.DoesNotExist:
                incidents = Incident.objects.none()               
        case _:
            incidents = Incident.objects.all()
    serializer = IncidentSerializer(incidents, many=True)
    return Response({"incidents": serializer.data}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_objects(request):
    filter = request.GET.get("filter")
    query = request.GET.get("query")
    match filter:
        case "incident":
            incidents = Incident.objects.filter(incident_reference__icontains=query)
        case "location":
            incidents = Incident.objects.filter(location__icontains=query)
        case "person":
            person = Person.objects.filter(name__icontains=query)
            incidents = Incident.objects.filter(
                Q(reporting_person__in=person) |
                Q(victim__in=person) |
                Q(suspect__in=person) |
                Q(witness__in=person)).distinct()
        case "vehicle":
            # Many to many relationship
            incidents = Incident.objects.filter(involved_vehicles__vehicle_reg__icontains=query).distinct()
    serializer = IncidentSerializer(incidents, many=True)        
    return Response({"objects": serializer.data}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_person(request):
    id = request.GET.get("id")
    try:
        person = Person.objects.get(id=id)
    except Person.DoesNotExist:
        return Response({"error": "Person not found."}) 
    serializer = PersonSerializer(person)
    return Response({"person": serializer.data}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tasks(request):
    shoulder_number = request.GET.get("shoulder_number", "")
    if shoulder_number != "":
        employee = get_object_or_404(Employee, shoulder_number=shoulder_number)
        tasks = Task.objects.filter(reciever=employee)
    else:
        incident_reference = request.GET.get("incident_reference", "")
        incident = get_object_or_404(Incident, incident_reference=incident_reference)
        tasks = Task.objects.filter(incident=incident)
    serializer = TaskSerializer(tasks, many=True)
    return Response({"tasks": serializer.data}, status=200)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def update_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.completed = True
    # Only save one attribute of the model rather than all of them 
    task.save(update_fields=["completed"])
    return JsonResponse({"message": "Update successful."}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def set_task(request, incident_reference):
    sender = get_object_or_404(Employee, user=request.user)
    incident = get_object_or_404(Incident, incident_reference=incident_reference)
    serializer = TaskSerializer(data=request.data, context={"sender": sender, "incident": incident})
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Update successful."}, status=200)
    # Return validation errors if invalid
    return JsonResponse({"errors": serializer.errors}, status=400)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_log_entries(request):
    incident_reference = request.GET.get("incident_reference")
    try:
        incident = Incident.objects.get(incident_reference=incident_reference)
    except Incident.DoesNotExist:
        return Response({"error": "incident missing"}, status=404)
    log_entries = LogEntry.objects.filter(incident=incident)
    serializer = LogEntrySerializer(log_entries, many=True)
    return Response({"log_entries": serializer.data}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def set_log_entry(request, incident_reference):
    incident = get_object_or_404(Incident, incident_reference=incident_reference)
    employee = get_object_or_404(Employee, user=request.user)
    serializer = LogEntrySerializer(data=request.data, context={"employee": employee, "incident": incident})
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Report successful."}, status=201)
    # Return validation errors if invalid
    return JsonResponse({"errors": serializer.errors}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vehicle(request, vehicle_reg):
    vehicle = get_object_or_404(Vehicle, vehicle_reg=vehicle_reg)  
    serializer = VehicleSerializer(vehicle)
    return Response({"vehicle": serializer.data}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exhibits(request, incident_reference):
    incident = get_object_or_404(Incident, incident_reference=incident_reference)
    exhibits = Exhibit.objects.filter(incident=incident)
    serializer = ExhibitSerializer(exhibits, many=True)
    return Response({"exhibits": serializer.data}, status=200)

# Notice different API view for updating existing entries
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_exhibit(request, exhibit_id):
    exhibit = get_object_or_404(Exhibit, id=exhibit_id)
    # Partial = true so serializer does not expect all information. Need to send existing entry as well. 
    serializer = ExhibitSerializer(exhibit, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Update successful."}, status=200)
    # Return validation errors if invalid
    return JsonResponse({"errors": serializer.errors}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def set_exhibit(request, incident_reference, shoulder_number):
    incident = get_object_or_404(Incident, incident_reference=incident_reference)
    employee = get_object_or_404(Employee, shoulder_number=shoulder_number)
    serializer = ExhibitSerializer(data=request.data, context={"incident": incident, "employee": employee})
    if serializer.is_valid():
        serializer.save() 
        return JsonResponse({"message": "Exhibit successfully created"}, status=201)
    # Return validation errors if invalid
    return JsonResponse({"errors": serializer.errors}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pre_determined_locations(request):
    pre_determined_locations = Movement._meta.get_field('to_location')
    updated_pre_determined_locations = []
    for location in pre_determined_locations.choices:
        updated_pre_determined_locations.append(location[1])
    return JsonResponse({"pre_determined_locations": updated_pre_determined_locations}, status=200, safe=False) 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def set_movement(request, exhibit_id):
    exhibit = get_object_or_404(Exhibit, id=exhibit_id)
    serializer = MovementSerializer(data = request.data, context={"exhibit": exhibit})
    if serializer.is_valid():
        serializer.save()  # Nested people are handled automatically
        return JsonResponse({"message": "Movement successfully created"}, status=201)
    # Return validation errors if invalid
    return JsonResponse({"errors": serializer.errors}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employee_shoulder_numbers(request):
    employee_shoulder_numbers = []
    employees = Employee.objects.all()
    for employee in employees:
        employee_shoulder_numbers.append(employee.shoulder_number)
    return JsonResponse({"employee":employee_shoulder_numbers}, status=200, safe=False)
