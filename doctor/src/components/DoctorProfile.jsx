import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DoctorProfile({ profile }) {
  return (
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
  )
}
