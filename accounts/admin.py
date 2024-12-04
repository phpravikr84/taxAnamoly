# accounts/admin.py
from django.contrib import admin
from .models import User  # Import your custom User model
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'username', 'is_active')
    ordering = ('-date_joined',)
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

# Register your custom User model with the custom UserAdmin
admin.site.register(User, CustomUserAdmin)
