import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DEMO_APPOINTMENTS = [
  {
    id: 1,
    patientName: "John Smith",
    date: "2024-02-25",
    time: "10:00 AM",
    status: "Confirmed",
  },
  {
    id: 2,
    patientName: "Sarah Johnson",
    date: "2024-02-25",
    time: "11:30 AM",
    status: "Pending",
  },
  {
    id: 3,
    patientName: "Michael Brown",
    date: "2024-02-26",
    time: "2:00 PM",
    status: "Confirmed",
  },
]

export default function Appointments() {
  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {DEMO_APPOINTMENTS.map((appointment) => (
            <div key={appointment.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{appointment.patientName}</h3>
                  <p className="text-sm text-gray-500">
                    {appointment.date} at {appointment.time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  appointment.status === "Confirmed" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {DEMO_APPOINTMENTS.map((appointment) => (
            <div key={appointment.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{appointment.patientName}</h3>
                  <p className="text-sm text-gray-500">
                    {appointment.date} at {appointment.time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  appointment.status === "Confirmed" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  )
}
