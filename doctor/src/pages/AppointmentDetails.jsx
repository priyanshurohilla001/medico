import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Loader2 } from "lucide-react"

export default function AppointmentDetails() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/appointment/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        setAppointment(response.data.data)
      } catch (error) {
        console.error('Error fetching appointment details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentDetails()
  }, [appointmentId])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
      </div>
    </div>
  )
}
