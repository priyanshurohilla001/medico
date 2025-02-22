import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import PatientProfile from "@/components/PatientProfile"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/patient/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success && response.data.data) {
        setProfile(response.data.data)
        setError(null)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch profile"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] p-4">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={fetchProfile}
          className="text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return profile ? <PatientProfile profile={profile} /> : null
}