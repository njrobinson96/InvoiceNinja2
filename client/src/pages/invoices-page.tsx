import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileMenu from "@/components/layout/mobile-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InvoiceList from "@/components/invoices/invoice-list";
import { Link } from "wouter";

export default function InvoicesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const filteredInvoices = invoices?.filter((invoice: any) => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your invoices and track payment status
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <Link href="/invoices/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="mt-6 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search invoices by number..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <InvoiceList 
                  invoices={filteredInvoices} 
                  isLoading={isLoading} 
                  error={error}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
