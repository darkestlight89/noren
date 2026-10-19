from django.test import TestCase
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from .models import Person, Incident
from django.utils import timezone
import os
import time
from datetime import date
from datetime import timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from noren.selenium_functions import wait_for_clickable, wait_for_visible, click_when_ready
from selenium.webdriver.common.by import By
import socket
from django.test import override_settings
import json

# Create your tests here.

#def file_uri(filename): 
 #   return pathlib.Path(os.path.abspath(filename)).as_uri()


class PersonTestCase(TestCase):

    def setUp(self):
       Person.objects.create(name="person1")
       Person.objects.create(name="person2", date_of_birth="1943-08-12")
       Person.objects.create(name="person3", date_of_birth=date.today()+timedelta(days=1))
       Person.objects.create(name="")

    def test_is_valid_person(self):
        person1 = Person.objects.get(name="person1")
        self.assertTrue(person1.is_valid())
        person2 = Person.objects.get(name="person2")
        self.assertTrue(person2.is_valid())
        person3 = Person.objects.get(name="person3")
        self.assertFalse(person3.is_valid())
        person4 = Person.objects.get(name="")
        self.assertFalse(person4.is_valid())

class IncidentTestCase(TestCase):
    
    def setUp(self):
        reporting_person = Person.objects.create(name="reporting_person")
        Incident.objects.create(incident_type='Homicide', reporting_person=reporting_person, location='location1', date_and_time_of_incident=timezone.now())
        Incident.objects.create(incident_type='Arson', reporting_person=reporting_person, location='', date_and_time_of_incident=timezone.now())
        Incident.objects.create(incident_type='Sudden Death', reporting_person=reporting_person, location='location3', date_and_time_of_incident=timezone.now()+timedelta(seconds=1))

    def test_is_valid_incident(self):
        incident1 = Incident.objects.get(incident_type="Homicide")
        self.assertTrue(incident1.is_valid())
        incident2 = Incident.objects.get(incident_type="Arson")
        self.assertFalse(incident2.is_valid())
        incident3 = Incident.objects.get(incident_type="Sudden Death")
        self.assertFalse(incident3.is_valid())


class SeleniumTestCase(StaticLiveServerTestCase):
    #  Listen for connections on all network interfaces as using seperate containers for Selenium and Docker
    host = "0.0.0.0"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Get URL from .env
        selenium_url = os.getenv("SELENIUM_URL")

        # No GUI
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        # Set up driver
        cls.driver = webdriver.Remote(
            command_executor=selenium_url,
            options=options,
        )

    @classmethod
    def tearDownClass(cls):

        # In case driver fails to be made
        try:
            if hasattr(cls, "driver"):
                cls.driver.quit()
        finally: 
            super().tearDownClass()


class FrontEndTest(SeleniumTestCase):
   def test_non_login_view(self):
        django_ip = socket.gethostbyname("django_app")
        url = self.live_server_url.replace(
            "0.0.0.0", django_ip
        ) + "/home"

        self.driver.execute_cdp_cmd(
            "Page.addScriptToEvaluateOnNewDocument",
            {
                "source": """
                    window.__jsErrors = [];

                    window.addEventListener("error", event => {
                        window.__jsErrors.push({
                            message: event.message,
                            filename: event.filename,
                            line: event.lineno
                        });
                    });

                    window.addEventListener("unhandledrejection", event => {
                        window.__jsErrors.push({
                            message: String(event.reason)
                        });
                    });
                """
            }
        )

        self.driver.get(url)
        time.sleep(3)

        print("JavaScript errors:", self.driver.execute_script(
            "return window.__jsErrors"
        ))

        print("Root HTML:", self.driver.execute_script(
            "return document.getElementById('root')?.innerHTML"
        ))

        print("News loader exists:", self.driver.execute_script(
            "return !!document.querySelector('#root #news-loader')"
        ))

        print("Loaded scripts:", self.driver.execute_script("""
            return performance.getEntriesByType('resource')
                .filter(r => r.name.includes('5173'))
                .map(r => ({
                    url: r.name,
                    duration: r.duration
                }));
        """))

        heading = wait_for_visible(
            self.driver,
            By.CSS_SELECTOR,
            '[id="news-loader"]'
        )

        self.assertTrue(heading.is_displayed())

        
                
