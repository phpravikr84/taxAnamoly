from django.db import models
from accounts.models import User  # Import the User model

# Create your models here.

class FilesMaster(models.Model):
    file_name = models.CharField(max_length=255)
    file_path_rw = models.CharField(max_length=255)
    file_path_pr = models.CharField(max_length=255, null=True, blank=True)
    file_path_pd = models.CharField(max_length=255, null=True, blank=True)
    user_id = models.CharField(max_length=255)
    #parent_file_id = models.IntegerField(null=True, blank=True)
    parent_file_id = models.CharField(max_length=255, null=True, blank=True)  # Changed to CharField
    status = models.IntegerField(choices=[(1, 'Success'), (2, 'Failure')])
    reason = models.TextField(null=True, blank=True)
    file_state = models.IntegerField(default=1, choices=[
        (1, 'Raw'),
        (2, 'Processed'),
        (3, 'Predicted'),
        (4, 'Analytics')
    ])
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    
    # Add the new field
    merge_status = models.BooleanField(default=False)
    
    # Update user_id to a ForeignKey
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')

    class Meta:
        db_table = 'filesmaster'

