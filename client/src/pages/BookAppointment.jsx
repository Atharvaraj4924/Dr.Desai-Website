import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material'
import { useSnackbar } from 'notistack'
import api from '../services/api'

const BookAppointment = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    symptoms: ''
  })

  // Fetch available doctors
  const { data: doctors, isLoading: doctorsLoading } = useQuery(
    ['doctors'],
    () => api.get('/appointments/doctors').then(res => res.data)
  )

  // Book appointment mutation
  const bookMutation = useMutation(
    (data) => api.post('/appointments', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments'])
        enqueueSnackbar('Appointment booked successfully!', { variant: 'success' })
        navigate('/appointments')
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.message || 'Failed to book appointment', { variant: 'error' })
      }
    }
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    bookMutation.mutate(formData)
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Book Appointment
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Schedule an appointment with one of our qualified doctors
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Doctor</InputLabel>
                  <Select
                    name="doctorId"
                    value={formData.doctorId}
                    label="Select Doctor"
                    onChange={handleChange}
                    required
                  >
                    {doctorsLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      doctors?.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} - {doctor.specialization}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="date"
                  label="Appointment Date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Slot</InputLabel>
                  <Select
                    name="time"
                    value={formData.time}
                    label="Time Slot"
                    onChange={handleChange}
                    required
                  >
                    {timeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="reason"
                  label="Reason for Visit"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Please describe your symptoms or reason for the appointment..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="symptoms"
                  label="Symptoms (Optional)"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="List any symptoms you're experiencing..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/appointments')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={bookMutation.isLoading}
                  >
                    {bookMutation.isLoading ? <CircularProgress size={20} /> : 'Book Appointment'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default BookAppointment 