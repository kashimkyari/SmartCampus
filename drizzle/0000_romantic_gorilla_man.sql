CREATE TABLE "academic_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"institution_id" integer NOT NULL,
	"department_id" integer,
	"rank" varchar(100),
	"specializations" text[],
	"research_areas" text[],
	"teaching_load" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"institution_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"institution_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"endpoint" text NOT NULL,
	"api_key" text,
	"configuration" json,
	"is_active" boolean DEFAULT true,
	"last_sync" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"institution_id" integer NOT NULL,
	"date" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"biometric_id" varchar(255),
	"device_id" varchar(255),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_number" varchar(50) NOT NULL,
	"institution_id" integer NOT NULL,
	"building" varchar(255),
	"capacity" integer NOT NULL,
	"equipment" text[],
	"room_type" varchar(50) DEFAULT 'lecture',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"institution_id" integer NOT NULL,
	"department_id" integer,
	"credits" integer DEFAULT 3,
	"hours_per_week" integer DEFAULT 3,
	"difficulty_weight" integer DEFAULT 5,
	"prerequisites" text[],
	"lecturer_id" integer,
	"assessment_structure" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"institution_id" integer NOT NULL,
	"faculty_id" integer,
	"head_id" integer,
	"staff_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"institution_id" integer NOT NULL,
	"dean_id" integer,
	"budget_allocation" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"semester" varchar(20) NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"grades" json,
	"attendance" varchar(10) DEFAULT '100%',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"education_system" varchar(50) NOT NULL,
	"location" text,
	"size" varchar(50),
	"academic_calendar" json,
	"structure" json,
	"is_configured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"semester" varchar(20) NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"enrollment_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"institution_id" integer NOT NULL,
	"student_id" varchar(50) NOT NULL,
	"program" varchar(255),
	"year_of_study" integer,
	"academic_standing" varchar(50) DEFAULT 'good',
	"gpa" numeric(3, 2),
	"credits" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "time_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"institution_id" integer NOT NULL,
	"day" varchar(20) NOT NULL,
	"start_time" varchar(10) NOT NULL,
	"end_time" varchar(10) NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"institution_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"classroom_id" integer NOT NULL,
	"time_slot_id" integer NOT NULL,
	"lecturer_id" integer NOT NULL,
	"student_groups" text[],
	"efficiency_score" numeric(3, 2) DEFAULT '0.85',
	"weather_factor" numeric(3, 2) DEFAULT '1.00',
	"academic_year" varchar(20) NOT NULL,
	"semester" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"institution_id" integer,
	"is_active" boolean DEFAULT true,
	"permissions" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
