import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Schedule,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useSnackbar } from 'notistack'
import api from '../services/api'
import { format } from 'date-fns'

const Appointments = () => {
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [statusDialog, setStatusDialog] = useState(false)
  const [statusData, setStatusData] = useState({
    status: '',
    notes: '',
    prescription: '',
    followUpDate: ''
  })

  // Fetch appointments
  const { data: appointmentsData, isLoading } = useQuery(
    ['appointments'],
    () => api.get('/appointments').then(res => res.data),
    { refetchInterval: 30000 }
  )

  const appointments = appointmentsData?.appointments || []

  // Update appointment status mutation
  const updateStatusMutation = useMutation(
    (data) => api.put(`/appointments/${data.id}/status`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments'])
        enqueueSnackbar('Appointment status updated successfully', { variant: 'success' })
        setStatusDialog(false)
        setSelectedAppointment(null)
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.message || 'Failed to update status', { variant: 'error' })
      }
    }
  )

  // Cancel appointment mutation
  const cancelMutation = useMutation(
    (id) => api.delete(`/appointments/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments'])
        enqueueSnackbar('Appointment cancelled successfully', { variant: 'success' })
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.message || 'Failed to cancel appointment', { variant: 'error' })
      }
    }
  )

  const handleStatusUpdate = (appointment) => {
    setSelectedAppointment(appointment)
    setStatusData({
      status: appointment.status,
      notes: appointment.notes || '',
      prescription: appointment.prescription || '',
      followUpDate: appointment.followUpDate ? format(new Date(appointment.followUpDate), 'yyyy-MM-dd') : ''
    })
    setStatusDialog(true)
  }

  const handleStatusSubmit = () => {
    updateStatusMutation.mutate({
      id: selectedAppointment._id,
      ...statusData
    })
  }

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelMutation.mutate(id)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'accepted': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Schedule />
      case 'accepted': return <CheckCircle />
      case 'completed': return <CheckCircle />
      case 'cancelled': return <Cancel />
      default: return <Schedule />
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Appointments
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your appointments and track their status
      </Typography>

      {appointments.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No appointments found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>{user?.role === 'doctor' ? 'Patient' : 'Doctor'}</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(appointment.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {appointment.time}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user?.role === 'doctor' 
                        ? appointment.patient?.name 
                        : appointment.doctor?.name
                      }
                    </Typography>
                    {user?.role === 'doctor' && (
                      <Typography variant="caption" color="text.secondary">
                        {appointment.patient?.age} years, {appointment.patient?.gender}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {appointment.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(appointment.status)}
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {user?.role === 'doctor' && appointment.status === 'pending' && (
                        <>
                          <Tooltip title="Accept">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleStatusUpdate({ ...appointment, status: 'accepted' })}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleStatusUpdate({ ...appointment, status: 'rejected' })}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      {appointment.status === 'accepted' && (
                        <Tooltip title="Mark Complete">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleStatusUpdate({ ...appointment, status: 'completed' })}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {appointment.status === 'pending' && (
                        <Tooltip title="Cancel">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleCancel(appointment._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusData.status}
                label="Status"
                onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={statusData.notes}
              onChange={(e) => setStatusData(prev => ({ ...prev, notes: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Prescription"
              value={statusData.prescription}
              onChange={(e) => setStatusData(prev => ({ ...prev, prescription: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="date"
              label="Follow-up Date"
              value={statusData.followUpDate}
              onChange={(e) => setStatusData(prev => ({ ...prev, followUpDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusSubmit} 
            variant="contained"
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Appointments 