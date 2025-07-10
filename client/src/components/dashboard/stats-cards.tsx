import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, Calendar } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalCourses: number;
  classesToday: number;
  studentChange: number;
  staffChange: number;
  courseChange: number;
  classChange: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalStaff: 0,
    totalCourses: 0,
    classesToday: 0,
    studentChange: 0,
    staffChange: 0,
    courseChange: 0,
    classChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: isLoading ? "..." : stats.totalStudents.toLocaleString(),
      change: isLoading ? "..." : `${stats.studentChange >= 0 ? '+' : ''}${stats.studentChange}%`,
      changeType: stats.studentChange >= 0 ? "positive" as const : "negative" as const,
      icon: GraduationCap,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Staff",
      value: isLoading ? "..." : stats.totalStaff.toLocaleString(),
      change: isLoading ? "..." : `${stats.staffChange >= 0 ? '+' : ''}${stats.staffChange}%`,
      changeType: stats.staffChange >= 0 ? "positive" as const : "negative" as const,
      icon: Users,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Total Courses",
      value: isLoading ? "..." : stats.totalCourses.toLocaleString(),
      change: isLoading ? "..." : `${stats.courseChange >= 0 ? '+' : ''}${stats.courseChange}%`,
      changeType: stats.courseChange >= 0 ? "positive" as const : "negative" as const,
      icon: BookOpen,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Classes Today",
      value: isLoading ? "..." : stats.classesToday.toLocaleString(),
      change: isLoading ? "..." : `${stats.classChange >= 0 ? '+' : ''}${stats.classChange}%`,
      changeType: stats.classChange >= 0 ? "positive" as const : "negative" as const,
      icon: Calendar,
      gradient: "from-orange-500 to-orange-600",
    },
  ];

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