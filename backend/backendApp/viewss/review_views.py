from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone

from ..models import Product, Review
from ..serializers import ReviewSerializer
from ..permission import IsAdminOrSuperAdmin


class ProductReviewView(APIView):
    
    def get_permissions(self):
        """Set different permissions for different HTTP methods."""
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        elif self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get(self, request, id):
        product = get_object_or_404(Product, id=id, is_active=True)
        reviews = Review.objects.filter(product=product).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id):
        user = request.user

        # Ensure user is authenticated
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        if user.is_staff:
            return Response({"detail": "Admins cannot create reviews."}, status=status.HTTP_403_FORBIDDEN)

        product = get_object_or_404(Product, id=id, is_active=True)

        # Prevent multiple reviews from same user for the same product
        if Review.objects.filter(user=user, product=product).exists():
            return Response({"detail": "You have already reviewed this product."},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save(user=user, product=product, created_at=timezone.now())
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteReviewView(APIView):
    
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def delete(self, request, id):
        review = get_object_or_404(Review, id=id)
        review.delete()
        return Response({"detail": "Review deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
