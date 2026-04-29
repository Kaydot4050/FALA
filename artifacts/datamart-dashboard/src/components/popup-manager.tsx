import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetActivePopups, useTrackPopupEvent } from "@workspace/api-client-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  PromotionalPopup, 
  NoticePopup, 
  WarningPopup, 
  UpdatePopup, 
  MaintenancePopup 
} from "./popup-templates";

const DISMISSED_KEY = "falaa_dismissed_popups";

export function PopupManager() {
  const [location] = useLocation();
  const { data: popupsRes } = useGetActivePopups({
    query: {
      refetchInterval: 60000, // Re-check every minute
    }
  });
  const trackMutation = useTrackPopupEvent();
  
  const [activePopup, setActivePopup] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!popupsRes?.data || popupsRes.data.length === 0) return;

    const popups = popupsRes.data;
    
    // Sort by priority (desc)
    const sortedPopups = [...popups].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Find the first popup that matches current path and hasn't been dismissed
    const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}");
    
    const eligible = sortedPopups.find(p => {
      if (!p.id || !p.type) return false;
      
      // Check if page matches
      const pageMatch = p.pages === "all" || 
                        (p.pages === "specific" && location === "/") ||
                        (Array.isArray(p.pages) && p.pages.includes(location));
      
      if (!pageMatch) return false;

      // Check frequency
      const lastDismissed = dismissed[p.id];
      if (lastDismissed) {
        if (p.frequency === "once") return false;
        if (p.frequency === "once_per_day") {
          const oneDay = 24 * 60 * 60 * 1000;
          if (Date.now() - lastDismissed < oneDay) return false;
        }
        // "every_visit" or "session" might need different logic, but here we treat them as "show again"
      }

      return true;
    });

    if (eligible && eligible.id !== activePopup?.id) {
      setActivePopup(eligible);
      setupTrigger(eligible);
    }
  }, [popupsRes, location]);

  const setupTrigger = (popup: any) => {
    setShow(false);

    if (popup.trigger === "load") {
      handleShow(popup);
    } else if (popup.trigger === "delay") {
      setTimeout(() => handleShow(popup), (popup.triggerValue || 0) * 1000);
    } else if (popup.trigger === "scroll") {
      const onScroll = () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= (popup.triggerValue || 50)) {
          handleShow(popup);
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll);
    } else if (popup.trigger === "exit") {
      const onExit = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          handleShow(popup);
          document.removeEventListener("mouseleave", onExit);
        }
      };
      document.addEventListener("mouseleave", onExit);
    }
  };

  const handleShow = (popup: any) => {
    setActivePopup(popup);
    setShow(true);
    trackMutation.mutate({ id: popup.id, data: { event: "impression" } });

    // Handle Auto Close if configured
    const autoCloseTime = popup.settings?.autoClose;
    if (autoCloseTime && autoCloseTime > 0) {
      setTimeout(() => {
        handleClose();
      }, autoCloseTime * 1000);
    }
  };

  const handleClose = () => {
    setShow(false);
    if (activePopup) {
      const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}");
      dismissed[activePopup.id] = Date.now();
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
      trackMutation.mutate({ id: activePopup.id, data: { event: "dismiss" } });
    }
  };

  const handleAction = (link: string) => {
    if (activePopup) {
      trackMutation.mutate({ id: activePopup.id, data: { event: "click" } });
    }
    if (link) {
      window.location.href = link;
    }
    handleClose();
  };

  if (!activePopup) return null;

  const layout = activePopup.settings?.layout || "modal";

  const renderPopup = () => {
    const props = { popup: activePopup, onClose: handleClose, onAction: handleAction, layout };
    
    switch (activePopup.type) {
      case "promotional": return <PromotionalPopup {...props} />;
      case "warning": return <WarningPopup {...props} />;
      case "update": return <UpdatePopup {...props} />;
      case "maintenance": return <MaintenancePopup {...props} />;
      default: return <NoticePopup {...props} />;
    }
  };

  // Determine container positioning based on layout
  const containerClasses: Record<string, string> = {
    modal: "fixed inset-0 z-[500] flex items-center justify-center p-4 pb-20 md:p-10 pointer-events-none",
    banner: "fixed inset-x-0 top-0 z-[500] flex justify-center p-4 md:p-6 pointer-events-none",
    slide: "fixed inset-x-0 bottom-0 z-[500] flex justify-center p-4 pb-20 md:p-6 md:pb-6 pointer-events-none",
    toast: "fixed bottom-0 right-0 z-[500] flex justify-end p-4 pb-20 md:p-6 md:pb-6 pointer-events-none"
  };

  const widthClasses: Record<string, string> = {
    modal: "w-full max-w-4xl",
    banner: "w-full max-w-4xl",
    slide: "w-full max-w-4xl",
    toast: "w-full max-w-md"
  };

  // Framer motion variants based on layout
  const animationVariants: Record<string, any> = {
    modal: {
      initial: { opacity: 0, scale: 0.9, y: 40 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: 40 }
    },
    banner: {
      initial: { opacity: 0, y: -100 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -100 }
    },
    slide: {
      initial: { opacity: 0, y: 100 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 100 }
    },
    toast: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className={containerClasses[layout]}>
          {layout === "modal" && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto" 
              onClick={handleClose}
            />
          )}
          <motion.div 
            initial={animationVariants[layout].initial}
            animate={animationVariants[layout].animate}
            exit={animationVariants[layout].exit}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={cn("relative pointer-events-auto shadow-2xl", widthClasses[layout])}
          >
            {renderPopup()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
