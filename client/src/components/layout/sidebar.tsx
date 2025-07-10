import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  DoorOpen,
  BarChart3,
  Wrench,
} from "lucide-react";

const navigation = {
  main: [
    { name: "Dashboard", href: "/dashboard", icon: Home, current: true },
    { name: "Institution Setup", href: "/setup", icon: Settings, current: false },
    { name: "Timetable Management", href: "/timetable", icon: Calendar, current: false },
  ],
  academic: [
    { name: "Students", href: "/students", icon: GraduationCap, current: false },
    { name: "Staff", href: "/staff", icon: Users, current: false },
    { name: "Courses", href: "/courses", icon: BookOpen, current: false },
    { name: "Classrooms", href: "/classrooms", icon: DoorOpen, current: false },
  ],
  administration: [
    { name: "Reports", href: "/reports", icon: BarChart3, current: false },
    { name: "Settings", href: "/settings", icon: Wrench, current: false },
  ],
};

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <nav className="mt-6">
        <div className="px-3">
          <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-3">Main</p>
          <ul className="space-y-1">
            {navigation.main.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-primary-500" : "text-secondary-400"
                      )}
                    />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-3 mt-8">
          <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-3">Academic</p>
          <ul className="space-y-1">
            {navigation.academic.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-primary-500" : "text-secondary-400"
                      )}
                    />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-3 mt-8">
          <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-3">Administration</p>
          <ul className="space-y-1">
            {navigation.administration.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-primary-500" : "text-secondary-400"
                      )}
                    />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
