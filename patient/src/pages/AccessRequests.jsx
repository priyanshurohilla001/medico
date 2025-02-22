import { useState, useEffect } from "react"
import axios from "axios"
import { Shield, ShieldCheck, ShieldX, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AccessRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/doctor-requests`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setRequests(response.data.requests)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccessUpdate = async (doctorId, approved) => {
    try {
      setUpdating(true)
      await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/doctor-access`,
        {
          doctorId,
          approved
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      toast({
        title: approved ? "Access Granted" : "Access Revoked",
        description: approved 
          ? "The doctor now has access to your medical records"
          : "The doctor's access has been revoked",
        variant: approved ? "default" : "destructive",
      })
      fetchRequests()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update access. Please try again.",
        variant: "destructive",
      })
      console.error('Error updating access:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (request) => {
    if (request.approvalStatus) {
      return (
        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <ShieldCheck className="mr-2 h-4 w-4" />
          <span>Access Granted</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
        <Clock className="mr-2 h-4 w-4" />
        <span>Pending Approval</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">
          Doctor Access Requests
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => (
          <Card key={request.doctorId._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.doctorId.name}</CardTitle>
                  <CardDescription>{request.doctorId.email}</CardDescription>
                </div>
                {getStatusBadge(request)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Specialties</p>
                  <p>{request.doctorId.specialties.join(", ")}</p>
                </div>
                <div className="flex gap-2">
                  {!request.approvalStatus ? (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => handleAccessUpdate(request.doctorId._id, true)}
                        disabled={updating}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {updating ? "Processing..." : "Grant Access"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleAccessUpdate(request.doctorId._id, false)}
                        disabled={updating}
                      >
                        <ShieldX className="mr-2 h-4 w-4" />
                        {updating ? "Processing..." : "Deny Access"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleAccessUpdate(request.doctorId._id, false)}
                        disabled={updating}
                      >
                        <ShieldX className="mr-2 h-4 w-4" />
                        {updating ? "Processing..." : "Revoke Access"}
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        This doctor currently has access to view your medical records
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <p>No access requests from doctors</p>
            <p className="text-sm mt-2">When doctors request access to your medical records, they will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
