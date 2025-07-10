import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, varchar, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  institutionId: integer("institution_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Institutions table
export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // high-school, university, technical, international
  educationSystem: varchar("education_system", { length: 50 }).notNull(), // british, american, ib, custom
  location: text("location"),
  size: varchar("size", { length: 50 }),
  academicCalendar: json("academic_calendar"),
  structure: json("structure"), // faculties, departments, grade levels
  isConfigured: boolean("is_configured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Faculties table (for universities)
export const faculties = pgTable("faculties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  institutionId: integer("institution_id").notNull(),
  deanId: integer("dean_id"),
  budgetAllocation: decimal("budget_allocation", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  institutionId: integer("institution_id").notNull(),
  facultyId: integer("faculty_id"),
  headId: integer("head_id"),
  staffCount: integer("staff_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Academic Staff table
export const academicStaff = pgTable("academic_staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionId: integer("institution_id").notNull(),
  departmentId: integer("department_id"),
  rank: varchar("rank", { length: 100 }),
  specializations: text("specializations").array(),
  researchAreas: text("research_areas").array(),
  teachingLoad: integer("teaching_load").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionId: integer("institution_id").notNull(),
  studentId: varchar("student_id", { length: 50 }).notNull().unique(),
  program: varchar("program", { length: 255 }),
  yearOfStudy: integer("year_of_study"),
  academicStanding: varchar("academic_standing", { length: 50 }).default("good"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  credits: integer("credits").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  courseCode: varchar("course_code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  institutionId: integer("institution_id").notNull(),
  departmentId: integer("department_id"),
  credits: integer("credits").default(3),
  hoursPerWeek: integer("hours_per_week").default(3),
  difficultyWeight: integer("difficulty_weight").default(5),
  prerequisites: text("prerequisites").array(),
  lecturerId: integer("lecturer_id"),
  assessmentStructure: json("assessment_structure"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Classrooms table
export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  roomNumber: varchar("room_number", { length: 50 }).notNull(),
  institutionId: integer("institution_id").notNull(),
  building: varchar("building", { length: 255 }),
  capacity: integer("capacity").notNull(),
  equipment: text("equipment").array(),
  roomType: varchar("room_type", { length: 50 }).default("lecture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Time Slots table
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  day: varchar("day", { length: 20 }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Timetable Slots table
export const timetableSlots = pgTable("timetable_slots", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  courseId: integer("course_id").notNull(),
  classroomId: integer("classroom_id").notNull(),
  timeSlotId: integer("time_slot_id").notNull(),
  lecturerId: integer("lecturer_id").notNull(),
  studentGroups: text("student_groups").array(),
  efficiencyScore: decimal("efficiency_score", { precision: 3, scale: 2 }).default("0.85"),
  weatherFactor: decimal("weather_factor", { precision: 3, scale: 2 }).default("1.00"),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student Enrollments table
export const studentEnrollments = pgTable("student_enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
});

// Grade Records table
export const gradeRecords = pgTable("grade_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  grades: json("grades"), // assignment1, midterm, final, overall
  attendance: varchar("attendance", { length: 10 }).default("100%"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activities Log table
export const activitiesLog = pgTable("activities_log", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  userId: integer("user_id").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  description: text("description").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id],
  }),
  academicStaff: one(academicStaff, {
    fields: [users.id],
    references: [academicStaff.userId],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  activities: many(activitiesLog),
}));

export const institutionsRelations = relations(institutions, ({ many }) => ({
  users: many(users),
  faculties: many(faculties),
  departments: many(departments),
  courses: many(courses),
  classrooms: many(classrooms),
  timeSlots: many(timeSlots),
  timetableSlots: many(timetableSlots),
  activities: many(activitiesLog),
}));

export const facultiesRelations = relations(faculties, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [faculties.institutionId],
    references: [institutions.id],
  }),
  dean: one(academicStaff, {
    fields: [faculties.deanId],
    references: [academicStaff.id],
  }),
  departments: many(departments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [departments.institutionId],
    references: [institutions.id],
  }),
  faculty: one(faculties, {
    fields: [departments.facultyId],
    references: [faculties.id],
  }),
  head: one(academicStaff, {
    fields: [departments.headId],
    references: [academicStaff.id],
  }),
  staff: many(academicStaff),
  courses: many(courses),
}));

export const academicStaffRelations = relations(academicStaff, ({ one, many }) => ({
  user: one(users, {
    fields: [academicStaff.userId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [academicStaff.institutionId],
    references: [institutions.id],
  }),
  department: one(departments, {
    fields: [academicStaff.departmentId],
    references: [departments.id],
  }),
  courses: many(courses),
  timetableSlots: many(timetableSlots),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [students.institutionId],
    references: [institutions.id],
  }),
  enrollments: many(studentEnrollments),
  grades: many(gradeRecords),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [courses.institutionId],
    references: [institutions.id],
  }),
  department: one(departments, {
    fields: [courses.departmentId],
    references: [departments.id],
  }),
  lecturer: one(academicStaff, {
    fields: [courses.lecturerId],
    references: [academicStaff.id],
  }),
  enrollments: many(studentEnrollments),
  grades: many(gradeRecords),
  timetableSlots: many(timetableSlots),
}));

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [classrooms.institutionId],
    references: [institutions.id],
  }),
  timetableSlots: many(timetableSlots),
}));

export const timeSlotsRelations = relations(timeSlots, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [timeSlots.institutionId],
    references: [institutions.id],
  }),
  timetableSlots: many(timetableSlots),
}));

export const timetableSlotsRelations = relations(timetableSlots, ({ one }) => ({
  institution: one(institutions, {
    fields: [timetableSlots.institutionId],
    references: [institutions.id],
  }),
  course: one(courses, {
    fields: [timetableSlots.courseId],
    references: [courses.id],
  }),
  classroom: one(classrooms, {
    fields: [timetableSlots.classroomId],
    references: [classrooms.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [timetableSlots.timeSlotId],
    references: [timeSlots.id],
  }),
  lecturer: one(academicStaff, {
    fields: [timetableSlots.lecturerId],
    references: [academicStaff.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacultySchema = createInsertSchema(faculties).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export const insertAcademicStaffSchema = createInsertSchema(academicStaff).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertClassroomSchema = createInsertSchema(classrooms).omit({
  id: true,
  createdAt: true,
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
  createdAt: true,
});

export const insertTimetableSlotSchema = createInsertSchema(timetableSlots).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activitiesLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutions.$inferSelect;
export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type Faculty = typeof faculties.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertAcademicStaff = z.infer<typeof insertAcademicStaffSchema>;
export type AcademicStaff = typeof academicStaff.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;
export type Classroom = typeof classrooms.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimetableSlot = z.infer<typeof insertTimetableSlotSchema>;
export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activitiesLog.$inferSelect;
