from django.db import models

class Prediction(models.Model):
    tin = models.BigIntegerField(null=True, blank=True)
    tax_period_year = models.PositiveIntegerField(null=True, blank=True)
    net_income = models.FloatField(null=True, blank=True)
    total_liabilities = models.FloatField(null=True, blank=True)
    total_assets = models.FloatField(null=True, blank=True)
    total_employees = models.FloatField(null=True, blank=True)
    total_salary_wages_paid = models.FloatField(null=True, blank=True)
    refund_approved_amount = models.FloatField(null=True, blank=True)
    refund_frequency = models.FloatField(null=True, blank=True)
    taxpayer_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Taxpayer Name")
    taxpayer_type = models.CharField(max_length=100, null=True, blank=True)
    sector_activity = models.CharField(max_length=255, null=True, blank=True)
    filing_frequency = models.FloatField(null=True, blank=True)
    late_filing_count = models.FloatField(null=True, blank=True)
    total_sales_gst = models.FloatField(null=True, blank=True)
    gst_payable = models.FloatField(null=True, blank=True)
    sector_average_sales = models.FloatField(null=True, blank=True)
    gst_compliance_ratio = models.FloatField(null=True, blank=True)
    employee_wage_ratio = models.FloatField(null=True, blank=True)
    sales_to_asset_ratio = models.FloatField(null=True, blank=True)
    debt_to_asset_ratio = models.FloatField(null=True, blank=True)
    risk_score_gst = models.IntegerField(null=True, blank=True)
    risk_score_swt = models.IntegerField(null=True, blank=True)
    risk_score_refund = models.IntegerField(null=True, blank=True)
    risk_score_cit = models.IntegerField(null=True, blank=True)
    total_risk_score = models.IntegerField(null=True, blank=True)
    fraud_probability = models.FloatField(null=True, blank=True, default=0.0)
    fraud_prediction = models.IntegerField(null=True, blank=True, default=None)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    file_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.taxpayer_name} ({self.tin})"

    class Meta:
        indexes = [
            models.Index(fields=['tin']),
            models.Index(fields=['tax_period_year']),
            models.Index(fields=['fraud_prediction']),
        ]
    
    fraud_prediction = models.IntegerField(null=True, blank=True, default=None)

