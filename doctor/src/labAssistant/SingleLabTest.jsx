import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SingleLabTest = ({ test }) => {
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
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 bg-muted/5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">
                  Patient: {test.patientId?.name}
                </h3>
                <Badge variant={test.status === 'completed' ? 'success' : 'default'}>
                  {test.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Completed on: {formatDate(test.completedAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 border-t">
            <div className="grid gap-4">
              {test.tests.map((result, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-muted/5 border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{result.testName}</h4>
                    {result.isCritical && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Critical
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid gap-2 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Result</p>
                        <p>{result.result}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reference Range</p>
                        <p>{result.referenceRange}</p>
                      </div>
                    </div>
                    
                    {result.remarks && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                        <p className="text-sm">{result.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-2 text-sm text-muted-foreground">
                <p>Requested by: Dr. {test.doctorId?.name}</p>
                <p>Lab Assistant: {test.labAssistantId?.name}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SingleLabTest;
