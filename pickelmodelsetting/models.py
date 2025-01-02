# models.py
from django.db import models

class PickelModelSetting(models.Model):
    id = models.AutoField(primary_key=True)
    file_name = models.CharField(max_length=255)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.file_name

