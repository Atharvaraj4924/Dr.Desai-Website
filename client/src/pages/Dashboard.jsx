import React from 'react'
import { useQuery } from 'react-query'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  Event,
  Person,
  LocalHospital,
  TrendingUp,
  Schedule,
  CheckCircle,
  Cancel,
  Pending
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()

  // Fetch appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery(
    ['appointments'],
    () => api.get('/appointments').then(res => res.data),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  )

  // Fetch medical records for doctors
  const { data: medicalRecordsData, isLoading: recordsLoading } = useQuery(
    ['medical-records'],
    () => api.get('/medical-records').then(res => res.data),
    { 
      enabled: user?.role === 'doctor',
      refetchInterval: 60000 // Refetch every minute
    }
  )

  const appointments = appointmentsData?.appointments || []
  const medicalRecords = medicalRecordsData?.medicalRecords || []

  // Calculate statistics
  const totalAppointments = appointments.length
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length
  const acceptedAppointments = appointments.filter(apt => apt.status === 'accepted').length
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'accepted' || apt.status === 'pending')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

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
      case 'pending': return <Pending />
      case 'accepted': return <Schedule />
      case 'completed': return <CheckCircle />
      case 'cancelled': return <Cancel />
      default: return <Event />
    }
  }

  if (appointmentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {user?.role === 'doctor' ? 'Manage your patients and appointments' : 'Track your health and appointments'}
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Event />
                </Avatar>
                <Box>
                  <Typography variant="h6">{totalAppointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Pending />
                </Avatar>
                <Box>
                  <Typography variant="h6">{pendingAppointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">{completedAppointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <LocalHospital />
                </Avatar>
                <Box>
                  <Typography variant="h6">{medicalRecords.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role === 'doctor' ? 'Medical Records' : 'Health Records'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Appointments */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
              {upcomingAppointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No upcoming appointments
                </Typography>
              ) : (
                <List>
                  {upcomingAppointments.map((appointment, index) => (
                    <React.Fragment key={appointment._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {getStatusIcon(appointment.status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1">
                                {user?.role === 'doctor' 
                                  ? appointment.patient?.name 
                                  : appointment.doctor?.name
                                }
                              </Typography>
                              <Chip
                                label={appointment.status}
                                color={getStatusColor(appointment.status)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {appointment.reason}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < upcomingAppointments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                {user?.role === 'patient' && (
                  <ListItem button>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Event />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Book Appointment"
                      secondary="Schedule a new appointment"
                    />
                  </ListItem>
                )}
                <ListItem button>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="View Profile"
                    secondary="Update your information"
                  />
                </ListItem>
                <ListItem button>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <LocalHospital />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Medical Records"
                    secondary="View health information"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard 