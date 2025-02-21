import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Welcome to Medico
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your trusted platform for booking doctor appointments online
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle>New Patient?</CardTitle>
              <CardDescription>Create a new account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/register')}
              >
                Register Now
              </Button>
            </CardContent>
          </Card>

          <Card className="transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle>Existing Patient?</CardTitle>
              <CardDescription>Sign in to manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Easy Booking",
                description: "Book appointments with just a few clicks"
              },
              {
                title: "Top Doctors",
                description: "Access to verified healthcare professionals"
              },
              {
                title: "Manage Schedule",
                description: "View and manage your appointments easily"
              }
            ].map((feature) => (
              <Card key={feature.title} className="text-left">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
