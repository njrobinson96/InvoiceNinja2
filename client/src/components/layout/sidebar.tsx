import { Link, useLocation } from "wouter";
import { File, LayoutDashboard, FilePen, Users, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/invoices", label: "Invoices", icon: FilePen },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/reports", label: "Reports", icon: PieChart },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
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

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-primary-800">
        <div className="flex items-center justify-center h-16 px-4 bg-primary-900">
          <div className="flex items-center">
            <File className="text-white mr-2" />
            <span className="text-white font-semibold text-lg">InvoiceFlow</span>
          </div>
        </div>
        
        <div className="h-0 flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-4 space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
              >
                <a className={cn(
                  "group flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  location === item.path
                    ? "bg-primary-700 text-white"
                    : "text-primary-100 hover:bg-primary-700 hover:text-white"
                )}>
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5",
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
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <Avatar className="h-9 w-9 rounded-full">
                  <AvatarFallback className="bg-primary-100 text-primary-600">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.businessName || user?.username}
                </p>
                <p className="text-xs font-medium text-primary-200">
                  {getPlanText()}
                </p>
              </div>
              <button 
                onClick={() => logoutMutation.mutate()}
                className="ml-auto text-primary-200 hover:text-white text-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
