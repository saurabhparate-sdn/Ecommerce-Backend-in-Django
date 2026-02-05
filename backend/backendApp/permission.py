from rest_framework.permissions import BasePermission

from .models import UserProfile

class IsSuperAdmin(BasePermission):

    def has_permission(self, request, view):

        try:
            if not request.user.is_authenticated:
                return False
            user_profile = UserProfile.objects.get(user=request.user)
            return user_profile.role in ['SUPER_ADMIN', 'super_admin']
        except UserProfile.DoesNotExist:
            return False
        
class IsAdminOrSuperAdmin(BasePermission):
   
    def has_permission(self, request, view):
        try:
            if not request.user.is_authenticated:
                return False
            profile = UserProfile.objects.get(user=request.user)
            return profile.role in ['ADMIN', 'admin', 'SUPER_ADMIN' , 'super_admin']
        except UserProfile.DoesNotExist:
            return False