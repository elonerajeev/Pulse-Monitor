import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import api, { API_ORIGIN } from '@/utils/api';
import {
  Activity,
  Check,
  Copy,
  HeartPulse,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface Heartbeat {
  _id: string;
  name: string;
  description?: string;
  token: string;
  expectedIntervalMinutes: number;
  graceMinutes: number;
  status: 'pending' | 'up' | 'down';
  lastPingAt?: string | null;
  lastPingSource?: string | null;
  totalPings: number;
  isPaused: boolean;
  dueAt?: string | null;
  overdue?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  up: 'bg-green-500/15 text-green-600 dark:text-green-400',
  down: 'bg-red-500/15 text-red-600 dark:text-red-400',
  pending: 'bg-muted text-muted-foreground',
  paused: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

/** Paused wins over the stored status: a paused job is not "down", nobody is watching it. */
const displayStatus = (hb: Heartbeat) => (hb.isPaused ? 'paused' : hb.status);

const relativeTime = (value?: string | null) => {
  if (!value) return 'never';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const pingUrlFor = (hb: Heartbeat) => `${API_ORIGIN}/api/v1/heartbeats/ping/${hb.token}`;

const Heartbeats = () => {
  const { toast } = useToast();
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    expectedIntervalMinutes: 60,
    graceMinutes: 5,
  });

  const fetchHeartbeats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/heartbeats');
      setHeartbeats(data.data ?? []);
    } catch {
      toast({
        title: 'Could not load heartbeats',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHeartbeats();
  }, [fetchHeartbeats]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await api.post('/heartbeats', form);
      toast({ title: 'Heartbeat created', description: 'Copy its ping URL into your job.' });
      setCreateOpen(false);
      setForm({ name: '', description: '', expectedIntervalMinutes: 60, graceMinutes: 5 });
      await fetchHeartbeats();
    } catch (error: any) {
      toast({
        title: 'Could not create heartbeat',
        description: error?.response?.data?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePause = async (hb: Heartbeat) => {
    try {
      await api.patch(`/heartbeats/${hb._id}`, { isPaused: !hb.isPaused });
      await fetchHeartbeats();
    } catch {
      toast({ title: 'Could not update heartbeat', variant: 'destructive' });
    }
  };

  const rotateToken = async (hb: Heartbeat) => {
    // Destructive in practice: every existing caller stops working the moment
    // the old token is retired, so make that consequence explicit first.
    if (
      !window.confirm(
        `Rotate the token for "${hb.name}"?\n\nAny job still using the current URL will stop checking in until you update it.`
      )
    ) {
      return;
    }

    try {
      await api.post(`/heartbeats/${hb._id}/rotate-token`);
      toast({ title: 'Token rotated', description: 'Update the URL in your job.' });
      await fetchHeartbeats();
    } catch {
      toast({ title: 'Could not rotate token', variant: 'destructive' });
    }
  };

  const remove = async (hb: Heartbeat) => {
    if (!window.confirm(`Delete "${hb.name}" and its check-in history?`)) return;

    try {
      await api.delete(`/heartbeats/${hb._id}`);
      toast({ title: 'Heartbeat deleted' });
      await fetchHeartbeats();
    } catch {
      toast({ title: 'Could not delete heartbeat', variant: 'destructive' });
    }
  };

  const copyUrl = async (hb: Heartbeat) => {
    try {
      await navigator.clipboard.writeText(pingUrlFor(hb));
      setCopiedId(hb._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: 'Could not copy', description: pingUrlFor(hb), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <HeartPulse className="h-6 w-6 text-primary" />
            Heartbeats
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch the jobs that should call in — cron, backups, ETL. If a check-in never
            arrives, you hear about it.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchHeartbeats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">New heartbeat</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New heartbeat</DialogTitle>
                <DialogDescription>
                  We'll give you a URL to call at the end of your job.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="hb-name">Name</Label>
                  <Input
                    id="hb-name"
                    placeholder="Nightly database backup"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hb-description">Description (optional)</Label>
                  <Textarea
                    id="hb-description"
                    placeholder="Runs on the db host at 02:00 UTC"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hb-interval">Expected every (minutes)</Label>
                    <Input
                      id="hb-interval"
                      type="number"
                      min={1}
                      value={form.expectedIntervalMinutes}
                      onChange={(e) =>
                        setForm({ ...form, expectedIntervalMinutes: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hb-grace">Grace period (minutes)</Label>
                    <Input
                      id="hb-grace"
                      type="number"
                      min={0}
                      value={form.graceMinutes}
                      onChange={(e) => setForm({ ...form, graceMinutes: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">
                      How late a check-in can be before we alert.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && heartbeats.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading heartbeats…
          </CardContent>
        </Card>
      )}

      {!loading && heartbeats.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Activity className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No heartbeats yet</p>
              <p className="text-sm text-muted-foreground">
                Create one, then add a single <code>curl</code> to the end of your job.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>Create your first heartbeat</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {heartbeats.map((hb) => {
          const status = displayStatus(hb);
          return (
            <Card key={hb._id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {hb.name}
                      <Badge className={STATUS_STYLES[status]} variant="secondary">
                        {status}
                      </Badge>
                      {hb.overdue && !hb.isPaused && status !== 'down' && (
                        <Badge variant="outline" className="text-amber-600">
                          overdue
                        </Badge>
                      )}
                    </CardTitle>
                    {hb.description && <CardDescription>{hb.description}</CardDescription>}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePause(hb)}
                      title={hb.isPaused ? 'Resume' : 'Pause'}
                    >
                      {hb.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rotateToken(hb)}
                      title="Rotate token"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(hb)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Expected every</p>
                    <p className="font-medium">{hb.expectedIntervalMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grace</p>
                    <p className="font-medium">{hb.graceMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last check-in</p>
                    <p className="font-medium">{relativeTime(hb.lastPingAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total check-ins</p>
                    <p className="font-medium">{hb.totalPings}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Ping URL</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-md bg-muted px-3 py-2 text-xs">
                      {pingUrlFor(hb)}
                    </code>
                    <Button variant="outline" size="sm" onClick={() => copyUrl(hb)}>
                      {copiedId === hb._id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add <code>curl -fsS -m 10 "{'<url>'}"</code> to the end of your job. Append{' '}
                    <code>?state=fail</code> to report a failed run.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Heartbeats;
