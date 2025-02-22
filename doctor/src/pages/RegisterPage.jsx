import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { SpecialtiesSelect } from "../components/SpecialtiesSelect"; 

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  specialties: z.array(z.string()).min(1, { 
    message: "Please select at least one specialty." 
  }),
  qualifications: z.string().optional(),
  experience: z.string().optional().refine((value) => {
    if (!value) return true; 
    const num = Number(value);
    return num >= 0;
  }, {
    message: "Experience must be a non-negative number.",
  }),
  age: z.string().optional().refine((value) => {
    if (!value) return true; 
    const num = Number(value);
    return num >= 18;
  }, {
    message: "Age must be 18 or older.",
  }),
  consultationFees: z.object({
    online: z.string().min(1, { message: "Online consultation fee is required" }).refine(
      (value) => !isNaN(value) && Number(value) >= 0,
      { message: "Fee must be a non-negative number" }
    ),
    physical: z.string().min(1, { message: "Physical consultation fee is required" }).refine(
      (value) => !isNaN(value) && Number(value) >= 0,
      { message: "Fee must be a non-negative number" }
    ),
  }),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      specialties: [],
      qualifications: "",
      experience: "",
      age: "",
      consultationFees: {
        online: "",
        physical: "",
      },
    },
  });

  async function onSubmit(values) {
    try {
      setIsLoading(true);

      const formattedValues = {
        ...values,
        age: values.age ? Number(values.age) : undefined,
        experience: values.experience ? Number(values.experience) : undefined,
        consultationFees: {
          online: Number(values.consultationFees.online),
          physical: Number(values.consultationFees.physical),
        },
      };
  
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/doctor/register`,
        formattedValues
      );
      
      localStorage.setItem("token", response.data.token);
      toast("Registration successful, welcome to MedicoApp!");
      navigate("/dashboard");
    } catch (error) {
      let errorMessage = "An error occurred.";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          errorMessage = "Network error: no response received.";
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your doctor account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="doctor@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialties</FormLabel>
                    <FormControl>
                      <SpecialtiesSelect
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qualifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualifications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your qualifications" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 35" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="consultationFees.online"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Online Consultation Fee (₹)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 500" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consultationFees.physical"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Consultation Fee (₹)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
                <Button variant="link" className="w-full" asChild>
                  <Link to="/login">Already have an account? Login</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
