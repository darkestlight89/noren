from django.urls import path

from . import views

urlpatterns = [
    path("api/auth/login/", views.authorise_login, name="authorise_login"),
    path("api/auth/current_user/", views.current_user, name="current_user"),
    path("api/auth/logout/", views.logout_view, name="logout"),
    path("api/get_incidents/", views.get_incidents, name="get_incidents"),
    path("api/get_person/", views.get_person, name="get_person"),
    path("api/get_tasks/", views.get_tasks, name="get_tasks"),
    path("api/update_task/<str:task_id>/", views.update_task, name="update_task"),
    path("api/set_task/<str:incident_reference>/", views.set_task, name="set_task"),
    path("api/get_log_entries/", views.get_log_entries, name="get_log_entries"),
    path("api/<str:incident_reference>/set_log_entry/", views.set_log_entry, name="set_log_entry"),
    path("api/get_exhibits/<str:incident_reference>/", views.get_exhibits, name="get_exhibits"),
    path("api/update_exhibit/<str:exhibit_id>/", views.update_exhibit, name="update_exhibit"),
    path("api/<str:incident_reference>/set_exhibit/<str:shoulder_number>/", views.set_exhibit, name="set_exhibit"),
    path("api/search_objects/", views.search_objects, name="search_objects"),
    path("api/get_vehicle/<str:vehicle_reg>/", views.get_vehicle, name="get_vehicle"), 
    path("api/get_pre_determined_locations/", views.get_pre_determined_locations, name="get_pre_determined_locations"), 
    path("api/<str:exhibit_id>/set_movement/", views.set_movement, name="set_movement"), 
    path("api/get_employee_shoulder_numbers/", views.get_employee_shoulder_numbers, name="get_employee_shoulder_numbers")
]