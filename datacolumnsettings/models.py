from django.db import models

# Create your models here.
class DataColumnSettings(models.Model):
    STATUS_CHOICES = [
        (0, 'Active'),
        (1, 'Inactive'),
    ]
    
    file_name = models.CharField(max_length=255)
    column_name = models.CharField(max_length=255)
    column_slug = models.SlugField(max_length=255, unique=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.column_slug