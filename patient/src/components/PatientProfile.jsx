import { User, Phone, MapPin, Mail } from "lucide-react";

export default function PatientProfile({ profile }) {
  const profileItems = [
    { icon: <User className="h-5 w-5" />, label: "Name", value: profile.name },
    { icon: <Phone className="h-5 w-5" />, label: "Phone", value: profile.phone },
    { icon: <MapPin className="h-5 w-5" />, label: "Address", value: profile.address },
    { icon: <Mail className="h-5 w-5" />, label: "Email", value: profile.email }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-12 w-12 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-muted-foreground">Patient</p>
        </div>
      </div>

      <div className="grid gap-4 mt-6">
        {profileItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border">
            {item.icon}
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-medium">{item.value || "Not provided"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
