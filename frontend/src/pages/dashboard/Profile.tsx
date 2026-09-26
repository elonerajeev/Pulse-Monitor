import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Bell, Mail, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

type PrefKey = "incidentEmails" | "sslExpiry" | "weeklyReport";

const PREFS: { key: PrefKey; title: string; description: string }[] = [
  {
    key: "incidentEmails",
    title: "Incident emails",
    description: "When a monitor or heartbeat goes down, and when it recovers.",
  },
  {
    key: "sslExpiry",
    title: "Certificate expiry warnings",
    description: "Ahead of a TLS certificate expiring, so it never lapses unnoticed.",
  },
  {
    key: "weeklyReport",
    title: "Weekly uptime report",
    description: "A Monday digest of uptime, response times, and incidents.",
  },
];

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    incidentEmails: true,
    sslExpiry: true,
    weeklyReport: true,
  });
  const [savingPref, setSavingPref] = useState<PrefKey | null>(null);
  const [sendingReport, setSendingReport] = useState(false);

  // Seed from the signed-in user once it loads; the API is the source of truth
  // for the defaults, so absent values fall back to on rather than off.
  useEffect(() => {
    const stored = (user as any)?.notificationPrefs;
    if (!stored) return;
    setPrefs({
      incidentEmails: stored.incidentEmails !== false,
      sslExpiry: stored.sslExpiry !== false,
      weeklyReport: stored.weeklyReport !== false,
    });
  }, [user]);

  const updatePref = async (key: PrefKey, value: boolean) => {
    const previous = prefs[key];
    // Optimistic, with an explicit rollback: a toggle that silently snaps back
    // is worse than one that never moved.
    setPrefs((current) => ({ ...current, [key]: value }));
    setSavingPref(key);

    try {
      await api.patch("/users/notification-prefs", { [key]: value });
    } catch {
      setPrefs((current) => ({ ...current, [key]: previous }));
      toast({ title: "Could not save that preference", variant: "destructive" });
    } finally {
      setSavingPref(null);
    }
  };

  const sendReportNow = async () => {
    setSendingReport(true);
    try {
      await api.post("/reports/send");
      toast({
        title: "Report sent",
        description: `Check ${user?.email} in a moment.`,
      });
    } catch (error: any) {
      toast({
        title: "Could not send the report",
        description: error?.response?.data?.message ?? "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-2xl font-bold">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/profile/edit")}>Edit Profile</Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription & Billing
          </CardTitle>
          <CardDescription>Manage your plan and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Current Plan</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="capitalize">{user?.plan || 'free'}</Badge>
                {user?.subscriptionStatus === 'active' && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Active</Badge>}
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/pricing">Change Plan</Link>
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> Secure billing powered by Stripe
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Email notifications
          </CardTitle>
          <CardDescription>
            Choose which emails reach {user?.email}. Slack and Discord alerts are configured
            per monitor and are not affected by these settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PREFS.map((pref) => (
            <div
              key={pref.key}
              className="flex items-start justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <Label htmlFor={pref.key} className="font-semibold">
                  {pref.title}
                </Label>
                <p className="text-sm text-muted-foreground">{pref.description}</p>
              </div>
              <Switch
                id={pref.key}
                checked={prefs[pref.key]}
                disabled={savingPref === pref.key}
                onCheckedChange={(checked) => updatePref(pref.key, checked)}
              />
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" /> Send this week's report now
              </p>
              <p className="text-sm text-muted-foreground">
                See what the weekly digest looks like without waiting for Monday.
              </p>
            </div>
            <Button variant="outline" onClick={sendReportNow} disabled={sendingReport}>
              <Send className="mr-2 h-4 w-4" />
              {sendingReport ? "Sending…" : "Send now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
