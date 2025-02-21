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

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/patient/appointments`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        setAppointments(response.data.data)
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment._id}>
              <TableCell>Dr. {appointment.doctorId?.name || 'N/A'}</TableCell>
              <TableCell>
                {new Date(appointment.appointmentDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{appointment.appointmentTime}</TableCell>
              <TableCell>{appointment.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
