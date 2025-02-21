import React, { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DatePickerWithRange } from "@/components/ui/datePickerCustom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner"

const formSchema = z.object({
  dailyWorkingStartTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    {
      message: "Invalid time format. Must be HH:mm (e.g., 09:00)",
    }
  ),
  dailyWorkingEndTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    {
      message: "Invalid time format. Must be HH:mm (e.g., 17:30)",
    }
  ),
  numberOfAppointments: z.number().int().positive({
    message: "Number of appointments must be a positive integer.",
  }),
  averageAppointmentTime: z.number().positive({
    message: "Average appointment time must be a positive number (minutes).",
  }),
  dateRange: z
    .object({
      from: z.date({
        required_error: "Start date is required.",
      }),
      to: z.date({
        required_error: "End date is required.",
      }),
    })
    .required(),
});

const CreateAppointments = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyWorkingStartTime: "09:00",
      dailyWorkingEndTime: "17:00",
      numberOfAppointments: 10,
      averageAppointmentTime: 30,
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const startDate = values.dateRange?.from;
      const endDate = values.dateRange?.to;

      if (!startDate || !endDate) {
        toast({
          variant: "destructive",
          title: "Error.",
          description: "Please select a valid date range.",
          action: "Close",
        });
        setIsSubmitting(false);
        return;
      }

      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      const payload = {
        dailyWorkingStartTime: values.dailyWorkingStartTime,
        dailyWorkingEndTime: values.dailyWorkingEndTime,
        numberOfAppointments: values.numberOfAppointments,
        averageAppointmentTime: values.averageAppointmentTime,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_VITE_SERVER_URL}/api/appointment/create`,
        payload
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          action: "Close",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            response.data.message || "Failed to create appointments.",
          action: "Close",
        });
      }
    } catch (error) {
      console.error("Error creating appointments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Internal server error.",
        action: "Close",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[90%] max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Appointment Slots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Range</FormLabel>
                  <FormControl>
                    <DatePickerWithRange
                      onSelect={field.onChange}
                      date={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyWorkingStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time (HH:mm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" placeholder="HH:mm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dailyWorkingEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (HH:mm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" placeholder="HH:mm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="numberOfAppointments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Appointments Per Day</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="e.g., 10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="averageAppointmentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Appointment Time (minutes)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="e.g., 30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Appointments"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateAppointments;
