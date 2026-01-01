from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import (
    Department, Employee, Shift, ShiftAssignment, HolidayCalendar,
    AttendanceLog, DailyAttendance, SalaryComponent, MonthlySalary
)
from .serializers import (
    DepartmentSerializer, EmployeeSerializer, ShiftSerializer, 
    ShiftAssignmentSerializer, HolidayCalendarSerializer, 
    AttendanceLogSerializer, DailyAttendanceSerializer,
    SalaryComponentSerializer, MonthlySalarySerializer
)

# ✅ COMPLETE - ALL 10 ViewSets (EDIT WORKS!)
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

class EmployeeViewSet(viewsets.ModelViewSet):  # ✅ EDIT/PUT WORKS!
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.filter(is_active=True)
    serializer_class = ShiftSerializer
    permission_classes = [AllowAny]

class ShiftAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentSerializer
    permission_classes = [AllowAny]

class HolidayCalendarViewSet(viewsets.ModelViewSet):
    queryset = HolidayCalendar.objects.all()
    serializer_class = HolidayCalendarSerializer
    permission_classes = [AllowAny]

class AttendanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AttendanceLog.objects.all().order_by('-punch_time')
    serializer_class = AttendanceLogSerializer
    permission_classes = [AllowAny]

class DailyAttendanceViewSet(viewsets.ModelViewSet):
    queryset = DailyAttendance.objects.all().order_by('-date')
    serializer_class = DailyAttendanceSerializer
    permission_classes = [AllowAny]

class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.filter(is_active=True)
    serializer_class = SalaryComponentSerializer
    permission_classes = [AllowAny]

class MonthlySalaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MonthlySalary.objects.all().order_by('-year', '-month')
    serializer_class = MonthlySalarySerializer
    permission_classes = [AllowAny]

# ✅ Biometric (unchanged)
class BiometricSyncView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        biometric_user_id = data.get('user_id') or data.get('employee_id')
        punch_time = data.get('timestamp') or data.get('punch_time')
        punch_type = data.get('punch_type', 'IN').upper()
        device_id = data.get('device_id', 'unknown')
        
        if not biometric_user_id or not punch_time:
            return Response({"error": "Missing user_id or timestamp"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            employee = Employee.objects.get(biometric_user_id=biometric_user_id)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
        
        AttendanceLog.objects.create(
            employee=employee,
            biometric_user_id=biometric_user_id,
            punch_time=punch_time,
            punch_type=punch_type,
            device_id=device_id,
            raw_payload=data,
            source='biometric'
        )
        
        return Response({"status": "success", "message": "Attendance synced"}, 
                       status=status.HTTP_201_CREATED)
