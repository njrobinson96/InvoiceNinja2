import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  
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

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
        <button 
          type="button" 
          className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:flex bg-white shadow-sm z-10">
        <div className="flex-1 px-4 py-4 flex justify-between">
          <div className="flex-1 flex">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2"
                  placeholder="Search"
                  type="search"
                />
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button 
                  type="button" 
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" 
                  id="user-menu-button" 
                  aria-expanded="false" 
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarFallback className="bg-primary-100 text-primary-600">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
