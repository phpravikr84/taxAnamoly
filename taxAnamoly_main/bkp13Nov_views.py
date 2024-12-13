import os
import time
import csv
import pandas as pd
import numpy as np
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect, get_object_or_404
from random import randint, choice
from faker import Faker
from datetime import datetime, timedelta
from django.contrib import messages, auth
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .forms import CSVUploadForm
from .utils import preprocess_csv
from filemasters.models import FilesMaster 
from accounts.models import User
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



MEDIA_DIR = 'media/csv/'
MEDIA_DIR_MERGE = 'media/csv/merge/'
PROCESS_DIRS = 'media/csv/processed/'
PREDICTED_DIRS = 'media/csv/predict/'
MODEL_DIR = 'static/model/'
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
                        df = pd.read_csv(file_path, encoding='utf-8')
                        file_dfs['csv'].append(df)
                    except UnicodeDecodeError as e_utf8:
                        try:
                            # Fallback to 'latin1' encoding
                            df = pd.read_csv(file_path, encoding='latin1')
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
            dataframes = {}
            user = request.user  # Get the authenticated user
            # Get FileIds as a comma-separated string
            #parentFileIds = ",".join(str(file['file_id']) for file in file_paths if 'file_id' in file)
            # Convert the file IDs to a PostgreSQL-compatible array literal
            parentFileIds = [file['file_id'] for file in file_paths if 'file_id' in file]

            # Format as a PostgreSQL array literal
            postgres_array = "{" + ",".join(map(str, parentFileIds)) + "}"
            # Now parentFileIds will contain a string of comma-separated file IDs, like '1,2,3,4'

            
            # Load CSV files dynamically
            for file_name, file_path in csv_files.items():
                if not os.path.exists(file_path):
                    return JsonResponse({
                        'status': 'error',
                        'message': f"File {file_name} at path {file_path} does not exist."
                    })
                dataframes[file_name] = pd.read_csv(file_path, encoding='ISO-8859-1', low_memory=False)

            # Standardize column names
            for df in dataframes.values():
                df.columns = df.columns.str.lower().str.replace(' ', '_')

            # Call feature engineering method
            result = engineer_features(
                dataframes.get('gst', pd.DataFrame()), 
                dataframes.get('cit', pd.DataFrame()),
                dataframes.get('swt', pd.DataFrame()), 
                dataframes.get('non_ind_reg', pd.DataFrame()), 
                dataframes.get('gst_refund', pd.DataFrame())
            )

            if not result.empty:
                os.makedirs(PROCESS_DIRS, exist_ok=True)  # Ensure the directory exists
                
                # Generate a dynamic file name
                output_file_name = f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                output_file_path = os.path.join(PROCESS_DIRS, output_file_name)
                result.to_csv(output_file_path, index=False)

                # Save metadata in FilesMaster model
                #for file_data in file_paths:
                FilesMaster.objects.create(
                    file_name=f"{output_file_name}_unified",
                    file_path_pr=output_file_path,
                    user_id=user,
                    parent_file_id=postgres_array,  # Assuming this is correct
                    status=1,
                    reason='Processed CSV file',
                    file_state=2,
                    merge_status=True
                )

                return JsonResponse({
                    'status': 'success',
                    'message': 'Files processed successfully!',
                    'processed_file_path': output_file_path
                })

            return JsonResponse({'status': 'error', 'message': 'Feature engineering returned no results.'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})


#==============================
# SHARE BY DATA SCIECNCE TEAM
#=============================
def engineer_features(gst_df, cit_df, swt_df, non_ind_reg_df, gst_refund_df):
     # Validate GST DataFrame
     # Debugging GST DataFrame
    if 'tin' not in gst_df.columns or 'tax_period_year' not in gst_df.columns:
        #logger.error(f"GST DataFrame missing columns: {gst_df.columns.tolist()}")
        raise ValueError("Required columns are missing in GST DataFrame")

    gst_features = gst_df.groupby(['tin', 'tax_period_year']).agg(
        total_sales_gst=('10_total_sales', 'sum'),
        gst_payable=('151_gst_payable', 'sum')
    ).reset_index()

    # Validate CIT DataFrame
    if 'tin' not in cit_df.columns or 'tax_period_' not in cit_df.columns:
        raise ValueError("Required columns are missing in CIT DataFrame")
    
    cit_features = cit_df.groupby(['tin', 'tax_period_']).agg(
        net_income=('710.current_year_profit_/_loss', 'sum'),
        total_liabilities=('590.total_liabilities', 'sum'),
        total_assets=('536.total_assets', 'sum')
    ).reset_index()
    cit_features.rename(columns={'tax_period_': 'tax_period_year'}, inplace=True)

    # Validate swt DataFrame
    if 'tin' not in swt_df.columns or 'tax_period_year' not in swt_df.columns:
        raise ValueError("Required columns are missing in SWT DataFrame")
    
    swt_features = swt_df.groupby(['tin', 'tax_period_year']).agg(
        total_employees=('10.no.employees_on_payroll', 'sum'),
        total_salary_wages_paid=('20.total_salary_wages_paid', 'sum')
    ).reset_index()

     # Validate swt DataFrame
    if 'tin' not in gst_refund_df.columns or 'tper_year' not in gst_refund_df.columns:
        raise ValueError("Required columns are missing in GST Refund DataFrame")
    
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

    unified_df.fillna(0, inplace=True)
    return unified_df

def make_predictions(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        # Parse JSON payload
        data = json.loads(request.body)
        processed_file_path = data.get('processedFilePath')
        #processed_file_path = os.path.join('media/csv/processed/output_20241212_175126.csv')
        #processed_file_path = os.path.join('/media', 'csv', 'processed', 'output_20241212_175126.csv')

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
        new_data = pd.read_csv(processed_file_path)
      

        # Validate required columns
        columns_to_keep = [
            'net_income', 'total_liabilities', 'total_assets', 'total_employees',
            'total_salary_wages_paid', 'refund_approved_amount', 'refund_frequency',
            'taxpayer_type', 'filing_frequency', 'late_filing_count',
            'total_sales_gst', 'gst_payable', 'sector_average_sales',
            'gst_compliance_ratio', 'employee_wage_ratio', 'sales_to_asset_ratio',
            'debt_to_asset_ratio', 'risk_score_gst', 'risk_score_swt',
            'risk_score_refund', 'risk_score_cit'
        ]
        
            # Ensure the DataFrame contains the required columns
        #if not all(col in new_data.columns for col in columns_to_keep):
        #    return JsonResponse({"error": "Input data is missing required columns."}, status=400)

        
        if not all(col in new_data.columns for col in columns_to_keep):
            return JsonResponse({"error": "Input data is missing required columns."}, status=400)

        # Convert columns to numeric and handle non-numeric data
        new_data[columns_to_keep] = new_data[columns_to_keep].apply(pd.to_numeric, errors='coerce')

        # Handle NaN values by filling them with 0 or another strategy
        new_data[columns_to_keep] = new_data[columns_to_keep].fillna(0)
        
        new_data.replace([np.inf, -np.inf], np.nan, inplace=True)
       

        # Process data
        X_new = new_data[columns_to_keep]
        
        # Convert DataFrame to JSON-compatible format (list of dictionaries)
        new_data_json = X_new.to_dict(orient='records')
        
        return JsonResponse({
            "status": "success",
            "message": "Predictions completed successfully.",
            "new_data": new_data_json
        })
      
        X_new_preprocessed = preprocessor.transform(X_new)
        
        

        # Predictions
        new_data['fraud_probability'] = model.predict_proba(X_new_preprocessed)[:, 1]
        new_data['fraud_prediction'] = model.predict(X_new_preprocessed)

        # Convert DataFrame to JSON
        new_data_json = new_data.to_dict(orient='records')

        # Save the output data
        output_file_name = f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        output_path = os.path.join(PREDICTED_DIRS, output_file_name)
        new_data.to_csv(output_path, index=False)

        # Return the response with the new data and output file path
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
