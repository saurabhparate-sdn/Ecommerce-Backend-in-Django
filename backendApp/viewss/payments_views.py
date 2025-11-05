from django.shortcuts import render, redirect  
from django.conf import settings  
from django.urls import reverse 
from django.views.decorators.csrf import csrf_exempt 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils.decorators import method_decorator
from ..models import CartItem, ProductVariant, Payment, PaymentItem
from ..serializers import CartItemSerializer
from decimal import Decimal
from django.contrib.auth.models import User



import stripe  

@method_decorator(csrf_exempt, name='dispatch')
class paymentView(APIView):

    def post(self, request, *args, **kwargs):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        success_url = request.build_absolute_uri(reverse('success'))
        cancel_url = request.build_absolute_uri(reverse('cancel'))

        cart_items = CartItem.objects.filter(
            cart__user=request.user             
        ).select_related('product_variant')

        

        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        line_items = []
        for item in cart_items:
            unit_amount = int((item.subtotal * Decimal('100')).quantize(Decimal('1')))
            image_url = 'https://img.freepik.com/premium-vector/payment-transaction-done-via-app-illustration_57801-326.jpg'

            line_items.append({
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': item.product_variant.name,
                        'images': [image_url],
                        'metadata': {
                            'product_id': item.product_variant.product_id,
                            'product_name': item.product_variant.name
                        },
                    },
                    'unit_amount': unit_amount,
                },
                'quantity': 1,
            })
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items= line_items,
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                expand=['line_items.data.price.product'],
                metadata={
                    "user_id": str(request.user.id)
                }
            )
            return Response({'url': checkout_session.url}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



def success(request):
    return render(request, "success.html")


def cancel(request):
    return render(request, "cancel.html")

class stripe_webhook(APIView):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_ENDPOINT_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=endpoint_secret
            )
        except ValueError:
            return Response(status=400)
        except stripe.error.SignatureVerificationError:
            return Response(status=400)

        # Handle the event type
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']

            # Extract required information
            customer_name = session.get('customer_details', {}).get('name')
            customer_email = session.get('customer_details', {}).get('email')
            payment_status = session.get('payment_status')
            amount_total = Decimal(session.get('amount_total', 0)) / 100
            stripe_session_id = session.get('id')

            # Get user if user_id metadata is present
            user = None
            metadata = session.get('metadata', {})
            user_id = metadata.get('user_id')

            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    user = None


            # Fetch product info from line items
            line_items = stripe.checkout.Session.list_line_items(
                session['id'], expand=['data.price.product']
            )
            products = []

            # --- Create Payment record ---

            payment = Payment.objects.create(
                user=user,
                stripe_session_id=stripe_session_id,
                customer_name=customer_name or "Guest",
                customer_email=customer_email or "No Email",
                amount_total=amount_total,
                payment_status=payment_status,
            )

            # --- Create PaymentItem records ---
            for item in line_items.data:
                product = item.price.product
                PaymentItem.objects.create(
                    payment=payment,
                    product_id=product.metadata.get('product_id'),
                    product_name=product.metadata.get('product_name'),
                    quantity=item.quantity,
                )

            # Optional: Log success
            print("=== PAYMENT STORED SUCCESSFULLY ===")
            print(f"Customer: {customer_name}")
            print(f"Email: ({customer_email})")
            print(f"Amount: ₹{amount_total}")
            print(f"Status: {payment_status}")
            print("Products saved:")
            for item in payment.items.all():
                print(f"Product Id: {item.product_id}")
                print(f"Product Name: {item.product_name}")
            print("===========================")

        return Response(status=200)


  
    