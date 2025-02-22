import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { ChevronLeft, FileText, ShieldAlert, Loader2, Plus, Minus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
    <div className="space-y-6">
      {allRecords.map((record, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="border-b bg-muted/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {record.type === 'appointment' ? (
                  <FileText className="h-5 w-5 text-blue-500" />
                ) : (
                  <div className="rounded-full bg-green-100 p-2">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-base">
                    {record.type === 'appointment' ? (
                      <>Consultation Visit</>
                    ) : (
                      <>Laboratory Report</>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {record.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </div>
              </div>
              {record.type === 'labRecord' && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  record.status === 'completed' ? 'bg-green-100 text-green-700' :
                  record.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {record.status}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {record.type === 'appointment' ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Doctor</h4>
                  <p className="text-sm">Dr. {record.doctorName}</p>
                </div>
                {record.diagnosis && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Diagnosis</h4>
                    <p className="text-sm">{record.diagnosis}</p>
                  </div>
                )}
                {record.prescriptions && record.prescriptions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Prescriptions</h4>
                    <div className="grid gap-3">
                      {record.prescriptions.map((prescription, i) => (
                        <div key={i} className="text-sm bg-muted/50 p-3 rounded-lg">
                          <p className="font-medium">{prescription.medicine}</p>
                          <p className="text-muted-foreground">{prescription.dosage}</p>
                          {prescription.duration && (
                            <p className="text-muted-foreground">Duration: {prescription.duration}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Request Date</h4>
                    <p className="text-sm">
                      {new Date(record.requestedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {record.completedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Completed Date</h4>
                      <p className="text-sm">
                        {new Date(record.completedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Test Results</h4>
                  <div className="grid gap-4">
                    {record.tests.map((test, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{test.testName}</CardTitle>
                              <CardDescription>
                                Performed on: {new Date(test.performedAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              {test.isCritical && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  Critical
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'completed' ? 'bg-green-100 text-green-700' :
                                record.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {record.status}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Test Result Details */}
                          <div className="grid gap-3">
                            {test.result && (
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                <span className="text-muted-foreground">Result</span>
                                <span className="font-medium">{test.result}</span>
                              </div>
                            )}
                            {test.referenceRange && (
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                <span className="text-muted-foreground">Reference Range</span>
                                <span>{test.referenceRange}</span>
                              </div>
                            )}
                            {test.remarks && (
                              <div className="text-sm">
                                <span className="text-muted-foreground block mb-1">Remarks</span>
                                <p className="mt-1 text-sm">{test.remarks}</p>
                              </div>
                            )}
                          </div>

                          {/* Additional Metadata */}
                          {(test.isCritical || test.remarks) && (
                            <div className="mt-4 p-3 rounded-lg bg-muted/50">
                              {test.isCritical && (
                                <div className="flex items-center gap-2 text-red-600 mb-2">
                                  <ShieldAlert className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    This result requires immediate attention
                                  </span>
                                </div>
                              )}
                              {test.remarks && (
                                <p className="text-sm text-muted-foreground">
                                  {test.remarks}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Lab Record Summary */}
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Tests</span>
                        <span className="font-medium">{record.tests.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Critical Results</span>
                        <span className="font-medium">
                          {record.tests.filter(t => t.isCritical).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'completed' ? 'bg-green-100 text-green-700' :
                          record.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {allRecords.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No medical records found</p>
          </div>
        </Card>
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
  const [notes, setNotes] = useState('')
  const [medicines, setMedicines] = useState([])
  const [suggestions, setSuggestions] = useState('')
  const [saving, setSaving] = useState(false)

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

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      if (appointment?.consultationDetails) {
        setNotes(appointment.consultationDetails.notes || '');
        setMedicines(appointment.consultationDetails.medicines || []);
        setSuggestions(appointment.consultationDetails.suggestions || '');
      }
    };

    fetchConsultationDetails();
  }, [appointment]);

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
            {appointment.status === 'confirmed' && (
              <Card className="mt-6">
                <CardHeader className="border-b">
                  <CardTitle>Consultation Details</CardTitle>
                  <CardDescription>
                    Record patient consultation notes, prescriptions, and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      await axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/api/appointment/${appointmentId}/consultation`,
                        {
                          notes,
                          medicines,
                          suggestions
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                          }
                        }
                      );
                      toast.success("Consultation details saved successfully");
                    } catch (error) {
                      toast.error("Failed to save consultation details");
                    } finally {
                      setSaving(false);
                    }
                  }} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-base">Clinical Notes</Label>
                        <Textarea 
                          placeholder="Enter your clinical observations and diagnosis"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-base">Prescribed Medicines</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMedicines([
                              ...medicines,
                              { name: '', dosage: '', frequency: '', duration: '' }
                            ])}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Medicine
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {medicines.map((medicine, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <div className="flex-1 grid grid-cols-4 gap-4">
                                    <div>
                                      <Label>Medicine Name</Label>
                                      <Input
                                        required
                                        placeholder="e.g., Paracetamol"
                                        value={medicine.name}
                                        onChange={(e) => {
                                          const newMedicines = [...medicines];
                                          newMedicines[index].name = e.target.value;
                                          setMedicines(newMedicines);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label>Dosage</Label>
                                      <Input
                                        placeholder="e.g., 500mg"
                                        value={medicine.dosage}
                                        onChange={(e) => {
                                          const newMedicines = [...medicines];
                                          newMedicines[index].dosage = e.target.value;
                                          setMedicines(newMedicines);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label>Frequency</Label>
                                      <Input
                                        placeholder="e.g., Twice daily"
                                        value={medicine.frequency}
                                        onChange={(e) => {
                                          const newMedicines = [...medicines];
                                          newMedicines[index].frequency = e.target.value;
                                          setMedicines(newMedicines);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label>Duration</Label>
                                      <Input
                                        placeholder="e.g., 5 days"
                                        value={medicine.duration}
                                        onChange={(e) => {
                                          const newMedicines = [...medicines];
                                          newMedicines[index].duration = e.target.value;
                                          setMedicines(newMedicines);
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 mt-6"
                                    onClick={() => {
                                      const newMedicines = [...medicines];
                                      newMedicines.splice(index, 1);
                                      setMedicines(newMedicines);
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {medicines.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No medicines prescribed yet
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">Additional Recommendations</Label>
                        <Textarea
                          placeholder="Enter lifestyle changes, follow-up instructions, or other recommendations"
                          value={suggestions}
                          onChange={(e) => setSuggestions(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setNotes('');
                          setMedicines([]);
                          setSuggestions('');
                        }}
                      >
                        Clear All
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saving ? "Saving Changes..." : "Save Consultation"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
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
