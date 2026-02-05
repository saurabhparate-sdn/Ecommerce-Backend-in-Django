from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Sum, F
from ..models import Cart, CartItem, ProductVariant
from ..serializers import CartItemSerializer
from ..models import ProductVariant, CartItem, Cart


class AddToCartView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        product_variant_id = request.data.get("product_variant")
        quantity = int(request.data.get("quantity", 1))

        if not product_variant_id:
            return Response({"detail": "Product variant ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        product_variant = get_object_or_404(ProductVariant, id=product_variant_id)
        cart, _ = Cart.objects.get_or_create(user=user)

        # Check if already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_variant=product_variant,
            defaults={
                "quantity": quantity,
                "subtotal": product_variant.price * quantity
            }
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.subtotal = product_variant.price * cart_item.quantity
            cart_item.save()

        data = {
            "id": cart_item.id,
            "product_variant": {
                "id": product_variant.id,
                "name": product_variant.name,
                "price": float(product_variant.price)
            },
            "quantity": cart_item.quantity,
            "subtotal": float(cart_item.subtotal)
        }
        return Response(data, status=status.HTTP_201_CREATED)


class CartView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        items = cart.items.select_related('product_variant').all()

        item_data = [
            {
                "product": item.product_variant.name,
                "quantity": item.quantity,
                "subtotal": float(item.subtotal)
            }
            for item in items
        ]

        total = cart.items.aggregate(total=Sum(F('subtotal')))['total'] or 0

        response = {
            "user": user.username,
            "items": item_data,
            "total": float(total)
        }
        return Response(response, status=status.HTTP_200_OK)



class UpdateCartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, id):
        return get_object_or_404(CartItem, id=id, cart__user=request.user)

    def put(self, request, id):
        cart_item = self.get_item(request, id)

        data = request.data.copy()
        
        if 'quantity' in data:
            try:
                quantity = int(data['quantity'])
            except ValueError:
                return Response(
                    {"detail": "Quantity must be a valid integer."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if quantity <= 0:
                cart_item.delete()
                return Response(
                    {"detail": "Item removed as quantity was 0."},
                    status=status.HTTP_204_NO_CONTENT
                )

            # Auto-update subtotal based on new quantity
            data['subtotal'] = float(cart_item.product_variant.price) * quantity

        # Step 4: Partial update via serializer
        serializer = CartItemSerializer(cart_item, data=data, partial=True)
        if serializer.is_valid():
            updated_item = serializer.save()

            # Step 5: Return structured response
            response_data = {
                "id": updated_item.id,
                "product_variant": {
                    "id": updated_item.product_variant.id,
                    "name": updated_item.product_variant.name,
                    "price": float(updated_item.product_variant.price)
                },
                "quantity": updated_item.quantity,
                "subtotal": float(updated_item.subtotal)
            }
            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RemoveCartItemView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, id):
        return get_object_or_404(CartItem, id=id, cart__user=request.user)

    def delete(self, request, id):
        user = request.user
        cart_item = self.get_item(request, id)
        cart_item.delete()
        return Response({"detail": "Item removed successfully."}, status=status.HTTP_204_NO_CONTENT)
