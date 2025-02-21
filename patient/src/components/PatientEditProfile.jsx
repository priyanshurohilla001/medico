import React, { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function PatientEditProfile({ profile, onUpdate }) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    address: profile.address || ""
  });
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully");
      onUpdate(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error updating profile"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label>Phone</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label>Address</label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}