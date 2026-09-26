import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Mail, Trash2, Shield } from 'lucide-react';

export default function TeamManagement() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const { data: teams, isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.listTeams(),
  });

  const { data: members } = useQuery({
    queryKey: ['teamMembers', selectedTeam?._id],
    queryFn: () => api.getTeamMembers(selectedTeam._id),
    enabled: !!selectedTeam,
  });

  const { data: auditLog } = useQuery({
    queryKey: ['auditLog', selectedTeam?._id],
    queryFn: () => api.getAuditLog(selectedTeam._id),
    enabled: !!selectedTeam,
  });

  const inviteMutation = useMutation({
    mutationFn: () => api.inviteMember(selectedTeam._id, email, role),
    onSuccess: () => {
      setEmail('');
      setRole('member');
      setShowInviteDialog(false);
      refetch();
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const allTeams = teams?.data?.teams || [];
  const teamMembers = members?.data?.members || [];
  const logs = auditLog?.data?.auditLog || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-gray-500 mt-2">Manage team members and permissions</p>
        </div>
        <Button>+ Create Team</Button>
      </div>

      {/* Teams Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTeams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Your teams and their members</CardDescription>
        </CardHeader>
        <CardContent>
          {allTeams.length > 0 ? (
            <div className="space-y-3">
              {allTeams.map((team: any) => (
                <div
                  key={team._id}
                  onClick={() => setSelectedTeam(team)}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-gray-500">{team.description}</p>
                  </div>
                  <Badge variant="outline">{team.members?.length} members</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No teams yet</p>
          )}
        </CardContent>
      </Card>

      {/* Team Details */}
      {selectedTeam && (
        <>
          <Card>
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedTeam.name}</CardTitle>
                <CardDescription>{selectedTeam.description}</CardDescription>
              </div>
              <Button onClick={() => setShowInviteDialog(true)}>+ Invite Member</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member: any) => (
                  <div key={member._id} className="flex items-center gap-3 p-3 border rounded">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">{member.user?.email}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Recent team activities</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.slice(0, 10).map((log: any, idx: number) => (
                    <div key={idx} className="text-sm p-2 border-l-2 border-blue-200">
                      <p className="font-medium capitalize">{log.action}</p>
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No audit events</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending || !email}
              className="w-full"
            >
              {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
