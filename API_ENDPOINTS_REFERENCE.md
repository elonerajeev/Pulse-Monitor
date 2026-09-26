# API Endpoints Reference
## Pulse Monitor Core Features (Tasks 1-7)

**Base URL:** `/api/v1`  
**Authentication:** All endpoints require JWT token in `Authorization: Bearer {token}` header

---

## 📊 Performance Metrics Endpoints

### Get Performance Metrics
```
GET /monitoring/:serviceId/metrics
```
Returns: Response time, Core Web Vitals, SSL metrics, anomaly flags

### Get Performance Trends
```
GET /monitoring/:serviceId/metrics/trends
Query: timeRange (1h, 24h, 7d, 30d)
```
Returns: Time-series trend data with averages and percentiles

### Compare Performance
```
GET /monitoring/:serviceId/metrics/comparison
Query: compareServiceId, timeRange
```
Returns: Side-by-side comparison of two services

### Get Anomalies
```
GET /monitoring/:serviceId/metrics/anomalies
Query: limit, offset
```
Returns: Detected anomalies with severity levels

---

## 🌍 Multi-Region Monitoring Endpoints

### Create Multi-Region Config
```
POST /monitoring/:serviceId/multi-region
Body: {
  regions: ["us-east-1", "eu-west-1", ...],
  enableFailover: true,
  failoverStrategy: "fastest",
  regionWeights: { "us-east-1": 0.5, ... }
}
```

### Get Multi-Region Config
```
GET /monitoring/:serviceId/multi-region
```

### Get Regional Health Status
```
GET /monitoring/:serviceId/multi-region/health
```
Returns: Health % per region, active alerts, uptime

### Get Regional Performance Comparison
```
GET /monitoring/:serviceId/multi-region/performance
Query: timeRange (1h, 24h, 7d, 30d)
```
Returns: Response time, failure rate, throughput per region

### Get Regional Alerts
```
GET /monitoring/:serviceId/multi-region/alerts
Query: status, region
```

### Update Region Configuration
```
PUT /monitoring/:serviceId/multi-region/regions/:regionName
Body: { enabled: true, alertThreshold: 500 }
```

### Configure Failover Strategy
```
PUT /monitoring/:serviceId/multi-region/failover
Body: {
  enabled: true,
  strategy: "fastest|latency|weight",
  primaryRegion: "us-east-1",
  regionWeights: { ... }
}
```

### Trigger Manual Failover
```
POST /monitoring/:serviceId/multi-region/failover/trigger
Body: { targetRegion: "eu-west-1", reason: "Emergency" }
```

### Get Failover History
```
GET /monitoring/:serviceId/multi-region/failover/history
Query: limit (default: 20)
```

### Delete Multi-Region Config
```
DELETE /monitoring/:serviceId/multi-region
```

---

## 📋 SLA Configuration Endpoints

### Create SLA Configuration
```
POST /monitoring/:serviceId/sla
Body: {
  uptimeTarget: 99.9,
  responseTimeTarget: 200,
  errorRateTarget: 0.1,
  monthlyCredits: 100,
  billingCycle: "monthly"
}
```

### Get SLA Configuration
```
GET /monitoring/:serviceId/sla
```

### Get Current SLA Metrics
```
GET /monitoring/:serviceId/sla/metrics
Query: period (current_month, last_month, custom)
```
Returns: Current metrics, breach status, credits earned/used

### Get SLA Breach History
```
GET /monitoring/:serviceId/sla/history
Query: limit, offset
```

### Update SLA Targets
```
PUT /monitoring/:serviceId/sla/targets
Body: {
  uptimeTarget: 99.95,
  responseTimeTarget: 150,
  errorRateTarget: 0.05
}
```

### Configure SLA Credits
```
PUT /monitoring/:serviceId/sla/credits
Body: {
  monthlyAllocation: 100,
  creditDetails: [
    { condition: { type: "uptime_breach", threshold: 99.5 }, creditAmount: 25 },
    ...
  ]
}
```

### Record SLA Breach
```
POST /monitoring/:serviceId/sla/breaches
Body: {
  breachType: "uptime|response_time|error_rate",
  severity: "high",
  details: "Service was down for 15 minutes",
  creditsApplied: 25
}
```

### Get SLA Report
```
GET /monitoring/:serviceId/sla/report
Query: startDate, endDate
```
Returns: Compliance %, breaches, credits, detailed report

### Get SLA Notifications Settings
```
GET /monitoring/:serviceId/sla/notifications
```

### Update Notifications Settings
```
PUT /monitoring/:serviceId/sla/notifications
Body: {
  enableWarnings: true,
  warningThreshold: 95,
  notificationChannels: ["email", "slack"]
}
```

### Delete SLA Configuration
```
DELETE /monitoring/:serviceId/sla
```

---

## 🚨 Incident Management Endpoints

### Create Incident
```
POST /incidents
Body: {
  monitoringId: "serviceId",
  title: "Database connection timeout",
  description: "Cannot connect to primary DB",
  severity: "critical",
  affectedServices: [...],
  affectedUsers: 5000,
  detectedAt: "2026-09-26T10:00:00Z"
}
```

### List Incidents
```
GET /incidents
Query: status (all, investigating, identified, monitoring, resolved),
       severity (critical, high, medium, low),
       limit, offset, sortBy, sortOrder
```

### Get Incident by ID
```
GET /incidents/:incidentId
```

### Get Incidents for Service
```
GET /incidents/service/:serviceId
Query: limit, offset
```

### Get Incident Statistics
```
GET /incidents/stats/overview
Query: days (default: 30)
```
Returns: Total, open, resolved, by severity, avg resolution time

### Update Incident Status
```
PATCH /incidents/:incidentId/status
Body: { status: "investigating|identified|monitoring|resolved", message: "..." }
```

### Add Timeline Event
```
POST /incidents/:incidentId/timeline
Body: { title: "...", description: "...", type: "update" }
```

### Get Incident Timeline
```
GET /incidents/:incidentId/timeline
```

### Add Root Cause Analysis (RCA)
```
POST /incidents/:incidentId/rca
Body: {
  rootCause: "Database connection pool exhausted",
  contributingFactors: ["High traffic", "No connection pooling"],
  immediateActions: ["Increased pool size", "Load balancer restart"],
  preventiveActions: ["Auto-scaling", "Connection pool monitoring"],
  lessons: ["Need better connection management"]
}
```

### Get RCA
```
GET /incidents/:incidentId/rca
```

### Update Impact Metrics
```
PATCH /incidents/:incidentId/impact
Body: {
  affectedUsers: 8000,
  affectedSessions: 12000,
  errorRate: 45.5,
  performanceDegradation: 65
}
```

### Publish Customer Communication
```
POST /incidents/:incidentId/communication
Body: {
  message: "We are investigating the issue...",
  channels: ["status_page", "email", "slack"]
}
```

### Get Incident Communications
```
GET /incidents/:incidentId/communications
```

### Delete Incident
```
DELETE /incidents/:incidentId
```

---

## 🔔 Alert Rule Endpoints

### Create Alert Rule
```
POST /alerts/rules
Body: {
  monitoringId: "serviceId",
  name: "High Response Time",
  description: "Alert when response time > 500ms",
  conditions: [
    { type: "threshold", metric: "responseTime", operator: "gt", threshold: 500 }
  ],
  notificationChannels: ["email", "slack"],
  escalationPolicy: [...],
  enableAutoResolve: true,
  cooldownMinutes: 5,
  tags: ["performance", "critical"]
}
```

### List Alert Rules
```
GET /alerts/rules
Query: monitoringId, status (all, active, inactive),
       tags, limit, offset
```

### Get Alert Rule
```
GET /alerts/rules/:ruleId
```

### Update Alert Rule
```
PUT /alerts/rules/:ruleId
Body: { name, description, conditions, notificationChannels, ... }
```

### Test Alert Rule
```
POST /alerts/rules/:ruleId/test
Body: { testData: { responseTime: 600, errorRate: 5 } }
```
Returns: Evaluation result, whether rule would trigger

### Get Rule Execution History
```
GET /alerts/rules/:ruleId/history
Query: limit, offset
```

### Get Triggered Alerts from Rule
```
GET /alerts/rules/:ruleId/alerts
Query: status (all, active, resolved), limit, offset
```

### Enable Alert Rule
```
PATCH /alerts/rules/:ruleId/enable
```

### Disable Alert Rule
```
PATCH /alerts/rules/:ruleId/disable
```

### Duplicate Alert Rule
```
POST /alerts/rules/:ruleId/duplicate
Body: { newName: "High Response Time - Copy" }
```

### Get Alert Rule Statistics
```
GET /alerts/stats/overview
Query: days (default: 30)
```

### Delete Alert Rule
```
DELETE /alerts/rules/:ruleId
```

---

## 👥 Team Management Endpoints

### Create Team
```
POST /teams
Body: {
  name: "DevOps Team",
  description: "Production monitoring team",
  plan: "professional" | "starter" | "enterprise"
}
```

### List User Teams
```
GET /teams
Query: limit, offset
```

### Get Team
```
GET /teams/:teamId
```

### Update Team
```
PUT /teams/:teamId
Body: { name: "...", description: "..." }
```

### Invite Member
```
POST /teams/:teamId/members/invite
Body: { email: "user@example.com", role: "admin|member" }
```
Returns: Invitation token (send to user)

### Accept Invitation
```
POST /teams/:teamId/members/accept-invite
Body: { token: "invitation_token" }
```

### Get Team Members
```
GET /teams/:teamId/members
Query: limit, offset
```

### Update Member Role
```
PATCH /teams/:teamId/members/:memberId
Body: { role: "admin|member" }
```

### Remove Member
```
DELETE /teams/:teamId/members/:memberId
```

### Get Audit Log
```
GET /teams/:teamId/audit-log
Query: limit, offset
```

### Get Billing Information
```
GET /teams/:teamId/billing
```

### Get Team Services
```
GET /teams/:teamId/services
Query: limit, offset
```

### Delete Team
```
DELETE /teams/:teamId
```

---

## 🔑 API Key Management Endpoints

### Create API Key
```
POST /api-keys
Body: {
  name: "Production Monitor",
  description: "For CI/CD pipeline",
  permissions: ["monitoring:read", "alerts:write"],
  expiresAt: "2026-12-31",
  ipWhitelist: { enabled: true, ips: ["192.168.1.0/24"] },
  allowedServices: ["serviceId1", "serviceId2"],
  rateLimit: {
    enabled: true,
    requestsPerMinute: 60,
    requestsPerHour: 1800,
    requestsPerDay: 50000
  }
}
```
Returns: `{ apiKey: {...}, plainKey: "pk_..." }`
⚠️ **Store plainKey securely - shown only once!**

### List API Keys
```
GET /api-keys
Query: limit, offset, status (all, active, inactive, revoked)
```

### Get API Key
```
GET /api-keys/:keyId
```

### Update API Key
```
PUT /api-keys/:keyId
Body: { name, description, permissions, rateLimit, ... }
```

### Rotate API Key
```
POST /api-keys/:keyId/rotate
Body: { reason: "Security audit" }
```
Returns: New `plainKey` (shown only once)

### Revoke API Key
```
POST /api-keys/:keyId/revoke
Body: { reason: "Compromised" }
```

### Get API Key Usage Summary
```
GET /api-keys/:keyId/usage
```
Returns: Total requests, errors, rate, top endpoints, permissions

### Get API Key Usage History
```
GET /api-keys/:keyId/usage/history
Query: limit, offset
```

### Delete API Key
```
DELETE /api-keys/:keyId
```

---

## 📊 Common Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Results per page (default: 20) |
| offset | number | Number of items to skip (default: 0) |
| timeRange | string | 1h, 24h, 7d, 30d |
| status | string | Filter by status |
| severity | string | Filter by severity |
| sortBy | string | Field to sort by |
| sortOrder | string | asc or desc |
| startDate | ISO date | Start of date range |
| endDate | ISO date | End of date range |

---

## 🔐 Common Headers

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Correlation-ID: {auto-generated}
```

---

## ✅ Response Format

### Success Response (200-201)
```json
{
  "status": "success",
  "code": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "errorCode": "ERROR_CODE",
  "message": "Error description",
  "statusCode": 400
}
```

---

## 🚀 Usage Examples

### Create and Get Metrics
```bash
# Get performance metrics
curl -X GET "http://localhost:5000/api/v1/monitoring/service123/metrics" \
  -H "Authorization: Bearer {token}"

# Get trends over 7 days
curl -X GET "http://localhost:5000/api/v1/monitoring/service123/metrics/trends?timeRange=7d" \
  -H "Authorization: Bearer {token}"
```

### Create Team and Invite Member
```bash
# Create team
curl -X POST "http://localhost:5000/api/v1/teams" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"DevOps","description":"Monitoring team"}'

# Invite member
curl -X POST "http://localhost:5000/api/v1/teams/teamId/members/invite" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","role":"admin"}'
```

### Create and Test Alert Rule
```bash
# Create alert rule
curl -X POST "http://localhost:5000/api/v1/alerts/rules" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"High Response Time",
    "conditions":[{"type":"threshold","metric":"responseTime","operator":"gt","threshold":500}]
  }'

# Test the rule
curl -X POST "http://localhost:5000/api/v1/alerts/rules/ruleId/test" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"testData":{"responseTime":600}}'
```

---

**Last Updated:** September 26, 2026  
**Status:** ✅ Ready for Integration Testing
