
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { BarChart3, Download, FileText, Users, GraduationCap, Calendar, TrendingUp } from "lucide-react";

interface ReportData {
  totalStudents: number;
  totalStaff: number;
  totalCourses: number;
  totalClassrooms: number;
  attendanceRate: number;
  graduationRate: number;
  enrollmentTrend: Array<{ month: string; count: number }>;
  departmentStats: Array<{ department: string; students: number; staff: number }>;
  attendanceByMonth: Array<{ month: string; rate: number }>;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("current_year");
  const [selectedReport, setSelectedReport] = useState("overview");

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?period=${selectedPeriod}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      const response = await fetch(`/api/reports/generate/${reportType}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: "Success",
          description: "Report generated and downloaded successfully",
        });
      } else {
        throw new Error("Failed to generate report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const reportTypes = [
    { value: "overview", label: "Institution Overview", icon: BarChart3 },
    { value: "students", label: "Student Report", icon: GraduationCap },
    { value: "staff", label: "Staff Report", icon: Users },
    { value: "attendance", label: "Attendance Report", icon: Calendar },
    { value: "academic", label: "Academic Performance", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900">Reports & Analytics</h2>
              <p className="mt-1 text-sm text-secondary-500">
                Generate and view institutional reports
              </p>
            </div>
            <div className="flex space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="current_semester">Current Semester</SelectItem>
                  <SelectItem value="last_semester">Last Semester</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => generateReport(selectedReport)}>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-3xl font-bold text-gray-900">{reportData?.totalStudents || 0}</p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Staff</p>
                        <p className="text-3xl font-bold text-gray-900">{reportData?.totalStaff || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Courses</p>
                        <p className="text-3xl font-bold text-gray-900">{reportData?.totalCourses || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{reportData?.attendanceRate || 0}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Detailed Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Department Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData?.departmentStats?.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{dept.department}</p>
                            <p className="text-sm text-gray-600">{dept.students} students • {dept.staff} staff</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{dept.students + dept.staff} total</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Enrollment Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData?.enrollmentTrend?.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{trend.month}</p>
                            <p className="text-sm text-gray-600">New enrollments</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{trend.count}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Attendance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Attendance Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData?.attendanceByMonth?.map((attendance, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{attendance.month}</p>
                            <p className="text-sm text-gray-600">Average attendance</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={
                                attendance.rate >= 90 ? "bg-green-100 text-green-800" :
                                attendance.rate >= 75 ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }
                            >
                              {attendance.rate}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.value}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => generateReport(type.value)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            Generate {type.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
