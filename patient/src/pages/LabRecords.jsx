import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from "sonner"
import { 
  BeakerIcon, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  CalendarIcon, 
  UserIcon,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const TestResultCard = ({ test }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">{test.testName}</h4>
        {test.isCritical && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Critical
          </Badge>
        )}
      </div>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Result</p>
            <p className="font-medium">{test.result}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Reference Range</p>
            <p className="font-medium">{test.referenceRange}</p>
          </div>
        </div>

        {test.remarks && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Remarks</p>
            <p className="text-sm text-muted-foreground">{test.remarks}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

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
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge 
                variant={record.status === 'completed' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {record.status}
              </Badge>
              <CardTitle className="text-xl font-semibold">
                Lab Report #{record._id.slice(-4)}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(record.requestedAt)}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                Dr. {record.doctorId?.name}
              </div>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pb-6">
          <ScrollArea className="h-full max-h-[600px]">
            <div className="grid gap-6">
              {record.status === 'completed' ? (
                record.tests.map((test, index) => (
                  <TestResultCard key={index} test={test} />
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Results pending</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};

const EmptyState = () => (
  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
      <BeakerIcon className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="mt-4 text-lg font-semibold">No lab records</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground">
        When you have laboratory tests ordered, they will appear here.
      </p>
    </div>
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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Lab Records</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your laboratory test results
          </p>
        </div>
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
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="all">
            All Records
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          <TabsContent value="all">
            {records.length === 0 ? <EmptyState /> : (
              <div className="space-y-4">
                {records.map(record => (
                  <SingleLabRecord key={record._id} record={record} />
                ))}
              </div>
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
        </div>
      </Tabs>
    </div>
  );
}
