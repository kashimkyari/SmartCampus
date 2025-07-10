import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function TimetableOverview() {
  const { institution } = useAuth();

  const { data: timetableSlots, isLoading } = useQuery({
    queryKey: ["/api/institutions", institution?.id, "timetable"],
    enabled: !!institution?.id,
  });

  const timeSlots = ["9:00", "10:00", "11:00", "12:00", "13:00"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getSlotColor = (index: number) => {
    const colors = [
      "bg-blue-100 border-l-4 border-blue-500 text-blue-900",
      "bg-green-100 border-l-4 border-green-500 text-green-900",
      "bg-purple-100 border-l-4 border-purple-500 text-purple-900",
      "bg-orange-100 border-l-4 border-orange-500 text-orange-900",
      "bg-pink-100 border-l-4 border-pink-500 text-pink-900",
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Weekly Timetable Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div>
          <CardTitle className="text-lg font-medium text-secondary-900">Weekly Timetable Overview</CardTitle>
          <p className="text-sm text-secondary-500">Current week schedule and classroom assignments</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-secondary-500 uppercase tracking-wider py-3 w-20">
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="text-left text-xs font-medium text-secondary-500 uppercase tracking-wider py-3"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timeSlots.map((time, timeIndex) => (
                <tr key={time}>
                  <td className="py-4 text-sm font-medium text-secondary-900">{time}</td>
                  {days.map((day, dayIndex) => (
                    <td key={`${time}-${day}`} className="py-2">
                      {(timeIndex + dayIndex) % 3 !== 2 ? (
                        <div className={`p-3 rounded-r ${getSlotColor(timeIndex + dayIndex)}`}>
                          <div className="text-sm font-medium">
                            {timeIndex === 0 && dayIndex === 0 && "Advanced Mathematics"}
                            {timeIndex === 0 && dayIndex === 1 && "Physics Lab"}
                            {timeIndex === 0 && dayIndex === 2 && "Computer Science"}
                            {timeIndex === 0 && dayIndex === 3 && "Chemistry"}
                            {timeIndex === 0 && dayIndex === 4 && "Literature"}
                            {timeIndex === 1 && dayIndex === 0 && "Biology"}
                            {timeIndex === 1 && dayIndex === 1 && "History"}
                            {timeIndex === 1 && dayIndex === 2 && "Art & Design"}
                            {timeIndex === 1 && dayIndex === 3 && "Geography"}
                            {timeIndex > 1 && "Free Period"}
                          </div>
                          <div className="text-xs opacity-75">
                            {timeIndex === 0 && dayIndex === 0 && "Room 201A"}
                            {timeIndex === 0 && dayIndex === 1 && "Lab 3B"}
                            {timeIndex === 0 && dayIndex === 2 && "Computer Lab"}
                            {timeIndex === 0 && dayIndex === 3 && "Room 305"}
                            {timeIndex === 0 && dayIndex === 4 && "Room 102"}
                            {timeIndex === 1 && dayIndex === 0 && "Lab 2A"}
                            {timeIndex === 1 && dayIndex === 1 && "Room 204"}
                            {timeIndex === 1 && dayIndex === 2 && "Art Studio"}
                            {timeIndex === 1 && dayIndex === 3 && "Room 301"}
                          </div>
                          <div className="text-xs opacity-75">
                            {timeIndex === 0 && dayIndex === 0 && "Dr. Smith"}
                            {timeIndex === 0 && dayIndex === 1 && "Prof. Johnson"}
                            {timeIndex === 0 && dayIndex === 2 && "Dr. Chen"}
                            {timeIndex === 0 && dayIndex === 3 && "Dr. Williams"}
                            {timeIndex === 0 && dayIndex === 4 && "Ms. Anderson"}
                            {timeIndex === 1 && dayIndex === 0 && "Dr. Brown"}
                            {timeIndex === 1 && dayIndex === 1 && "Prof. Davis"}
                            {timeIndex === 1 && dayIndex === 2 && "Ms. Garcia"}
                            {timeIndex === 1 && dayIndex === 3 && "Mr. Wilson"}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-secondary-500">Showing current week schedule</div>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Timetable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
