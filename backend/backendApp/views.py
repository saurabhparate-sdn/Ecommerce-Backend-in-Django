from django.http import HttpResponse
from .tasks import send_email_task

def ping(request):
    return HttpResponse("Pong", status=200)


def send_test_email(request):
    subject = "Test Email via Celery"
    message = "Hello! This message is sent asynchronously using Celery with Redis."
    recipients = ['paratesaurabh054@gmail.com']

    send_email_task.delay(subject, message, recipients)

    return HttpResponse("Email sending task has been queued.")
