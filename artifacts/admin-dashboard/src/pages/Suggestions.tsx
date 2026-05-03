import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MessageSquare,
  User,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Suggestion {
  id: number;
  name: string;
  text: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Suggestions() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const {
    data: suggestions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-suggestions"],
    queryFn: async () => {
      const res = await customFetch<any>("/api/admin/suggestions");
      return (res.data || []) as Suggestion[];
    },
  });

  const filteredSuggestions =
    statusFilter === "all"
      ? suggestions
      : suggestions.filter((s) => s.status === statusFilter);

  const handleDelete = async (id: number) => {
    try {
      await customFetch(`/api/admin/suggestions/${id}`, { method: "DELETE" });
      toast.success("Suggestion deleted");
      refetch();
    } catch {
      toast.error("Failed to delete suggestion");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await customFetch(`/api/admin/suggestions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Marked as ${status}`);
      refetch();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const stats = {
    total: suggestions.length,
    newCount: suggestions.filter((s) => s.status === "New").length,
    reviewed: suggestions.filter((s) => s.status === "Reviewed").length,
    archived: suggestions.filter((s) => s.status === "Archived").length,
  };

  if (isLoading) return <SuggestionsSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Customer Suggestions
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Feedback and feature requests from your customers
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="h-10 rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 text-primary text-[10px] uppercase tracking-widest"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total" value={stats.total} color="text-white" icon={MessageSquare} />
        <StatCard label="New" value={stats.newCount} color="text-primary" icon={Clock} />
        <StatCard label="Reviewed" value={stats.reviewed} color="text-emerald-500" icon={CheckCircle2} />
        <StatCard label="Archived" value={stats.archived} color="text-amber-500" icon={Eye} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["all", "New", "Reviewed", "Archived"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap border",
              statusFilter === f
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary"
                : "bg-background/50 text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuggestions.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 opacity-30">
            <MessageSquare size={48} />
            <p className="font-black text-sm uppercase tracking-tighter">
              {statusFilter === "all"
                ? "No suggestions yet"
                : `No ${statusFilter.toLowerCase()} suggestions`}
            </p>
          </div>
        ) : (
          filteredSuggestions.map((s) => (
            <Card
              key={s.id}
              className="bg-card/40 border-border/50 backdrop-blur-xl group hover:border-primary/30 transition-all overflow-hidden relative"
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  s.status === "New"
                    ? "bg-primary"
                    : s.status === "Reviewed"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                )}
              />

              <CardContent className="p-6 space-y-4">
                {/* Top row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="font-black text-sm text-white">
                        {s.name || "Anonymous"}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {formatDate(s.createdAt)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                      s.status === "New"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : s.status === "Reviewed"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}
                  >
                    {s.status}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                  "{s.text}"
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    onClick={() => handleDelete(s.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-[9px] font-black uppercase hover:bg-red-500/10 hover:text-red-400 gap-1.5"
                  >
                    <Trash2 size={12} />
                    Delete
                  </Button>
                  {s.status === "New" && (
                    <Button
                      onClick={() => handleUpdateStatus(s.id, "Reviewed")}
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-[9px] font-black uppercase border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5 gap-1.5"
                    >
                      <CheckCircle2 size={12} />
                      Mark Reviewed
                    </Button>
                  )}
                  {s.status === "Reviewed" && (
                    <Button
                      onClick={() => handleUpdateStatus(s.id, "Archived")}
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-[9px] font-black uppercase border-amber-500/20 text-amber-500 hover:bg-amber-500/5 gap-1.5"
                    >
                      <Eye size={12} />
                      Archive
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-foreground",
  icon: Icon,
}: {
  label: string;
  value: number;
  color?: string;
  icon: any;
}) {
  return (
    <Card className="bg-card/40 border-border/50 backdrop-blur-xl group hover:border-primary/30 transition-all cursor-default">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-muted-foreground">
            {label}
          </p>
          <Icon size={14} className="text-muted-foreground opacity-40" />
        </div>
        <p
          className={cn(
            "text-lg md:text-2xl font-black tracking-tight transition-transform group-hover:translate-x-1",
            color
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
function SuggestionsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-10">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg opacity-50" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="flex gap-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-24 rounded-xl opacity-40" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
      </div>
    </div>
  );
}
