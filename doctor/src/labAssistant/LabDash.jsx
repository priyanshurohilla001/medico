import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from "sonner"
import { ClipboardList, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium">No Lab Requests</h3>
    <p className="text-sm text-muted-foreground">There are no pending lab test requests at the moment.</p>
  </div>
)

const LoadingStats = () => (
  <div className="grid gap-4 md:grid-cols-3 mb-8">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium bg-muted animate-pulse h-4 w-20"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted animate-pulse h-8 w-12"></div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const Labdash = () => {
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTest, setSelectedTest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState({});
  const itemsPerPage = 10

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/labAssistant/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setStats(response.data.stats)
    } catch (error) {
      toast.error("Failed to fetch statistics")
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/labAssistant/requestedAppointments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setRequests(response.data.requestedAppointments || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch requests")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([fetchStats(), fetchRequests()])
  }, [])

  const totalPages = Math.max(1, Math.ceil((Array.isArray(requests) ? requests.length : 0) / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRequests = Array.isArray(requests) ? requests.slice(startIndex, endIndex) : []

  const handleInputChange = (testName, field, value) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        [field]: value
      }
    }));
  };

  const handleSubmitResults = async (request) => {
    try {
      setIsSubmitting(true);
      
      const formattedResults = request.tests.map(test => ({
        testName: test.testName,
        result: testResults[test.testName]?.result || '',
        referenceRange: testResults[test.testName]?.referenceRange || '',
        remarks: testResults[test.testName]?.remarks || '',
        isCritical: testResults[test.testName]?.isCritical || false
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/labAssistant/updateTestResults`,
        {
          recordId: request._id,
          testResults: formattedResults
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Test results updated successfully");
        fetchRequests(); // Refresh the list
        setTestResults({}); // Reset form
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update test results");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">Lab Dashboard</h2>
        
        {/* Stats Section */}
        {statsLoading ? (
          <LoadingStats />
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pending || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completed || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            {requests.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Doctor Name</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>{request.patientId?.name || 'N/A'}</TableCell>
                        <TableCell>{request.doctorId?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="capitalize">{request.status}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setSelectedTest(request)}
                                variant="outline"
                              >
                                Complete Test
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Complete Lab Test</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                {request.tests.map((test, index) => (
                                  <div key={index} className="grid gap-2 p-4 border rounded-lg">
                                    <Label className="font-bold">Test Name: {test.testName}</Label>
                                    <Input
                                      placeholder="Enter test result"
                                      className="mb-2"
                                      value={testResults[test.testName]?.result || ''}
                                      onChange={(e) => handleInputChange(test.testName, 'result', e.target.value)}
                                    />
                                    <Input
                                      placeholder="Reference range"
                                      className="mb-2"
                                      value={testResults[test.testName]?.referenceRange || ''}
                                      onChange={(e) => handleInputChange(test.testName, 'referenceRange', e.target.value)}
                                    />
                                    <Textarea 
                                      placeholder="Additional remarks"
                                      value={testResults[test.testName]?.remarks || ''}
                                      onChange={(e) => handleInputChange(test.testName, 'remarks', e.target.value)}
                                    />
                                  </div>
                                ))}
                                <Button 
                                  className="mt-4" 
                                  onClick={() => handleSubmitResults(request)}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Submit Results'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Modified Pagination Controls */}
                {requests.length > itemsPerPage && (
                  <div className="flex justify-center gap-2 py-4 bg-muted/5">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span className="py-2 px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages || currentRequests.length === 0}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Labdash