import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import ActiveTournament from "@/components/dashboard/ActiveTournament";
import RecentMatches from "@/components/dashboard/RecentMatches";

export default function PlayerDashboard() {
  return (
    <DashboardLayout>

      <StatsCards />

      <div className="grid lg:grid-cols-2 gap-8 mt-8">

        <ActiveTournament />

        <RecentMatches />

      </div>

    </DashboardLayout>
  );
}