import { 
  users, institutions, faculties, departments, academicStaff, students, 
  courses, classrooms, timeSlots, timetableSlots, studentEnrollments, 
  gradeRecords, activitiesLog, attendanceRecords, apiIntegrations,
  type User, type InsertUser, type Institution, type InsertInstitution,
  type Faculty, type InsertFaculty, type Department, type InsertDepartment,
  type AcademicStaff, type InsertAcademicStaff, type Student, type InsertStudent,
  type Course, type InsertCourse, type Classroom, type InsertClassroom,
  type TimeSlot, type InsertTimeSlot, type TimetableSlot, type InsertTimetableSlot,
  type ActivityLog, type InsertActivityLog, type AttendanceRecord, type InsertAttendanceRecord,
  type ApiIntegration, type InsertApiIntegration
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Institution operations
  getInstitution(id: number): Promise<Institution | undefined>;
  getInstitutionByUserId(userId: number): Promise<Institution | undefined>;
  createInstitution(institution: InsertInstitution): Promise<Institution>;
  updateInstitution(id: number, institution: Partial<InsertInstitution>): Promise<Institution | undefined>;
  markInstitutionConfigured(id: number): Promise<void>;

  // Faculty operations
  getFacultiesByInstitution(institutionId: number): Promise<Faculty[]>;
  createFaculty(faculty: InsertFaculty): Promise<Faculty>;

  // Department operations
  getDepartmentsByInstitution(institutionId: number): Promise<Department[]>;
  getDepartmentsByFaculty(facultyId: number): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Academic Staff operations
  getAcademicStaffByInstitution(institutionId: number): Promise<AcademicStaff[]>;
  createAcademicStaff(staff: InsertAcademicStaff): Promise<AcademicStaff>;

  // Student operations
  getStudentsByInstitution(institutionId: number): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;

  // Course operations
  getCoursesByInstitution(institutionId: number): Promise<Course[]>;
  getCoursesByDepartment(departmentId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Classroom operations
  getClassroomsByInstitution(institutionId: number): Promise<Classroom[]>;
  createClassroom(classroom: InsertClassroom): Promise<Classroom>;

  // Time Slot operations
  getTimeSlotsByInstitution(institutionId: number): Promise<TimeSlot[]>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;

  // Timetable operations
  getTimetableSlotsByInstitution(institutionId: number): Promise<TimetableSlot[]>;
  createTimetableSlot(slot: InsertTimetableSlot): Promise<TimetableSlot>;

  // Statistics
  getInstitutionStats(institutionId: number): Promise<{
    totalStudents: number;
    activeCourses: number;
    facultyMembers: number;
    classroomUsage: number;
  }>;

  // Activity Log
  getRecentActivities(institutionId: number, limit?: number): Promise<ActivityLog[]>;
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;

  // Attendance operations
  getAttendanceByStudent(studentId: number, date?: string): Promise<AttendanceRecord[]>;
  getAttendanceByInstitution(institutionId: number, date?: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: number, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined>;

  // API Integration operations
  getApiIntegrations(institutionId: number): Promise<ApiIntegration[]>;
  createApiIntegration(integration: InsertApiIntegration): Promise<ApiIntegration>;
  updateApiIntegration(id: number, integration: Partial<InsertApiIntegration>): Promise<ApiIntegration | undefined>;
  deleteApiIntegration(id: number): Promise<void>;

  // User management with role editing
  updateUserRole(userId: number, role: string, permissions?: string[]): Promise<User | undefined>;
  getUsersByRole(institutionId: number, role: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Institution operations
  async getInstitution(id: number): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution || undefined;
  }

  async getInstitutionByUserId(userId: number): Promise<Institution | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.institutionId) return undefined;
    
    return this.getInstitution(user.institutionId);
  }

  async createInstitution(insertInstitution: InsertInstitution): Promise<Institution> {
    const [institution] = await db.insert(institutions).values(insertInstitution).returning();
    return institution;
  }

  async updateInstitution(id: number, updateData: Partial<InsertInstitution>): Promise<Institution | undefined> {
    const [institution] = await db
      .update(institutions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(institutions.id, id))
      .returning();
    return institution || undefined;
  }

  async markInstitutionConfigured(id: number): Promise<void> {
    await db
      .update(institutions)
      .set({ isConfigured: true, updatedAt: new Date() })
      .where(eq(institutions.id, id));
  }

  // Faculty operations
  async getFacultiesByInstitution(institutionId: number): Promise<Faculty[]> {
    return db.select().from(faculties).where(eq(faculties.institutionId, institutionId));
  }

  async createFaculty(insertFaculty: InsertFaculty): Promise<Faculty> {
    const [faculty] = await db.insert(faculties).values(insertFaculty).returning();
    return faculty;
  }

  // Department operations
  async getDepartmentsByInstitution(institutionId: number): Promise<Department[]> {
    return db.select().from(departments).where(eq(departments.institutionId, institutionId));
  }

  async getDepartmentsByFaculty(facultyId: number): Promise<Department[]> {
    return db.select().from(departments).where(eq(departments.facultyId, facultyId));
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }

  // Academic Staff operations
  async getAcademicStaffByInstitution(institutionId: number): Promise<AcademicStaff[]> {
    return db.select().from(academicStaff).where(eq(academicStaff.institutionId, institutionId));
  }

  async createAcademicStaff(insertStaff: InsertAcademicStaff): Promise<AcademicStaff> {
    const [staff] = await db.insert(academicStaff).values(insertStaff).returning();
    return staff;
  }

  // Student operations
  async getStudentsByInstitution(institutionId: number): Promise<Student[]> {
    return db.select().from(students).where(eq(students.institutionId, institutionId));
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  // Course operations
  async getCoursesByInstitution(institutionId: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.institutionId, institutionId));
  }

  async getCoursesByDepartment(departmentId: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.departmentId, departmentId));
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  // Classroom operations
  async getClassroomsByInstitution(institutionId: number): Promise<Classroom[]> {
    return db.select().from(classrooms).where(eq(classrooms.institutionId, institutionId));
  }

  async createClassroom(insertClassroom: InsertClassroom): Promise<Classroom> {
    const [classroom] = await db.insert(classrooms).values(insertClassroom).returning();
    return classroom;
  }

  // Time Slot operations
  async getTimeSlotsByInstitution(institutionId: number): Promise<TimeSlot[]> {
    return db.select().from(timeSlots).where(eq(timeSlots.institutionId, institutionId));
  }

  async createTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [timeSlot] = await db.insert(timeSlots).values(insertTimeSlot).returning();
    return timeSlot;
  }

  // Timetable operations
  async getTimetableSlotsByInstitution(institutionId: number): Promise<TimetableSlot[]> {
    return db.select().from(timetableSlots).where(eq(timetableSlots.institutionId, institutionId));
  }

  async createTimetableSlot(insertSlot: InsertTimetableSlot): Promise<TimetableSlot> {
    const [slot] = await db.insert(timetableSlots).values(insertSlot).returning();
    return slot;
  }

  // Statistics
  async getInstitutionStats(institutionId: number): Promise<{
    totalStudents: number;
    activeCourses: number;
    facultyMembers: number;
    classroomUsage: number;
  }> {
    const [studentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(eq(students.institutionId, institutionId));

    const [courseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.institutionId, institutionId));

    const [staffCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(academicStaff)
      .where(eq(academicStaff.institutionId, institutionId));

    const [classroomCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(classrooms)
      .where(eq(classrooms.institutionId, institutionId));

    const [timetableCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timetableSlots)
      .where(eq(timetableSlots.institutionId, institutionId));

    const classroomUsage = classroomCount.count > 0 
      ? Math.round((timetableCount.count / (classroomCount.count * 40)) * 100) // 40 slots per week assumption
      : 0;

    return {
      totalStudents: studentCount.count || 0,
      activeCourses: courseCount.count || 0,
      facultyMembers: staffCount.count || 0,
      classroomUsage: Math.min(classroomUsage, 100),
    };
  }

  // Activity Log
  async getRecentActivities(institutionId: number, limit: number = 10): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activitiesLog)
      .where(eq(activitiesLog.institutionId, institutionId))
      .orderBy(desc(activitiesLog.createdAt))
      .limit(limit);
  }

  async logActivity(insertActivity: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db.insert(activitiesLog).values(insertActivity).returning();
    return activity;
  }

  // Attendance operations
  async getAttendanceByStudent(studentId: number, date?: string): Promise<AttendanceRecord[]> {
    if (date) {
      return db.select().from(attendanceRecords)
        .where(and(eq(attendanceRecords.studentId, studentId), eq(attendanceRecords.date, date)))
        .orderBy(desc(attendanceRecords.createdAt));
    }
    return db.select().from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, studentId))
      .orderBy(desc(attendanceRecords.createdAt));
  }

  async getAttendanceByInstitution(institutionId: number, date?: string): Promise<AttendanceRecord[]> {
    if (date) {
      return db.select().from(attendanceRecords)
        .where(and(eq(attendanceRecords.institutionId, institutionId), eq(attendanceRecords.date, date)))
        .orderBy(desc(attendanceRecords.createdAt));
    }
    return db.select().from(attendanceRecords)
      .where(eq(attendanceRecords.institutionId, institutionId))
      .orderBy(desc(attendanceRecords.createdAt));
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db.insert(attendanceRecords).values(insertRecord).returning();
    return record;
  }

  async updateAttendanceRecord(id: number, updateData: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const [record] = await db
      .update(attendanceRecords)
      .set(updateData)
      .where(eq(attendanceRecords.id, id))
      .returning();
    return record || undefined;
  }

  // API Integration operations
  async getApiIntegrations(institutionId: number): Promise<ApiIntegration[]> {
    return db.select().from(apiIntegrations).where(eq(apiIntegrations.institutionId, institutionId));
  }

  async createApiIntegration(insertIntegration: InsertApiIntegration): Promise<ApiIntegration> {
    const [integration] = await db.insert(apiIntegrations).values(insertIntegration).returning();
    return integration;
  }

  async updateApiIntegration(id: number, updateData: Partial<InsertApiIntegration>): Promise<ApiIntegration | undefined> {
    const [integration] = await db
      .update(apiIntegrations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(apiIntegrations.id, id))
      .returning();
    return integration || undefined;
  }

  async deleteApiIntegration(id: number): Promise<void> {
    await db.delete(apiIntegrations).where(eq(apiIntegrations.id, id));
  }

  // User management with role editing
  async updateUserRole(userId: number, role: string, permissions?: string[]): Promise<User | undefined> {
    const updateData: Partial<InsertUser> = { role };
    if (permissions) {
      updateData.permissions = permissions;
    }
    
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getUsersByRole(institutionId: number, role: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(and(eq(users.institutionId, institutionId), eq(users.role, role)));
  }
}

export const storage = new DatabaseStorage();
