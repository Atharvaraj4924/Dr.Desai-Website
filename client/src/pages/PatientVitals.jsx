import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useSnackbar } from 'notistack'
import api from '../services/api'
import { format } from 'date-fns'

const PatientVitals = () => {
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: ''
  })

  // Fetch vitals history
  const { data: vitalsHistory, isLoading } = useQuery(
    ['vitals-history', user?.id],
    () => api.get(`/medical-records/vitals/${user?.id}`).then(res => res.data),
    { enabled: !!user?.id }
  )

  // Update vitals mutation
  const updateVitalsMutation = useMutation(
    (data) => api.put(`/medical-records/vitals/${user?.id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vitals-history'])
        enqueueSnackbar('Vitals updated successfully!', { variant: 'success' })
        setFormData({
          weight: '',
          height: '',
          heartRate: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          temperature: ''
        })
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.message || 'Failed to update vitals', { variant: 'error' })
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
    
    const vitalsData = {}
    if (formData.weight) vitalsData.weight = parseFloat(formData.weight)
    if (formData.height) vitalsData.height = parseFloat(formData.height)
    if (formData.heartRate) vitalsData.heartRate = parseInt(formData.heartRate)
    if (formData.bloodPressureSystolic && formData.bloodPressureDiastolic) {
      vitalsData.bloodPressure = {
        systolic: parseInt(formData.bloodPressureSystolic),
        diastolic: parseInt(formData.bloodPressureDiastolic)
      }
    }
    if (formData.temperature) vitalsData.temperature = parseFloat(formData.temperature)

    updateVitalsMutation.mutate(vitalsData)
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
        My Vitals
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track and update your health vitals
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Vitals
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="weight"
                      label="Weight (kg)"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="height"
                      label="Height (cm)"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="heartRate"
                      label="Heart Rate (bpm)"
                      type="number"
                      value={formData.heartRate}
                      onChange={handleChange}
                      inputProps={{ min: 30, max: 200 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="temperature"
                      label="Temperature (°C)"
                      type="number"
                      value={formData.temperature}
                      onChange={handleChange}
                      inputProps={{ step: 0.1, min: 35, max: 42 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="bloodPressureSystolic"
                      label="Blood Pressure - Systolic"
                      type="number"
                      value={formData.bloodPressureSystolic}
                      onChange={handleChange}
                      inputProps={{ min: 70, max: 200 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="bloodPressureDiastolic"
                      label="Blood Pressure - Diastolic"
                      type="number"
                      value={formData.bloodPressureDiastolic}
                      onChange={handleChange}
                      inputProps={{ min: 40, max: 130 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={updateVitalsMutation.isLoading}
                    >
                      {updateVitalsMutation.isLoading ? <CircularProgress size={20} /> : 'Update Vitals'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vitals History
              </Typography>
              {vitalsHistory && vitalsHistory.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Weight</TableCell>
                        <TableCell>Height</TableCell>
                        <TableCell>Heart Rate</TableCell>
                        <TableCell>BP</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vitalsHistory.slice(0, 10).map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {format(new Date(record.createdAt), 'MMM dd')}
                          </TableCell>
                          <TableCell>
                            {record.vitals?.weight?.value ? `${record.vitals.weight.value} kg` : '-'}
                          </TableCell>
                          <TableCell>
                            {record.vitals?.height?.value ? `${record.vitals.height.value} cm` : '-'}
                          </TableCell>
                          <TableCell>
                            {record.vitals?.heartRate?.value ? `${record.vitals.heartRate.value} bpm` : '-'}
                          </TableCell>
                          <TableCell>
                            {record.vitals?.bloodPressure?.systolic ? 
                              `${record.vitals.bloodPressure.systolic}/${record.vitals.bloodPressure.diastolic}` : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No vitals history found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PatientVitals 