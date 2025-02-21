import { useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SpecialtiesSelect } from "./SpecialtiesSelect"
import { toast } from "sonner"

export default function EditProfile({ profile }) {  // Remove setProfile prop
  const [formData, setFormData] = useState({
    name: profile.name || "",
    specialties: profile.specialties || [],
    qualifications: profile.qualifications || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSpecialtiesChange = (newSpecialties) => {
    setFormData(prev => ({ ...prev, specialties: newSpecialties }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await axios({
        method: 'PATCH',
        url: `${import.meta.env.VITE_SERVER_URL}/api/doctor/profile`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: formData
      })

      if (response.data.success) {
        toast.success("Profile updated successfully")
        window.location.reload()
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(
        error.response?.data?.message || 
        "Failed to update profile"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={profile.email} disabled />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialties</label>
              <SpecialtiesSelect
                value={formData.specialties}
                onChange={handleSpecialtiesChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Qualifications</label>
              <Textarea
                value={formData.qualifications}
                onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
