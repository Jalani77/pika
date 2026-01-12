import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calculator, Calendar, BookOpen, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

const Layout = () => {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/grades", icon: Calculator, label: "Grade Architect" },
    { to: "/syllabus", icon: BookOpen, label: "Syllabus" },
    { to: "/planner", icon: Calendar, label: "Study Planner" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-4 flex flex-col flex-shrink-0">
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Pika</h1>
          <p className="text-xs text-muted-foreground">Student Dashboard</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
