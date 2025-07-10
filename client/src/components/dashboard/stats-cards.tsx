import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, DoorOpen } from "lucide-react";

export default function StatsCards() {
  const { institution } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/institutions", institution?.id, "stats"],
    enabled: !!institution?.id,
  });

  const statsCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      change: "+12%",
      changeType: "positive",
      icon: GraduationCap,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Courses",
      value: stats?.activeCourses || 0,
      change: "+8%",
      changeType: "positive",
      icon: BookOpen,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Faculty Members",
      value: stats?.facultyMembers || 0,
      change: "+3%",
      changeType: "positive",
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Classroom Usage",
      value: `${stats?.classroomUsage || 0}%`,
      change: "-2%",
      changeType: "negative",
      icon: DoorOpen,
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="bg-white overflow-hidden shadow-sm border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">{stat.title}</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className={`font-medium ${
                  stat.changeType === "positive" ? "text-green-600" : "text-orange-600"
                }`}>
                  {stat.change}
                </span>
                <span className="text-secondary-500"> from last term</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
