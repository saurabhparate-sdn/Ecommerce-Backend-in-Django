from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
from ..models import Cart, CartItem, Order, OrderItem, Coupon
from ..serializers import OrderSerializer
from ..permission import IsAdminOrSuperAdmin  

# 1. CREATE ORDER (User)

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        address_id = request.data.get("address_id")
        coupon_code = request.data.get("coupon_code", None)

        # Fetch user's cart
        cart = get_object_or_404(Cart, user=user)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate total
        total_amount = sum(item.subtotal for item in cart_items)
        discount = Decimal(0)

        # Apply coupon if provided
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)

                # Validate coupon
                if coupon.expiry_date < timezone.now():
                    return Response({"detail": "Coupon has expired."}, status=status.HTTP_400_BAD_REQUEST)

                if total_amount < coupon.min_amount:
                    return Response({"detail": "Order total does not meet coupon minimum amount."},
                                    status=status.HTTP_400_BAD_REQUEST)

                # Calculate discount based on type
                if coupon.discount_type == "PERCENT":
                    discount = (total_amount * coupon.value) / Decimal(100)
                elif coupon.discount_type == "FIXED":
                    discount = coupon.value

                # Ensure discount doesn’t exceed total
                if discount > total_amount:
                    discount = total_amount

            except Coupon.DoesNotExist:
                return Response({"detail": "Invalid coupon code."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate grand total
        grand_total = total_amount - discount

        # Create order
        order = Order.objects.create(
            user=user,
            address_id=address_id,
            total_amount=total_amount,
            discount=discount,
            grand_total=grand_total,
            payment_status="PENDING",
            order_status="PENDING"
        )

        # Create order items
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product_variant=item.product_variant,
                quantity=item.quantity,
                price=item.product_variant.price
            )

        # Clear cart
        # cart_items.delete()

        response_data = {
            "id": order.id,
            "total_amount": float(total_amount),
            "discount": float(discount),
            "grand_total": float(grand_total),
            "order_status": order.order_status,
            "payment_status": order.payment_status,
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

# 2. LIST ORDERS (User/Admin/SuperAdmin)

class OrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        orders = Order.objects.all()

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# 3. GET ORDER DETAILS

class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        user = request.user
        order = Order.objects.get(id=id)

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


# 4. UPDATE ORDER STATUS (Admin / Super Admin)

class UpdateOrderStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def put(self, request, id):
        order = Order.objects.get(id=id)
        new_status = request.data.get("order_status")

        if not new_status:
            return Response({"detail": "Order status is required."}, status=status.HTTP_400_BAD_REQUEST)

        order.order_status = new_status
        order.save(update_fields=["order_status"])

        response_data = {
            "id": order.id,
            "order_status": order.order_status,
            "updated_by": request.user.username
        }
        return Response(response_data, status=status.HTTP_200_OK)


# 5. APPROVE ORDER (Admin / Super Admin)

class ApproveOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request, id):
        order = Order.objects.get(id=id)

        if order.order_status != "PENDING":
            return Response({"detail": "Only pending orders can be approved."}, status=status.HTTP_400_BAD_REQUEST)

        order.order_status = "APPROVED"
        order.approved_by = request.user
        order.save()

        response_data = {
            "id": order.id,
            "order_status": order.order_status,
            "approved_by": request.user.username
        }
        return Response(response_data, status=status.HTTP_200_OK)
