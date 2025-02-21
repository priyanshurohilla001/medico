import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function EditProfile({ profile }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Add your update logic here
    console.log("Profile update submitted")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue={profile.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialties</label>
              <Input defaultValue={profile.specialties.join(", ")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Qualifications</label>
              <Input defaultValue={profile.qualifications} />
            </div>
          </div>
          <Button type="submit" className="mt-4">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}
