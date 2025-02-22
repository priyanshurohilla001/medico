import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const CompletedTests = () => {
  const [completedTests, setCompletedTests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCompletedTests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/labAssistant/completedTests`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setCompletedTests(response.data.completedTests)
    } catch (error) {
      toast.error("Failed to fetch completed tests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompletedTests()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {completedTests.map((test) => (
          <Card key={test._id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{test.patientId?.name}</CardTitle>
                  <CardDescription>
                    Completed on: {new Date(test.completedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge>Completed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="tests">
                  <AccordionTrigger>View Test Results</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {test.tests.map((testItem, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-semibold">{testItem.testName}</h4>
                          <div className="grid gap-2 mt-2">
                            <div className="text-sm">
                              <span className="font-medium">Result:</span> {testItem.result}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Reference Range:</span> {testItem.referenceRange}
                            </div>
                            {testItem.remarks && (
                              <div className="text-sm">
                                <span className="font-medium">Remarks:</span> {testItem.remarks}
                              </div>
                            )}
                            {testItem.isCritical && (
                              <Badge variant="destructive" className="w-fit">Critical</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}

export default CompletedTests
