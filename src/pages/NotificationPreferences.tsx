import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, PackageCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const DEFAULTS: NotificationPreferences = {
  inapp_order_updates: true,
  inapp_delivery_events: true,
};

const NotificationPreferencesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    getMyNotificationPreferences()
      .then(setPrefs)
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const toggle = (key: keyof NotificationPreferences) => (value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyNotificationPreferences(prefs);
      toast({ title: "Preferences saved" });
    } catch (e: any) {
      toast({
        title: "Could not save",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container max-w-2xl py-10 flex-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-display font-bold">Notification preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose which in-app notifications you'd like to receive.
          </p>
        </header>

        <Card className="divide-y">
          {loading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <>
              <PreferenceRow
                icon={<Bell className="h-4 w-4" />}
                title="Order updates"
                description="When an artist accepts, rejects, or ships your order."
                checked={prefs.inapp_order_updates}
                onCheckedChange={toggle("inapp_order_updates")}
              />
              <PreferenceRow
                icon={<PackageCheck className="h-4 w-4" />}
                title="Delivery events"
                description="When your order is marked as delivered."
                checked={prefs.inapp_delivery_events}
                onCheckedChange={toggle("inapp_delivery_events")}
              />
            </>
          )}
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const PreferenceRow = ({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4 p-5">
    <div className="flex items-start gap-3 min-w-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default NotificationPreferencesPage;