from django import forms
from datacolumnsettings.models import DataColumnSettings
from pickelmodelsetting.models import PickelModelSetting
import json

class CSVUploadForm(forms.Form):
    file = forms.FileField(label='Upload CSV File')
    

class DataColumnSettingForm(forms.ModelForm):
    class Meta:
        model = DataColumnSettings
        fields = ['file_name', 'column_name', 'column_slug', 'status']

    def __init__(self, *args, **kwargs):
        super(DataColumnSettingForm, self).__init__(*args, **kwargs)
        # Adjust choices for 'status' field to present Active/Inactive as options
        self.fields['status'].widget.choices = [(1, 'Active'), (0, 'Inactive')]
        self.fields['column_name'].widget.attrs['class'] = 'form-control'
        self.fields['column_slug'].widget.attrs['class'] = 'form-control'
        self.fields['status'].widget.attrs['class'] = 'form-control'

class PickelModelSettingForm(forms.ModelForm):
    class Meta:
        model = PickelModelSetting
        fields = ['file_name']  # Include the fields