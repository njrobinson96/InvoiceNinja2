import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileMenu from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import ClientForm from "@/components/clients/client-form";

export default function ClientCreatePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

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
                  onClick={() => navigate("/clients")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to clients
                </Button>
              </div>
              
              <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-gray-900">Add New Client</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a new client to your client list
                  </p>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg">
                <ClientForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
