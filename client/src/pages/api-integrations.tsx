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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit3, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const integrationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  endpoint: z.string().url("Must be a valid URL"),
  apiKey: z.string().optional(),
  configuration: z.string().optional(),
  isActive: z.boolean().default(true),
});

type IntegrationFormData = z.infer<typeof integrationFormSchema>;

interface ApiIntegration {
  id: number;
  name: string;
  type: string;
  endpoint: string;
  apiKey?: string;
  configuration?: any;
  isActive: boolean;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApiIntegrations() {
  const { user, institution } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<ApiIntegration | null>(null);

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      name: "",
      type: "",
      endpoint: "",
      apiKey: "",
      configuration: "",
      isActive: true,
    },
  });

  const { data: integrations, isLoading } = useQuery<ApiIntegration[]>({
    queryKey: ["/api/integrations", institution?.id],
    queryFn: () => apiRequest(`/api/integrations/${institution?.id}`),
    enabled: !!institution?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: IntegrationFormData) => {
      const payload = {
        ...data,
        institutionId: institution?.id,
        configuration: data.configuration ? JSON.parse(data.configuration) : null,
      };
      return apiRequest("/api/integrations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations", institution?.id] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Integration created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create integration",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IntegrationFormData> }) => {
      const payload = {
        ...data,
        configuration: data.configuration ? JSON.parse(data.configuration) : null,
      };
      return apiRequest(`/api/integrations/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations", institution?.id] });
      setIsDialogOpen(false);
      setEditingIntegration(null);
      form.reset();
      toast({
        title: "Success",
        description: "Integration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update integration",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/integrations/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations", institution?.id] });
      toast({
        title: "Success",
        description: "Integration deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete integration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: IntegrationFormData) => {
    if (editingIntegration) {
      updateMutation.mutate({ id: editingIntegration.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (integration: ApiIntegration) => {
    setEditingIntegration(integration);
    form.reset({
      name: integration.name,
      type: integration.type,
      endpoint: integration.endpoint,
      apiKey: integration.apiKey || "",
      configuration: integration.configuration ? JSON.stringify(integration.configuration, null, 2) : "",
      isActive: integration.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this integration?")) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return <Activity className="h-4 w-4" />;
      case "lms":
        return <CheckCircle className="h-4 w-4" />;
      case "sis":
        return <Edit3 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (isActive: boolean, lastSync?: string) => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (lastSync) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="outline">Not Synced</Badge>;
  };

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
          <h1 className="text-2xl font-bold">API Integrations</h1>
          <p className="text-gray-600">Manage external system integrations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingIntegration(null);
              form.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIntegration ? "Edit Integration" : "Add New Integration"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Integration name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="attendance">Attendance System</SelectItem>
                            <SelectItem value="lms">Learning Management System</SelectItem>
                            <SelectItem value="sis">Student Information System</SelectItem>
                            <SelectItem value="finance">Finance System</SelectItem>
                            <SelectItem value="hr">HR System</SelectItem>
                            <SelectItem value="library">Library System</SelectItem>
                            <SelectItem value="transport">Transport System</SelectItem>
                            <SelectItem value="cafeteria">Cafeteria System</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Endpoint</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter API key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="configuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuration (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"timeout": 30, "retries": 3}'
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-gray-500">
                          Enable this integration
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingIntegration ? "Update" : "Create"} Integration
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations?.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(integration.type)}
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                {getStatusBadge(integration.isActive, integration.lastSync)}
              </div>
              <CardDescription className="capitalize">{integration.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Endpoint:</span>
                  <div className="text-gray-600 break-all">{integration.endpoint}</div>
                </div>
                {integration.lastSync && (
                  <div className="text-sm">
                    <span className="font-medium">Last Sync:</span>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(integration.lastSync).toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(integration)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(integration.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {integrations?.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations configured</h3>
          <p className="text-gray-600 mb-4">
            Add your first API integration to connect with external systems
          </p>
        </div>
      )}
    </div>
  );
}