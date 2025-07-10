import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ApiIntegrations from "@/pages/api-integrations";
import Attendance from "@/pages/attendance";
import UserManagement from "@/pages/user-management";
import InstitutionSetup from "@/pages/institution-setup";
import Courses from "@/pages/courses";
import Timetable from "@/pages/timetable";
import Students from "@/pages/students";
import Staff from "@/pages/staff";
import Classrooms from "@/pages/classrooms";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/setup" component={InstitutionSetup} />
      <Route path="/courses" component={Courses} />
      <Route path="/timetable" component={Timetable} />
      <Route path="/students" component={Students} />
      <Route path="/staff" component={Staff} />
      <Route path="/classrooms" component={Classrooms} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/api-integrations" component={ApiIntegrations} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/user-management" component={UserManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
