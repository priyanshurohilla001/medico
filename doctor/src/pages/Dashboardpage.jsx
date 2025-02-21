import { useState, useEffect } from "react"
import axios from "axios"
import { Loader2, LayoutDashboard, UserCog, Key, LogOut, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import DoctorProfile from "@/components/DoctorProfile"
import EditProfile from "@/components/EditProfile"
import ChangePassword from "@/components/ChangePassword"
import Appointments from "@/components/Appointments"

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Calendar, label: "Appointments", id: "appointments" },
  { icon: UserCog, label: "Edit Profile", id: "edit-profile" },
  { icon: Key, label: "Change Password", id: "change-password" },
]

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/doctor/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setProfile(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    if (!profile) {
      return <p>Failed to load profile data.</p>
    }

    switch (activeTab) {
      case "dashboard":
        return <DoctorProfile profile={profile} />
      case "appointments":
        return <Appointments />
      case "edit-profile":
        return <EditProfile profile={profile} />
      case "change-password":
        return <ChangePassword />
      default:
        return <DoctorProfile profile={profile} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6">Medico | Doctor</h2>
          <nav className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 transition-colors",
                  activeTab === item.id 
                    ? "bg-black text-white hover:bg-black/90" 
                    : "hover:bg-gray-800/10 text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-6 left-6">
          <Button
            variant="ghost"
            className="w-52 justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">
          {SIDEBAR_ITEMS.find(item => item.id === activeTab)?.label || "Dashboard"}
        </h1>
        {renderContent()}
      </main>
    </div>
  )
}

