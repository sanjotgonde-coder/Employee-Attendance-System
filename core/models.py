from django.db import models
from django.contrib.auth.models import User

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    manager = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_departments')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Employee(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('on_leave', 'On Leave')]
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    employee_code = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='employees')
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    date_of_joining = models.DateField()
    biometric_user_id = models.CharField(max_length=50, blank=True, null=True)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    default_shift = models.ForeignKey('Shift', on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_code})"
    
    def get_full_name(self):  # ✅ FIXED for admin/serializer
        return f"{self.first_name} {self.last_name}"

class Shift(models.Model):
    SHIFT_TYPES = [('day', 'Day Shift'), ('night', 'Night Shift'), ('rotation_a', 'Rotation A'), 
                   ('rotation_b', 'Rotation B'), ('general', 'General')]
    name = models.CharField(max_length=50)
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPES, default='general')
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_night_shift = models.BooleanField(default=False)
    grace_in_minutes = models.PositiveIntegerField(default=15)
    grace_out_minutes = models.PositiveIntegerField(default=15)
    max_work_hours = models.DecimalField(max_digits=4, decimal_places=2, default=8.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_shift_type_display()})"

class ShiftAssignment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shift_assignments')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='assignments')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['employee', 'start_date']
    
    def __str__(self):
        return f"{self.employee.employee_code} - {self.shift.name}"

class HolidayCalendar(models.Model):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=200)
    is_optional = models.BooleanField(default=False)
    location = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.date}"

class AttendanceLog(models.Model):
    PUNCH_TYPE = [('IN', 'Check In'), ('OUT', 'Check Out')]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_logs')
    biometric_user_id = models.CharField(max_length=50)
    punch_time = models.DateTimeField()
    punch_type = models.CharField(max_length=10, choices=PUNCH_TYPE)
    device_id = models.CharField(max_length=50)
    raw_payload = models.JSONField(null=True, blank=True)
    source = models.CharField(max_length=20, default='biometric', choices=[
        ('biometric', 'Biometric Device'), ('manual', 'Manual Entry'), ('api', 'API Sync')])
    verified = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['employee', 'punch_time', 'punch_type']
    
    def __str__(self):
        return f"{self.employee.employee_code} - {self.punch_type}"

class DailyAttendance(models.Model):
    STATUS_CHOICES = [('present', 'Present'), ('absent', 'Absent'), ('late', 'Late'), 
                     ('half_day', 'Half Day'), ('weekoff', 'Weekly Off'), ('holiday', 'Holiday'), ('leave', 'On Leave')]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='daily_attendance')
    date = models.DateField()
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True, related_name='daily_attendances')
    in_time = models.TimeField(null=True, blank=True)
    out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent')
    work_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_regularized = models.BooleanField(default=False)
    regularization_notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['employee', 'date']
    
    def __str__(self):
        return f"{self.employee.employee_code} - {self.date}"

class SalaryComponent(models.Model):
    COMPONENT_TYPE = [('earnings', 'Earnings'), ('deductions', 'Deductions')]
    name = models.CharField(max_length=100)
    component_type = models.CharField(max_length=20, choices=COMPONENT_TYPE)
    is_fixed = models.BooleanField(default=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    percentage_of = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name}"

class MonthlySalary(models.Model):
    PAY_STATUS = [('draft', 'Draft'), ('generated', 'Generated'), ('approved', 'Approved'), ('paid', 'Paid')]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_slips')
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    total_present_days = models.IntegerField(default=0)
    total_work_days = models.IntegerField(default=0)
    paid_leaves = models.IntegerField(default=0)
    unpaid_leaves = models.IntegerField(default=0)
    late_days = models.IntegerField(default=0)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_payable = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=PAY_STATUS, default='draft')
    generated_on = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_salaries')
    
    class Meta:
        unique_together = ['employee', 'month', 'year']
    
    def __str__(self):
        return f"{self.employee.employee_code} - {self.month}/{self.year}"
