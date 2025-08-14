import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminGroups from "@/pages/admin/groups";
import AdminStudents from "@/pages/admin/students";
import AdminAttendance from "@/pages/admin/attendance";
import AdminMedals from "@/pages/admin/medals";
import AdminMarketplace from "@/pages/admin/marketplace";
import StudentDashboard from "@/pages/student/dashboard";
import StudentAttendance from "@/pages/student/attendance";
import StudentMedals from "@/pages/student/medals";
import StudentMarketplace from "@/pages/student/marketplace";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/groups" component={AdminGroups} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/attendance" component={AdminAttendance} />
      <Route path="/admin/medals" component={AdminMedals} />
      <Route path="/admin/marketplace" component={AdminMarketplace} />
      
      {/* Student Routes */}
      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/attendance" component={StudentAttendance} />
      <Route path="/student/medals" component={StudentMedals} />
      <Route path="/student/marketplace" component={StudentMarketplace} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
