import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from "sonner"
import { ClipboardList, AlertCircle, RefreshCw, BeakerIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

const SingleLabRecord = ({ record }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                Lab Tests - {formatDate(record.requestedAt)}
              </h3>
              <Badge variant={record.status === 'completed' ? 'success' : 'default'}>
                {record.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Doctor: Dr. {record.doctorId?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'View Details'}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 mt-4 border-t pt-4">
            {record.tests.map((test, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-muted/5 border"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{test.testName}</h4>
                  {test.isCritical && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Critical
                    </Badge>
                  )}
                </div>
                
                {record.status === 'completed' ? (
                  <div className="grid gap-2 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Result</p>
                        <p>{test.result}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reference Range</p>
                        <p>{test.referenceRange}</p>
                      </div>
                    </div>
                    
                    {test.remarks && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                        <p className="text-sm">{test.remarks}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    Results pending
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
    <BeakerIcon className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium">No Lab Records</h3>
    <p className="text-sm text-muted-foreground">You don't have any lab records yet.</p>
  </div>
);

export default function LabRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLabRecords = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/lab-records`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setRecords(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch lab records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabRecords();
  }, []);

  const pendingRecords = records.filter(record => record.status !== 'completed');
  const completedRecords = records.filter(record => record.status === 'completed');

  const handleRefresh = () => {
    setLoading(true);
    fetchLabRecords();
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Lab Records</h2>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {records.length === 0 ? (
            <EmptyState />
          ) : (
            records.map(record => (
              <SingleLabRecord key={record._id} record={record} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingRecords.length === 0 ? (
            <EmptyState />
          ) : (
            pendingRecords.map(record => (
              <SingleLabRecord key={record._id} record={record} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedRecords.length === 0 ? (
            <EmptyState />
          ) : (
            completedRecords.map(record => (
              <SingleLabRecord key={record._id} record={record} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
