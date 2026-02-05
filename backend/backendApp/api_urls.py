from django.contrib import admin
from django.urls import path, include
from .viewss.jwt_auth_views import RegisterAuthView, LoginAuthView, ForgetPasswordView , UserProfileView, CreateAdminView, LogoutAuthView, UserList, CreateAdminView
from .viewss.brand_views import CreateCategoryView, BrandListView
from .viewss.product_management_views import  ProductView, ProductByIdView, ProductVariantView, ProductImageView
from .viewss.cart_views import CartView, AddToCartView, UpdateCartItemView, RemoveCartItemView
from .viewss.orders_views import CreateOrderView, OrderListView, OrderDetailView, UpdateOrderStatusView, ApproveOrderView
from .viewss.discount_coupons_views import DiscountView, CreateCouponView, ValidateCouponView
from .viewss.review_views import DeleteReviewView, ProductReviewView
from .viewss.notification_views import NotificationListView, MarkNotificationReadView, SendNotificationView
from .viewss.payments_views import success, cancel, paymentView, stripe_webhook
from .views import ping

urlpatterns = [

    # Apis for jwt authentication
    path('register/', RegisterAuthView.as_view(), name='register'),
    path('login/', LoginAuthView.as_view(), name='login'),
    path('forget-password/', ForgetPasswordView.as_view(), name='forget-password'),
    path('logout/', LogoutAuthView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('create-admin/', CreateAdminView.as_view(), name='create-admin'),
    path('users/', UserList.as_view(), name='user-list'),

    #Categories API
    path('categories/', CreateCategoryView.as_view(), name='create-category'),
    path('categories/<int:id>/', CreateCategoryView.as_view(), name='put-delete-category'),
    path('brands/', BrandListView.as_view(), name='brand-list'),

    # Product Management APIs
    path('products/', ProductView.as_view(), name='product-list-create'),
    path('products/<int:id>/', ProductByIdView.as_view(), name='product-detail-update'),
    path('products/<int:id>/variants/', ProductVariantView.as_view(), name='product-variant-list-create'),
    path('products/<int:id>/images/', ProductImageView.as_view(), name='product-image-list-create'),

    # #Cart Management APIs
    path('cart/', CartView.as_view(), name='cart-list'),
    path('cart/add/', AddToCartView.as_view(), name='cart-add'),
    path('cart/update/<int:id>/', UpdateCartItemView.as_view(), name='cart-update'),
    path('cart/remove/<int:id>/', RemoveCartItemView.as_view(), name='cart-delete'),

    #Order Management APIs
    path("orders/create/", CreateOrderView.as_view(), name="create-order"),
    path("orders/", OrderListView.as_view(), name="order-list"),
    path("orders/<int:id>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<int:id>/update-status/", UpdateOrderStatusView.as_view(), name="update-order-status"),
    path("orders/<int:id>/approve/", ApproveOrderView.as_view(), name="approve-order"),

    #Discount and Coupons APIs
    path('discounts/', DiscountView.as_view(), name='create-discount'),
    path('coupons/', CreateCouponView.as_view(), name='create-coupon'),
    path('coupons/<str:code>/validate/', ValidateCouponView.as_view(), name='validate-coupon'),

    #Review APIs
    path('product/<int:id>/reviews/', ProductReviewView.as_view(), name='product-reviews'),
    path('reviews/<int:id>/delete/', DeleteReviewView.as_view(), name='delete-review'),

    #Notification APIs
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:id>/mark-read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('notifications/send/', SendNotificationView.as_view(), name='send-notification'),


    #Payment APIs
    # path('', home, name='home'),
    path('payments/', paymentView.as_view(), name='payments'),
    path('webhook/', stripe_webhook.as_view(), name='webhook'),
    path('success/', success, name='success'),
    path('cancel/', cancel, name='cancel'),
    path('ping/', ping, name='ping'),
]

