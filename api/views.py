from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from .models import Usuario

def home(request):
    return render(request, 'index.html')

@api_view(['POST'])
def registrar_usuario(request):
    usuario = request.data.get('usuario', '').strip()
    password = request.data.get('password', '').strip()

    if not usuario or not password:
        return Response({"success": False, "message": "Complete todos los campos"})

    if Usuario.objects.filter(usuario=usuario).exists():
        return Response({"success": False, "message": "El usuario ya existe"})

    password_hash = make_password(password)
    Usuario.objects.create(usuario=usuario, password=password_hash)
    return Response({"success": True, "message": "Usuario registrado con éxito"})

@api_view(['POST'])
def login_usuario(request):
    usuario = request.data.get('usuario', '').strip()
    password = request.data.get('password', '').strip()

    try:
        user = Usuario.objects.get(usuario=usuario)
        if check_password(password, user.password):
            return Response({"success": True, "message": "Inicio de sesión exitoso"})
    except Usuario.DoesNotExist:
        pass

    return Response({"success": False, "message": "Credenciales incorrectas"})