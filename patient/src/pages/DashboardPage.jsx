import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, Calendar, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Profile", path: "profile" },
  { icon: Calendar, label: "Book Appointment", path: "book" },
  { icon: User, label: "My Appointments", path: "appointments" },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activePath, setActivePath] = useState("profile")

  const handleNavigation = (path) => {
    setActivePath(path)
    navigate(path)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6">Medico | Patient</h2>
          <nav className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => (
              <Button
                key={item.path}
                variant={activePath === item.path ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  activePath === item.path
                    ? "bg-primary text-primary-foreground"
                    : ""
                )}
                onClick={() => handleNavigation(item.path)}
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

     
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
