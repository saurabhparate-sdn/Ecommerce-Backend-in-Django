from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

from ..models import Notification, User
from ..serializers import NotificationSerializer
from ..permission import IsAdminOrSuperAdmin, IsSuperAdmin

# FETCH NOTIFICATIONS


class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # keep it simple

    def get(self, request):
        user = request.user

        # Admin/SuperAdmin can see all notifications
        if hasattr(user, "role") and user.role.name in ["ADMIN", "admin", "SUPER_ADMIN", "super_admin"]:
            notifications = Notification.objects.all().order_by("-created_at")
        else:
            # Normal users see only their own notifications
            notifications = Notification.objects.filter(user=user).order_by("-created_at")

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# MARK AS READ

class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        user = request.user
        notification = get_object_or_404(Notification, id=id)

        if not notification:
            return Response({"detail": "Notification not found."},
                            status=status.HTTP_404_NOT_FOUND)
    
        notification.is_read = True
        notification.save()

        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)


# SEND NOTIFICATION (SUPER ADMIN ONLY)

class SendNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        user_id = request.data.get("user")
        title = request.data.get("title")
        message = request.data.get("message")

        # Validate required fields
        if not user_id or not title or not message:
            return Response({"detail": "user, title, and message are required fields."},
                            status=status.HTTP_400_BAD_REQUEST)

        recipient = get_object_or_404(User, id=user_id)

        notification = Notification.objects.create(
            user=recipient,
            title=title,
            message=message
        )

        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
