import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  CreditCard,
  Menu,
  Package
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  const NavContent = () => (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`
              flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }
            `}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200 shadow-sm">
          <div className="flex items-center px-6 py-6 border-b border-slate-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-slate-900">FinanceHub</h1>
                <p className="text-sm text-slate-500">Credit Manager</p>
              </div>
            </div>
          </div>
          <NavContent />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white shadow-lg border"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full bg-white">
              <div className="flex items-center px-6 py-6 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-slate-900">FinanceHub</h1>
                    <p className="text-sm text-slate-500">Credit Manager</p>
                  </div>
                </div>
              </div>
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}