from django.urls import path
from .views import registrar_usuario, login_usuario

urlpatterns = [
    path('register/', registrar_usuario, name='api_register'),
    path('login/', login_usuario, name='api_login'),
]

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]