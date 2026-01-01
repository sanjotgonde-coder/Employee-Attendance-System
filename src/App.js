import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, TextField, Box,
  Card, CardContent, Chip, Stack, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton,
  FormControl, InputLabel, Select, MenuItem, Snackbar
} from '@mui/material';
import {
  Add, Refresh, Edit, Close, CheckCircle
} from '@mui/icons-material';

const API_BASE = 'http://127.0.0.1:8000/api';

function App() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test backend first
      await axios.get(`${API_BASE}/employees/`);
      setBackendStatus('connected');
      
      // Fetch real data
      const [empRes, deptRes] = await Promise.all([
        axios.get(`${API_BASE}/employees/`),
        axios.get(`${API_BASE}/departments/`)
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Backend error:', error);
      setBackendStatus('disconnected');
      setError('Backend not running on port 8000. Run: python manage.py runserver');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/employees/`, formData);
      setShowForm(false);
      setFormData({});
      fetchData();
      showSnackbar('✅ Employee created successfully!');
    } catch (error) {
      console.error('Create error:', error);
      showSnackbar('❌ Error: ' + (error.response?.data?.detail || 'Check form data'), 'error');
    }
  };

  const handleEditOpen = (employee) => {
    setEditEmployee({ ...employee });
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditEmployee({
      ...editEmployee,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateEmployee = async () => {
    try {
      await axios.put(`${API_BASE}/employees/${editEmployee.id}/`, editEmployee);
      fetchData();
      setEditModal(false);
      showSnackbar('✅ Employee updated successfully!');
    } catch (error) {
      showSnackbar('❌ Update failed: ' + (error.response?.data?.detail || 'Try again'), 'error');
    }
  };

  const testBiometric = async () => {
    const testEmployee = employees.find(emp => emp.biometric_user_id === '12345');
    if (!testEmployee) {
      showSnackbar('❌ Create employee with biometric_user_id: "12345" first', 'warning');
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/biometric/sync/`, {
        user_id: "12345",
        timestamp: new Date().toISOString(),
        punch_type: "IN",
        device_id: "TEST-DEVICE"
      });
      showSnackbar('✅ Biometric sync SUCCESS!');
      fetchData();
    } catch (error) {
      showSnackbar('❌ Biometric failed: ' + (error.response?.data?.detail || error.response?.status), 'error');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Connecting to Django backend...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ mb: 3 }}>
          👥 Employee Attendance System
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mb={3}>
          <Chip 
            label={backendStatus === 'connected' ? '✅ LIVE' : '❌ OFFLINE'} 
            color={backendStatus === 'connected' ? 'success' : 'error'}
            size="medium"
          />
          <Typography variant="h6">
            Employees: {employees.length}
          </Typography>
        </Stack>
        
        {backendStatus === 'disconnected' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading || backendStatus === 'disconnected'}
            size="large"
          >
            Refresh Data
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Add />}
            onClick={() => setShowForm(!showForm)}
            disabled={backendStatus === 'disconnected'}
            size="large"
          >
            {showForm ? 'Cancel' : 'Add Employee'}
          </Button>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<CheckCircle />}
            onClick={testBiometric}
            disabled={backendStatus === 'disconnected'}
            size="large"
          >
            Test Biometric
          </Button>
        </Stack>
      </Paper>

      {/* Departments + Form */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              🏢 Departments ({departments.length})
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {departments.map(dept => (
                <Chip 
                  key={dept.id} 
                  label={`${dept.name} (${dept.code})`} 
                  color="primary"
                  variant="outlined"
                  size="medium"
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {showForm && backendStatus === 'connected' && (
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                ➕ Add New Employee
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  name="employee_code"
                  label="Employee Code *"
                  required
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="first_name"
                  label="First Name *"
                  required
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="last_name"
                  label="Last Name"
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="email"
                  label="Email *"
                  type="email"
                  required
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="biometric_user_id"
                  label="Biometric ID"
                  helperText='Use "12345" for testing'
                  onChange={handleInputChange}
                  fullWidth
                />
                <FormControl fullWidth required>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    name="department"
                    value={formData.department || ''}
                    label="Department *"
                    onChange={handleInputChange}
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  name="date_of_joining"
                  label="Joining Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleInputChange}
                  fullWidth
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Create Employee
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h5" gutterBottom>
              👥 Employees ({employees.length})
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 80 }}>Code</TableCell>
                  <TableCell sx={{ width: 220 }}>Name</TableCell>
                  <TableCell sx={{ width: 250 }}>Email</TableCell>
                  <TableCell sx={{ width: 160 }}>Department</TableCell>
                  <TableCell sx={{ width: 130 }}>Biometric</TableCell>
                  <TableCell sx={{ width: 100 }}>Status</TableCell>
                  <TableCell sx={{ width: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary" variant="h6">
                        No employees yet. Create one above!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id} hover>
                      <TableCell>{emp.employee_code}</TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" noWrap title={emp.full_name}>
                          {emp.full_name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography variant="body2" noWrap title={emp.email}>
                          {emp.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{emp.department?.code || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={emp.biometric_user_id || 'Not Set'} 
                          color={emp.biometric_user_id ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={emp.status?.toUpperCase() || 'N/A'} 
                          color={emp.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => handleEditOpen(emp)}
                          disabled={backendStatus === 'disconnected'}
                          title="Edit Employee"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ✅ FIXED DIALOG - No nested headings */}
      <Dialog 
        open={editModal} 
        onClose={() => setEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Typography variant="h6" component="div"> {/* ✅ Changed to h6 */}
            Edit Employee
          </Typography>
          <IconButton onClick={() => setEditModal(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 0 }}>
          <Stack spacing={2.5}>
            <TextField
              name="full_name"
              label="Full Name"
              value={editEmployee.full_name || ''}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={editEmployee.email || ''}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              name="biometric_user_id"
              label="Biometric ID"
              value={editEmployee.biometric_user_id || ''}
              onChange={handleEditChange}
              fullWidth
              helperText="Change for scanner testing"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setEditModal(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateEmployee}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={backendStatus === 'disconnected'}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
