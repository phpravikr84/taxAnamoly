# Generated by Django 5.1.3 on 2024-12-18 06:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('predictions', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prediction',
            name='fraud_prediction',
            field=models.BooleanField(blank=True, default=False),
        ),
        migrations.AlterField(
            model_name='prediction',
            name='fraud_probability',
            field=models.FloatField(blank=True, default=0.0, null=True),
        ),
        migrations.AlterField(
            model_name='prediction',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='prediction',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='prediction',
            name='taxpayer_name',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Taxpayer Name'),
        ),
        migrations.AddIndex(
            model_name='prediction',
            index=models.Index(fields=['tin'], name='predictions_tin_98d7a0_idx'),
        ),
        migrations.AddIndex(
            model_name='prediction',
            index=models.Index(fields=['tax_period_year'], name='predictions_tax_per_d9c2c3_idx'),
        ),
        migrations.AddIndex(
            model_name='prediction',
            index=models.Index(fields=['fraud_prediction'], name='predictions_fraud_p_a131e8_idx'),
        ),
    ]