import React from 'react'
import { useQuery } from 'react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { format } from 'date-fns'

const MedicalRecords = () => {
  const { user } = useAuth()

  // Fetch medical records
  const { data: recordsData, isLoading } = useQuery(
    ['medical-records', user?.id],
    () => api.get(`/medical-records/patient/${user?.id}`).then(res => res.data),
    { enabled: !!user?.id }
  )

  const medicalRecords = recordsData?.medicalRecords || []

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
        Medical Records
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View your medical history and health information
      </Typography>

      {medicalRecords.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No medical records found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {medicalRecords.map((record) => (
            <Grid item xs={12} key={record._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {record.doctor?.name} - {record.doctor?.specialization}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  {record.diagnosis && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Diagnosis
                      </Typography>
                      <Typography variant="body2">{record.diagnosis}</Typography>
                    </Box>
                  )}

                  {record.symptoms && record.symptoms.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Symptoms
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {record.symptoms.map((symptom, index) => (
                          <Chip key={index} label={symptom} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {record.prescription && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Prescription
                      </Typography>
                      <Typography variant="body2">{record.prescription.notes}</Typography>
                      {record.prescription.medications && record.prescription.medications.length > 0 && (
                        <List dense>
                          {record.prescription.medications.map((med, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={med.name}
                                secondary={`${med.dosage} - ${med.frequency} - ${med.duration}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}

                  {record.treatment && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Treatment
                      </Typography>
                      <Typography variant="body2">{record.treatment}</Typography>
                    </Box>
                  )}

                  {record.notes && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2">{record.notes}</Typography>
                    </Box>
                  )}

                  {record.followUp && record.followUp.required && (
                    <Box>
                      <Typography variant="subtitle2" color="warning.main" gutterBottom>
                        Follow-up Required
                      </Typography>
                      <Typography variant="body2">
                        Date: {format(new Date(record.followUp.date), 'MMM dd, yyyy')}
                      </Typography>
                      {record.followUp.notes && (
                        <Typography variant="body2" color="text.secondary">
                          {record.followUp.notes}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default MedicalRecords 