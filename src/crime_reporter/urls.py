from django.urls import path
from django.conf.urls.static import static
from django.conf import settings


from . import views

urlpatterns = [
#API:
path("get_articles/<int:start_int>-<int:end_int>", views.get_articles, name="get_articles"),
path("get_incident_types", views.get_incident_types, name="get_incident_types"),
path("report_submit", views.set_report, name="set_report"),
path("get_csrf", views.get_csrf, name="get_csrf"),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)