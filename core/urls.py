from django.urls import path
from .views import (
    EmployeeViewSet, DepartmentViewSet, BiometricSyncView, ShiftViewSet,
    ShiftAssignmentViewSet, HolidayCalendarViewSet, AttendanceLogViewSet,
    DailyAttendanceViewSet, SalaryComponentViewSet, MonthlySalaryViewSet
)

urlpatterns = [
    # ✅ Departments
    path('departments/', DepartmentViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('departments/<int:pk>/', DepartmentViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    })),

    # ✅ Employees (EDIT WORKS!)
    path('employees/', EmployeeViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('employees/<int:pk>/', EmployeeViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    })),

    # ✅ Shifts
    path('shifts/', ShiftViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('shifts/<int:pk>/', ShiftViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    })),

    # ✅ Biometric Scanner
    path('biometric/sync/', BiometricSyncView.as_view()),

    # ✅ Other modules (add as needed)
    path('shift-assignments/', ShiftAssignmentViewSet.as_view({'get': 'list'})),
    path('attendance-logs/', AttendanceLogViewSet.as_view({'get': 'list'})),
    path('holidays/', HolidayCalendarViewSet.as_view({'get': 'list'})),
]
