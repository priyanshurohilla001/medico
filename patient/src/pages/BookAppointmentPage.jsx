import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import axios from "axios"
import { toast } from "sonner"

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const token = localStorage.getItem("token")

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/doctors`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setDoctors(response.data)
    } catch (error) {
      toast.error("Failed to fetch doctors")
    }
  }

  const fetchAvailableSlots = async (doctorId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/appointments/${doctorId}/available`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setAppointments(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch available slots")
    }
  }

  const bookAppointment = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/appointments/book/${selectedSlot._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      toast.success("Appointment booked successfully!")
      setOpenDialog(false)
      fetchAvailableSlots(selectedDoctor._id)
    } catch (error) {
      toast.error("Failed to book appointment")
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Card
              key={doctor._id}
              className={`p-4 cursor-pointer ${
                selectedDoctor?._id === doctor._id ? "border-primary" : ""
              }`}
              onClick={() => {
                setSelectedDoctor(doctor)
                fetchAvailableSlots(doctor._id)
              }}
            >
              <h3 className="font-medium">Dr. {doctor.name}</h3>
              <p className="text-sm text-gray-500">{doctor.specialties.join(", ")}</p>
            </Card>
          ))}
        </div>
      </Card>

      {selectedDoctor && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((slot) => (
                <TableRow key={slot._id}>
                  <TableCell>{new Date(slot.appointmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{slot.appointmentTime}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setSelectedSlot(slot)
                        setOpenDialog(true)
                      }}
                    >
                      Book
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to book this appointment?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={bookAppointment}>
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
