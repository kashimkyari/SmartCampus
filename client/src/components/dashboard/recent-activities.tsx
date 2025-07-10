import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Calendar, BookOpen, Settings, Users, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: number;
  action: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case "student_created":
    case "student_enrolled":
      return UserPlus;
    case "timetable_updated":
    case "timetable_created":
      return Calendar;
    case "course_created":
    case "course_updated":
      return BookOpen;
    case "staff_created":
    case "staff_updated":
      return Users;
    case "institution_created":
    case "institution_configured":
      return Settings;
    default:
      return GraduationCap;
  }
};

const getActivityIconColor = (action: string) => {
  switch (action) {
    case "student_created":
    case "student_enrolled":
      return "bg-blue-500";
    case "timetable_updated":
    case "timetable_created":
      return "bg-green-500";
    case "course_created":
    case "course_updated":
      return "bg-purple-500";
    case "staff_created":
    case "staff_updated":
      return "bg-orange-500";
    case "institution_created":
    case "institution_configured":
      return "bg-indigo-500";
    default:
      return "bg-gray-500";
  }
};

export default function RecentActivities() {
  const { institution } = useAuth();

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["/api/institutions", institution?.id, "activities"],
    enabled: !!institution?.id,
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-secondary-900">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-secondary-900">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-secondary-500 text-sm">Failed to load recent activities</p>
            <p className="text-secondary-400 text-xs mt-1">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activitiesList = activities || [];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-secondary-900">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activitiesList.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-secondary-500 text-sm">No recent activities</p>
            <p className="text-secondary-400 text-xs mt-1">
              Activities will appear here as you use the system
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activitiesList.map((activity: Activity, index: number) => {
                const IconComponent = getActivityIcon(activity.action);
                const iconColor = getActivityIconColor(activity.action);
                const isLast = index === activitiesList.length - 1;
                
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span 
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span 
                            className={`h-8 w-8 rounded-full ${iconColor} flex items-center justify-center ring-8 ring-white`}
                          >
                            <IconComponent className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.createdAt}>
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {activitiesList.length > 0 && (
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => console.log("View all activities")}
            >
              View all activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
