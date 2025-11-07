# emailCron/cron.py
from django.core.mail import send_mail
from django.conf import settings

def send_email():
    send_mail(
        subject="Hello User!",
        message="This email is sent every minute by Django cron job!",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=["saurabhparate054@gmail.com", "paratesaurabh054@gmail.com"],
        fail_silently=False,
    )
    print("Hello Saurabh email sent!")