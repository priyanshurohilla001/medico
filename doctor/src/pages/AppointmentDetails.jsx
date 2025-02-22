import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { ChevronLeft, FileText, ShieldAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { toast } from "sonner"

const RecordsAccessRequest = ({ patientId, onRequest, requestStatus }) => {
  const [requesting, setRequesting] = useState(false)

  const handleRequest = async () => {
    try {
      setRequesting(true)
      await onRequest(patientId)
      toast.success("Access request has been sent to the patient")
    } catch (error) {
      toast.error("Could not send access request. Please try again.")
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <ShieldAlert className="h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold">Access Required</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {requestStatus === 'pending' 
          ? "Your access request is pending patient approval"
          : "You need permission to view this patient's medical records"}
      </p>
      <Button 
        onClick={handleRequest} 
        disabled={requesting || requestStatus === 'pending'}
      >
        {requesting ? "Sending Request..." : 
         requestStatus === 'pending' ? "Request Pending" : 
         "Request Access"}
      </Button>
    </div>
  )
}

const PatientRecords = ({ patientId, hasAccess, onRequest, requestStatus }) => {
  const [records, setRecords] = useState({ appointments: [], labRecords: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      if (!hasAccess) return
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/doctor/patient-records/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        setRecords(response.data.data)
      } catch (error) {
        console.error('Error fetching records:', error)
      } finally {
        setLoading(false)
      }
    }

    if (hasAccess) {
      fetchRecords()
    } else {
      setLoading(false)
    }
  }, [patientId, hasAccess])

  if (!hasAccess) {
    return (
      <RecordsAccessRequest 
        patientId={patientId} 
        onRequest={onRequest}
        requestStatus={requestStatus}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Sort all records by date
  const allRecords = [
    ...records.appointments.map(r => ({ ...r, date: new Date(r.date) })),
    ...records.labRecords.map(r => ({ ...r, date: new Date(r.date) }))
  ].sort((a, b) => b.date - a.date)

  return (
    <div className="space-y-4">
      {allRecords.map((record, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-base">
              {record.type === 'appointment' ? (
                <>Visit on {record.date.toLocaleDateString()}</>
              ) : (
                <>Lab Tests - {record.status}</>
              )}
            </CardTitle>
            {record.type === 'appointment' && (
              <CardDescription>Dr. {record.doctorName}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {record.type === 'appointment' ? (
                <>
                  <p className="text-sm">{record.diagnosis}</p>
                  {record.prescriptions && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {record.prescriptions.length} Prescriptions
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  {record.tests.map((test, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{test.testName}</p>
                      {test.result && (
                        <p className="text-muted-foreground">
                          Result: {test.result}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {allRecords.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No records found
        </div>
      )}
    </div>
  )
}

export default function AppointmentDetails() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [requestStatus, setRequestStatus] = useState(null)

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/appointment/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        setAppointment(response.data.data)

        // Only check access if we have patient data
        if (response.data.data?.patientId?._id) {
          try {
            const accessRes = await axios.get(
              `${import.meta.env.VITE_SERVER_URL}/api/doctor/check-access/${response.data.data.patientId._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              }
            )
            setHasAccess(accessRes.data.hasAccess)
            setRequestStatus(accessRes.data.requestStatus) // 'pending', 'none', or 'granted'
          } catch (error) {
            console.error('Error checking access:', error)
            setHasAccess(false)
            setRequestStatus('none')
          }
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentDetails()
  }, [appointmentId])

  const handleAccessRequest = async (patientId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/doctor/request-access`,
        { patientId: patientId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      if (response.data.success) {
        setRequestStatus('pending')
        toast.success("Access request sent successfully")
        return true
      } else {
        throw new Error(response.data.message || "Failed to send request")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send access request"
      toast.error(errorMessage)
      console.error('Failed to send access request:', error)
      throw error
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!appointment) {
    return <div>Appointment not found</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(-1)}>
                Appointments
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                Appointment Details
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Appointment Details
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Appointment Details</TabsTrigger>
            <TabsTrigger value="records">Patient Records</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                    <p className="text-lg">{appointment.patientId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Appointment Date</p>
                    <p className="text-lg">{formatDate(appointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Appointment Time</p>
                    <p className="text-lg">{appointment.appointmentTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Appointment Type</p>
                    <p className="text-lg">{appointment.appointmentType || 'Regular'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-lg capitalize">{appointment.status}</p>
                  </div>
                  {appointment.price && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Price</p>
                      <p className="text-lg">₹{appointment.price}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            {appointment?.patientId && (
              <PatientRecords 
                patientId={appointment.patientId._id} 
                hasAccess={hasAccess}
                onRequest={handleAccessRequest}
                requestStatus={requestStatus}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
