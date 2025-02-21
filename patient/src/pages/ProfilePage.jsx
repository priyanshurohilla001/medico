import { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import PatientProfile from "../components/PatientProfile";
import PatientEditProfile from "../components/PatientEditProfile";
import PatientChangePassword from "../components/PatientChangePassword";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/patient/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardContent className="pt-6">
              <PatientProfile profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <PatientEditProfile 
            profile={profile} 
            onUpdate={(updatedProfile) => setProfile(updatedProfile)} 
          />
        </TabsContent>

        <TabsContent value="password">
          <PatientChangePassword />
        </TabsContent>
      </Tabs>
    </div>
  );
}