from rest_framework import serializers
from .models import (
    Department, Employee, Shift, ShiftAssignment, HolidayCalendar,
    AttendanceLog, DailyAttendance, SalaryComponent, MonthlySalary
)

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['id', 'user']
    
    def get_full_name(self, obj):
        return obj.get_full_name()

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'

class ShiftAssignmentSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)
    
    class Meta:
        model = ShiftAssignment
        fields = '__all__'
        read_only_fields = ['id']

class HolidayCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = HolidayCalendar
        fields = '__all__'

class AttendanceLogSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    
    class Meta:
        model = AttendanceLog
        fields = '__all__'
        read_only_fields = ['id', 'verified']

class DailyAttendanceSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    
    class Meta:
        model = DailyAttendance
        fields = '__all__'
        read_only_fields = ['id']

class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = '__all__'

class MonthlySalarySerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    
    class Meta:
        model = MonthlySalary
        fields = '__all__'
        read_only_fields = ['id', 'generated_on']
