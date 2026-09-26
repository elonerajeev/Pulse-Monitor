import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Key, Copy, RotateCw, Trash2, Eye, EyeOff } from 'lucide-react';

export default function ApiKeysManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showPlainKey, setShowPlainKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<any>(null);

  const { data: keys, isLoading, refetch } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => api.listApiKeys(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createApiKey({
        name: newKeyName,
        permissions: ['monitoring:read', 'alerts:read'],
      }),
    onSuccess: (data) => {
      setCreatedKey(data.data);
      setShowKeyDialog(true);
      setNewKeyName('');
      setShowCreateDialog(false);
      refetch();
    },
  });

  const rotateMutation = useMutation({
    mutationFn: (id: string) => api.rotateApiKey(id),
    onSuccess: (data) => {
      setCreatedKey(data.data);
      setShowKeyDialog(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteApiKey(id),
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const allKeys = keys?.data?.keys || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-gray-500 mt-2">Manage programmatic access tokens</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>+ Create Key</Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allKeys.filter((k: any) => k.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allKeys.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allKeys.filter((k: any) => k.status === 'revoked').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API credentials</CardDescription>
        </CardHeader>
        <CardContent>
          {allKeys.length > 0 ? (
            <div className="space-y-3">
              {allKeys.map((key: any) => (
                <div key={key._id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Key className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{key.keyPrefix}</p>
                    <div className="flex gap-2 mt-2">
                      {key.permissions?.slice(0, 3).map((perm: string) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm.split(':')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={key.status === 'active' ? 'default' : 'destructive'}>
                      {key.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rotateMutation.mutate(key._id)}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(key._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No API keys yet</p>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Key Name</label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Production API Key"
              />
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newKeyName}
              className="w-full"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
          </DialogHeader>
          {createdKey && (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ Save this key securely. You won't be able to see it again.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <div className="flex gap-2">
                  <Input
                    type={showPlainKey ? 'text' : 'password'}
                    value={createdKey.plainKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPlainKey(!showPlainKey)}
                  >
                    {showPlainKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(createdKey.plainKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setShowKeyDialog(false)} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
