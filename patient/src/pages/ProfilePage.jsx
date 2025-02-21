import PatientProfile from "../components/PatientProfile";
import PatientEditProfile from "../components/PatientEditProfile";
import PatientChangePassword from "../components/PatientChangePassword";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/patient/profile`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {!(editing || changingPassword) && (
        <>
          <PatientProfile profile={profile} />
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
              onClick={() => setChangingPassword(true)}
            >
              Change Password
            </button>
          </div>
        </>
      )}

      {editing && (
        <PatientEditProfile
          profile={profile}
          onUpdate={(updatedProfile) => {
            setProfile(updatedProfile);
            setEditing(false);
          }}
        />
      )}

      {changingPassword && (
        <>
          <PatientChangePassword />
          <button
            className="px-4 py-2 bg-gray-300 rounded mt-4"
            onClick={() => setChangingPassword(false)}
          >
            Back to Profile
          </button>
        </>
      )}
    </div>
  );
}