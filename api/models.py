from django.db import models

class Usuario(models.Model):
    usuario = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.usuario