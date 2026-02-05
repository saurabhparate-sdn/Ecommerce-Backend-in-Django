from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.db import transaction
from .models import Order, OrderItem, Product, ProductVariant, Notification, OrderStatus


# ---------------------------------------------------------
# 1. Reduce stock after order APPROVED
# ---------------------------------------------------------
@receiver(post_save, sender=Order)
def reduce_stock_on_order_approved(sender, instance, created, **kwargs):
    """
    When an order is approved, automatically reduce product and variant stock.
    """
    # Only run when order is marked as APPROVED (not at creation)
    if not created and instance.order_status == OrderStatus.APPROVED:
        order_items = OrderItem.objects.filter(order=instance)

        # Use atomic transaction to ensure data integrity
        with transaction.atomic():
            for item in order_items:
                variant = item.product_variant
                product = variant.product

                # Safely reduce stock if available
                if variant.stock >= item.quantity:
                    variant.stock -= item.quantity
                    variant.save(update_fields=["stock"])

                if product.stock >= item.quantity:
                    product.stock -= item.quantity
                    product.save(update_fields=["stock"])


# ---------------------------------------------------------
# 2. Send notifications on order creation & updates
# ---------------------------------------------------------
@receiver(post_save, sender=Order)
def send_order_notification(sender, instance, created, **kwargs):
    """
    Send notifications to users when orders are created or status changes.
    """
    user = instance.user

    # New order created
    if created:
        title = "Order Placed Successfully"
        message = (
            f"Your order #{instance.id} has been placed successfully. "
            f"Status: {instance.order_status}."
        )

    # Existing order updated (status changed)
    else:
        title = "Order Status Update"
        message = (
            f"Your order #{instance.id} status has been updated to "
            f"{instance.order_status}."
        )

    # Create notification entry
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
    )
