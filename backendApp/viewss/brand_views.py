from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.text import slugify
from ..models import Category, Brand
from ..serializers import CategorySerializer, BrandSerializer
from ..permission import IsSuperAdmin, IsAdminOrSuperAdmin
from rest_framework.permissions import IsAuthenticated, AllowAny



class CreateCategoryView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        elif self.request.method in  ['POST','PUT', 'DELETE']:
            return [IsAuthenticated() ,IsAdminOrSuperAdmin()]
        return super().get_permissions()
    
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description', '')

        if not name:
            return Response({'detail': 'Category name is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        slug = slugify(name)

        # Check if category with same slug already exists
        if Category.objects.filter(slug=slug).exists():
            return Response({'detail': 'Category with this name already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.create(
            name=name,
            slug=slug,
            description=description
        )

        response_data = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

   
    def get_category(self, id):
        return Category.objects.get(id=id)
    
    def put(self, request, id):
        category = self.get_category(id)
        data = request.data.copy()

        # If name provided, slugify and check uniqueness
        if 'name' in data:
            slug = slugify(data['name'])
            if Category.objects.filter(slug=slug).exclude(id=id).exists():
                return Response({'detail': 'Category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            data['slug'] = slug

        serializer = CategorySerializer(category, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        category = self.get_category(id)
        category.delete()
        return Response({'detail': 'Category deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class BrandListView(APIView):
    def get_permissions(self):
        """Set different permissions for different HTTP methods."""
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        elif self.request.method == 'POST':
            return [IsAuthenticated() ,IsAdminOrSuperAdmin()]
        return super().get_permissions()

    def get(self, request):
        brands = Brand.objects.all()
        serializer = BrandSerializer(brands, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description', '')
        logo = request.FILES.get('logo') 

        if not name:
            return Response({'detail': 'Brand name is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if Brand.objects.filter(name=name).exists():
            return Response({'detail': 'Brand with this name already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)

        brand = Brand.objects.create(
            name=name,
            description=description,
            logo=logo
        )

        print(brand.logo.url)

        response_data = {
            'id': brand.id,
            'name': brand.name,
            'description': brand.description,
            'logo': brand.logo.url if brand.logo else None
        }

        return Response(response_data, status=status.HTTP_201_CREATED)
