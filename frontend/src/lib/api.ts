import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  status: string;
  code: number;
  data: T;
  message: string;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        throw error;
      }
    );
  }

  // ==================== PERFORMANCE METRICS ====================
  async getPerformanceMetrics(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/metrics`);
  }

  async getPerformanceTrends(serviceId: string, timeRange = '24h') {
    return this.instance.get(`/monitoring/${serviceId}/metrics/trends`, {
      params: { timeRange },
    });
  }

  async getPerformanceComparison(serviceId: string, compareServiceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/metrics/comparison`, {
      params: { compareServiceId },
    });
  }

  async getPerformanceAnomalies(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/metrics/anomalies`);
  }

  // ==================== MULTI-REGION MONITORING ====================
  async createMultiRegionConfig(serviceId: string, config: any) {
    return this.instance.post(`/monitoring/${serviceId}/multi-region`, config);
  }

  async getMultiRegionConfig(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/multi-region`);
  }

  async getRegionalHealth(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/multi-region/health`);
  }

  async getRegionalPerformance(serviceId: string, timeRange = '24h') {
    return this.instance.get(`/monitoring/${serviceId}/multi-region/performance`, {
      params: { timeRange },
    });
  }

  async getRegionalAlerts(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/multi-region/alerts`);
  }

  async triggerFailover(serviceId: string, targetRegion: string, reason: string) {
    return this.instance.post(`/monitoring/${serviceId}/multi-region/failover/trigger`, {
      targetRegion,
      reason,
    });
  }

  async getFailoverHistory(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/multi-region/failover/history`);
  }

  // ==================== SLA CONFIGURATION ====================
  async createSLAConfiguration(serviceId: string, config: any) {
    return this.instance.post(`/monitoring/${serviceId}/sla`, config);
  }

  async getSLAConfiguration(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/sla`);
  }

  async getSLAMetrics(serviceId: string) {
    return this.instance.get(`/monitoring/${serviceId}/sla/metrics`);
  }

  async getSLAHistory(serviceId: string, limit = 30) {
    return this.instance.get(`/monitoring/${serviceId}/sla/history`, {
      params: { limit },
    });
  }

  async updateSLATargets(serviceId: string, targets: any) {
    return this.instance.put(`/monitoring/${serviceId}/sla/targets`, targets);
  }

  async getSLAReport(serviceId: string, startDate?: string, endDate?: string) {
    return this.instance.get(`/monitoring/${serviceId}/sla/report`, {
      params: { startDate, endDate },
    });
  }

  async recordSLABreach(serviceId: string, breach: any) {
    return this.instance.post(`/monitoring/${serviceId}/sla/breaches`, breach);
  }

  // ==================== INCIDENTS ====================
  async createIncident(incident: any) {
    return this.instance.post('/incidents', incident);
  }

  async listIncidents(params: any = {}) {
    return this.instance.get('/incidents', { params });
  }

  async getIncident(incidentId: string) {
    return this.instance.get(`/incidents/${incidentId}`);
  }

  async updateIncidentStatus(incidentId: string, status: string, message?: string) {
    return this.instance.patch(`/incidents/${incidentId}/status`, {
      status,
      message,
    });
  }

  async addTimelineEvent(incidentId: string, event: any) {
    return this.instance.post(`/incidents/${incidentId}/timeline`, event);
  }

  async getIncidentTimeline(incidentId: string) {
    return this.instance.get(`/incidents/${incidentId}/timeline`);
  }

  async addRCA(incidentId: string, rca: any) {
    return this.instance.post(`/incidents/${incidentId}/rca`, rca);
  }

  async getRCA(incidentId: string) {
    return this.instance.get(`/incidents/${incidentId}/rca`);
  }

  async updateImpactMetrics(incidentId: string, metrics: any) {
    return this.instance.patch(`/incidents/${incidentId}/impact`, metrics);
  }

  async publishCommunication(incidentId: string, communication: any) {
    return this.instance.post(`/incidents/${incidentId}/communication`, communication);
  }

  async getIncidentCommunications(incidentId: string) {
    return this.instance.get(`/incidents/${incidentId}/communications`);
  }

  async getIncidentStats(days = 30) {
    return this.instance.get('/incidents/stats/overview', { params: { days } });
  }

  // ==================== ALERT RULES ====================
  async createAlertRule(rule: any) {
    return this.instance.post('/alerts/rules', rule);
  }

  async listAlertRules(params: any = {}) {
    return this.instance.get('/alerts/rules', { params });
  }

  async getAlertRule(ruleId: string) {
    return this.instance.get(`/alerts/rules/${ruleId}`);
  }

  async updateAlertRule(ruleId: string, updates: any) {
    return this.instance.put(`/alerts/rules/${ruleId}`, updates);
  }

  async testAlertRule(ruleId: string, testData: any) {
    return this.instance.post(`/alerts/rules/${ruleId}/test`, { testData });
  }

  async getAlertRuleHistory(ruleId: string, limit = 50) {
    return this.instance.get(`/alerts/rules/${ruleId}/history`, { params: { limit } });
  }

  async getTriggeredAlerts(ruleId: string, params: any = {}) {
    return this.instance.get(`/alerts/rules/${ruleId}/alerts`, { params });
  }

  async enableAlertRule(ruleId: string) {
    return this.instance.patch(`/alerts/rules/${ruleId}/enable`);
  }

  async disableAlertRule(ruleId: string) {
    return this.instance.patch(`/alerts/rules/${ruleId}/disable`);
  }

  async deleteAlertRule(ruleId: string) {
    return this.instance.delete(`/alerts/rules/${ruleId}`);
  }

  // ==================== TEAMS ====================
  async createTeam(team: any) {
    return this.instance.post('/teams', team);
  }

  async listTeams(params: any = {}) {
    return this.instance.get('/teams', { params });
  }

  async getTeam(teamId: string) {
    return this.instance.get(`/teams/${teamId}`);
  }

  async updateTeam(teamId: string, updates: any) {
    return this.instance.put(`/teams/${teamId}`, updates);
  }

  async inviteMember(teamId: string, email: string, role: string) {
    return this.instance.post(`/teams/${teamId}/members/invite`, { email, role });
  }

  async acceptInvitation(teamId: string, token: string) {
    return this.instance.post(`/teams/${teamId}/members/accept-invite`, { token });
  }

  async getTeamMembers(teamId: string, params: any = {}) {
    return this.instance.get(`/teams/${teamId}/members`, { params });
  }

  async updateMemberRole(teamId: string, memberId: string, role: string) {
    return this.instance.patch(`/teams/${teamId}/members/${memberId}`, { role });
  }

  async removeMember(teamId: string, memberId: string) {
    return this.instance.delete(`/teams/${teamId}/members/${memberId}`);
  }

  async getAuditLog(teamId: string, params: any = {}) {
    return this.instance.get(`/teams/${teamId}/audit-log`, { params });
  }

  async getTeamBilling(teamId: string) {
    return this.instance.get(`/teams/${teamId}/billing`);
  }

  async deleteTeam(teamId: string) {
    return this.instance.delete(`/teams/${teamId}`);
  }

  // ==================== API KEYS ====================
  async createApiKey(key: any) {
    return this.instance.post('/api-keys', key);
  }

  async listApiKeys(params: any = {}) {
    return this.instance.get('/api-keys', { params });
  }

  async getApiKey(keyId: string) {
    return this.instance.get(`/api-keys/${keyId}`);
  }

  async updateApiKey(keyId: string, updates: any) {
    return this.instance.put(`/api-keys/${keyId}`, updates);
  }

  async rotateApiKey(keyId: string, reason?: string) {
    return this.instance.post(`/api-keys/${keyId}/rotate`, { reason });
  }

  async revokeApiKey(keyId: string, reason?: string) {
    return this.instance.post(`/api-keys/${keyId}/revoke`, { reason });
  }

  async getApiKeyUsage(keyId: string) {
    return this.instance.get(`/api-keys/${keyId}/usage`);
  }

  async deleteApiKey(keyId: string) {
    return this.instance.delete(`/api-keys/${keyId}`);
  }
}

export default new ApiClient();
