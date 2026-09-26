import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Globe, Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api, { API_ORIGIN } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

interface Service {
  _id: string;
  name: string;
  target: string;
  status: string;
  isPublic?: boolean;
}

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy", { description: "Select the text and copy it manually." });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={copy} className="shrink-0">
      {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
};

const StatusPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [digest, setDigest] = useState<string | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);

  // The status page is keyed by the owner's id, which the API returns on the
  // monitors it sends back — no extra round trip needed to build the link.
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/monitoring")
      .then(({ data }) => {
        const list: Service[] = data.data || [];
        setServices(list);
        const owner = (data.data?.[0] as any)?.owner;
        if (owner) setOwnerId(typeof owner === "string" ? owner : owner._id);
      })
      .catch(() => toast.error("Couldn't load your services"))
      .finally(() => setLoading(false));
  }, []);

  const statusUrl = ownerId ? `${window.location.origin}/status/${ownerId}` : null;
  const publicCount = services.filter((s) => s.isPublic).length;

  const togglePublic = async (service: Service, next: boolean) => {
    setSavingId(service._id);
    // Optimistic: the switch should feel instant, and it is reverted on failure.
    setServices((prev) => prev.map((s) => (s._id === service._id ? { ...s, isPublic: next } : s)));
    try {
      await api.patch(`/monitoring/${service._id}`, { isPublic: next });
      toast.success(next ? `${service.name} is now public` : `${service.name} is now private`);
    } catch {
      setServices((prev) => prev.map((s) => (s._id === service._id ? { ...s, isPublic: !next } : s)));
      toast.error("Couldn't update that service");
    } finally {
      setSavingId(null);
    }
  };

  const generateDigest = async () => {
    setDigestLoading(true);
    setDigest(null);
    try {
      const { data } = await api.post("/ai/digest");
      setDigest(data.data.summary);
    } catch (err: any) {
      toast.error("Couldn't generate the digest", {
        description: err?.response?.data?.message || "Please try again shortly.",
      });
    } finally {
      setDigestLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Status Page & Sharing</h1>
        <p className="text-muted-foreground">
          Publish a live status page for your customers, embed uptime badges, and get an
          AI summary of the last 24 hours.
        </p>
      </header>

      <section className="rounded-xl border p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Daily AI digest</h2>
        </div>

        {digest ? (
          <div className="space-y-2 whitespace-pre-wrap text-sm leading-relaxed">{digest}</div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ask the assistant to review your monitors and summarise what happened, what
            broke, and what needs attention.
          </p>
        )}

        <Button onClick={generateDigest} disabled={digestLoading} className="mt-4" size="sm">
          {digestLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reviewing your monitors…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {digest ? "Regenerate" : "Generate digest"}
            </>
          )}
        </Button>
      </section>

      <section className="rounded-xl border p-5">
        <div className="mb-1 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Your public status page</h2>
        </div>

        {publicCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            Make at least one service public below to activate your status page.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Showing {publicCount} of {services.length} services. Anyone with this link can
              view it — no account needed.
            </p>
            {statusUrl && (
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs">
                  {statusUrl}
                </code>
                <CopyButton value={statusUrl} label="Copy link" />
                <Button variant="outline" size="sm" asChild>
                  <a href={statusUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open
                  </a>
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Services</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your services…</p>
        ) : services.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            You don't have any monitors yet.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {services.map((service) => {
              const badgeMarkdown = `![uptime](${API_ORIGIN}/api/v1/public/badge/${service._id})`;

              return (
                <li key={service._id} className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{service.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{service.target}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {service.isPublic ? (
                        <Globe className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={Boolean(service.isPublic)}
                        disabled={savingId === service._id}
                        onCheckedChange={(next) => togglePublic(service, next)}
                        aria-label={`Make ${service.name} public`}
                      />
                    </div>
                  </div>

                  {service.isPublic && (
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs">
                        {badgeMarkdown}
                      </code>
                      <CopyButton value={badgeMarkdown} label="Copy badge" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default StatusPage;
