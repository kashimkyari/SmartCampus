import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, UserPlus, BookOpen, BarChart3, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: "Create New Timetable",
      icon: CalendarPlus,
      gradient: "bg-primary-50 border-primary-200 hover:bg-primary-100",
      iconColor: "text-primary-600",
      onClick: () => setLocation("/timetable"),
    },
    {
      title: "Add New Student",
      icon: UserPlus,
      gradient: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600",
      onClick: () => setLocation("/students"),
    },
    {
      title: "Manage Courses",
      icon: BookOpen,
      gradient: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => setLocation("/courses"),
    },
    {
      title: "Generate Reports",
      icon: BarChart3,
      gradient: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => setLocation("/reports"),
    },
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-secondary-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={index}
              variant="ghost"
              className={`w-full flex items-center justify-between p-3 ${action.gradient} border transition-colors text-left h-auto`}
              onClick={action.onClick}
            >
              <div className="flex items-center">
                <Icon className={`${action.iconColor} mr-3 h-5 w-5`} />
                <span className="text-sm font-medium text-secondary-900">{action.title}</span>
              </div>
              <ChevronRight className={`${action.iconColor} h-4 w-4`} />
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
