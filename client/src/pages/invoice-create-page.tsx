import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileMenu from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import InvoiceForm from "@/components/invoices/invoice-form";

export default function InvoiceCreatePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  className="flex items-center text-gray-600"
                  onClick={() => navigate("/invoices")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to invoices
                </Button>
              </div>
              
              <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a new invoice for your client
                  </p>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg">
                <InvoiceForm clients={clients || []} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
