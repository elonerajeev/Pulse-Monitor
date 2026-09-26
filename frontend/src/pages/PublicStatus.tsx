import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, HelpCircle, XCircle } from "lucide-react";
import axios from "axios";

// Public, unauthenticated view. It deliberately uses a bare axios call rather
// than the shared api client: that client attaches credentials and CSRF tokens,
// which have no meaning for a visitor who is not signed in.
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "https://pulse-monitor-backend.onrender.com")
).replace(/\/+$/, "");

interface Uptime {
  day: number | null;
  week: number | null;
  month: number | null;
  avgResponseTime: number | null;
}

interface Service {
  id: string;
  name: string;
  type: string;
  status: string;
  uptime: Uptime;
}

interface Incident {
  service: string;
  status: string;
  httpStatusCode: number | null;
  at: string;
}

interface StatusPage {
  title: string;
  overall: string;
  services: Service[];
  incidents: Incident[];
  generatedAt: string;
}

const STATUS_META: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  online: { label: "Operational", className: "text-emerald-500", Icon: CheckCircle2 },
  degraded: { label: "Degraded", className: "text-amber-500", Icon: AlertTriangle },
  offline: { label: "Outage", className: "text-red-500", Icon: XCircle },
  pending: { label: "Awaiting first check", className: "text-muted-foreground", Icon: Clock },
};

const meta = (status: string) =>
  STATUS_META[status] || { label: status, className: "text-muted-foreground", Icon: HelpCircle };

const BANNER: Record<string, string> = {
  online: "All systems operational",
  degraded: "Some systems degraded",
  offline: "Active outage",
  pending: "Awaiting first checks",
};

// A window with no checks reports null rather than 100% — never dress that up.
const formatUptime = (value: number | null) => (value === null ? "—" : `${value.toFixed(2)}%`);

const PublicStatus = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StatusPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get(`${API_ORIGIN}/api/v1/public/status/${slug}`)
      .then(({ data }) => {
        if (!cancelled) setPage(data.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.status === 404
              ? "This status page doesn't exist, or no services have been made public yet."
              : "Could not load this status page. Please try again shortly."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Public pages are read by people who may not share the operator's theme, so
  // this view sets its own colours rather than inheriting the dashboard's.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading status…
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <HelpCircle className="h-10 w-10 text-muted-foreground" />
        <p className="max-w-md text-muted-foreground">{error}</p>
      </div>
    );
  }

  const overall = meta(page.overall);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">{page.title}</h1>
          <div className={`flex items-center justify-center gap-2 text-lg font-medium ${overall.className}`}>
            <overall.Icon className="h-6 w-6" />
            {BANNER[page.overall] || overall.label}
          </div>
          <p className="text-xs text-muted-foreground">
            Updated {new Date(page.generatedAt).toLocaleString()}
          </p>
        </header>

        <section className="divide-y rounded-xl border">
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[1fr_5rem_5rem_5rem]">
            <span>Service</span>
            <span className="hidden text-right sm:block">24h</span>
            <span className="hidden text-right sm:block">7d</span>
            <span className="text-right">30d</span>
          </div>

          {page.services.map((service) => {
            const status = meta(service.status);
            return (
              <div
                key={service.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 sm:grid-cols-[1fr_5rem_5rem_5rem]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{service.name}</p>
                  <p className={`flex items-center gap-1.5 text-sm ${status.className}`}>
                    <status.Icon className="h-3.5 w-3.5" />
                    {status.label}
                    {service.uptime.avgResponseTime !== null && (
                      <span className="text-muted-foreground">· {service.uptime.avgResponseTime}ms avg</span>
                    )}
                  </p>
                </div>
                <span className="hidden text-right text-sm tabular-nums sm:block">
                  {formatUptime(service.uptime.day)}
                </span>
                <span className="hidden text-right text-sm tabular-nums sm:block">
                  {formatUptime(service.uptime.week)}
                </span>
                <span className="text-right text-sm tabular-nums">{formatUptime(service.uptime.month)}</span>
              </div>
            );
          })}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Past 7 days
          </h2>
          {page.incidents.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No incidents reported in the last 7 days.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {page.incidents.map((incident, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{incident.service}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {incident.status}
                      {incident.httpStatusCode ? ` (HTTP ${incident.httpStatusCode})` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(incident.at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="pt-2 text-center text-xs text-muted-foreground">
          Powered by PulseMonitor
        </footer>
      </div>
    </div>
  );
};

export default PublicStatus;
