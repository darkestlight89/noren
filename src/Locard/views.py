from django.shortcuts import render
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout as django_logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from crime_reporter.serializers import IncidentSerializer, PersonSerializer, VehicleSerializer
from crime_reporter.models import Person, Incident, Vehicle
from .models import ForensicEmployee
from django.db.models import Q


# Create your views here.

  