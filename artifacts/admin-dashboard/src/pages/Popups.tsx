import { useState } from "react";
import { 
  useGetAdminPopups, 
  useCreatePopup, 
  useUpdatePopup, 
  useDeletePopup 
} from "@workspace/api-client-react";
import { 
  Bell, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar, 
  Settings2, 
  Target, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Info, 
  Megaphone, 
  Hammer,
  ChevronRight,
  Save,
  X,
  ExternalLink,
  BarChart2,
  Rocket,
  Monitor,
  Smartphone,
  Wrench,
  Settings
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const POPUP_TYPES = [
  { id: "promotional", label: "Promotional", icon: Megaphone, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "notice", label: "Notice", icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "warning", label: "Warning", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "update", label: "Update", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "maintenance", label: "Maintenance", icon: Hammer, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const LAYOUT_STYLES = [
  { id: "modal", label: "Modal", description: "Center screen popup" },
  { id: "banner", label: "Banner", description: "Top of page notification bar" },
  { id: "slide", label: "Slide", description: "Slides in from bottom" },
  { id: "toast", label: "Toast", description: "Small corner notification" },
];

export default function Popups() {
  const { data: popupsRes, isLoading, refetch } = useGetAdminPopups();
  const popups = popupsRes?.data || [];
  
  const createMutation = useCreatePopup();
  const updateMutation = useUpdatePopup();
  const deleteMutation = useDeletePopup();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingPopup, setEditingPopup] = useState<any>(null);
  const [previewPopup, setPreviewPopup] = useState<any>(null);

  const handleCreate = () => {
    setEditingPopup({
      type: "notice",
      title: "",
      message: "",
      buttonText: "Dismiss",
      isActive: true,
      priority: 0,
      trigger: "load",
      triggerValue: 0,
      frequency: "every_visit",
      pages: "all",
      settings: {}
    });
    setIsEditing(true);
  };

  const handleEdit = (popup: any) => {
    setEditingPopup({ ...popup });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this popup?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Popup deleted");
        refetch();
      } catch (err) {
        toast.error("Failed to delete popup");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingPopup.id) {
        await updateMutation.mutateAsync({ 
          id: editingPopup.id, 
          data: editingPopup 
        });
        toast.success("Popup updated");
      } else {
        await createMutation.mutateAsync({ data: editingPopup });
        toast.success("Popup created");
      }
      setIsEditing(false);
      refetch();
    } catch (err) {
      toast.error("Failed to save popup");
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter glow-text">Popups</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Manage site announcements & promotions</p>
        </div>
        <Button onClick={handleCreate} className="rounded-2xl h-12 px-8 glow-primary">
          <Plus className="mr-2 h-5 w-5" />
          Create New
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Popup List */}
        <div className="xl:col-span-2 space-y-4">
          {popups.length === 0 ? (
            <Card className="glass border-white/5 bg-white/5 py-20 flex flex-col items-center justify-center text-center opacity-40">
              <Bell size={64} className="mb-4" />
              <p className="font-black">No popups configured yet</p>
            </Card>
          ) : (
            popups.map((popup: any) => (
              <motion.div 
                layout 
                key={popup.id} 
                className={cn(
                  "glass-card p-6 border transition-all hover:border-primary/20 group relative overflow-hidden",
                  !popup.isActive && "opacity-60 grayscale"
                )}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5",
                      POPUP_TYPES.find(t => t.id === popup.type)?.bg,
                      POPUP_TYPES.find(t => t.id === popup.type)?.color
                    )}>
                      {(() => {
                        const Icon = POPUP_TYPES.find(t => t.id === popup.type)?.icon || Bell;
                        return <Icon size={28} />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-black text-lg tracking-tight flex items-center gap-3">
                        {popup.title}
                        {!popup.isActive && <Badge variant="outline" className="text-[9px] uppercase border-white/10">Disabled</Badge>}
                      </h3>
                      <p className="text-slate-400 text-xs font-bold line-clamp-1 mt-0.5">{popup.message}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Target size={12} className="text-primary" />
                          {popup.pages === "all" ? "All Pages" : "Targeted"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Zap size={12} className="text-amber-500" />
                          {popup.trigger}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <BarChart2 size={12} className="text-emerald-500" />
                          {popup.analytics?.impressions || 0} Views
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewPopup(popup)} className="hover:bg-primary/10 hover:text-primary rounded-xl">
                      <Eye size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(popup)} className="hover:bg-amber-500/10 hover:text-amber-500 rounded-xl">
                      <Edit2 size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(popup.id)} 
                      disabled={deleteMutation.isPending}
                      className="hover:bg-red-500/10 hover:text-red-500 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
           <Card className="glass-card border-primary/20 bg-primary/5 p-8 overflow-hidden relative">
              <div className="absolute -top-6 -right-6 opacity-10 rotate-12">
                 <Settings2 size={120} />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest mb-2 relative z-10">Quick Tip</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed relative z-10">
                Popups with higher priority will overlap others. Maintenance popups usually should have the highest priority.
              </p>
           </Card>

           <Card className="glass-card p-8 space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Live Status</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Total Active</span>
                    <span className="text-sm font-black">{popups.filter((p: any) => p.isActive).length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Total Impressions</span>
                    <span className="text-sm font-black text-primary">{popups.reduce((acc: number, p: any) => acc + (p.analytics?.impressions || 0), 0)}</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#0B0F1A] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">{editingPopup.id ? "Edit Popup" : "New Popup"}</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Configure your announcement</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-xl">
                  <X size={20} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column: Content */}
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popup Content Type</label>
                      <div className="grid grid-cols-5 gap-3">
                        {POPUP_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => setEditingPopup({ ...editingPopup, type: type.id })}
                            className={cn(
                              "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                              editingPopup.type === type.id 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                            )}
                          >
                            <type.icon size={20} />
                            <span className="text-[9px] font-black uppercase hidden lg:block">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <Bell size={16} />
                        <span className="font-bold text-sm">Announcement Popup Style</span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {LAYOUT_STYLES.map(layout => {
                          const isSelected = (editingPopup.settings?.layout || "modal") === layout.id;
                          return (
                            <button
                              key={layout.id}
                              onClick={() => setEditingPopup({ ...editingPopup, settings: { ...editingPopup.settings, layout: layout.id } })}
                              className={cn(
                                "flex flex-col items-center p-3 rounded-2xl border transition-all text-center",
                                isSelected 
                                  ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                                  : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                              )}
                            >
                              <div className="w-full h-16 bg-[#0B0F1A] border border-white/5 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center">
                                {layout.id === "modal" && (
                                  <div className="w-10 h-6 bg-slate-800 rounded flex flex-col items-center justify-center gap-1 shadow-lg">
                                    <div className="w-6 h-1 bg-white/80 rounded-full" />
                                    <div className="w-4 h-1 bg-white/40 rounded-full" />
                                  </div>
                                )}
                                {layout.id === "banner" && (
                                  <div className={cn("absolute top-0 inset-x-0 h-4 flex items-center justify-center", isSelected ? "bg-amber-500" : "bg-blue-500")}>
                                     <div className="w-8 h-1 bg-white/80 rounded-full" />
                                  </div>
                                )}
                                {layout.id === "slide" && (
                                  <div className={cn("absolute bottom-0 inset-x-0 h-6 flex items-center justify-center rounded-t-lg", isSelected ? "bg-amber-500" : "bg-blue-500")}>
                                     <div className="w-8 h-1 bg-white/80 rounded-full" />
                                  </div>
                                )}
                                {layout.id === "toast" && (
                                  <div className={cn("absolute bottom-2 right-2 w-8 h-4 rounded shadow-lg flex items-center justify-center", isSelected ? "bg-amber-500" : "bg-blue-500")}>
                                     <div className="w-4 h-1 bg-white/80 rounded-full" />
                                  </div>
                                )}
                              </div>
                              <span className={cn("text-[11px] font-black", isSelected ? "text-amber-500" : "text-white")}>{layout.label}</span>
                              <span className="text-[8px] mt-1 opacity-70 leading-tight">{layout.description}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-3 mt-6 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Background Artwork</label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "watermark", label: "Watermark" },
                            { id: "glow", label: "Radial Glow" },
                            { id: "mesh", label: "Mesh Gradient" }
                          ].map(art => (
                            <button
                              key={art.id}
                              onClick={() => setEditingPopup({ 
                                ...editingPopup, 
                                settings: { ...editingPopup.settings, artwork: art.id } 
                              })}
                              className={cn(
                                "py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all",
                                (editingPopup.settings?.artwork || "watermark") === art.id
                                  ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                  : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                              )}
                            >
                              {art.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 mt-6 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auto Close Timer</label>
                          <span className="text-[10px] font-black text-amber-500">{editingPopup.settings?.autoClose || 0}s</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          className="w-full accent-amber-500"
                          value={editingPopup.settings?.autoClose || 0}
                          onChange={(e) => setEditingPopup({ 
                            ...editingPopup, 
                            settings: { ...editingPopup.settings, autoClose: parseInt(e.target.value) } 
                          })}
                        />
                        <p className="text-[9px] text-slate-500 italic">Duration in seconds. Set to 0 to disable auto-close.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                        <Input 
                          placeholder="e.g. Flash Sale Live!" 
                          className="rounded-xl h-12 bg-white/5 border-white/5 focus:border-primary/50" 
                          value={editingPopup.title}
                          onChange={(e) => setEditingPopup({ ...editingPopup, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</label>
                        <textarea 
                          placeholder="What would you like to say?" 
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-primary/50 min-h-[120px]" 
                          value={editingPopup.message}
                          onChange={(e) => setEditingPopup({ ...editingPopup, message: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Button Text</label>
                          <Input 
                            placeholder="e.g. Shop Now" 
                            className="rounded-xl h-12 bg-white/5 border-white/5" 
                            value={editingPopup.buttonText}
                            onChange={(e) => setEditingPopup({ ...editingPopup, buttonText: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Button Link</label>
                          <Input 
                            placeholder="e.g. /buy" 
                            className="rounded-xl h-12 bg-white/5 border-white/5" 
                            value={editingPopup.buttonLink}
                            onChange={(e) => setEditingPopup({ ...editingPopup, buttonLink: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Settings */}
                  <div className="space-y-8">
                    <div className="glass p-6 rounded-[24px] space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Zap size={16} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-tight">Visibility & Priority</span>
                         </div>
                         <Switch 
                            checked={editingPopup.isActive} 
                            onCheckedChange={(checked) => setEditingPopup({ ...editingPopup, isActive: checked })} 
                         />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority (High overlaps Low)</label>
                        <Input 
                          type="number" 
                          className="rounded-xl bg-black/20 border-white/5" 
                          value={editingPopup.priority}
                          onChange={(e) => setEditingPopup({ ...editingPopup, priority: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Pages</label>
                        <Select 
                          value={
                            editingPopup.pages === "all" ? "all" 
                            : editingPopup.pages?.includes("/checkout") ? "checkout" 
                            : editingPopup.pages?.includes("/") ? "specific" 
                            : "all"
                          } 
                          onValueChange={(val) => {
                            const newPages = val === "all" ? "all" : val === "specific" ? ["/"] : ["/checkout"];
                            setEditingPopup({ ...editingPopup, pages: newPages });
                          }}
                        >
                          <SelectTrigger className="rounded-xl bg-black/20 border-white/5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass border-white/10 z-[1000]">
                            <SelectItem value="all">Everywhere</SelectItem>
                            <SelectItem value="specific">Homepage Only</SelectItem>
                            <SelectItem value="checkout">Checkout Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="glass p-6 rounded-[24px] space-y-6">
                      <div className="flex items-center gap-3">
                         <Clock size={16} className="text-amber-500" />
                         <span className="text-xs font-black uppercase tracking-tight">Trigger & Frequency</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trigger</label>
                          <Select 
                            value={editingPopup.trigger} 
                            onValueChange={(val) => setEditingPopup({ ...editingPopup, trigger: val })}
                          >
                            <SelectTrigger className="rounded-xl bg-black/20 border-white/5 text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass border-white/10 z-[1000]">
                              <SelectItem value="load">On Load</SelectItem>
                              <SelectItem value="delay">Timed Delay</SelectItem>
                              <SelectItem value="scroll">Scroll Depth</SelectItem>
                              <SelectItem value="exit">Exit Intent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frequency</label>
                          <Select 
                            value={editingPopup.frequency} 
                            onValueChange={(val) => setEditingPopup({ ...editingPopup, frequency: val })}
                          >
                            <SelectTrigger className="rounded-xl bg-black/20 border-white/5 text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass border-white/10 z-[1000]">
                              <SelectItem value="every_visit">Every Visit</SelectItem>
                              <SelectItem value="once_per_day">Once per Day</SelectItem>
                              <SelectItem value="once">Once Total</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(editingPopup.trigger === "delay" || editingPopup.trigger === "scroll") && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {editingPopup.trigger === "delay" ? "Delay (Seconds)" : "Scroll Depth (%)"}
                          </label>
                          <Input 
                            type="number"
                            min="0"
                            max={editingPopup.trigger === "scroll" ? "100" : undefined}
                            placeholder={editingPopup.trigger === "delay" ? "e.g. 5" : "e.g. 50"} 
                            className="rounded-xl bg-black/20 border-white/5" 
                            value={editingPopup.triggerValue || ""}
                            onChange={(e) => setEditingPopup({ ...editingPopup, triggerValue: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Scheduling Section */}
                    <div className="glass p-6 rounded-[24px] space-y-6">
                      <div className="flex items-center gap-3">
                         <Calendar className="text-purple-500" size={16} />
                         <span className="text-xs font-black uppercase tracking-tight">Scheduling (Optional)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Time</label>
                          <Input 
                            type="datetime-local"
                            className="rounded-xl bg-black/20 border-white/5 text-[10px]"
                            value={editingPopup.startTime ? new Date(editingPopup.startTime).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setEditingPopup({ ...editingPopup, startTime: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Time</label>
                          <Input 
                            type="datetime-local"
                            className="rounded-xl bg-black/20 border-white/5 text-[10px]"
                            value={editingPopup.endTime ? new Date(editingPopup.endTime).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setEditingPopup({ ...editingPopup, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">Leave blank to start immediately or never expire.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                <Button variant="ghost" onClick={() => setPreviewPopup(editingPopup)} className="rounded-xl">
                  <Eye className="mr-2 h-4 w-4" />
                  Live Preview
                </Button>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="rounded-xl px-10 glow-primary"
                  >
                    <Save className={cn("mr-2 h-4 w-4", (createMutation.isPending || updateMutation.isPending) && "animate-pulse")} />
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal (Internal) */}
      <AnimatePresence>
        {previewPopup && (
           <AdminPopupPreview 
              popup={previewPopup} 
              onClose={() => setPreviewPopup(null)} 
           />
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminPopupPreview({ popup, onClose }: { popup: any, onClose: () => void }) {
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const layout = popup.settings?.layout || "modal";
  const artwork = popup.settings?.artwork || "watermark";
  const isCompact = layout !== "modal";
  
  const getIcon = () => {
    switch (popup.type) {
      case "promotional": return Megaphone;
      case "warning": return AlertTriangle;
      case "update": return Rocket;
      case "maintenance": return Settings;
      default: return Info;
    }
  };

  const Icon = getIcon();
  const colorMap: Record<string, string> = {
    promotional: "amber",
    warning: "red",
    maintenance: "purple",
    update: "blue",
    notice: "blue"
  };
  const activeColor = colorMap[popup.type] || "blue";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl z-[1001]">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsPreviewMobile(false)}
          className={cn("rounded-xl h-9 px-4 gap-2", !isPreviewMobile ? "bg-primary text-white" : "text-slate-400")}
        >
          <Monitor size={14} />
          <span className="text-[10px] font-black uppercase">Desktop View</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsPreviewMobile(true)}
          className={cn("rounded-xl h-9 px-4 gap-2", isPreviewMobile ? "bg-primary text-white" : "text-slate-400")}
        >
          <Smartphone size={14} />
          <span className="text-[10px] font-black uppercase">Mobile View</span>
        </Button>
      </div>

      <div className={cn(
        "relative transition-all duration-500 ease-out z-[1001]",
        isPreviewMobile ? "w-[375px] h-[667px] border-[8px] border-slate-800 rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl" : "w-full max-w-4xl"
      )}>
        {/* Mock Content for Background */}
        {isPreviewMobile && (
          <div className="absolute inset-0 opacity-20 p-6 space-y-4">
             <div className="h-4 w-1/3 bg-white/10 rounded-full" />
             <div className="h-32 w-full bg-white/5 rounded-2xl" />
             <div className="h-32 w-full bg-white/5 rounded-2xl" />
             <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/5 border-t border-white/10 flex justify-around items-center px-4">
                <div className="h-6 w-6 rounded-lg bg-primary/20" />
                <div className="h-6 w-6 rounded-lg bg-white/10" />
                <div className="h-6 w-6 rounded-lg bg-white/10" />
             </div>
          </div>
        )}

        <div className={cn(
          "absolute transition-all duration-500",
          layout === "modal" ? "inset-0 flex items-center justify-center p-6" :
          layout === "banner" ? "top-0 inset-x-0 p-4" :
          layout === "slide" ? "bottom-0 inset-x-0 p-4" + (isPreviewMobile ? " pb-20" : "") :
          "bottom-0 right-0 p-4" + (isPreviewMobile ? " pb-20" : "")
        )}>
          <div className={cn(
            "relative overflow-hidden group shadow-2xl transition-all duration-300 w-full",
            popup.type === "promotional" ? "bg-slate-950 border border-amber-500/30 shadow-amber-500/10" :
            popup.type === "warning" ? "bg-slate-950 border-2 border-red-500/20 shadow-red-500/10" :
            popup.type === "maintenance" ? "bg-slate-950 border border-purple-500/30 shadow-purple-500/10" :
            "bg-[#0B0F1A] border border-white/5 shadow-white/5",
            isCompact ? "rounded-2xl p-4 pr-12 max-w-xl mx-auto" : "rounded-[32px] p-8 md:p-10 max-w-lg mx-auto",
            layout === "toast" && "max-w-sm"
          )}>
            {/* Background Artwork */}
            {artwork === "watermark" && (
              <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-white -rotate-12 pointer-events-none">
                <Icon size={400} strokeWidth={1.5} />
              </div>
            )}
            {artwork === "glow" && (
              <div className={cn(
                "absolute inset-0 opacity-40",
                `bg-[radial-gradient(circle_at_50%_50%,rgba(var(--${activeColor}-500),0.15),transparent_70%)]`
              )} />
            )}
            {artwork === "mesh" && (
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className={cn(`absolute -top-[20%] -left-[20%] w-[60%] h-[60%] blur-[100px] rounded-full animate-pulse`, `bg-${activeColor}-500/20`)} />
                <div className={cn(`absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] blur-[100px] rounded-full animate-pulse`, `bg-${activeColor}-500/10`)} style={{ animationDelay: '1s' }} />
              </div>
            )}

            <button onClick={onClose} className={cn("absolute text-slate-500 hover:text-white transition-all z-20 flex items-center justify-center", isCompact ? "top-4 right-4" : "top-6 right-6")}>
              <X size={20} />
            </button>

            <div className={cn(isCompact ? "flex items-center gap-4" : "space-y-6 text-center")}>
              <div className={cn(
                "relative shrink-0 flex items-center justify-center overflow-hidden",
                popup.type === "promotional" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                popup.type === "warning" ? "text-red-500 bg-red-500/10 border-red-500/20" :
                popup.type === "maintenance" ? "text-purple-500 bg-purple-500/10 border-purple-500/20" :
                "text-blue-500 bg-blue-500/10 border-blue-500/20",
                isCompact ? "h-12 w-12 rounded-xl border" : "h-20 w-20 rounded-[24px] border mx-auto"
              )}>
                <Icon size={isCompact ? 24 : 40} />
              </div>

              <div className={cn("flex-1", isCompact ? "" : "space-y-2")}>
                <h2 className={cn("font-black tracking-tight text-white leading-tight", isCompact ? "text-sm" : "text-3xl")}>
                  {popup.title || "Announcement Title"}
                </h2>
                <p className={cn("text-slate-400 font-medium leading-relaxed", isCompact ? "text-[11px] line-clamp-3" : "text-sm md:text-base")}>
                  {popup.message || "Your message will appear here..."}
                </p>
              </div>

              {popup.buttonText && (
                <div className={isCompact ? "shrink-0 ml-2" : "pt-2"}>
                  <Button className={cn(
                    "font-black shadow-xl transition-all hover:scale-105 active:scale-95",
                    popup.type === "promotional" ? "bg-amber-500 text-black hover:bg-amber-600" :
                    popup.type === "maintenance" ? "bg-purple-600 text-white hover:bg-purple-700" :
                    popup.type === "warning" ? "bg-red-600 text-white hover:bg-red-700" :
                    "bg-primary text-white",
                    isCompact ? "h-9 px-4 rounded-xl text-[10px] uppercase tracking-widest" : "w-full h-14 rounded-2xl text-lg"
                  )}>
                    {popup.buttonText}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
