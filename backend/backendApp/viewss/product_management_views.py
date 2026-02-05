from ..serializers import ProductSerializer, ProductVariantSerializer, ProductImageSerializer
from ..models import Product
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from ..permission import IsAdminOrSuperAdmin
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from ..models import ProductImage
from ..serializers import ProductImageSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.text import slugify
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

class ProductPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "page_size"
    max_page_size = 20


class ProductView(APIView):

    def get_permissions(self):
        """Set different permissions for different HTTP methods."""
        if self.request.method == 'GET':
            return [AllowAny()]
        elif self.request.method in ['POST']:
            return [IsAdminOrSuperAdmin()]
        return super().get_permissions()
    
    def get(self, request):
        queryset = Product.objects.filter(is_active=True)

        # Search (by name or description)
        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        # Ordering
        ordering = request.query_params.get("ordering", "name")
        if ordering:
            queryset = queryset.order_by(ordering)

        # Pagination
        paginator = ProductPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = ProductSerializer(paginated_queryset, many=True)

        return paginator.get_paginated_response(serializer.data)
    

    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description', '')
        category = request.data.get('category')
        brand = request.data.get('brand')
        base_price = request.data.get('base_price')
        stock = request.data.get('stock')
        if not name:
            return Response({'detail': 'Product name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        slug = slugify(name)
        if Product.objects.filter(slug=slug).exists():
            return Response({'detail': 'Product with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        created_by = request.user
        data = Product.objects.create(
            name = name,
            slug = slug,
            description = description,
            category_id = category,
            brand_id = brand,
            base_price = base_price,
            stock = stock,
            created_by = created_by
        )
        
        response_data = {
            'id': data.id,
            'name': data.name,
            'slug': data.slug,
            'price': data.base_price,
            'stock': data.stock,
            'is_active': data.is_active
        }
        return Response(response_data, status=status.HTTP_201_CREATED)



class ProductByIdView(APIView):

    def get_permissions(self):
        """Set different permissions for different HTTP methods."""
        if self.request.method == 'GET':
            return [AllowAny()]
        elif self.request.method in ['PUT', 'DELETE']:
            return [IsAdminOrSuperAdmin()]
        return super().get_permissions()

    
    def get_product(self, id):
        return Product.objects.get(id=id)

    
    def get(self, request, id):
        product = self.get_product(id)
        serializer = ProductSerializer(product)
        return Response(serializer.data)


    def put(self, request, id):
        product = self.get_product(id)
        
        data = request.data.copy()

        if 'name' in data:
            slug = slugify(data['name'])
            if Product.objects.filter(slug=slug).exclude(id=id).exists():
                return Response({'detail': 'Product with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            data['slug'] = slug

        serializer = ProductSerializer(product, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, id):
        product = self.get_product(id)
        product.delete()
        return Response({'detail': 'Product deleted successfully.'},
                        status=status.HTTP_204_NO_CONTENT)
    

class ProductVariantView(APIView):

    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, id):
        product = Product.objects.get(id=id)
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product = product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductImageView(APIView):

    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, id):
        product = Product.objects.get(id=id)
        serializer = ProductImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)