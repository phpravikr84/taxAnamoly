import pandas as pd

def preprocess_csv(file_path):
    """
    Preprocess CSV file.
    """
    data = pd.read_csv(file_path)

    # Handling known columns and missing values
    if 'Gender' in data.columns:
        data['Gender'] = data['Gender'].map({'Male': 1, 'Female': 0}).fillna(0)

    if 'Loan_Status' in data.columns:
        data['Loan_Status'] = data['Loan_Status'].map({'Y': 1, 'N': 0}).fillna(0)

    if 'Property_Area' in data.columns:
        data['Property_Area'] = data['Property_Area'].fillna('Unknown')

    if 'Education' in data.columns:
        data['Education'] = data['Education'].fillna('Unknown')

    return data
