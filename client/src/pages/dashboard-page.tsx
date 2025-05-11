import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileMenu from "@/components/layout/mobile-menu";
import FinancialMetrics from "@/components/dashboard/financial-metrics";
import MonthlyRevenue from "@/components/dashboard/monthly-revenue";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import UpcomingPayments from "@/components/dashboard/upcoming-payments";
import SubscriptionOverview from "@/components/dashboard/subscription-overview";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    enabled: !!user,
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Welcome back, {user?.businessName || user?.username}. Here's an overview of your business.
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <Button variant="outline" className="mr-3">
                    <FileDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Link href="/invoices/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Invoice
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="mt-8 text-center">
                  <p className="text-red-500">Error loading dashboard data. Please try again later.</p>
                </div>
              ) : (
                <>
                  <FinancialMetrics 
                    pendingAmount={metrics?.pendingAmount || 0}
                    paidAmount={metrics?.paidAmount || 0}
                    overdueAmount={metrics?.overdueAmount || 0}
                    totalClients={metrics?.totalClients || 0}
                  />
                  
                  <MonthlyRevenue />
                  
                  <RecentInvoices invoices={metrics?.recentInvoices || []} />
                  
                  <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <UpcomingPayments payments={metrics?.upcomingPayments || []} />
                    <SubscriptionOverview plan={user?.plan || "free"} />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
