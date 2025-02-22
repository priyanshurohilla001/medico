import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea"; // not used but might be useful later, keep it for now
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import DoctorSlots from "@/components/DoctorSlots";


const DoctorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/doctor/${id}`
        );
        if (response.data.success) {
          setDoctor(response.data.doctor);
        } else {
          setError(response.data.message || "Failed to fetch doctor details.");
        }
      } catch (err) {
        console.error("Error fetching doctor details:", err);
        setError(
          err.response?.data?.message ||
            "An unexpected error occurred while fetching doctor details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Breadcrumbs
            items={[
              { label: "Book Appointment", link: "/dashboard/book" },
              { label: doctor?.name || "Doctor Details" },
            ]}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-[200px] w-full rounded-md" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : !doctor ? (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not found</AlertTitle>
          <AlertDescription>
            No doctor found.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{doctor.name}</CardTitle>
            <CardDescription>Details about {doctor.name}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <p className="text-sm font-medium leading-none">{doctor.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <p className="text-sm font-medium leading-none">
                {doctor.specialties && doctor.specialties.join(", ")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <p className="text-sm font-medium leading-none">
                {doctor.experience || "N/A"} years
              </p>
            </div>
            {doctor.qualifications && (
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <p className="text-sm font-medium leading-none">
                  {doctor.qualifications}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      { doctor &&  <DoctorSlots doctor={doctor} />}
    </div>
  );
};

export default DoctorDetailsPage;