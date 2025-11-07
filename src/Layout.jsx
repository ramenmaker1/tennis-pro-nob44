
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Users, TrendingUp, BarChart3, Target, Brain, Upload, Shield, FileText, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ErrorBoundary from "./components/ErrorBoundary";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "Dashboard", group: "navigation" },
  { name: "Players", icon: Users, path: "Players", group: "navigation" },
  { name: "Match Analysis", icon: TrendingUp, path: "MatchAnalysis", group: "navigation" },
  { name: "Predictions", icon: Target, path: "Predictions", group: "navigation" },
  { name: "ML Dashboard", icon: Brain, path: "MLDashboard", group: "navigation" },
  { name: "Bulk Import", icon: Upload, path: "BulkImport", group: "admin" },
  { name: "Data Quality", icon: Shield, path: "DataQuality", group: "admin" },
  { name: "Compliance", icon: FileText, path: "Compliance", group: "admin" },
  { name: "Help", icon: HelpCircle, path: "Help", group: "admin" },
];

export default function Layout({ children }) {
  const location = useLocation();

  const navigationGroupItems = navItems.filter(item => item.group === "navigation");
  const adminGroupItems = navItems.filter(item => item.group === "admin");

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-slate-50">
          <Sidebar className="border-r border-slate-200 bg-white">
            <SidebarHeader className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">TennisPro</h2>
                  <p className="text-xs text-slate-500">Match Analytics</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationGroupItems.map((item) => {
                      const itemUrl = createPageUrl(item.path);
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton 
                            asChild 
                            className={`hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 rounded-xl mb-1 ${
                              location.pathname === itemUrl ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600'
                            }`}
                          >
                            <Link to={itemUrl} className="flex items-center gap-3 px-3 py-2.5">
                              <item.icon className="w-5 h-5" />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Admin Tools Section */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-4">
                  Admin Tools
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminGroupItems.map((item) => {
                      const itemUrl = createPageUrl(item.path);
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton 
                            asChild 
                            className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-1 ${
                              location.pathname === itemUrl ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-600'
                            }`}
                          >
                            <Link to={itemUrl} className="flex items-center gap-3 px-3 py-2.5">
                              <item.icon className="w-5 h-5" />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-6 py-4 lg:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors" />
                <h1 className="text-xl font-bold text-slate-900">TennisPro</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
