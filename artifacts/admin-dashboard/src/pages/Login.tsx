import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lock, User, LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (formData.username === "nana." && formData.password === "Standfirm1.") {
        localStorage.setItem("admin_auth", "true");
        toast.success("Login successful", {
          description: "Welcome back to FalaaDeals Admin",
        });
        setLocation("/");
      } else {
        toast.error("Invalid credentials", {
          description: "Please enter both username and password",
        });
      }
    } catch (error) {
      toast.error("Login failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden isolate">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] animate-blob pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] animate-blob pointer-events-none" style={{ animationDelay: '4s' }} />
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-[-1]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <img 
            src="/logo.png" 
            alt="Falaa Deals" 
            className="h-20 md:h-24 w-auto object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
          />
        </div>

        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden relative rounded-[35px] border-t-white/10">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <CardHeader className="pb-6 pt-10 text-center">
            <CardTitle className="text-2xl font-black text-white tracking-tight">Security Access</CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Verify your identity to manage operations.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    className="h-14 pl-12 bg-black/40 border-white/5 text-white placeholder:text-slate-600 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 font-medium shadow-inner"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="h-14 pl-12 pr-12 bg-black/40 border-white/5 text-white placeholder:text-slate-600 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 font-medium shadow-inner"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded-lg border-white/5 bg-black/40 text-primary focus:ring-primary/20 focus:ring-offset-0"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-500 font-bold cursor-pointer hover:text-slate-300 transition-colors">
                    Trust this device
                  </label>
                </div>
                <button type="button" className="text-xs text-primary/70 hover:text-primary font-black uppercase tracking-tight transition-all">
                  Support
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 bg-gradient-to-r from-primary to-indigo-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black text-base md:text-lg rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border-none mt-4 transition-all duration-500 group relative overflow-hidden"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12 pointer-events-none" />
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Initialize Portal</span>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          
          <div className="border-t border-white/5 bg-black/20 py-6 text-center">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
              Secured by Falaa Infrastructure v2.0
            </p>
          </div>
        </Card>
        
        <div className="mt-10 flex flex-col items-center gap-4">
           <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Active</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">TLS 1.3</span>
              </div>
           </div>
           <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">© 2026 Falaa Deals · All Rights Reserved</p>
        </div>
      </motion.div>
    </div>
  );
}
