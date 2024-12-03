from django.http import HttpResponse
from django.shortcuts import render
from random import randint, choice
from faker import Faker
from datetime import datetime, timedelta

# Define login page
def login(request):
    return render(request, 'login.html')

# Define Dashboard Page
def dashboard(request):
    return render(request, 'dashboard/index.html')

# Define Raw Data Page
def rawData(request):
    faker = Faker()
    records = []

    # Generate 50 dummy records
    for i in range(1, 51):
        created_at = faker.date_time_between(start_date="-1y", end_date="now")
        modified_at = created_at + timedelta(days=randint(1, 30))  # Modified date after creation
        records.append({
            "id": i,
            "file_name": faker.file_name(category="text"),  # Generate random file name
            "uploaded_by": faker.name(),
            "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "modified_at": modified_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
    return render(request, 'data-managment/raw-data/index.html', {"records": records})

# Define View Raw Data Page
def viewRawData(request):
    # Create a Faker instance
    faker = Faker()

    # Predefined positions and offices for diversity
    positions = ["System Architect", "Developer", "Manager", "Analyst", "Engineer"]
    offices = ["Edinburgh", "Tokyo", "New York", "London", "San Francisco"]

    # Generate 50 records
    records = []
    for _ in range(50):
        record = {
            "name": faker.name(),
            "position": choice(positions),
            "office": choice(offices),
            "age": randint(25, 65),
            "start_date": faker.date_between(start_date='-10y', end_date='today').strftime('%Y/%m/%d'),
            "salary": f"${randint(50, 200) * 1000:,}"
        }
        records.append(record)
    return render(request, 'data-managment/raw-data/view.html', {"records": records})

# Define Raw Data Upload Page
def rawDataUpload(request):
    return render(request, 'data-managment/raw-data/upload.html')

# Define Process Data Page
def processData(request):
    faker = Faker()
    records = []

    # Generate 50 dummy records
    for i in range(1, 51):
        created_at = faker.date_time_between(start_date="-1y", end_date="now")
        modified_at = created_at + timedelta(days=randint(1, 30))  # Modified date after creation
        records.append({
            "id": i,
            "file_name": faker.file_name(category="text"),  # Generate random file name
            "uploaded_by": faker.name(),
            "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "modified_at": modified_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
  
    return render(request, 'data-managment/processed-data/index.html', {"records": records})

# Define View Process Data Page
def viewProcessData(request):
    # Create a Faker instance
    faker = Faker()

    # Predefined positions and offices for diversity
    positions = ["System Architect", "Developer", "Manager", "Analyst", "Engineer"]
    offices = ["Edinburgh", "Tokyo", "New York", "London", "San Francisco"]

    # Generate 50 records
    records = []
    for _ in range(50):
        record = {
            "name": faker.name(),
            "position": choice(positions),
            "office": choice(offices),
            "age": randint(25, 65),
            "start_date": faker.date_between(start_date='-10y', end_date='today').strftime('%Y/%m/%d'),
            "salary": f"${randint(50, 200) * 1000:,}"
        }
        records.append(record)
    return render(request, 'data-managment/processed-data/view.html', {"records": records})

#Fraud Analytics View
def viewFraudAnalyticsData(request):
    return render(request, 'dashboard/analytics/')
