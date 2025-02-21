import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function ChangePassword() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords don't match!")
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await axios({
        method: 'PATCH',
        url: `${import.meta.env.VITE_SERVER_URL}/api/doctor/change-password`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      })

      if (response.data.success) {
        toast.success("Password changed successfully")
        // Clear local storage and redirect to login
        localStorage.clear()
        navigate('/login')
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(
        error.response?.data?.message || 
        "Failed to change password"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <Input 
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                currentPassword: e.target.value 
              }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input 
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                newPassword: e.target.value 
              }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input 
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                confirmPassword: e.target.value 
              }))}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
