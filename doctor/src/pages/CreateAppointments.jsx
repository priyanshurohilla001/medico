"use client";

import React, { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DatePickerWithRange from "@/components/ui/datePickerCustom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { generateTimeOptions } from "@/utils/timeOptions";

const timeOptions = generateTimeOptions();

const formSchema = z.object({
  dailyWorkingStartTime: z.string().min(1, "Start time is required"),
  dailyWorkingEndTime: z.string().min(1, "End time is required"),
  numberOfAppointments: z.coerce
    .number()
    .int()
    .positive("Number of appointments must be a positive integer.")
    .max(50, "Maximum 50 appointments allowed per day"),
  averageAppointmentTime: z.coerce
    .number()
    .positive("Average appointment time must be a positive number.")
    .min(15, "Minimum appointment time is 15 minutes")
    .max(180, "Maximum appointment time is 180 minutes"),
  dateRange: z.object({
    from: z.date({
      required_error: "Start date is required.",
    }),
    to: z.date({
      required_error: "End date is required.",
    }),
  }).refine((data) => data.from <= data.to, {
    message: "End date cannot be before start date",
  }),
});

const CreateAppointments = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyWorkingStartTime: "10:00",
      dailyWorkingEndTime: "16:00",
      numberOfAppointments: 8,
      averageAppointmentTime: 45,
      dateRange: {
        from: null,
        to: null,
      },
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const startDate = values.dateRange?.from;
      const endDate = values.dateRange?.to;

      if (!startDate || !endDate) {
        toast.error("Please select a valid date range.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        dailyWorkingStartTime: values.dailyWorkingStartTime,
        dailyWorkingEndTime: values.dailyWorkingEndTime,
        numberOfAppointments: Number(values.numberOfAppointments),
        averageAppointmentTime: Number(values.averageAppointmentTime),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/appointment/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Appointments created successfully");
        form.reset();
      }
    } catch (error) {
      console.error("Error creating appointments:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to create appointments. Please try again."
      );
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
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyWorkingEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="50"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="e.g., 8"
                    />
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
                    <Input
                      {...field}
                      type="number"
                      min="15"
                      max="180"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="e.g., 45"
                    />
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
