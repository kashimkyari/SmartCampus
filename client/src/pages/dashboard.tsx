import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import TimetableOverview from "@/components/dashboard/timetable-overview";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivities from "@/components/dashboard/recent-activities";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, institution, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to onboarding if institution is not configured
    if (!isLoading && (!institution || !institution.isConfigured)) {
      setLocation("/");
    }
  }, [user, institution, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !institution?.isConfigured) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold leading-7 text-secondary-900 sm:text-4xl sm:truncate">
                  Dashboard
                </h2>
                <p className="mt-1 text-sm text-secondary-500">
                  Welcome back! Here's what's happening at {institution.name} today.
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Export Report
                </button>
                <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                  Quick Actions
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weekly Timetable Overview */}
            <div className="lg:col-span-2">
              <TimetableOverview />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <QuickActions />
              <RecentActivities />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
