import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee } from "lucide-react"

export default function DoctorProfile({ profile }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-500">Name</dt>
              <dd className="mt-1">{profile.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Email</dt>
              <dd className="mt-1">{profile.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Specialties</dt>
              <dd className="mt-1">{profile.specialties.join(", ")}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Qualifications</dt>
              <dd className="mt-1">{profile.qualifications}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Experience</dt>
              <dd className="mt-1">{profile.experience} years</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Age</dt>
              <dd className="mt-1">{profile.age} years</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1">
                {new Date(profile.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Add new card for consultation fees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Consultation Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <IndianRupee className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">Online Consultation</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ₹{profile.consultationFees?.online || 0}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium">Physical Consultation</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹{profile.consultationFees?.physical || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
