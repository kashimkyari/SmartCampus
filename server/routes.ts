import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertInstitutionSchema, insertFacultySchema, 
  insertDepartmentSchema, insertAcademicStaffSchema, insertStudentSchema,
  insertCourseSchema, insertClassroomSchema, insertTimeSlotSchema,
  insertTimetableSlotSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "smartcampus-secret-key-2024";

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, role = "admin" } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role,
      });

      // Generate token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const institution = user.institutionId ? await storage.getInstitution(user.institutionId) : null;
      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, institution });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Institution routes
  app.post("/api/institutions", authenticateToken, async (req: any, res) => {
    try {
      const institutionData = insertInstitutionSchema.parse(req.body);
      const institution = await storage.createInstitution(institutionData);
      
      // Update user's institutionId
      await storage.updateUser(req.user.id, { institutionId: institution.id });
      
      // Log activity
      await storage.logActivity({
        institutionId: institution.id,
        userId: req.user.id,
        action: "institution_created",
        description: `Institution "${institution.name}" created`,
        metadata: { institutionType: institution.type, educationSystem: institution.educationSystem }
      });

      res.json(institution);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/institutions/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const institution = await storage.getInstitution(id);
      if (!institution) {
        return res.status(404).json({ message: "Institution not found" });
      }
      res.json(institution);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/institutions/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const institution = await storage.updateInstitution(id, updateData);
      if (!institution) {
        return res.status(404).json({ message: "Institution not found" });
      }
      res.json(institution);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/institutions/:id/configure", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markInstitutionConfigured(id);
      
      // Log activity
      await storage.logActivity({
        institutionId: id,
        userId: req.user.id,
        action: "institution_configured",
        description: "Institution setup completed",
        metadata: {}
      });

      res.json({ message: "Institution configured successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Faculty routes
  app.get("/api/institutions/:institutionId/faculties", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const faculties = await storage.getFacultiesByInstitution(institutionId);
      res.json(faculties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/faculties", authenticateToken, async (req: any, res) => {
    try {
      const facultyData = insertFacultySchema.parse(req.body);
      const faculty = await storage.createFaculty(facultyData);
      
      // Log activity
      await storage.logActivity({
        institutionId: faculty.institutionId,
        userId: req.user.id,
        action: "faculty_created",
        description: `Faculty "${faculty.name}" created`,
        metadata: { facultyId: faculty.id }
      });

      res.json(faculty);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Department routes
  app.get("/api/institutions/:institutionId/departments", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const departments = await storage.getDepartmentsByInstitution(institutionId);
      res.json(departments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/departments", authenticateToken, async (req: any, res) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      
      // Log activity
      await storage.logActivity({
        institutionId: department.institutionId,
        userId: req.user.id,
        action: "department_created",
        description: `Department "${department.name}" created`,
        metadata: { departmentId: department.id }
      });

      res.json(department);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Academic Staff routes
  app.get("/api/institutions/:institutionId/staff", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const staff = await storage.getAcademicStaffByInstitution(institutionId);
      res.json(staff);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/staff", authenticateToken, async (req: any, res) => {
    try {
      const staffData = insertAcademicStaffSchema.parse(req.body);
      const staff = await storage.createAcademicStaff(staffData);
      
      // Log activity
      await storage.logActivity({
        institutionId: staff.institutionId,
        userId: req.user.id,
        action: "staff_created",
        description: `Academic staff member created`,
        metadata: { staffId: staff.id }
      });

      res.json(staff);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Student routes
  app.get("/api/institutions/:institutionId/students", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const students = await storage.getStudentsByInstitution(institutionId);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/students", authenticateToken, async (req: any, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      
      // Log activity
      await storage.logActivity({
        institutionId: student.institutionId,
        userId: req.user.id,
        action: "student_created",
        description: `Student ${student.studentId} enrolled`,
        metadata: { studentId: student.id }
      });

      res.json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Course routes
  app.get("/api/institutions/:institutionId/courses", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const courses = await storage.getCoursesByInstitution(institutionId);
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", authenticateToken, async (req: any, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      
      // Log activity
      await storage.logActivity({
        institutionId: course.institutionId,
        userId: req.user.id,
        action: "course_created",
        description: `Course "${course.name}" (${course.courseCode}) created`,
        metadata: { courseId: course.id }
      });

      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Classroom routes
  app.get("/api/institutions/:institutionId/classrooms", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const classrooms = await storage.getClassroomsByInstitution(institutionId);
      res.json(classrooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/classrooms", authenticateToken, async (req: any, res) => {
    try {
      const classroomData = insertClassroomSchema.parse(req.body);
      const classroom = await storage.createClassroom(classroomData);
      
      // Log activity
      await storage.logActivity({
        institutionId: classroom.institutionId,
        userId: req.user.id,
        action: "classroom_created",
        description: `Classroom ${classroom.roomNumber} created`,
        metadata: { classroomId: classroom.id }
      });

      res.json(classroom);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Time Slots routes
  app.get("/api/institutions/:institutionId/time-slots", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const timeSlots = await storage.getTimeSlotsByInstitution(institutionId);
      res.json(timeSlots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/time-slots", authenticateToken, async (req: any, res) => {
    try {
      const timeSlotData = insertTimeSlotSchema.parse(req.body);
      const timeSlot = await storage.createTimeSlot(timeSlotData);
      res.json(timeSlot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Timetable routes
  app.get("/api/institutions/:institutionId/timetable", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const timetableSlots = await storage.getTimetableSlotsByInstitution(institutionId);
      res.json(timetableSlots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/timetable", authenticateToken, async (req: any, res) => {
    try {
      const slotData = insertTimetableSlotSchema.parse(req.body);
      const slot = await storage.createTimetableSlot(slotData);
      
      // Log activity
      await storage.logActivity({
        institutionId: slot.institutionId,
        userId: req.user.id,
        action: "timetable_updated",
        description: "Timetable slot created",
        metadata: { slotId: slot.id }
      });

      res.json(slot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Statistics routes
  app.get("/api/institutions/:institutionId/stats", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const stats = await storage.getInstitutionStats(institutionId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activities routes
  app.get("/api/institutions/:institutionId/activities", authenticateToken, async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivities(institutionId, limit);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
