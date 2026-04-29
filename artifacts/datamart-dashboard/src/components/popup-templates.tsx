import { X, Megaphone, Info, AlertTriangle, Zap, Clock, Settings, Wrench, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PopupTemplateProps {
  popup: any;
  onClose: () => void;
  onAction: (link: string) => void;
  layout?: string;
}

const PopupBackground = ({ type, artwork = "watermark", color = "primary" }: { type: string, artwork?: string, color?: string }) => {
  const getIcon = () => {
    switch (type) {
      case "promotional": return Megaphone;
      case "warning": return AlertTriangle;
      case "update": return Rocket;
      case "maintenance": return Settings;
      default: return Info;
    }
  };

  const Icon = getIcon();
  const colorMap: Record<string, string> = {
    primary: "blue",
    promotional: "amber",
    warning: "red",
    update: "blue",
    maintenance: "purple",
    notice: "blue"
  };
  const activeColor = colorMap[type] || "blue";

  return (
    <>
      {artwork === "watermark" && (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br from-${activeColor}-500/5 via-transparent to-transparent opacity-50`} />
          <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-white -rotate-12 pointer-events-none">
            <Icon size={400} strokeWidth={1.5} />
          </div>
        </>
      )}
      {artwork === "glow" && (
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--${activeColor}-500),0.1),transparent_70%)]`} />
      )}
      {artwork === "mesh" && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className={`absolute -top-[20%] -left-[20%] w-[60%] h-[60%] bg-${activeColor}-500/20 blur-[100px] rounded-full animate-pulse`} />
          <div className={`absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] bg-${activeColor}-500/10 blur-[100px] rounded-full animate-pulse`} style={{ animationDelay: '1s' }} />
        </div>
      )}
    </>
  );
};

export const PromotionalPopup = ({ popup, onClose, onAction, layout = "modal" }: PopupTemplateProps) => {
  const isCompact = layout !== "modal";
  return (
    <div className={cn("relative group overflow-hidden bg-slate-950 border border-amber-500/30 shadow-2xl shadow-amber-500/10", isCompact ? "rounded-2xl" : "rounded-[32px]")}>
    <PopupBackground type="promotional" artwork={popup.settings?.artwork} />

      <button onClick={onClose} className={cn("absolute text-slate-500 hover:text-white transition-all z-20 flex items-center justify-center", isCompact ? "top-3 right-3 h-6 w-6 rounded-md bg-transparent" : "top-5 right-5 h-8 w-8 rounded-full bg-white/5")}>
        <X size={16} />
      </button>

      <div className={cn("flex h-full", isCompact ? "flex-row items-center p-3 pr-10 gap-4" : "flex-col md:flex-row")}>
        {popup.imageUrl && (
          <div className={cn("relative overflow-hidden", isCompact ? "w-14 h-14 rounded-xl shrink-0" : "md:w-2/5 h-48 md:h-auto")}>
            <img src={popup.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Promotion" />
            {!isCompact && <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-transparent to-transparent" />}
          </div>
        )}
        
        <div className={cn("flex flex-col justify-center", isCompact ? "flex-1 space-y-1" : cn("p-5 md:p-8 space-y-3 md:space-y-5", popup.imageUrl ? "md:w-3/5" : "w-full text-center items-center"))}>
          <div className="flex items-center gap-2 text-amber-500">
             <Megaphone size={isCompact ? 14 : 20} className="animate-bounce" />
             <span className={cn("font-black uppercase", isCompact ? "text-[8px] tracking-[0.2em]" : "text-[10px] tracking-[0.3em]")}>Special Offer</span>
          </div>
          
          <div className={cn(isCompact ? "flex items-center justify-between" : "space-y-1 md:space-y-2")}>
            <div>
              <h2 className={cn("font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400", isCompact ? "text-sm" : "text-2xl md:text-4xl")}>
                {popup.title}
              </h2>
              {isCompact && <p className="text-slate-400 font-medium text-[11px] leading-relaxed line-clamp-3 mt-0.5">{popup.message}</p>}
            </div>
            
            {isCompact && popup.buttonText && (
              <Button onClick={() => onAction(popup.buttonLink)} className="ml-3 shrink-0 h-8 px-4 rounded-xl bg-amber-500 text-black font-black text-[10px] shadow-[0_5px_15px_rgba(245,158,11,0.3)] hover:bg-amber-400">
                {popup.buttonText}
              </Button>
            )}
          </div>

          {!isCompact && (
            <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed line-clamp-3">
              {popup.message}
            </p>
          )}

          {!isCompact && popup.buttonText && (
            <Button 
              onClick={() => onAction(popup.buttonLink)}
              className="h-14 md:h-16 px-10 rounded-2xl bg-amber-500 text-black font-black text-lg md:text-xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {popup.buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const NoticePopup = ({ popup, onClose, onAction, layout = "modal" }: PopupTemplateProps) => {
  const isCompact = layout !== "modal";
  return (
    <div className={cn(
      "bg-[#0B0F1A] border border-white/5 relative overflow-hidden group shadow-2xl",
      isCompact ? "rounded-2xl p-4 pr-12" : "rounded-[24px] md:rounded-[28px] p-6 md:p-10"
    )}>
      <PopupBackground type="notice" artwork={popup.settings?.artwork} />
      
      <button onClick={onClose} className={cn("absolute text-slate-500 hover:text-white transition-all z-20", isCompact ? "top-4 right-4" : "top-4 right-4 md:top-6 md:right-6")}>
        <X size={18} />
      </button>

      <div className={cn(isCompact ? "flex items-center gap-4" : "space-y-4 md:space-y-5")}>
        <div className={cn("relative shrink-0 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 overflow-hidden", isCompact ? "h-10 w-10 rounded-xl" : "h-12 w-12 md:h-16 md:w-16 rounded-2xl")}>
          <div className="absolute inset-0 animate-[spin_8s_linear_infinite] flex items-center justify-center opacity-30">
            <div className="w-full h-1 bg-blue-500 blur-md rotate-45" />
            <div className="w-full h-1 bg-blue-500 blur-md -rotate-45" />
          </div>
          <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" style={{ animationDuration: '3s' }} />
          <Info size={24} className={cn("relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]", isCompact ? "w-5 h-5" : "md:w-8 md:h-8")} />
        </div>
        
        <div className={cn("flex-1", isCompact ? "" : "space-y-1.5")}>
          <h2 className={cn("font-black tracking-tight text-white leading-tight", isCompact ? "text-sm" : "text-xl md:text-2xl")}>{popup.title}</h2>
          <p className={cn("text-slate-400 font-medium leading-relaxed", isCompact ? "text-[11px] line-clamp-3" : "text-sm")}>{popup.message}</p>
        </div>

        {popup.buttonText && (
          <Button 
            variant="outline" 
            onClick={() => onAction(popup.buttonLink)}
            className={cn("rounded-xl border-white/10 hover:bg-white/5 font-bold text-white", isCompact ? "h-8 px-4 text-[10px]" : "w-full h-10 md:h-12 text-sm")}
          >
            {popup.buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export const WarningPopup = ({ popup, onClose, onAction, layout = "modal" }: PopupTemplateProps) => {
  const isCompact = layout !== "modal";
  return (
    <div className={cn(
      "bg-slate-950 border-2 border-red-500/20 shadow-2xl shadow-red-500/5 relative overflow-hidden",
      isCompact ? "rounded-2xl p-4 pr-12" : "rounded-[24px] md:rounded-[28px] p-6 md:p-8"
    )}>
      <PopupBackground type="warning" artwork={popup.settings?.artwork} />
      <div className="absolute inset-x-0 top-0 h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20" />
      
      {isCompact && (
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-all z-20">
          <X size={18} />
        </button>
      )}

      <div className={cn(isCompact ? "flex items-center gap-3" : "flex gap-4 md:gap-6")}>
        <div className={cn("relative shrink-0 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 overflow-hidden", isCompact ? "h-10 w-10" : "h-12 w-12 md:h-14 md:w-14")}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn("border-2 border-red-500/40 rounded-full animate-ping", isCompact ? "h-6 w-6" : "h-8 w-8")} style={{ animationDuration: '2s' }} />
          </div>
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          <AlertTriangle size={24} className={cn("relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]", isCompact ? "w-5 h-5" : "md:w-7 md:h-7")} />
        </div>
        
        <div className={cn("flex-1", isCompact ? "flex items-center justify-between" : "space-y-3 md:space-y-4")}>
          <div className={cn(isCompact ? "" : "space-y-0.5")}>
            <h2 className={cn("font-black tracking-tight text-white uppercase leading-tight", isCompact ? "text-sm" : "text-lg md:text-xl")}>{popup.title}</h2>
            <p className={cn("text-slate-400 font-medium leading-relaxed", isCompact ? "text-[11px] line-clamp-3" : "text-[13px]")}>{popup.message}</p>
          </div>

          <div className={cn("flex gap-2 md:gap-3", isCompact ? "shrink-0 ml-2" : "")}>
            {popup.buttonText && (
              <Button 
                onClick={() => onAction(popup.buttonLink)}
                className={cn("bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest", isCompact ? "px-3 h-8 text-[9px]" : "px-5 h-9 md:h-10 text-[10px]")}
              >
                {popup.buttonText}
              </Button>
            )}
            {!isCompact && (
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-slate-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-9 md:h-10 px-4"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UpdatePopup = ({ popup, onClose, onAction, layout = "modal" }: PopupTemplateProps) => {
  const isCompact = layout !== "modal";
  return (
    <div className={cn("glass-card border-primary/20 p-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent", isCompact ? "rounded-[20px]" : "rounded-[28px] md:rounded-[32px]")}>
      <div className={cn("bg-slate-950/80 backdrop-blur-xl relative overflow-hidden group", isCompact ? "rounded-[16px] p-4 pr-12" : "rounded-[24px] md:rounded-[28px] p-6 md:p-8 space-y-4 md:space-y-6")}>
        <PopupBackground type="update" artwork={popup.settings?.artwork} />

        <button onClick={onClose} className={cn("absolute text-slate-500 hover:text-white transition-all z-20", isCompact ? "top-4 right-4" : "top-4 right-4 md:top-6 md:right-6")}>
          <X size={18} />
        </button>

        <div className={cn(isCompact ? "flex items-center gap-4" : "flex items-center gap-3 md:gap-4")}>
          <div className={cn("relative shrink-0 bg-slate-950 border border-primary/20 flex items-center justify-center overflow-hidden", isCompact ? "h-10 w-10 rounded-xl" : "h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl")}>
            <div className="absolute -inset-2 bg-gradient-to-tr from-transparent via-primary/50 to-transparent animate-[spin_2s_linear_infinite]" />
            <div className={cn("absolute inset-[1px] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center", isCompact ? "rounded-[9px]" : "rounded-[11px] md:rounded-[15px]")}>
              <div className="absolute inset-0 bg-primary/10 animate-pulse" />
              <Rocket size={20} className={cn("relative z-10 text-primary drop-shadow-[0_0_10px_currentColor] animate-bounce", isCompact ? "w-5 h-5" : "md:w-6 md:h-6")} style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          <div className={cn("flex-1", isCompact ? "flex items-center justify-between" : "")}>
            <div>
              <h2 className={cn("font-black tracking-tight text-white leading-tight", isCompact ? "text-sm" : "text-base md:text-lg")}>{popup.title}</h2>
              {!isCompact && <span className="text-[8px] md:text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Latest Update</span>}
              {isCompact && <p className="text-slate-300 font-medium leading-relaxed text-[11px] line-clamp-3 mt-0.5">{popup.message}</p>}
            </div>

            {isCompact && popup.buttonText && (
              <Button onClick={() => onAction(popup.buttonLink)} className="ml-3 shrink-0 h-8 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-black tracking-tight group text-white text-[10px]">
                {popup.buttonText}
              </Button>
            )}
          </div>
        </div>

        {!isCompact && <p className="text-slate-300 font-medium leading-relaxed text-sm">{popup.message}</p>}

        {!isCompact && popup.buttonText && (
          <Button 
            onClick={() => onAction(popup.buttonLink)}
            className="w-full h-10 md:h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-black tracking-tight group text-white text-sm"
          >
            {popup.buttonText}
            <Rocket size={14} className="ml-2 text-primary group-hover:animate-pulse" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const MaintenancePopup = ({ popup, onClose, onAction, layout = "modal" }: PopupTemplateProps) => {
  const isCompact = layout !== "modal";
  return (
    <div className={cn("relative group overflow-hidden bg-slate-950 border border-purple-500/30", isCompact ? "rounded-2xl p-4 pr-12 text-left" : "rounded-[28px] md:rounded-[32px] p-6 md:p-16 text-center")}>
      <PopupBackground type="maintenance" artwork={popup.settings?.artwork} />
      <button onClick={onClose} className={cn("absolute text-slate-500 hover:text-white transition-all z-20 flex items-center justify-center", isCompact ? "top-4 right-4 h-6 w-6 bg-transparent" : "top-4 right-4 md:top-6 md:right-6 h-8 w-8 rounded-full bg-white/5")}>
        <X size={16} />
      </button>

      <div className={cn("relative z-10 w-full", isCompact ? "flex items-center gap-4" : "space-y-4 md:space-y-6")}>
        <div className={cn("relative shrink-0 overflow-hidden", isCompact ? "h-12 w-12 rounded-xl bg-purple-500/5 border border-purple-500/30 p-1.5" : "inline-block h-16 w-16 md:h-24 md:w-24 rounded-[20px] bg-purple-500/5 border border-purple-500/30 p-1.5 md:p-3 mx-auto")}>
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Browser Window Background */}
            <div className="absolute top-0 left-0 w-[75%] h-[75%] border-[2px] border-purple-500/30 rounded-lg overflow-hidden flex flex-col bg-slate-950/50">
              <div className="h-2.5 border-b-[2px] border-purple-500/30 w-full flex items-center px-1 gap-0.5">
                <div className="h-0.5 w-0.5 rounded-full bg-purple-500/30"></div>
              </div>
            </div>

            {/* Spinning Gear */}
            <div className="absolute -bottom-1 -right-1 w-[70%] h-[70%] bg-slate-950 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 animate-[spin_4s_linear_infinite] flex items-center justify-center text-purple-500">
                <Settings size="100%" strokeWidth={2} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-purple-400">
                <Wrench size="45%" strokeWidth={2.5} className="rotate-45 -ml-0.5 -mt-0.5" />
              </div>
            </div>
          </div>
        </div>

        <div className={cn("flex-1", isCompact ? "flex items-center justify-between" : "space-y-1.5 md:space-y-2")}>
          <div className={isCompact ? "" : ""}>
            <h2 className={cn("font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-purple-100 to-purple-300 drop-shadow-sm pb-1", isCompact ? "text-sm" : "text-2xl md:text-3xl")}>
              {popup.title}
            </h2>
            <p className={cn("text-slate-400 font-medium leading-relaxed", isCompact ? "text-[11px] line-clamp-3 mt-0.5" : "text-xs md:text-sm max-w-[260px] md:max-w-xs mx-auto px-2 mt-2")}>
              {popup.message}
            </p>
          </div>

          {isCompact && popup.buttonText && (
            <Button onClick={() => onAction(popup.buttonLink)} className="ml-3 shrink-0 h-8 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px]">
              {popup.buttonText}
            </Button>
          )}
        </div>

        {!isCompact && (
          <div className="flex flex-col items-center gap-4 md:gap-5">
             {popup.buttonText && (
               <Button onClick={() => onAction(popup.buttonLink)} className="h-12 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base md:text-xl transition-all hover:scale-[1.02] active:scale-95">
                 {popup.buttonText}
               </Button>
             )}
             <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
                <Clock size={12} />
                Check back soon
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
