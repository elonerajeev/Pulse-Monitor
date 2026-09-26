import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Play, Copy, Trash2 } from 'lucide-react';

export default function AlertRulesManagement() {
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [testData, setTestData] = useState('{}');

  const { data: rules, isLoading, refetch } = useQuery({
    queryKey: ['alertRules'],
    queryFn: () => api.listAlertRules(),
  });

  const { data: stats } = useQuery({
    queryKey: ['alertStats'],
    queryFn: () => api.listAlertRules({ limit: 100 }),
  });

  const testMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.testAlertRule(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAlertRule(id),
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const allRules = rules?.data?.rules || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alert Rules</h1>
          <p className="text-gray-500 mt-2">Create and manage custom alert rules</p>
        </div>
        <Button>+ Create Rule</Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allRules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allRules.filter((r: any) => r.enabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {allRules.filter((r: any) => !r.enabled).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
          <CardDescription>Manage alert conditions and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {allRules.length > 0 ? (
            <div className="space-y-3">
              {allRules.map((rule: any) => (
                <div key={rule._id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                    <div className="flex gap-2 mt-2">
                      {rule.conditions?.map((cond: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cond.metric} {cond.operator} {cond.threshold}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRule(rule);
                        setShowTestDialog(true);
                      }}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(rule._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No alert rules configured</p>
          )}
        </CardContent>
      </Card>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Alert Rule: {selectedRule?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Data (JSON)</label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className="w-full h-32 border rounded p-2 font-mono text-sm"
                placeholder='{"responseTime": 500, "errorRate": 5}'
              />
            </div>
            <Button
              onClick={() => {
                try {
                  const data = JSON.parse(testData);
                  testMutation.mutate({ id: selectedRule._id, data });
                } catch {
                  alert('Invalid JSON');
                }
              }}
              disabled={testMutation.isPending}
              className="w-full"
            >
              {testMutation.isPending ? 'Testing...' : 'Test Rule'}
            </Button>
            {testMutation.data && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="font-medium text-blue-900">Test Result</p>
                <p className="text-sm text-blue-700">
                  {testMutation.data?.data?.willTrigger ? 'Alert will trigger' : 'Alert will not trigger'}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
