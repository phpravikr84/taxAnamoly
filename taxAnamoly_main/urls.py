"""
URL configuration for taxAnamoly_main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login, name="login"),
    path('login/', views.login, name="login"),
    #
    # path('login/', views.login, name="login"),
    path('logout', views.logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('data-management/raw-data/', views.rawData, name='data-management-view'),
    path('data-management/raw-data/view/<int:file_id>', views.viewRawData, name='view-raw-data'),
    path('data-management/raw-data/upload/', views.rawDataUpload, name='data-management-upload'),
    path('data-management/raw-data/delete/', views.deleteUploadedFile, name='delete-file'),
    path('data-management/raw-data/delete-merge/', views.deleteMergeFile, name='delete-merge-file'),
    path('data-management/raw-data/merge_files/', views.merge_files, name='data-management-merge-files'),
    path('data-management/process-data/', views.processData, name='data-management-processed'),
    path('data-management/process-data/ProcessRawFiles', views.ProcessRawFiles, name='data-management-predict'),
    path('data-management/start-prediction', views.make_predictions, name='data-management-start-prediction'),
    #path('data-management/process-data/', views.viewProcessData, name='view-process-data'),
    path('data-managment/predected-data/', views.viewPredictedData, name='data-management-predicted-data'),
    path('data-managment/predected-data/view/<int:file_id>', views.viewPredictedDataDetail, name='data-management-predicted-data-view'),
    path('data-managment/predected-data/download/<int:file_id>', views.downloadPredictedFile, name='data-management-predicted-data-download'),
    path('dashboard/analytics/', views.viewFraudAnalyticsData, name='dashboard-analytics'),
     path('get_geojson/', views.get_geojson, name='get_geojson'),
    path('get_predictions_data/<int:tax_period_year>/<int:fraud_detection>/', views.get_predictions_data, name='get_predictions_data'),
    #Setting companySetting
    path('settings/datacolumn-setting/', views.dataColumnSettingList, name='data-column-setting'),
    path('settings/datacolumn-setting/add', views.dataColumnSettingAdd, name='data-column-setting-add'),
    path('settings/datacolumn-setting/edit/<int:file_id>', views.dataColumnSettingEdit, name='data-column-setting-edit'),
    path('settings/company/', views.companySetting, name='company-setting'),
    path('settings/company/add', views.companySettingAdd, name='company-setting-add'),
    path('settings/company/edit', views.companySettingEdit, name='company-setting-edit'),
    #Pickel
    path('settings/pickel-model/', views.pickelModelSetting, name='pickel-model-setting'),
    path('settings/pickel-model/add', views.pickelModelSettingAdd, name='pickel-model-setting-add'),
    path('settings/pickel-model/edit', views.pickelModelSettingEdit, name='pickel-model-setting-edit'),
]
