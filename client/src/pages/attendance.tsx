import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Plus, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const attendanceFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["present", "absent", "late", "excused"]),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  biometricId: z.string().optional(),
  deviceId: z.string().optional(),
  metadata: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  biometricId?: string;
  deviceId?: string;
  metadata?: any;
  createdAt: string;
  student?: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
  };
}

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  section: string;
}

export default function Attendance() {
  const { user, institution } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      studentId: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: "present",
      checkInTime: "",
      checkOutTime: "",
      biometricId: "",
      deviceId: "",
      metadata: "",
    },
  });

  // Fetch students
  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/institutions", institution?.id, "students"],
    queryFn: () => apiRequest(`/api/institutions/${institution?.id}/students`),
    enabled: !!institution?.id,
  });

  // Fetch attendance records
  const { data: attendanceRecords, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/institution", institution?.id, selectedDate],
    queryFn: () => apiRequest(`/api/attendance/institution/${institution?.id}${selectedDate ? `?date=${selectedDate}` : ''}`),
    enabled: !!institution?.id,
  });

  // Fetch student attendance when student is selected
  const { data: studentAttendance } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/student", selectedStudent],
    queryFn: () => apiRequest(`/api/attendance/student/${selectedStudent}`),
    enabled: !!selectedStudent,
  });

  const createMutation = useMutation({
    mutationFn: (data: AttendanceFormData) => {
      const payload = {
        ...data,
        institutionId: institution?.id,
        metadata: data.metadata ? JSON.parse(data.metadata) : null,
      };
      return apiRequest("/api/attendance", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/institution", institution?.id] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Attendance record created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create attendance record",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceFormData> }) => {
      const payload = {
        ...data,
        metadata: data.metadata ? JSON.parse(data.metadata) : null,
      };
      return apiRequest(`/api/attendance/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/institution", institution?.id] });
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AttendanceFormData) => {
    createMutation.mutate(data);
  };

  const handleStatusChange = (recordId: number, newStatus: string) => {
    updateMutation.mutate({ id: recordId, data: { status: newStatus } });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case "absent":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
      case "late":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Late</Badge>;
      case "excused":
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Excused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAttendanceStats = () => {
    if (!attendanceRecords) return { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    
    const stats = attendanceRecords.reduce(
      (acc, record) => {
        acc[record.status as keyof typeof acc]++;
        acc.total++;
        return acc;
      },
      { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
    );
    
    return stats;
  };

  const stats = getAttendanceStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select student" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {students?.map((student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                  {student.firstName} {student.lastName} ({student.studentId})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkInTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check In Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Out Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="biometricId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biometric ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Fingerprint/Face ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Attendance device" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      Mark Attendance
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.present}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.absent}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{stats.late}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="student">Student View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance - {selectedDate}</CardTitle>
              <CardDescription>
                Attendance records for {format(new Date(selectedDate), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.student?.studentId || record.studentId}</TableCell>
                      <TableCell>
                        {record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.checkInTime ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(record.checkInTime), 'HH:mm')}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {record.checkOutTime ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(record.checkOutTime), 'HH:mm')}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{record.deviceId || '-'}</TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => handleStatusChange(record.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance History</CardTitle>
              <CardDescription>
                View attendance history for individual students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select onValueChange={(value) => setSelectedStudent(parseInt(value))}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName} ({student.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedStudent && studentAttendance && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          {record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          {record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>{record.deviceId || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}