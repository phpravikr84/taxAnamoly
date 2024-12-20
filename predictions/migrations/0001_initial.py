# Generated by Django 5.1.3 on 2024-12-18 06:14

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tin', models.BigIntegerField(blank=True, null=True)),
                ('tax_period_year', models.PositiveIntegerField(blank=True, null=True)),
                ('net_income', models.FloatField(blank=True, null=True)),
                ('total_liabilities', models.FloatField(blank=True, null=True)),
                ('total_assets', models.FloatField(blank=True, null=True)),
                ('total_employees', models.FloatField(blank=True, null=True)),
                ('total_salary_wages_paid', models.FloatField(blank=True, null=True)),
                ('refund_approved_amount', models.FloatField(blank=True, null=True)),
                ('refund_frequency', models.FloatField(blank=True, null=True)),
                ('taxpayer_name', models.CharField(blank=True, max_length=255, null=True)),
                ('taxpayer_type', models.CharField(blank=True, max_length=100, null=True)),
                ('sector_activity', models.CharField(blank=True, max_length=255, null=True)),
                ('filing_frequency', models.FloatField(blank=True, null=True)),
                ('late_filing_count', models.FloatField(blank=True, null=True)),
                ('total_sales_gst', models.FloatField(blank=True, null=True)),
                ('gst_payable', models.FloatField(blank=True, null=True)),
                ('sector_average_sales', models.FloatField(blank=True, null=True)),
                ('gst_compliance_ratio', models.FloatField(blank=True, null=True)),
                ('employee_wage_ratio', models.FloatField(blank=True, null=True)),
                ('sales_to_asset_ratio', models.FloatField(blank=True, null=True)),
                ('debt_to_asset_ratio', models.FloatField(blank=True, null=True)),
                ('risk_score_gst', models.IntegerField(blank=True, null=True)),
                ('risk_score_swt', models.IntegerField(blank=True, null=True)),
                ('risk_score_refund', models.IntegerField(blank=True, null=True)),
                ('risk_score_cit', models.IntegerField(blank=True, null=True)),
                ('total_risk_score', models.IntegerField(blank=True, null=True)),
                ('fraud_probability', models.FloatField(blank=True, null=True)),
                ('fraud_prediction', models.BooleanField(blank=True, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('file_id', models.IntegerField(blank=True, null=True)),
            ],
        ),
    ]