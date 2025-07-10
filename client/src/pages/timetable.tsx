
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Calendar, Clock, MapPin, User, Plus, Edit } from "lucide-react";

interface TimetableSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  courseName: string;
  courseCode: string;
  classroomName: string;
  staffName: string;
  studentCount: number;
}

export default function Timetable() {
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState("current");

  const daysOfWeek = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch("/api/timetable", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTimetableSlots(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch timetable",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSlotForDayAndTime = (day: string, time: string) => {
    return timetableSlots.find(slot => 
      slot.dayOfWeek === day && slot.startTime === time
    );
  };

  const getColorForCourse = (courseCode: string) => {
    const colors = [
      "bg-blue-100 border-blue-200 text-blue-800",
      "bg-green-100 border-green-200 text-green-800",
      "bg-purple-100 border-purple-200 text-purple-800",
      "bg-orange-100 border-orange-200 text-orange-800",
      "bg-pink-100 border-pink-200 text-pink-800",
      "bg-indigo-100 border-indigo-200 text-indigo-800",
    ];
    
    const hash = courseCode.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900">Timetable Management</h2>
              <p className="mt-1 text-sm text-secondary-500">
                View and manage class schedules
              </p>
            </div>
            <div className="flex space-x-4">
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Week</SelectItem>
                  <SelectItem value="next">Next Week</SelectItem>
                  <SelectItem value="previous">Previous Week</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading timetable...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Timetable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-200 p-3 bg-gray-50 text-left font-medium">
                          Time
                        </th>
                        {daysOfWeek.map(day => (
                          <th key={day} className="border border-gray-200 p-3 bg-gray-50 text-center font-medium min-w-[150px]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(time => (
                        <tr key={time}>
                          <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                            {time}
                          </td>
                          {daysOfWeek.map(day => {
                            const slot = getSlotForDayAndTime(day, time);
                            return (
                              <td key={`${day}-${time}`} className="border border-gray-200 p-2 align-top">
                                {slot ? (
                                  <div className={`p-3 rounded-lg border-2 ${getColorForCourse(slot.courseCode)} relative group hover:shadow-md transition-shadow`}>
                                    <div className="flex justify-between items-start mb-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {slot.courseCode}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="text-sm font-medium mb-1">{slot.courseName}</div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {slot.classroomName}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {slot.staffName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {slot.studentCount} students
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-16 flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors cursor-pointer rounded">
                                    <Plus className="h-4 w-4" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Classes</p>
                    <p className="text-2xl font-bold text-gray-900">{timetableSlots.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(timetableSlots.map(slot => slot.courseCode)).size}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Classrooms Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(timetableSlots.map(slot => slot.classroomName)).size}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {timetableSlots.reduce((sum, slot) => sum + slot.studentCount, 0)}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
