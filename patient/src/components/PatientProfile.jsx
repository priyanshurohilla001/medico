import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function PatientProfile({ profile }) {
  if (!profile) {
    return null
  }

  const profileDetails = [
    { label: "Name", value: profile.name },
    { label: "Email", value: profile.email },
    { label: "Age", value: profile.age },
    { label: "Gender", value: profile.gender },
    { label: "Phone", value: profile.phone },
    { label: "Address", value: profile.address },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">My Profile</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {profileDetails.map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <Label className="text-muted-foreground">{label}</Label>
                <p className="font-medium">{value || 'Not provided'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
