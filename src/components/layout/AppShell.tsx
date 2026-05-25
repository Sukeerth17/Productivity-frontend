import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";
import { MobileNav } from "./MobileNav";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { AnimatePresence } from "framer-motion";

export function AppShell() {
  const navigate = useNavigate();
  const [showGlobalNew, setShowGlobalNew] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      if (e.key.toLowerCase() === 'u' && modifier) {
        e.preventDefault();
        setShowGlobalNew(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <MobileNav />
      </div>
      <AnimatePresence>
        {showGlobalNew && <NewTaskModal onClose={() => setShowGlobalNew(false)} />}
      </AnimatePresence>
    </div>
  );
}
