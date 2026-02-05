from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from django.core.exceptions import ObjectDoesNotExist
from ..permission import IsSuperAdmin
from django.contrib.auth import authenticate
from ..serializers import (
    UserSerializer, RegisterUserSerializer, UserProfileSerializer
)
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from ..models import UserProfile
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.tokens import PasswordResetTokenGenerator

# function to get tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# Register View
class RegisterAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            profile = UserProfile.objects.get(user=user)
            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': profile.role,
                'message': 'User registered successfully.'
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Login View
class LoginAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = authenticate(request, username=username, password=password)
            if user:
                tokens = get_tokens_for_user(user)
                profile = UserProfile.objects.get(user=user)
                response_data = {
                    'tokens': tokens,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': profile.role,
                    }
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

#Forget Password View
class ForgetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Get email from request
        email = request.data.get('email')

        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Generate password reset token and UID
        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create password reset link (your frontend URL)
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"

        # Send email
        subject = "Password Reset Request"
        message = (
            f"Hello {user.username},\n\n"
            f"You requested a password reset for your account.\n\n"
            f"Click the link below to set a new password:\n{reset_link}\n\n"
            f"If you didn’t request this, please ignore this email."
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

        return Response(
            {'detail': 'Password reset link sent to your registered email address.'},
            status=status.HTTP_200_OK
        )

# Logout View (blacklisting tokens, if configured)
class LogoutAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        print(refresh_token, "refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist() 
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)

        except TokenError:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

# User Profile View
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        userr = request.user
        user_serializer = UserSerializer(request.user)

        try:
            profile = UserProfile.objects.get(user=request.user)
        except ObjectDoesNotExist:
            # Optionally create a profile or return default response
            profile = UserProfile.objects.create(user=request.user)
        profile_serializer = UserProfileSerializer(profile)
        
        # print(user_serializer.errors, "user_serializer.data")
        return Response({
            'user': user_serializer.data,
            'profile': profile_serializer.data
        })


    def put(self, request):
        user_serializer = UserSerializer(request.user, data=request.data, partial=True)
        profile = UserProfile.objects.get(user=request.user)
        profile_serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if user_serializer.is_valid() and profile_serializer.is_valid():
            user_serializer.save()
            profile_serializer.save()
            return Response({
                'user': user_serializer.data,
                'profile': profile_serializer.data
            })
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# CreateAdminView as APIView        
class CreateAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'ADMIN')  # default to ADMIN if not provided

        # Validate that role is ADMIN only
        if role != 'ADMIN':
            return Response({'detail': 'Only ADMIN role can be created here.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Validate required fields
        if not username or not email or not password:
            return Response({'detail': 'username, email, and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if username/email already exists
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)

        # Assign admin profile
        UserProfile.objects.update_or_create(user=user, defaults={'role': 'ADMIN'})

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': 'ADMIN',
            'message': 'Admin account created successfully.'
        }, status=status.HTTP_201_CREATED)

#User List for Super Admin
class UserList(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        users = User.objects.all()

        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            })

        return Response(user_data, status=status.HTTP_200_OK)
