import { useState } from 'react'
import axios from 'axios'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserCheck2, UserX2, Loader2 } from "lucide-react"

export default function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/access-requests`,  // This matches our backend route now
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setRequests(response.data.requests);
    } catch (error) {
      toast.error("Failed to fetch access requests");
      console.error(error); // Add this for debugging
    } finally {
      setLoading(false);
    }
  };

  const handleAccessUpdate = async (doctorId, approved) => {
    try {
      await axios.put(  // Changed from post to put to match backend
        `${import.meta.env.VITE_SERVER_URL}/api/patient/update-access`,
        { doctorId, approved },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!approved) {
        setRequests(requests.filter(req => req.doctorId._id !== doctorId));
      } else {
        setRequests(requests.map(req => 
          req.doctorId._id === doctorId 
            ? { ...req, approvalStatus: true }
            : req
        ));
      }

      toast.success(`Access ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error("Failed to update access");
      console.error(error); // Add this for debugging
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchRequests();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">View Access Requests</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Doctor Access Requests</DialogTitle>
          <DialogDescription>
            Manage doctors who have requested access to your lab records
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending access requests
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.doctorId._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">Dr. {request.doctorId.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {request.doctorId.email}
                    </p>
                    {request.doctorId.specialties && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {request.doctorId.specialties.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  {!request.approvalStatus ? (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAccessUpdate(request.doctorId._id, false)}
                      >
                        <UserX2 className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAccessUpdate(request.doctorId._id, true)}
                      >
                        <UserCheck2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">
                      Approved
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
