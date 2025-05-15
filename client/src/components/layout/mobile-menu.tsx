import { Link, useLocation } from "wouter";
import { File, LayoutDashboard, FilePen, Users, PieChart, Settings, X, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/invoices", label: "Invoices", icon: FilePen },
  { path: "/recurring-templates", label: "Recurring Billing", icon: CalendarClock },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/reports", label: "Reports", icon: PieChart },
  { path: "/settings", label: "Settings", icon: Settings },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Extract initials from the business name or username
  const getInitials = () => {
    if (user?.businessName) {
      return user.businessName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.username.substring(0, 2).toUpperCase() || "US";
  };
  
  const getPlanText = () => {
    switch(user?.plan) {
      case 'free':
        return 'Free Plan';
      case 'professional':
        return 'Professional Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      default:
        return 'Free Plan';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={onClose}></div>
      
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-800">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button 
            type="button" 
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <File className="text-white mr-2" />
            <span className="text-white font-semibold text-lg">InvoiceFlow</span>
          </div>
          
          <nav className="mt-5 px-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
              >
                <a
                  className={cn(
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                    location === item.path
                      ? "bg-primary-700 text-white"
                      : "text-primary-100 hover:bg-primary-700 hover:text-white"
                  )}
                  onClick={onClose}
                >
                  <item.icon 
                    className={cn(
                      "mr-4 h-5 w-5",
                      location === item.path
                        ? "text-primary-300"
                        : "text-primary-300"
                    )} 
                  />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
          <div className="flex-shrink-0 group block">
            <div className="flex items-center">
              <div>
                <Avatar className="h-10 w-10 rounded-full">
                  <AvatarFallback className="bg-primary-100 text-primary-600">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-white">
                  {user?.businessName || user?.username}
                </p>
                <p className="text-sm font-medium text-primary-200">
                  {getPlanText()}
                </p>
              </div>
              <button 
                onClick={() => {
                  logoutMutation.mutate();
                  onClose();
                }}
                className="ml-auto text-primary-200 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 w-14"></div>
    </div>
  );
}
