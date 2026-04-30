import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Phone, Wifi, Copy, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "loading" | "fulfilled" | "paid" | "pending" | "failed" | "on_hold";

interface OrderData {
  orderId: string;
  orderStatus: string;
  orderReference: string | null;
  phoneNumber: string;
  network: string;
  capacity: string;
  amount: string;
}

export default function PaymentCallback() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<OrderStatus>("loading");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Tracking # copied to clipboard." });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setStatus("failed");
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const checkStatus = async () => {
      if (cancelled) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiUrl}/api/paystack/verify/${reference}?t=${Date.now()}`);
        
        // If we get a server error (500), just retry instead of failing
        if (!res.ok && res.status >= 500) {
          console.warn("Server busy, retrying...");
          timeoutId = setTimeout(checkStatus, 5000);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        if (data.status === "success" && data.data) {
          setOrderData(data.data);
          const orderStatus = data.data.orderStatus;

          if (orderStatus === "fulfilled" || orderStatus === "completed") {
            setStatus("fulfilled");
            return;
          } 
          
          if (orderStatus === "failed" || orderStatus === "error") {
            setStatus("failed");
            return;
          }

          if (orderStatus === "on_hold") {
            setStatus("on_hold");
          } else {
            const isPendingState = ["paid", "processing", "pending"].includes(orderStatus);
            setStatus(isPendingState ? (orderStatus === "paid" || orderStatus === "processing" ? "paid" : "pending") : "pending");
          }
          
          if (pollCount > 150) {
            setStatus("failed");
            return;
          }

          setPollCount((c) => c + 1);
          const delay = pollCount < 40 ? 1500 : 5000;
          timeoutId = setTimeout(checkStatus, delay);
        } else {
          if (pollCount < 5) {
            console.log("Waiting for payment record to settle...");
            setPollCount((c) => c + 1);
            timeoutId = setTimeout(checkStatus, 3000);
          } else {
            setStatus("failed");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (!cancelled) {
          timeoutId = setTimeout(checkStatus, 5000);
        }
      }
    };

    checkStatus();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const NETWORK_LABELS: Record<string, string> = {
    YELLO: "MTN",
    TELECEL: "Telecel",
    at: "AirtelTigo",
  };

  if (status === "on_hold") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in text-center px-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse">
            <Clock className="h-12 w-12" />
          </div>
          <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-black border-4 border-background">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Order On Hold</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your payment was received, but our system flagged this for manual review. 
            <span className="block mt-2 font-bold text-amber-500/90">Please do not pay again.</span>
          </p>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-2xl p-6 w-full max-w-md space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-white">{reference}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            An administrator will review and process your bundle shortly. You can close this page.
          </p>
        </div>

        <Button onClick={() => setLocation("/")} variant="outline" className="w-full max-w-md" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {(status === "loading" || status === "pending" || status === "paid") && (
          <div className="text-center space-y-6 animate-in fade-in">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {status === "paid" ? "Payment Confirmed!" : "Verifying Payment..."}
              </h2>
              <p className="text-muted-foreground mt-2">
                {status === "paid"
                  ? "We've received your payment. Your data bundle is being delivered instantly. Please stay on this page."
                  : "We're just confirming your transaction with Paystack. This usually takes a few seconds."}
              </p>
            </div>
            {orderData && (
              <div className="bg-card border border-border rounded-[20px] p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="font-medium">{orderData.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="font-medium">{NETWORK_LABELS[orderData.network] || orderData.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bundle</span>
                  <span className="font-medium">{orderData.capacity} GB</span>
                </div>
              </div>
            )}
          </div>
        )}

        {status === "fulfilled" && (
          <div className="text-center space-y-6 animate-in fade-in">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-500">Data Delivered!</h2>
              <p className="text-muted-foreground mt-2">
                Your data bundle has been sent successfully.
              </p>
            </div>
            {orderData && (
              <div className="bg-card border border-border rounded-[20px] p-4 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </span>
                  <span className="font-bold">{orderData.phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Wifi className="h-3.5 w-3.5" /> Bundle
                  </span>
                  <span className="font-bold">{orderData.capacity} GB ({NETWORK_LABELS[orderData.network] || orderData.network})</span>
                </div>
                {orderData.orderReference && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Tracking ID</span>
                    <button 
                      onClick={() => copyToClipboard(orderData.orderReference || "")}
                      className="group flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded transition-colors"
                    >
                      <span className="font-mono text-sm text-primary font-bold">#{orderData.orderReference}</span>
                      <Copy className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Amount Paid</span>
                  <span className="font-bold text-lg">GHS {Number(orderData.amount).toFixed(2)}</span>
                </div>
              </div>
            )}
            <Button onClick={() => setLocation("/")} className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Buy More Data
            </Button>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center space-y-6 animate-in fade-in">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-500">Something Went Wrong</h2>
              <p className="text-muted-foreground mt-2">
                We couldn't verify your payment. If money was deducted, please contact us with your transaction reference.
              </p>
            </div>
            <Button onClick={() => setLocation("/")} variant="outline" className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
