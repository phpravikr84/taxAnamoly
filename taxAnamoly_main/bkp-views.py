import os
import time
import pandas as pd
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from random import randint, choice
from faker import Faker
from datetime import datetime, timedelta
from django.contrib import messages, auth
from django.views.decorators.csrf import csrf_exempt
from .forms import CSVUploadForm
from .utils import preprocess_csv  # Assuming you have a utility function for CSV processing
from filemasters.models import FilesMaster  # Update the import path based on your project structure
from django.utils.timezone import now
from django.conf import settings

MEDIA_DIR = 'media/csv/'
MEDIA_DIR_MERGE = 'media/csv/merge/'
ALLOWED_EXTENSIONS = ['csv', 'xls', 'xlsx', 'pdf']
FINANCE_FILENAMES = {
            'gst': 'GST',
            'cit': 'CIT',
            'swt': 'SWT',
            'non_ind_reg': 'Non Ind Reg',
            'gst_refund': 'GST Refund'
        }

# Define login page
def login(request):
    if request.method == 'POST':
        email = request.POST['email']  # Use uppercase 'POST'
        password = request.POST['password']  # Use uppercase 'POST'
        
        user = auth.authenticate(request, email=email, password=password)  # Ensure to pass the request as the first argument here
        if user is not None:
            auth.login(request, user)
            messages.success(request, 'You are login successfully')  # Add request parameter for messages
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid login Credential')  # Add request parameter for messages
            return redirect('login')
        
    return render(request, 'login.html')


# Define logout page
def logout(request):
    auth.logout(request)
    #return render(request)
    return redirect('login')

# Define Dashboard Page
def dashboard(request):
    if request.user.is_authenticated:
        return render(request, 'dashboard/index.html')  # Render the dashboard if the user is logged in
    else:
        return redirect('login')  # Redirect to login page if the user is not logged in

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
#def rawDataUpload(request):
#    return render(request, 'data-managment/raw-data/upload.html')


@csrf_exempt
def rawDataUpload(request):
    """
    Handle file uploads with validation and error handling.
    """
    if request.method == 'POST':
        form = CSVUploadForm(request.POST, request.FILES)

        if form.is_valid():
            uploaded_file = request.FILES['file']
            file_extension = uploaded_file.name.split('.')[-1].lower()
            
            # Check if 'financialfilename' is selected
            financial_filename = request.POST['financialfilename']
            if not financial_filename:
                messages.error(request, "Financial Filename not selected!")
                return redirect('data-management-upload')

            # Validate file extension
            if file_extension not in ALLOWED_EXTENSIONS:
                messages.error(request, f"Invalid file format: .{file_extension}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
                return redirect('data-management-upload')

            # Save file to media directory
            file_name = f"{int(time.time())}_{uploaded_file.name}"
            file_path = os.path.join(MEDIA_DIR, file_name)
            os.makedirs(MEDIA_DIR, exist_ok=True)
            if not request.user.is_authenticated:
                user_id = None
            else:
                user_id = request.user.id

            try:
                with open(file_path, 'wb+') as dest:
                    for chunk in uploaded_file.chunks():
                        dest.write(chunk)
                
                # Insert record into the database
                file_record = FilesMaster(
                    file_name=financial_filename,
                    file_path_rw=file_path,
                    file_path_pr=None,
                    file_path_pd=None,
                    user_id=user_id,
                    parent_file_id=None,
                    status=1,  # Success
                    reason=None,
                    file_state=1,  # Raw
                    created_date=now(),
                    modified_date=now()
                )
                file_record.save()

                # Success message
                messages.success(request, 'File uploaded successfully!')
                return redirect('data-management-upload')

            except Exception as e:
                messages.error(request, f"Error saving the file: {e}")
                return redirect('data-management-upload')
        else:
            messages.error(request, 'Invalid form submission.')

    else:
        form = CSVUploadForm()

    return render(request, 'data-managment/raw-data/upload.html', {'form': form, 'financefilenames': FINANCE_FILENAMES})

#Define Merge Files
def merge_files(request):
    #Get & Run LOOP of File name
    for key, value in FINANCE_FILENAMES.items:
    
        # Define file name (this can be dynamic, passed from the template or form)
        file_name = key  # Example, or retrieve dynamically from form or request
        
        # Get all files with the same file_name and file_type=csv or excel
        files = FilesMaster.objects.filter(file_name=file_name)

        # Initialize a dictionary to store dataframes, grouped by file type (csv, excel)
        file_dfs = {'csv': [], 'excel': []}

        for file in files:
            # Get the file path from the database
            file_path = file.file_path_rw

            # Check the file extension and process accordingly
            if file_path.endswith('.csv'):
                try:
                    df = pd.read_csv(file_path)
                    file_dfs['csv'].append(df)
                except Exception as e:
                    # Error while reading CSV
                    messages.error(request, f"Error reading CSV file {file_path}: {e}")
                    return redirect('data-management-upload')
            elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
                try:
                    df = pd.read_excel(file_path)
                    file_dfs['excel'].append(df)
                except Exception as e:
                    # Error while reading Excel
                    messages.error(request, f"Error reading Excel file {file_path}: {e}")
                    return redirect('data-management-upload')
            else:
                # Skip non-CSV/Excel files (optional handling)
                messages.error(request, f"Unsupported file type for file {file_path}")
                return redirect('data-management-upload')

        # Merge CSV files (if any)
        if file_dfs['csv']:
            merged_csv_df = pd.concat(file_dfs['csv'], ignore_index=True)

            # Use MEDIA_DIR_MERGE for the merged file path
            merged_csv_file_name = f"{file_name}_final_rawfile.csv"
            merged_csv_file_path = os.path.join(MEDIA_DIR_MERGE, merged_csv_file_name)

            # Ensure the directory exists, create it if it doesn't
            os.makedirs(MEDIA_DIR_MERGE, exist_ok=True)

            # Save the merged CSV file
            merged_csv_df.to_csv(merged_csv_file_path, index=False)

            # Optionally, store the merged CSV file path in the database
            FilesMaster.objects.create(file_name=f"{file_name}_final", file_path_rw=merged_csv_file_path)

            messages.success(request, f"CSV files successfully merged into {merged_csv_file_name}")

        # Merge Excel files (if any)
        if file_dfs['excel']:
            merged_excel_df = pd.concat(file_dfs['excel'], ignore_index=True)

            # Save the merged Excel file
            merged_excel_file_name = f"{file_name}_final_rawfile.xlsx"
            merged_excel_file_path = os.path.join(MEDIA_DIR_MERGE, merged_excel_file_name)

            # Ensure the directory exists, create it if it doesn't
            os.makedirs(MEDIA_DIR_MERGE, exist_ok=True)

            # Save the merged Excel file
            merged_excel_df.to_excel(merged_excel_file_path, index=False)

            # Optionally, store the merged Excel file path in the database
            FilesMaster.objects.create(file_name=f"{file_name}_final", file_path_rw=merged_excel_file_path)

            messages.success(request, f"Excel files successfully merged into {merged_excel_file_name}")

    # Redirect after success
    return redirect('data-management-upload')


def display_results(request):
    """
    Display uploaded CSV data in a bootstrap table and render the chart section.
    """
    file_path = request.session.get('last_file')
    if not file_path or not os.path.exists(file_path):
        return HttpResponse("No file found. Please upload a CSV first.", status=404)

    data = pd.read_csv(file_path)

    # Convert to dictionary format
    table_data = data.to_dict(orient='records')

    # Get headers
    table_headers = list(data.columns)

    print("Table Data:", table_data)
    print("Table Headers:", table_headers)


    # Render the table with the data and headers
    return render(request, 'result.html', {
        'table_headers': table_headers,
        'table_data': table_data
    })


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
