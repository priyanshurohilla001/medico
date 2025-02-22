import { useState, useEffect } from "react"
import axios from "axios"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/patient/my-appointments`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success) {
          setAppointments(response.data.appointments)
        } else {
          throw new Error(response.data.message || "Failed to fetch appointments")
        }
      } catch (err) {
        setError(err.message)
        toast.error(err.message || "Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/my-appointments/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (response.data.success) {
        setSelectedAppointment(response.data.appointment)
        setIsDetailsOpen(true)
      }
    } catch (error) {
      toast.error("Failed to fetch appointment details")
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    }
    return <Badge className={`${statusStyles[status]} px-3 py-1`}>{status}</Badge>
  }

  const getAppointmentFee = (appointment) => {
    if (!appointment.doctorId?.consultationFees || !appointment.appointmentType) {
      return 'N/A';
    }
    return `₹${appointment.doctorId.consultationFees[appointment.appointmentType]}`;
  };

  if (loading) return <div className="flex justify-center p-8">Loading appointments...</div>
  if (error) return <div className="flex justify-center p-8 text-red-500">{error}</div>

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Appointments</h2>
          <Badge variant="outline" className="text-sm">
            Total: {appointments.length}
          </Badge>
        </div>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments found</p>
            <Button variant="outline" className="mt-4">Book New Appointment</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    Dr. {appointment.doctorId?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {appointment.doctorId?.specialties?.map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="mr-1 mb-1"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                      <span className="text-sm text-gray-500">{appointment.appointmentTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>{getAppointmentFee(appointment)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAppointmentDetails(appointment._id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Doctor Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Doctor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Name:</span> Dr. {selectedAppointment.doctorId.name}</p>
                    <p><span className="font-medium">Specialties:</span></p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAppointment.doctorId.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <p><span className="font-medium">Qualification:</span> {selectedAppointment.doctorId.qualification}</p>
                    <p><span className="font-medium">Experience:</span> {selectedAppointment.doctorId.experience} years</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Email:</span> {selectedAppointment.doctorId.email}</p>
                    <p><span className="font-medium">Consultation Fees:</span></p>
                    <div className="ml-4">
                      <p>Physical: ₹{selectedAppointment.doctorId.consultationFees.physical}</p>
                      <p>Online: ₹{selectedAppointment.doctorId.consultationFees.online}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Appointment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Date:</span> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Time:</span> {selectedAppointment.appointmentTime}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedAppointment.status)}</p>
                    <p><span className="font-medium">Type:</span> {selectedAppointment.appointmentType}</p>
                    <p><span className="font-medium">Fee:</span> {getAppointmentFee(selectedAppointment)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Symptoms:</span> {selectedAppointment.symptoms || 'Not specified'}</p>
                    <p><span className="font-medium">Reason:</span> {selectedAppointment.reason}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Notes */}
              {selectedAppointment.consultationNotes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Consultation Notes</h3>
                  <div className="space-y-3">
                    {selectedAppointment.consultationNotes.diagnosis && (
                      <p><span className="font-medium">Diagnosis:</span> {selectedAppointment.consultationNotes.diagnosis}</p>
                    )}
                    {selectedAppointment.consultationNotes.prescription && (
                      <div>
                        <span className="font-medium">Prescription:</span>
                        <pre className="mt-1 whitespace-pre-wrap text-sm bg-white p-2 rounded">
                          {selectedAppointment.consultationNotes.prescription}
                        </pre>
                      </div>
                    )}
                    {selectedAppointment.consultationNotes.instructions && (
                      <p><span className="font-medium">Instructions:</span> {selectedAppointment.consultationNotes.instructions}</p>
                    )}
                    {selectedAppointment.consultationNotes.followUpDate && (
                      <p><span className="font-medium">Follow-up Date:</span> {new Date(selectedAppointment.consultationNotes.followUpDate).toLocaleDateString()}</p>
                    )}
                    {selectedAppointment.consultationNotes.notes && (
                      <p><span className="font-medium">Additional Notes:</span> {selectedAppointment.consultationNotes.notes}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Added on: {new Date(selectedAppointment.consultationNotes.addedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
