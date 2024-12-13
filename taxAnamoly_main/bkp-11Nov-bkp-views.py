import os
import time
import csv
import pandas as pd
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect, get_object_or_404
from random import randint, choice
from faker import Faker
from datetime import datetime, timedelta
from django.contrib import messages, auth
from django.views.decorators.csrf import csrf_exempt
from .forms import CSVUploadForm
from .utils import preprocess_csv
from filemasters.models import FilesMaster 
from accounts.models import User
from django.utils.timezone import now
from django.conf import settings
from django.core.paginator import Paginator

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

FINANCE_FILENAMES_MERGE = {
            'gst_final': 'gst',
            'cit_final': 'cit',
            'swt_final': 'swt',
            'non_ind_reg_final': 'non_ind_reg',
            'gst_refund_final': 'gst_refund'
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
    # Query FilesMaster with the necessary fields and join with the User model
    files = FilesMaster.objects.filter(merge_status=True).select_related('User').values(
        'id',
        'file_name',
        'file_path_rw',
        'created_date',
        'modified_date',
        'user_id__first_name',
        'user_id__last_name'
    )

    records = []

    # Process the query results
    for file in files:
        records.append({
            "id": file['id'],
            "file_id": file['id'],
            "file_name": file['file_name'],
            "file_path": file['file_path_rw'],
            "uploaded_by": f"{file['user_id__first_name']} {file['user_id__last_name']}",
            "created_at": file['created_date'].strftime("%Y-%m-%d %H:%M:%S"),
            "modified_at": file['modified_date'].strftime("%Y-%m-%d %H:%M:%S"),
        })

    # Render the records in the view template
    return render(request, 'data-managment/raw-data/index.html', {"records": records})

# Define View Raw Data Page
def viewRawData(request, file_id):
    # Retrieve the file record
    file_record = get_object_or_404(FilesMaster, id=file_id)

    # Read the CSV file and extract data
    csv_data = []
    try:
        with open(file_record.file_path_rw, mode='r') as file:
            csv_reader = csv.reader(file)
            headers = next(csv_reader)  # Skip the header
            for row in csv_reader:
                csv_data.append(row)
    except Exception as e:
        print(f"Error reading CSV file: {e}")

    # Paginate the data
    paginator = Paginator(csv_data, 10)  # Show 10 rows per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Render template with paginated data
    return render(request, 'data-managment/raw-data/view.html', {
        'page_obj': page_obj,
        'headers': headers,
        'file_record': file_record,
    })
# Define Raw Data Upload Page
#def rawDataUpload(request):
#    return render(request, 'data-managment/raw-data/upload.html')


@csrf_exempt
def rawDataUpload(request):
    """
    Handle file uploads with AJAX and support multiple file uploads.
    """
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        files = request.FILES.getlist('file')  # Get multiple files from the request
        financial_filename = request.POST.get('financialfilename', None)  # Provide a default value

        if not financial_filename:
            print("financialfilename not found:", request.POST)
            return JsonResponse({'status': 'error', 'message': 'Financial Filename not selected!'})


        uploaded_files = []  # List to track successfully uploaded files
        errors = []  # List to track errors for each file

        for uploaded_file in files:
            file_extension = uploaded_file.name.split('.')[-1].lower()

            # Validate file extension
            if file_extension not in ALLOWED_EXTENSIONS:
                errors.append(f"Invalid file format: {uploaded_file.name}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
                continue

            # Generate file name and path
            file_name = f"{int(time.time())}_{uploaded_file.name}"
            file_path = os.path.join(MEDIA_DIR, file_name)
            os.makedirs(MEDIA_DIR, exist_ok=True)

            # Determine the user
            user = request.user if request.user.is_authenticated else None

            try:
                # Save file to disk
                with open(file_path, 'wb+') as dest:
                    for chunk in uploaded_file.chunks():
                        dest.write(chunk)

                # Save record in the database
                file_record = FilesMaster(
                    file_name=financial_filename,
                    file_path_rw=file_path,
                    file_path_pr=None,
                    file_path_pd=None,
                    user_id=user,
                    parent_file_id=None,
                    status=1,  # Success
                    reason=None,
                    file_state=1,  # Raw
                    created_date=now(),
                    modified_date=now()
                )
                file_record.save()
                uploaded_files.append({
                    'id': file_record.id,
                    'file_path': file_record.file_path_rw
                })

            except Exception as e:
                errors.append(f"Error saving {uploaded_file.name}: {str(e)}")

        # Return response
        if uploaded_files:
            return JsonResponse({'status': 'success', 'uploaded_files': uploaded_files, 'errors': errors})
        else:
            return JsonResponse({'status': 'error', 'message': 'No files uploaded successfully.', 'errors': errors})
    else:
        form = CSVUploadForm()
    return render(request, 'data-managment/raw-data/upload.html', {'form': form, 'financefilenames': FINANCE_FILENAMES})

@csrf_exempt
def deleteUploadedFile(request):
    """
    Handle file deletion via AJAX.
    """
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        file_id = request.POST.get('file_id')
        try:
            file_record = FilesMaster.objects.get(id=file_id)
            # Delete the file from the file system
            if os.path.exists(file_record.file_path_rw):
                os.remove(file_record.file_path_rw)
            # Delete the database record
            file_record.delete()
            return JsonResponse({'status': 'success', 'message': 'File deleted successfully.'})
        except FilesMaster.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'File not found.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})

@csrf_exempt
def merge_files(request):
    # Ensure the directory for merged files exists
    os.makedirs(MEDIA_DIR_MERGE, exist_ok=True)

    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    user = request.user  # Get the authenticated user
    total_files = len(FINANCE_FILENAMES)
    processed_files = 0  # Track processed files count

    try:
        # Loop through finance file names
        for key, value in FINANCE_FILENAMES.items():
            file_name = key  # Define the base file name dynamically FINANCE_FILENAMES_MERGE
            files = FilesMaster.objects.filter(file_name=file_name, file_state=1)  # Only raw files
            #files = FilesMaster.objects.filter(file_name=file_name, merge_status=0)  # Only raw files
            
            # Prepare lists to hold dataframes for CSV and Excel files
            file_dfs = {'csv': [], 'excel': []}

            # Process each file
            for file in files:
                file_path = file.file_path_rw
                try:
                    if file_path.endswith('.csv'):
                        df = pd.read_csv(file_path)
                        file_dfs['csv'].append(df)
                    elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
                        df = pd.read_excel(file_path)
                        file_dfs['excel'].append(df)
                except Exception as e:
                    continue  # Skip the problematic file and continue

            # Merge and save CSV files
            if file_dfs['csv']:
                merged_csv_df = pd.concat(file_dfs['csv'], ignore_index=True)
                merged_csv_file_name = f"{file_name}_final_rawfile.csv"
                merged_csv_file_path = os.path.join(MEDIA_DIR_MERGE, merged_csv_file_name)
                merged_csv_df.to_csv(merged_csv_file_path, index=False)

                FilesMaster.objects.create(
                    file_name=f"{file_name}_final",
                    file_path_rw=merged_csv_file_path,
                    user_id=user,
                    status=1,
                    reason='Merged CSV files',
                    file_state=5,
                    merge_status=True
                )

            # Merge and save Excel files
            if file_dfs['excel']:
                merged_excel_df = pd.concat(file_dfs['excel'], ignore_index=True)
                merged_excel_file_name = f"{file_name}_final_rawfile.xlsx"
                merged_excel_file_path = os.path.join(MEDIA_DIR_MERGE, merged_excel_file_name)
                merged_excel_df.to_excel(merged_excel_file_path, index=False)

                FilesMaster.objects.create(
                    file_name=f"{file_name}_final",
                    file_path_rw=merged_excel_file_path,
                    user_id=user,
                    status=1,
                    reason='Merged Excel files',
                    file_state=1,
                    merge_status=True
                )

            processed_files += 1  # Increment processed count

        return JsonResponse({'status': 'success', 'processed_files': processed_files, 'total_files': total_files})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def deleteMergeFile(request):
    """
    Handle file deletion via AJAX.
    """
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        file_id = request.POST.get('file_id')
        try:
            file_record = FilesMaster.objects.get(id=file_id)
            # Delete the file from the file system
            #if os.path.exists(file_record.file_path_rw):
                #os.remove(file_record.file_path_rw)
            # Delete the database record
            file_record.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'File deleted successfully.',
                'redirect_url': '/data-management/raw-data/'  # Add redirect URL here
            })
        except FilesMaster.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'File not found.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})

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
