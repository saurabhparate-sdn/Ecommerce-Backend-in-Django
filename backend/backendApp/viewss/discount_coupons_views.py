from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from django.shortcuts import get_object_or_404

from ..models import Discount, Coupon, User
from ..serializers import DiscountSerializer, CouponSerializer
from ..permission import IsAdminOrSuperAdmin
from decimal import Decimal


# DISCOUNT VIEWS

class DiscountView(APIView):

    def get_permissions(self):
        """Set different permissions for different HTTP methods."""
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        elif self.request.method == 'POST':
            return [permissions.IsAuthenticated() ,IsAdminOrSuperAdmin()]
        return super().get_permissions()

    def post(self, request):
        serializer = DiscountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def get(self, request):
        discounts = Discount.objects.all()
        serializer = DiscountSerializer(discounts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# COUPON VIEWS

class CreateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request):
        serializer = CouponSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, code):
        coupon = get_object_or_404(Coupon, code=code)
        now = timezone.now()

        # Check expiry
        if coupon.expiry_date < now:
            return Response({"detail": "Coupon has expired."}, status=status.HTTP_400_BAD_REQUEST)

        # Check usage limit
        if coupon.usage_limit <= 0:
            return Response({"detail": "Coupon usage limit reached."}, status=status.HTTP_400_BAD_REQUEST)

        # Check minimum order amount
        order_amount = request.query_params.get("order_amount")
        if order_amount:
            order_amount = Decimal(order_amount)
            if order_amount < coupon.min_amount:
                return Response({"detail": f"Minimum order amount must be ₹{coupon.min_amount}."},
                                status=status.HTTP_400_BAD_REQUEST)

        # Coupon valid
        serializer = CouponSerializer(coupon)
        return Response({"message": "Coupon is valid", "coupon": serializer.data}, status=status.HTTP_200_OK)
