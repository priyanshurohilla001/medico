import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState, useEffect } from "react"
import axios from "axios"

const ITEMS_PER_PAGE = 5

export default function Appointments() {
  const [currentPage, setCurrentPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointments, setAppointments] = useState({ confirmed: [], available: [] })
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    confirmed: { total: 0, pages: 0 },
    available: { total: 0, pages: 0 }
  })
  const token = localStorage.getItem("token")

  const fetchAppointments = async (type) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/appointment/${type}`,  // Updated URL
        {
          params: { page: currentPage, limit: ITEMS_PER_PAGE },
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setAppointments(prev => ({
        ...prev,
        [type]: response.data.data
      }))
      setPagination(prev => ({
        ...prev,
        [type]: response.data.pagination
      }))
    } catch (error) {
      console.error(`Error fetching ${type} appointments:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments('confirmed')
    fetchAppointments('available')
  }, [currentPage, token])

  const handleCancel = async (appointment) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/appointment/${appointment._id}/cancel`,  // Updated URL
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchAppointments('confirmed')
      setOpenDialog(false)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  const handleDeleteSlot = async (appointment) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/appointment/${appointment._id}`,  // Updated URL
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchAppointments('available')
      setOpenDialog(false)
    } catch (error) {
      console.error('Error deleting slot:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const AppointmentTable = ({ appointments, type }) => {
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }

    if (!appointments.length) {
      return (
        <div className="text-center py-4 text-gray-500">
          No {type} appointments found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{type === 'confirmed' ? 'Patient Name' : 'Slot'}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>
                    {type === 'confirmed' 
                      ? appointment.patientId?.name || 'N/A'
                      : 'Available'
                    }
                  </TableCell>
                  <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                  <TableCell>{appointment.appointmentTime}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {appointment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {type === 'confirmed' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setOpenDialog(true);
                        }}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setOpenDialog(true);
                        }}
                      >
                        Delete Slot
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination[type] && pagination[type].pages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {[...Array(pagination[type].pages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => 
                    Math.min(pagination[type].pages, p + 1)
                  )}
                  disabled={currentPage === pagination[type].pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="confirmed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="confirmed">Confirmed Appointments</TabsTrigger>
            <TabsTrigger value="available">Available Slots</TabsTrigger>
          </TabsList>
          
          <TabsContent value="confirmed" className="space-y-4">
            <AppointmentTable 
              appointments={appointments.confirmed} 
              type="confirmed"
            />
          </TabsContent>
          
          <TabsContent value="available" className="space-y-4">
            <AppointmentTable 
              appointments={appointments.available}
              type="available"
            />
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              No, Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancel(selectedAppointment)}
            >
              Yes, Cancel it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
