from django.contrib import admin
from .models import UserProfile, Address, Category, Brand, Product, ProductImage, ProductVariant, Discount, Coupon, Cart, CartItem, Order, OrderItem, Review, Notification

admin.site.register(UserProfile)
admin.site.register(Address)
admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(ProductVariant)
admin.site.register(Discount)
admin.site.register(Coupon)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)  
admin.site.register(Review)
admin.site.register(Notification)