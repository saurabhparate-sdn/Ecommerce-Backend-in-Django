from django.test import TestCase

# Create your tests here.

from django.test import TestCase, Client
from django.urls import reverse

class PingTest(TestCase):
    def test_ping_view(self):
        client = Client()
        response = client.get(reverse('ping'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode(), "Pong")
