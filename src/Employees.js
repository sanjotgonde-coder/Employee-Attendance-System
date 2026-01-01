import React, { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Modal, Box, TextField, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import axios from 'axios';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState({});

  const fetchEmployees = async () => {
    const res = await axios.get('http://127.0.0.1:8000/api/employees/');
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEditOpen = (id) => {
    const emp = employees.find(e => e.id === id);
    setEditEmployee(emp);
    setEditModal(true);
  };

  const handleUpdate = async () => {
    await axios.put(`http://127.0.0.1:8000/api/employees/${editEmployee.id}/`, editEmployee);
    fetchEmployees();
    setEditModal(false);
  };

  return (
    <div>
      <h2>Employees ({employees.length})</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Biometric ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map(emp => (
            <TableRow key={emp.id}>
              <TableCell>{emp.employee_code}</TableCell>
              <TableCell>{emp.name}</TableCell>
              <TableCell>{emp.email}</TableCell>
              <TableCell>{emp.department?.name || 'NA'}</TableCell>
              <TableCell>{emp.biometric_user_id || 'NA'}</TableCell>
              <TableCell>{emp.is_active ? 'ACTIVE' : 'INACTIVE'}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => handleEditOpen(emp.id)}>
                  <Edit /> Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* EDIT MODAL */}
      <Modal open={editModal} onClose={() => setEditModal(false)}>
        <Box sx={{p: 3, maxWidth: 400, margin: '10% auto'}}>
          <Typography variant="h6">Edit Employee</Typography>
          <TextField fullWidth margin="normal" label="Name" value={editEmployee.name || ''} 
            onChange={e => setEditEmployee({...editEmployee, name: e.target.value})} />
          <TextField fullWidth margin="normal" label="Email" value={editEmployee.email || ''} 
            onChange={e => setEditEmployee({...editEmployee, email: e.target.value})} />
          <TextField fullWidth margin="normal" label="Biometric ID" value={editEmployee.biometric_user_id || ''} 
            onChange={e => setEditEmployee({...editEmployee, biometric_user_id: e.target.value})} />
          <Box mt={2}>
            <Button variant="contained" onClick={handleUpdate}>Save</Button>
            <Button onClick={() => setEditModal(false)}>Cancel</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
