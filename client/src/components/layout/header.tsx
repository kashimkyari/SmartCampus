import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, GraduationCap } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white text-lg" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-secondary-900">SmartCampus</h1>
                  <p className="text-xs text-secondary-500">Where Smart Scheduling Meets Academic Excellence</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-secondary-500 hover:text-secondary-700">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
                  {getInitials(user?.username || "U")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-secondary-700">{user?.username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-secondary-500 hover:text-secondary-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
