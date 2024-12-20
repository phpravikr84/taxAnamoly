import os
import time
import csv
import pandas as pd
import numpy as np
from django.db import transaction
from django.http import HttpResponse, JsonResponse, Http404
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect, get_object_or_404
from random import randint, choice
from faker import Faker
from datetime import datetime, timedelta
from django.contrib import messages, auth
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .forms import CSVUploadForm
from .forms import DataColumnSettingForm
from .utils import preprocess_csv
from filemasters.models import FilesMaster 
from accounts.models import User
from datacolumnsettings.models import DataColumnSettings
from django.utils.timezone import now
from django.conf import settings
from django.core.paginator import Paginator
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from predictions.models import Prediction
from .location_data import LocationData
import random
from django.db.models import Max, Min
import folium
from folium.plugins import HeatMap

MEDIA_DIR = 'media/csv/'
MEDIA_DIR_MERGE = 'media/csv/merge/'
PROCESS_DIRS = 'media/csv/processed/'
PREDICTED_DIRS = 'media/csv/predict/'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'static', 'model')
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
@login_required
def merge_files(request):
    # Ensure the directory for merged files exists
    os.makedirs(MEDIA_DIR_MERGE, exist_ok=True)

    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

    user = request.user  # Get the authenticated user
    file_name = request.POST.get('mergefilename')  # Get and sanitize the filename

    # Validate file_name
    if not file_name:
        return JsonResponse({'status': 'error', 'message': 'Filename cannot be blank, empty, or null'}, status=400)

    try:
        # Fetch files from FilesMaster based on file_name and file_state
        files = FilesMaster.objects.filter(file_name=file_name, file_state=1)

        if not files.exists():
            return JsonResponse({'status': 'error', 'message': 'No files found to merge for the provided filename'}, status=404)

        # Prepare lists to hold dataframes for CSV and Excel files
        file_dfs = {'csv': [], 'excel': []}
        processed_files = 0  # Track processed files count
        errors = []  # Collect errors for debugging

        # Process each file
        for file in files:
            file_path = file.file_path_rw
            if not os.path.exists(file_path):
                errors.append(f"File not found: {file_path}")
                continue

            try:
                if file_path.endswith('.csv'):
                    try:
                        # Attempt to read with UTF-8 encoding first
                        df = pd.read_csv(file_path, encoding='ISO-8859-1', low_memory=False)
                        file_dfs['csv'].append(df)
                    except UnicodeDecodeError as e_utf8:
                        try:
                            # Fallback to 'latin1' encoding
                            df = pd.read_csv(file_path, encoding='ISO-8859-1', low_memory=False)
                            file_dfs['csv'].append(df)
                        except Exception as e_latin1:
                            errors.append(f"Error reading CSV file {file_path} with both UTF-8 and Latin1: {str(e_latin1)}")
                elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
                    df = pd.read_excel(file_path)
                    file_dfs['excel'].append(df)
            except Exception as e:
                errors.append(f"Unexpected error processing file {file_path}: {str(e)}")
                continue

        # Merge and save CSV files
        if file_dfs['csv']:
            try:
                merged_csv_df = pd.concat(file_dfs['csv'], ignore_index=True, sort=False)
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
                processed_files += 1
            except Exception as e:
                errors.append(f"Error merging CSV files: {str(e)}")

        # Merge and save Excel files
        if file_dfs['excel']:
            try:
                merged_excel_df = pd.concat(file_dfs['excel'], ignore_index=True, sort=False)
                merged_excel_file_name = f"{file_name}_final_rawfile.xlsx"
                merged_excel_file_path = os.path.join(MEDIA_DIR_MERGE, merged_excel_file_name)
                merged_excel_df.to_excel(merged_excel_file_path, index=False)

                FilesMaster.objects.create(
                    file_name=f"{file_name}_final",
                    file_path_rw=merged_excel_file_path,
                    user_id=user,
                    status=1,
                    reason='Merged Excel files',
                    file_state=5,
                    merge_status=True
                )
                processed_files += 1
            except Exception as e:
                errors.append(f"Error merging Excel files: {str(e)}")

        if processed_files == 0:
            # No valid files were processed, provide detailed reasons
            return JsonResponse({'status': 'error', 'message': 'No valid files processed for merging', 'errors': errors}, status=400)

        return JsonResponse({'status': 'success', 'processed_files': processed_files, 'message': 'Files merged successfully'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f"An error occurred: {str(e)}"}, status=500)

    
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

    data = pd.read_csv(file_path, encoding='ISO-8859-1', low_memory=False)

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
    # Query FilesMaster with the necessary fields and join with the User model
    files = FilesMaster.objects.filter(file_state=5, merge_status=True).select_related('User').values(
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
    return render(request, 'data-managment/processed-data/index.html', {"records": records})


@csrf_exempt
def ProcessRawFiles(request):
    if request.method == 'POST':
        try:
            # Parse file paths from POST data
            body_data = json.loads(request.body)
            file_paths = body_data.get('filePaths', [])
            csv_files = {file['file_name']: file['file_path'] for file in file_paths}
            user = request.user  # Get the authenticated user

            # Get FileIds as a PostgreSQL-compatible array literal
            parentFileIds = [file['file_id'] for file in file_paths if 'file_id' in file]
            postgres_array = "{" + ",".join(map(str, parentFileIds)) + "}"

            # Define paths and load CSV files explicitly
            try:
                gst_df = pd.read_csv(csv_files.get('gst', ''), encoding='ISO-8859-1', low_memory=False)
                cit_df = pd.read_csv(csv_files.get('cit', ''), encoding='ISO-8859-1', low_memory=False)
                swt_df = pd.read_csv(csv_files.get('swt', ''), encoding='ISO-8859-1', low_memory=False)
                non_ind_reg_df = pd.read_csv(csv_files.get('non_ind_reg', ''), encoding='ISO-8859-1', low_memory=False)
                gst_refund_df = pd.read_csv(csv_files.get('gst_refund', ''), encoding='ISO-8859-1', low_memory=False)
            except FileNotFoundError as e:
                return JsonResponse({'status': 'error', 'message': str(e)})

            # Standardize column names
            for df in [gst_df, cit_df, swt_df, non_ind_reg_df, gst_refund_df]:
                if not df.empty:
                    df.columns = df.columns.str.lower().str.replace(' ', '_')

            # Call feature engineering method
            result = engineer_features(
                gst_df, cit_df, swt_df, non_ind_reg_df, gst_refund_df
            )

            if not result.empty:
                os.makedirs(PROCESS_DIRS, exist_ok=True)  # Ensure the directory exists

                # Generate a dynamic file name
                output_file_name = f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                output_file_path = os.path.join(PROCESS_DIRS, output_file_name)
                result.to_csv(output_file_path, index=False)

                # Save metadata in FilesMaster model
                FilesMaster.objects.create(
                    file_name=f"{output_file_name}_unified",
                    file_path_pr=output_file_path,
                    user_id=user,
                    parent_file_id=postgres_array,
                    status=1,
                    reason='Processed CSV file',
                    file_state=2,
                    merge_status=True
                )

                # Include data types in the response
                result_dtypes = {col: str(dtype) for col, dtype in result.dtypes.to_dict().items()}

                return JsonResponse({
                    'status': 'success',
                    'message': 'Files processed successfully done! Please wait another prediction started ...',
                    'processed_file_path': output_file_path,
                    'data_types': result_dtypes
                })

            return JsonResponse({'status': 'error', 'message': 'Feature engineering returned no results.'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})



#==============================
# SHARE BY DATA SCIECNCE TEAM
#=============================
def engineer_features(gst_df, cit_df, swt_df, non_ind_reg_df, gst_refund_df):
    gst_features = gst_df.groupby(['tin', 'tax_period_year']).agg(
        total_sales_gst=('10_total_sales', 'sum'),
        gst_payable=('151_gst_payable', 'sum')
    ).reset_index()

    cit_features = cit_df.groupby(['tin', 'tax_period_']).agg(
        net_income=('710.current_year_profit_/_loss', 'sum'),
        total_liabilities=('590.total_liabilities', 'sum'),
        total_assets=('536.total_assets', 'sum')
    ).reset_index()
    cit_features.rename(columns={'tax_period_': 'tax_period_year'}, inplace=True)

    swt_features = swt_df.groupby(['tin', 'tax_period_year']).agg(
        total_employees=('10.no.employees_on_payroll', 'sum'),
        total_salary_wages_paid=('20.total_salary_wages_paid', 'sum')
    ).reset_index()

    refund_features = gst_refund_df.groupby(['tin', 'tper_year']).agg(
        refund_approved_amount=('approve_amt', 'sum'),
        refund_frequency=('approve_amt', 'count')
    ).reset_index()
    refund_features.rename(columns={'tper_year': 'tax_period_year'}, inplace=True)

    reg_features = non_ind_reg_df[['tin', 'taxpayer_name', 'taxpayer_type', 'sector_activity']]

    filing_frequency = gst_df.groupby(['tin', 'tax_period_year']).size().reset_index(name='filing_frequency')
    late_filing_count = gst_df[gst_df['entry_date'] > gst_df['due_date']].groupby(['tin', 'tax_period_year']).size().reset_index(name='late_filing_count')

    sector_sales_avg = non_ind_reg_df.merge(gst_df, on='tin').groupby('sector_activity').agg(
        sector_average_sales=('10_total_sales', 'mean')
    ).reset_index()
    gst_features = gst_features.merge(non_ind_reg_df[['tin', 'sector_activity']], on='tin', how='left')
    gst_features = gst_features.merge(sector_sales_avg, on='sector_activity', how='left')

    features_to_merge = [
        (cit_features, ['tin', 'tax_period_year']),
        (swt_features, ['tin', 'tax_period_year']),
        (refund_features, ['tin', 'tax_period_year']),
        (reg_features, ['tin']),
        (filing_frequency, ['tin', 'tax_period_year']),
        (late_filing_count, ['tin', 'tax_period_year']),
        (gst_features, ['tin', 'tax_period_year']),
    ]

    unified_df = features_to_merge[0][0]
    for feature_df, merge_keys in features_to_merge[1:]:
        unified_df = unified_df.merge(feature_df, on=merge_keys, how='left')

    if 'sector_activity_x' in unified_df.columns:
        unified_df.rename(columns={'sector_activity_x': 'sector_activity'}, inplace=True)
    if 'sector_activity_y' in unified_df.columns:
        unified_df.drop(columns=['sector_activity_y'], inplace=True)

    unified_df['gst_compliance_ratio'] = unified_df['gst_payable'] / unified_df['total_sales_gst']
    unified_df['employee_wage_ratio'] = unified_df['total_salary_wages_paid'] / unified_df['total_employees']
    unified_df['sales_to_asset_ratio'] = unified_df['total_sales_gst'] / unified_df['total_assets']
    unified_df['debt_to_asset_ratio'] = unified_df['total_liabilities'] / unified_df['total_assets']

    unified_df['risk_score_gst'] = np.where(unified_df['gst_compliance_ratio'] < 0.8, 10, 0)
    unified_df['risk_score_swt'] = np.where(unified_df['employee_wage_ratio'] < 5000, 15, 0)
    unified_df['risk_score_refund'] = np.where(unified_df['refund_approved_amount'] > 1000000, 5, 0)
    unified_df['risk_score_cit'] = np.where((unified_df['debt_to_asset_ratio'] > 0.5) & (unified_df['net_income'] < 0), 20, 0)

    unified_df['total_risk_score'] = unified_df[['risk_score_gst', 'risk_score_swt', 'risk_score_refund', 'risk_score_cit']].sum(axis=1)
    return unified_df

def make_predictions(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        user = request.user  # Get the authenticated user
        # Parse JSON payload
        data = json.loads(request.body)
        processed_file_path = data.get('processedFilePath')

        if not processed_file_path:
            return JsonResponse({"error": "processedFilePath not provided in the request."}, status=400)

        if not os.path.exists(processed_file_path):
            return JsonResponse({"error": f"File not found: {processed_file_path}"}, status=400)

        # Load model and preprocessor
        model_path = os.path.join(MODEL_DIR, 'fraud_detection_model.pkl')
        preprocessor_path = os.path.join(MODEL_DIR, 'scaler.pkl')


        if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
            return JsonResponse({"error": "Required model or preprocessor files are missing."}, status=400)

        model = joblib.load(model_path)
        preprocessor = joblib.load(preprocessor_path)

        # Load data
        new_data = pd.read_csv(processed_file_path, encoding='ISO-8859-1', low_memory=False)

        # Define the required columns
        columns_to_keep = [
            'net_income', 'total_liabilities', 'total_assets', 'total_employees',
            'total_salary_wages_paid', 'refund_approved_amount', 'refund_frequency',
            'taxpayer_type', 'filing_frequency', 'late_filing_count',
            'total_sales_gst', 'gst_payable', 'sector_average_sales',
            'gst_compliance_ratio', 'employee_wage_ratio', 'sales_to_asset_ratio',
            'debt_to_asset_ratio', 'risk_score_gst', 'risk_score_swt',
            'risk_score_refund', 'risk_score_cit'
        ]
         
        ###Changes###
        categorical_columns = ['taxpayer_type']  # Add other categorical columns if necessary
        #numerical_columns = [col for col in columns_to_keep if col not in categorical_columns]


        # Check for missing columns
        missing_cols = [col for col in columns_to_keep if col not in new_data.columns]
        if missing_cols:
            return JsonResponse({"error": f"Missing columns in input data: {missing_cols}"}, status=400)


        # Ensure data is numeric or string for preprocessing
        new_data[columns_to_keep] = new_data[columns_to_keep].apply(pd.to_numeric, errors='coerce')
        new_data[categorical_columns] = new_data[categorical_columns].fillna('Unknown').astype(str)

        # Replace NaN and infinite values with 0
        new_data.replace([np.inf, -np.inf], np.nan, inplace=True)
        new_data.fillna(0, inplace=True)
        
        # Replace unseen categories with a placeholder
        known_categories = preprocessor.named_transformers_['cat'].categories_
        for i, col in enumerate(categorical_columns):
            new_data[col] = new_data[col].apply(lambda x: x if x in known_categories[i] else "Unknown")


        # Ensure data types are compatible with the preprocessor
        # Process data
        X_new = new_data[columns_to_keep]
        

        # # Ensure it's a DataFrame with correct columns
        # X_new = pd.DataFrame(X_new, columns=columns_to_keep)

        # # Debugging checks
        # if not isinstance(X_new, pd.DataFrame):
            # return JsonResponse({"error": "X_new is not a DataFrame."}, status=400)

        # if not all(col in X_new.columns for col in columns_to_keep):
            # return JsonResponse({"error": "Input data is missing required columns for preprocessing."}, status=400)

        # Apply transformation
        X_new_preprocessed = preprocessor.transform(X_new)


        # Predictions
        new_data['fraud_probability'] = model.predict_proba(X_new_preprocessed)[:, 1]
        new_data['fraud_prediction'] = model.predict(X_new_preprocessed)

        # Save the output data
        output_file_name = f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        output_path = os.path.join(PREDICTED_DIRS, output_file_name)
        new_data.to_csv(output_path, index=False)

        # Convert DataFrame to JSON
        new_data_json = new_data.to_dict(orient='records')
        
        # Save metadata in FilesMaster model
        fileMst = FilesMaster.objects.create(
            file_name=f"{output_file_name}_predicted",
            file_path_pd=output_path,
            user_id=user,
            status=1,
            reason='Predicted CSV file',
            file_state=3,
            merge_status=True
        )
        
        #Get Inserted File Id
        insertedId = fileMst.id
        #Save Filedata in Predictions 
        response = addPredictedDataDetail(output_path, insertedId)
        # if response["status"] != "success":
        #     return JsonResponse({"error": response["message"]}, status=400)
        
        return JsonResponse({
            "status": "success",
            "message": "Predictions completed successfully.",
            "output_path": output_path,
            "new_data": new_data_json
        })

    except Exception as e:
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

#=====================================
#END
#=====================================

#Insert File record in Predictions_prediction table

def addPredictedDataDetail(file_path, file_id):
    try:
        # Initialize a cache to store lat and lng for each TIN
        tin_location_cache = {}

        # Open the CSV file
        with open(file_path, mode='r') as file:
            csv_reader = csv.reader(file)
            headers = next(csv_reader)  # Read the header row

            # Create a mapping of header names to their indices
            header_index = {header: index for index, header in enumerate(headers)}

            # Prepare a list for batch inserts
            predictions = []

            # Loop through the rows
            for row in csv_reader:
                # Check for duplicates based on TIN and tax_period_year
                tin = int(row[header_index["tin"]]) if row[header_index["tin"]] else None
                tax_period_year = int(row[header_index["tax_period_year"]]) if row[header_index["tax_period_year"]] else None

                
                if tin and tax_period_year:
                    # Check if a record already exists
                    if Prediction.objects.filter(tin=tin, tax_period_year=tax_period_year).exists():
                        continue  # Skip duplicates

                    # Use cached location if TIN already exists, otherwise assign a new random location
                    if tin in tin_location_cache:
                        location = tin_location_cache[tin]
                    else:
                        location = random.choice(LocationData.DATA)
                        tin_location_cache[tin] = location  # Cache the location for this TIN

                # Add to batch insert list
                predictions.append(Prediction(
                    tin=tin,
                    tax_period_year=tax_period_year,
                    net_income=float(row[header_index["net_income"]]) if row[header_index["net_income"]] else None,
                    total_liabilities=float(row[header_index["total_liabilities"]]) if row[header_index["total_liabilities"]] else None,
                    total_assets=float(row[header_index["total_assets"]]) if row[header_index["total_assets"]] else None,
                    total_employees=float(row[header_index["total_employees"]]) if row[header_index["total_employees"]] else None,
                    total_salary_wages_paid=float(row[header_index["total_salary_wages_paid"]]) if row[header_index["total_salary_wages_paid"]] else None,
                    refund_approved_amount=float(row[header_index["refund_approved_amount"]]) if row[header_index["refund_approved_amount"]] else None,
                    refund_frequency=float(row[header_index["refund_frequency"]]) if row[header_index["refund_frequency"]] else None,
                    taxpayer_name=row[header_index["taxpayer_name"]] if row[header_index["taxpayer_name"]] else None,
                    taxpayer_type=row[header_index["taxpayer_type"]] if row[header_index["taxpayer_type"]] else None,
                    sector_activity=row[header_index["sector_activity"]] if row[header_index["sector_activity"]] else None,
                    filing_frequency=float(row[header_index["filing_frequency"]]) if row[header_index["filing_frequency"]] else None,
                    late_filing_count=float(row[header_index["late_filing_count"]]) if row[header_index["late_filing_count"]] else None,
                    total_sales_gst=float(row[header_index["total_sales_gst"]]) if row[header_index["total_sales_gst"]] else None,
                    gst_payable=float(row[header_index["gst_payable"]]) if row[header_index["gst_payable"]] else None,
                    sector_average_sales=float(row[header_index["sector_average_sales"]]) if row[header_index["sector_average_sales"]] else None,
                    gst_compliance_ratio=float(row[header_index["gst_compliance_ratio"]]) if row[header_index["gst_compliance_ratio"]] else None,
                    employee_wage_ratio=float(row[header_index["employee_wage_ratio"]]) if row[header_index["employee_wage_ratio"]] else None,
                    sales_to_asset_ratio=float(row[header_index["sales_to_asset_ratio"]]) if row[header_index["sales_to_asset_ratio"]] else None,
                    debt_to_asset_ratio=float(row[header_index["debt_to_asset_ratio"]]) if row[header_index["debt_to_asset_ratio"]] else None,
                    risk_score_gst=int(row[header_index["risk_score_gst"]]) if row[header_index["risk_score_gst"]] else None,
                    risk_score_swt=int(row[header_index["risk_score_swt"]]) if row[header_index["risk_score_swt"]] else None,
                    risk_score_refund=int(row[header_index["risk_score_refund"]]) if row[header_index["risk_score_refund"]] else None,
                    risk_score_cit=int(row[header_index["risk_score_cit"]]) if row[header_index["risk_score_cit"]] else None,
                    total_risk_score=int(row[header_index["total_risk_score"]]) if row[header_index["total_risk_score"]] else None,
                    fraud_probability=float(row[header_index["fraud_probability"]]) if row[header_index["fraud_probability"]] else None,
                    fraud_prediction = int(row[header_index["fraud_prediction"]]) if row[header_index["fraud_prediction"]].strip() else None,
                    latitude=location['lat'],
                    longitude=location['lng'],
                    file_id=file_id,
                ))

            # Perform batch insert for better performance
            if predictions:
                with transaction.atomic():
                    Prediction.objects.bulk_create(predictions)

        return True  # Success

    except Exception as e:
        return str(e)  # Error message

# Define Raw Data Page
def viewPredictedData(request):
    # Query FilesMaster with the necessary fields and join with the User model
    files = FilesMaster.objects.filter(file_state=3, merge_status=True).select_related('User').values(
        'id',
        'file_name',
        'file_path_pd',
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
            "file_path": file['file_path_pd'],
            "uploaded_by": f"{file['user_id__first_name']} {file['user_id__last_name']}",
            "created_at": file['created_date'].strftime("%Y-%m-%d %H:%M:%S"),
            "modified_at": file['modified_date'].strftime("%Y-%m-%d %H:%M:%S"),
        })

    # Render the records in the view template
    return render(request, 'data-managment/processed-data/view.html', {"records": records})

# def viewPredictedDataDetail(request, file_id):
#      # Retrieve the file record
#     file_record = get_object_or_404(FilesMaster, id=file_id)

#     # Read the CSV file and extract data
#     csv_data = []
#     try:
#         with open(file_record.file_path_pd, mode='r') as file:
#             csv_reader = csv.reader(file)
#             headers = next(csv_reader)  # Skip the header
#             for row in csv_reader:
#                 csv_data.append(row)
#     except Exception as e:
#         print(f"Error reading CSV file: {e}")

#     # Paginate the data
#     paginator = Paginator(csv_data, 10)  # Show 10 rows per page
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)

#     # Render template with paginated data
#     return render(request, 'data-managment/processed-data/view-data.html', {
#         'page_obj': page_obj,
#         'headers': headers,
#         'file_record': file_record,
#     })


def viewPredictedDataDetail(request, file_id):
    # Retrieve the file record
    file_record = get_object_or_404(FilesMaster, id=file_id)

    # Retrieve the predictions for the specific file_id
    predictions = Prediction.objects.filter(file_id=file_id)

    # Paginate the data
    paginator = Paginator(predictions, 10)  # Show 10 rows per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Render template with paginated data
    return render(request, 'data-managment/processed-data/view-data.html', {
        'page_obj': page_obj,
        'file_record': file_record,
    })
    
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

# View for file download
def downloadPredictedFile(request, file_id):
    file_record = get_object_or_404(FilesMaster, id=file_id)
    file_path = file_record.file_path_pd

    try:
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type="application/octet-stream")
            response['Content-Disposition'] = f'attachment; filename="{file_path}"'
            return response
    except FileNotFoundError:
        raise Http404("File not found.")
    
def viewFraudAnalyticsData(request):
    # Get unique taxpayer names (company names)
    taxpayer_names = Prediction.objects.values_list('taxpayer_name', flat=True).distinct()

    # Get minimum and maximum tax period year
    min_year = Prediction.objects.aggregate(Min('tax_period_year'))['tax_period_year__min']
    max_year = Prediction.objects.aggregate(Max('tax_period_year'))['tax_period_year__max']

    # Create a list of years from min_year to max_year
    years_range = list(range(min_year, max_year + 1))

    # Get filters from request (default to max_year and all fraud values)
    tax_period_year = request.GET.get('tax_period_year', max_year)
    fraud_prediction = request.GET.get('fraud_prediction')  # Can be None, '1', or '0'

    # Filter predictions based on year and fraud prediction (if provided)
    predictions = Prediction.objects.filter(tax_period_year=tax_period_year)
    if fraud_prediction in ['0', '1']:
        predictions = predictions.filter(fraud_prediction=int(fraud_prediction))

    # Generate the map (only once) and center it based on the first prediction with valid data
    if predictions.exists():
        first_prediction = predictions.first()
        map_object = folium.Map(location=[first_prediction.latitude, first_prediction.longitude], zoom_start=6)
    else:
        # If no predictions exist, create a default map center
        map_object = folium.Map(location=[48.0, 5.0], zoom_start=6)  # Default location

    # Create a list of locations and intensities for the HeatMap
    heat_data = []
    for prediction in predictions:
        if prediction.fraud_prediction == 1:
            latitude = float(prediction.latitude)
            longitude = float(prediction.longitude)

            if latitude and longitude:
                print(f"Adding to heatmap: Latitude: {latitude}, Longitude: {longitude}")
                heat_data.append([latitude, longitude, 1])  # Add intensity for fraud locations

                # For debugging: Add markers for each fraud location
                folium.CircleMarker([latitude, longitude], radius=5, color='red', fill=True).add_to(map_object)

    # Add HeatMap to the map if heat_data is not empty
    if heat_data:
        HeatMap(heat_data, radius=25, max_zoom=15).add_to(map_object)
        print("HeatMap added to map.")
    else:
        print("No fraud data found for heatmap")

    # Render the map as HTML
    map_html = map_object._repr_html_()

    # Prepare data for rendering
    return render(request, 'dashboard/analytics/index.html', {
        'taxpayer_names': taxpayer_names,
        'min_year': min_year,
        'max_year': max_year,
        'years_range': years_range,
        'fraud_values': [0, 1],  # Fraud can either be 0 or 1
        'predictions': predictions,
        'default_tax_period_year': tax_period_year,
        'map_html': map_html,  # Pass the generated map HTML
    })

    
def get_geojson(request):
    file_path = os.path.join(settings.MEDIA_ROOT, 'countries.geojson')
    with open(file_path, 'r') as file:
        geojson_data = json.load(file)
    return JsonResponse(geojson_data)

# Optionally, leave the original JSON response for API usage
def get_predictions_data(request, tax_period_year, fraud_detection):
    predictions = Prediction.objects.filter(tax_period_year=tax_period_year, fraud_prediction=fraud_detection)
    
    data = [
        {
            'latitude': float(prediction.latitude),
            'longitude': float(prediction.longitude),
            'fraud_prediction': prediction.fraud_prediction,
        }
        for prediction in predictions if prediction.latitude and prediction.longitude
    ]
    
    return JsonResponse(data, safe=False)

#Setting Rules
# View to list all data column settings
def dataColumnSettingList(request):
    settings = DataColumnSettings.objects.all()
    return render(request, 'settings/datacolumn-setting/index.html', {'settings': settings})

# View to add a new data column setting
def dataColumnSettingAdd(request):
    if request.method == 'POST':
        form = DataColumnSettingForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('data-column-setting')  # Redirect to the list view
    else:
        form = DataColumnSettingForm()
    return render(request, 'settings/datacolumn-setting/add.html', {'form': form})

# View to edit an existing data column setting
def dataColumnSettingEdit(request, id):
    setting = DataColumnSetting.objects.get(id)
    if request.method == 'POST':
        form = DataColumnSettingForm(request.POST, instance=setting)
        if form.is_valid():
            form.save()
            return redirect('data-column-setting')  # Redirect to the list view
    else:
        form = DataColumnSettingForm(instance=setting)
    return render(request, 'settings/datacolumn-setting/edit.html', {'form': form})
#Company Management
def companySetting(request):
    return render(request, 'settings/company/index.html')
def companySettingAdd(request):
    return render(request, 'settings/company/add.html')
def companySettingEdit(request):
    return render(request, 'settings/company/edit.html')
#Pickel Managment
def pickelModelSetting(request):
    return render(request, 'settings/pickel-model/index.html')
def pickelModelSettingAdd(request):
    return render(request, 'settings/pickel-model/add.html')
def pickelModelSettingEdit(request):
    return render(request, 'settings/pickel-model/edit.html')