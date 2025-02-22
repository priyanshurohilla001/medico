import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const DoctorSlots = ({ doctor }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationType, setConsultationType] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/doctor/${id}/appointments`
        );

        if (!response.ok) throw new Error("Failed to fetch appointments");

        const data = await response.json();
        if (data.success) {
          setAppointments(data.appointments);
        } else {
          throw new Error("Failed to load appointments");
        }
      } catch (err) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedSlot || !consultationType) return;

    setIsBooking(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/appointment/confirm`,
        {
          doctorId: doctor._id,
          appointmentId: selectedSlot.appointmentId,
          consultationType,
          fees: doctor.consultationFees[consultationType],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Appointment booked successfully!");
        navigate("/appointments");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        "Failed to book appointment. Please try again."
      );
    } finally {
      setIsBooking(false);
      setSelectedSlot(null);
      setConsultationType("");
    }
  };

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
        <ScrollArea className="w-full pb-4">
          <div className="flex gap-4 mb-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
        </ScrollArea>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Select a date and time for your consultation
        </p>
      </div>

      <Tabs defaultValue={appointments[0]?.date}>
        <ScrollArea className="w-full pb-4">
          <TabsList className="flex h-auto px-2 py-2">
            {appointments.map((dateSlot) => (
              <TabsTrigger
                key={dateSlot.date}
                value={dateSlot.date}
                className="px-4 py-2 h-auto text-sm flex flex-col space-y-1"
              >
                <span className="font-medium">
                  {new Date(dateSlot.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </span>
                <span className="text-xs font-normal">
                  {new Date(dateSlot.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {appointments.map((dateSlot) => (
          <TabsContent key={dateSlot.date} value={dateSlot.date}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dateSlot.appointments.map((slot) => (
                <Dialog
                  key={slot.appointmentId}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedSlot(null);
                      setConsultationType("");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant={slot.patientId ? "ghost" : "outline"}
                      disabled={!!slot.patientId}
                      className={`h-14 text-base ${
                        !slot.patientId &&
                        "hover:bg-primary/10 hover:text-primary"
                      } transition-colors`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <span>
                        {slot.time}
                        {slot.patientId && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            • Booked
                          </span>
                        )}
                      </span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-left">
                        Confirm Appointment
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          {new Date(dateSlot.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>
                        <p className="text-lg font-semibold text-primary">
                          {slot.time}
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Consultation Type</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant={
                              consultationType === "online" ? "" : "ghost"
                            }
                            size="lg"
                            className={`h-16 flex-col gap-1 rounded-md transition-all duration-200 ${
                              consultationType === "online"
                                ? "border border-current shadow-sm"
                                : "border border-transparent hover:shadow-sm"
                            }`}
                            onClick={() => setConsultationType("online")}
                          >
                            <span>Online</span>
                            <span
                              className={`font-normal text-muted-foreground ${
                                consultationType === "online"
                                  ? "opacity-80"
                                  : ""
                              }`}
                            >
                              ₹{doctor.consultationFees.online}
                            </span>
                          </Button>
                          <Button
                            variant={
                              consultationType === "physical" ? "" : "ghost"
                            }
                            size="lg"
                            className={`h-16 flex-col gap-1 rounded-md transition-all duration-200 ${
                              consultationType === "physical"
                                ? "border border-current shadow-sm"
                                : "border border-transparent hover:shadow-sm"
                            }`}
                            onClick={() => setConsultationType("physical")}
                          >
                            <span>Physical</span>
                            <span
                              className={`font-normal text-muted-foreground ${
                                consultationType === "physical"
                                  ? "opacity-80"
                                  : ""
                              }`}
                            >
                              ₹{doctor.consultationFees.physical}
                            </span>
                          </Button>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleBooking}
                        disabled={!consultationType || isBooking}
                      >
                        {isBooking ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Booking Appointment...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DoctorSlots;
