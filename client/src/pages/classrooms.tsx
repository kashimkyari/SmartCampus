
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { DoorOpen, Plus, Search, Users, Monitor, Wifi, Edit, Trash2, MapPin } from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: string;
  location: string;
  floor: string;
  equipment: string[];
  status: string;
  description: string;
  createdAt: string;
}

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    capacity: "",
    type: "",
    location: "",
    floor: "",
    equipment: "",
    description: "",
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/classrooms", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classrooms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingClassroom ? "PUT" : "POST";
      const url = editingClassroom ? `/api/classrooms/${editingClassroom.id}` : "/api/classrooms";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          equipment: formData.equipment.split(",").map(e => e.trim()).filter(e => e),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Classroom ${editingClassroom ? "updated" : "created"} successfully`,
        });
        setIsDialogOpen(false);
        setEditingClassroom(null);
        setFormData({
          name: "",
          code: "",
          capacity: "",
          type: "",
          location: "",
          floor: "",
          equipment: "",
          description: "",
        });
        fetchClassrooms();
      } else {
        throw new Error("Failed to save classroom");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save classroom",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      name: classroom.name,
      code: classroom.code,
      capacity: classroom.capacity.toString(),
      type: classroom.type,
      location: classroom.location,
      floor: classroom.floor,
      equipment: classroom.equipment.join(", "),
      description: classroom.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this classroom?")) return;
    
    try {
      const response = await fetch(`/api/classrooms/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Classroom deleted successfully",
        });
        fetchClassrooms();
      } else {
        throw new Error("Failed to delete classroom");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete classroom",
        variant: "destructive",
      });
    }
  };

  const filteredClassrooms = classrooms.filter(classroom => 
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "occupied": return "bg-red-100 text-red-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "lecture": return "bg-blue-100 text-blue-800";
      case "laboratory": return "bg-purple-100 text-purple-800";
      case "workshop": return "bg-orange-100 text-orange-800";
      case "library": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900">Classrooms</h2>
              <p className="mt-1 text-sm text-secondary-500">
                Manage learning spaces and facilities
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingClassroom(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Classroom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingClassroom ? "Edit Classroom" : "Add New Classroom"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Classroom Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Classroom Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lecture">Lecture Hall</SelectItem>
                          <SelectItem value="laboratory">Laboratory</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="library">Library</SelectItem>
                          <SelectItem value="auditorium">Auditorium</SelectItem>
                          <SelectItem value="gymnasium">Gymnasium</SelectItem>
                          <SelectItem value="conference">Conference Room</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Main Building, Science Block"
                      />
                    </div>
                    <div>
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        placeholder="e.g., Ground Floor, 2nd Floor"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                    <Input
                      id="equipment"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      placeholder="e.g., Projector, Whiteboard, Computers"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional notes about the classroom"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingClassroom ? "Update Classroom" : "Add Classroom"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classrooms by name, code, type, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Classrooms Grid */}
          {isLoading ? (
            <div className="text-center py-8">Loading classrooms...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClassrooms.map((classroom) => (
                <Card key={classroom.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{classroom.name}</CardTitle>
                        <p className="text-sm text-gray-500">{classroom.code}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(classroom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(classroom.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge className={getTypeColor(classroom.type)}>
                          {classroom.type}
                        </Badge>
                        <Badge className={getStatusColor(classroom.status)}>
                          {classroom.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Capacity: {classroom.capacity} students
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {classroom.location} {classroom.floor && `• ${classroom.floor}`}
                      </div>
                      
                      {classroom.equipment && classroom.equipment.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Equipment:</p>
                          <div className="flex flex-wrap gap-1">
                            {classroom.equipment.map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {classroom.description && (
                        <div className="text-sm text-gray-600 mt-2">
                          <p className="font-medium">Description:</p>
                          <p className="text-xs">{classroom.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
