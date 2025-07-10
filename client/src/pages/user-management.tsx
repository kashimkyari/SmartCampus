import { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Users, UserPlus, Shield, Edit3, Mail, Calendar, Crown, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const userRoleSchema = z.object({
  role: z.string().min(1, "Role is required"),
  permissions: z.array(z.string()).optional(),
});

type UserRoleFormData = z.infer<typeof userRoleSchema>;

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  institutionId: number;
  isActive: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

const rolePermissions: Record<string, string[]> = {
  admin: [
    "manage_users",
    "manage_institution",
    "view_all_data",
    "edit_all_data",
    "manage_timetables",
    "manage_courses",
    "manage_staff",
    "manage_students",
    "manage_attendance",
    "manage_integrations",
    "view_reports",
    "manage_classrooms",
    "manage_grades",
  ],
  teacher: [
    "view_students",
    "manage_attendance",
    "view_timetables",
    "manage_grades",
    "view_courses",
    "view_classrooms",
  ],
  staff: [
    "view_students",
    "view_staff",
    "view_timetables",
    "view_courses",
    "manage_attendance",
  ],
  student: [
    "view_own_data",
    "view_timetables",
    "view_grades",
    "view_attendance",
  ],
};

const availableRoles = [
  { value: "admin", label: "Administrator", description: "Full system access" },
  { value: "teacher", label: "Teacher", description: "Academic and student management" },
  { value: "staff", label: "Staff", description: "Administrative access" },
  { value: "student", label: "Student", description: "Limited access to personal data" },
];

export default function UserManagement() {
  const { user, institution } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const form = useForm<UserRoleFormData>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      role: "",
      permissions: [],
    },
  });

  // Fetch users by role
  const { data: allUsers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/institution", institution?.id],
    queryFn: () => apiRequest(`/api/users/institution/${institution?.id}`),
    enabled: !!institution?.id && user?.role === "admin",
  });

  // Fetch users by specific role
  const { data: roleUsers } = useQuery<User[]>({
    queryKey: ["/api/users/institution", institution?.id, "role", selectedRole],
    queryFn: () => apiRequest(`/api/users/institution/${institution?.id}?role=${selectedRole}`),
    enabled: !!institution?.id && !!selectedRole,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserRoleFormData }) => {
      return apiRequest(`/api/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/institution", institution?.id] });
      setIsDialogOpen(false);
      setSelectedUser(null);
      form.reset();
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleRoleUpdate = (data: UserRoleFormData) => {
    if (!selectedUser) return;
    updateRoleMutation.mutate({ userId: selectedUser.id, data });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    form.reset({
      role: user.role,
      permissions: user.permissions || rolePermissions[user.role] || [],
    });
    setIsDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: "default" as const, icon: Crown },
      teacher: { variant: "secondary" as const, icon: UserIcon },
      staff: { variant: "outline" as const, icon: Users },
      student: { variant: "outline" as const, icon: UserIcon },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { variant: "outline" as const, icon: UserIcon };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUsersByRole = (role: string) => {
    return allUsers?.filter(user => user.role === role) || [];
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access user management. Only administrators can manage users.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(selectedUser.username)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedUser.username}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleRoleUpdate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableRoles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{role.label}</span>
                                    <span className="text-sm text-gray-500">{role.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Permissions</FormLabel>
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                        <div className="space-y-2">
                          {form.watch("role") && rolePermissions[form.watch("role")]?.map((permission) => (
                            <div key={permission} className="flex items-center justify-between">
                              <label className="text-sm font-medium">
                                {permission.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </label>
                              <Switch
                                checked={form.watch("permissions")?.includes(permission)}
                                onCheckedChange={(checked) => {
                                  const current = form.watch("permissions") || [];
                                  if (checked) {
                                    form.setValue("permissions", [...current, permission]);
                                  } else {
                                    form.setValue("permissions", current.filter(p => p !== permission));
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateRoleMutation.isPending}>
                        Update Role
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="teacher">Teachers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="student">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {availableRoles.map((role) => {
              const count = getUsersByRole(role.value).length;
              return (
                <Card key={role.value} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.label}</CardTitle>
                      {getRoleBadge(role.value)}
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <p className="text-sm text-gray-600">users</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Overview of all users in the institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {availableRoles.map((role) => (
          <TabsContent key={role.value} value={role.value}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {role.label}s
                </CardTitle>
                <CardDescription>
                  Manage users with {role.label.toLowerCase()} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getUsersByRole(role.value).map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">{user.username}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.isActive ? "default" : "secondary"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {getUsersByRole(role.value).length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {role.label.toLowerCase()}s found
                      </h3>
                      <p className="text-gray-600">
                        No users with the {role.label.toLowerCase()} role have been assigned yet.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}