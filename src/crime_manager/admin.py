from django.contrib import admin
from .models import Employee, Task, LogEntry, Exhibit, Movement

# Register your models here.
admin.site.register(Employee)
admin.site.register(Task)
admin.site.register(LogEntry)
admin.site.register(Exhibit)
admin.site.register(Movement)