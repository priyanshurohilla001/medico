import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import SingleLabTest from './SingleLabTest'
import { Button } from "@/components/ui/button"

const CompletedTests = () => {
  const [completedTests, setCompletedTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(completedTests.length / itemsPerPage)

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

  const currentTests = completedTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : completedTests.length === 0 ? (
        <div className="text-center p-8 bg-muted/5 rounded-lg">
          <p className="text-muted-foreground">No completed tests found</p>
        </div>
      ) : (
        <>
          {currentTests.map((test) => (
            <SingleLabTest key={test._id} test={test} />
          ))}

          {completedTests.length > itemsPerPage && (
            <div className="flex justify-center gap-2 py-4">
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
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CompletedTests
