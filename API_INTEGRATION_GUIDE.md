# Pulse Monitor - API Integration Guide

Complete API documentation for the Pulse Monitor Enterprise SaaS platform covering all 14 core and premium features.

**Last Updated:** September 26, 2026
**API Version:** v1
**Base URL:** `http://localhost:5000/api/v1` (local) | `https://api.pulsemonitor.com/api/v1` (production)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Core Features](#core-features)
3. [Premium Features](#premium-features)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Frontend Integration](#frontend-integration)
7. [WebSocket Support](#websocket-support)
8. [Code Examples](#code-examples)

---

## Authentication

All API endpoints (except `/auth/login`, `/auth/signup`, `/auth/refresh-token`) require JWT bearer token authentication.

### Getting a Token

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "status": "success",
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    }
  },
  "message": "Login successful"
}
```

### Using the Token

All authenticated requests must include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Token Refresh

```bash
POST /auth/refresh-token
Content-Type: application/json

{
  "token": "existing-token"
}

Response: Returns new token
```

---

## Core Features

### 1. Performance Metrics

Retrieve and analyze performance metrics for monitored services.

#### Get Performance Metrics

```
GET /monitoring/{serviceId}/metrics
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "code": 200,
  "data": {
    "serviceId": "service-123",
    "uptime": 99.95,
    "avgResponseTime": 245,
    "minResponseTime": 120,
    "maxResponseTime": 890,
    "requestsPerSecond": 1250,
    "errorRate": 0.05,
    "timestamp": "2026-09-26T10:30:00Z"
  },
  "message": "Metrics retrieved successfully"
}
```

#### Get Performance Trends

```
GET /monitoring/{serviceId}/metrics/trends?timeRange=24h
Authorization: Bearer <token>

Query Parameters:
- timeRange: "1h" | "6h" | "24h" | "7d" | "30d" (default: 24h)

Response:
{
  "status": "success",
  "data": {
    "trends": [
      {
        "timestamp": "2026-09-26T09:00:00Z",
        "avgResponseTime": 230,
        "errorRate": 0.03,
        "uptime": 99.98,
        "requestsPerSecond": 1200
      },
      // ... more data points
    ]
  }
}
```

#### Get Performance Anomalies

```
GET /monitoring/{serviceId}/metrics/anomalies
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "anomalies": [
      {
        "timestamp": "2026-09-26T08:45:00Z",
        "type": "response_time_spike",
        "severity": "high",
        "value": 3500,
        "threshold": 500,
        "description": "Response time exceeded normal range"
      }
    ]
  }
}
```

### 2. Multi-Region Monitoring

Monitor services across multiple geographic regions.

#### Create Multi-Region Configuration

```
POST /monitoring/{serviceId}/multi-region
Authorization: Bearer <token>
Content-Type: application/json

{
  "regions": ["us-east-1", "eu-west-1", "ap-southeast-1"],
  "primaryRegion": "us-east-1",
  "failoverEnabled": true,
  "healthCheckInterval": 30
}

Response:
{
  "status": "success",
  "data": {
    "id": "mr-config-123",
    "serviceId": "service-123",
    "regions": [
      {
        "region": "us-east-1",
        "status": "healthy",
        "uptime": 99.98,
        "responseTime": 245
      },
      {
        "region": "eu-west-1",
        "status": "healthy",
        "uptime": 99.95,
        "responseTime": 320
      }
    ]
  }
}
```

#### Get Regional Health

```
GET /monitoring/{serviceId}/multi-region/health
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "overallStatus": "healthy",
    "regions": [
      {
        "region": "us-east-1",
        "status": "healthy",
        "lastCheck": "2026-09-26T10:30:00Z",
        "latency": 45
      },
      {
        "region": "eu-west-1",
        "status": "healthy",
        "lastCheck": "2026-09-26T10:29:55Z",
        "latency": 120
      }
    ]
  }
}
```

#### Trigger Failover

```
POST /monitoring/{serviceId}/multi-region/failover/trigger
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetRegion": "eu-west-1",
  "reason": "Primary region degraded"
}

Response:
{
  "status": "success",
  "data": {
    "failoverId": "failover-456",
    "fromRegion": "us-east-1",
    "toRegion": "eu-west-1",
    "timestamp": "2026-09-26T10:31:00Z",
    "status": "completed"
  }
}
```

### 3. SLA Configuration

Manage Service Level Agreements and track compliance.

#### Create SLA Configuration

```
POST /monitoring/{serviceId}/sla
Authorization: Bearer <token>
Content-Type: application/json

{
  "uptimeTarget": 99.95,
  "responseTimeTarget": 500,
  "monthlyOutageWindow": 22,
  "creditMultiplier": 10,
  "escalationEmail": "ops@company.com"
}

Response:
{
  "status": "success",
  "data": {
    "id": "sla-789",
    "serviceId": "service-123",
    "uptimeTarget": 99.95,
    "currentUptime": 99.92,
    "complianceStatus": "at_risk",
    "monthlyCredits": 0,
    "breachHistory": []
  }
}
```

#### Get SLA Status

```
GET /monitoring/{serviceId}/sla/status
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "slaId": "sla-789",
    "serviceId": "service-123",
    "currentMonth": {
      "uptimeTarget": 99.95,
      "currentUptime": 99.92,
      "status": "at_risk",
      "creditsAccrued": 0,
      "minutesOutage": 576
    },
    "historicalBreaches": [
      {
        "date": "2026-08-15",
        "uptimeAchieved": 99.80,
        "uptimeTarget": 99.95,
        "creditsIssued": 10
      }
    ]
  }
}
```

### 4. Incident Management

Track, manage, and resolve incidents.

#### Create Incident

```
POST /monitoring/{serviceId}/incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Database Connection Pool Exhausted",
  "description": "Database connections exceeded limit",
  "severity": "high",
  "affectedServices": ["service-123"],
  "rootCauseAnalysis": "Unoptimized query in batch job"
}

Response:
{
  "status": "success",
  "data": {
    "id": "incident-101",
    "serviceId": "service-123",
    "title": "Database Connection Pool Exhausted",
    "severity": "high",
    "status": "open",
    "createdAt": "2026-09-26T10:35:00Z",
    "updatedAt": "2026-09-26T10:35:00Z",
    "timeline": []
  }
}
```

#### Update Incident Status

```
PATCH /monitoring/{serviceId}/incidents/{incidentId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "resolution": "Optimized query and increased connection pool size",
  "communicationSent": true
}

Response:
{
  "status": "success",
  "data": {
    "id": "incident-101",
    "status": "resolved",
    "resolvedAt": "2026-09-26T11:15:00Z",
    "resolution": "Optimized query and increased connection pool size"
  }
}
```

#### Get Incident Timeline

```
GET /monitoring/{serviceId}/incidents/{incidentId}/timeline
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "timeline": [
      {
        "timestamp": "2026-09-26T10:35:00Z",
        "event": "created",
        "author": "user@company.com",
        "message": "Incident created"
      },
      {
        "timestamp": "2026-09-26T10:40:00Z",
        "event": "communication",
        "message": "Alert sent to subscribers"
      },
      {
        "timestamp": "2026-09-26T11:15:00Z",
        "event": "resolved",
        "message": "Incident resolved"
      }
    ]
  }
}
```

### 5. Alert Rules Management

Create and manage alert rules for services.

#### Create Alert Rule

```
POST /monitoring/{serviceId}/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "High Response Time Alert",
  "condition": "responseTime > 1000",
  "severity": "high",
  "notificationChannels": ["email", "slack"],
  "enabled": true,
  "cooldownPeriod": 300
}

Response:
{
  "status": "success",
  "data": {
    "id": "alert-rule-201",
    "serviceId": "service-123",
    "name": "High Response Time Alert",
    "condition": "responseTime > 1000",
    "severity": "high",
    "enabled": true,
    "createdAt": "2026-09-26T10:40:00Z"
  }
}
```

#### Test Alert Rule

```
POST /monitoring/{serviceId}/alerts/{ruleId}/test
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "ruleId": "alert-rule-201",
    "testResult": "passed",
    "notificationsSent": 2,
    "channels": ["email", "slack"],
    "message": "Test notification delivered successfully"
  }
}
```

#### Get Alert History

```
GET /monitoring/{serviceId}/alerts/history?days=7
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "id": "alert-trigger-001",
        "ruleId": "alert-rule-201",
        "timestamp": "2026-09-26T09:30:00Z",
        "value": 1250,
        "threshold": 1000,
        "status": "resolved"
      }
    ]
  }
}
```

### 6. Team Management

Manage team members and permissions.

#### Create Team Member

```
POST /teams/{serviceId}/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newmember@company.com",
  "role": "admin",
  "permissions": ["view", "edit", "delete"]
}

Response:
{
  "status": "success",
  "data": {
    "id": "member-301",
    "email": "newmember@company.com",
    "role": "admin",
    "permissions": ["view", "edit", "delete"],
    "joinedAt": "2026-09-26T10:45:00Z"
  }
}
```

#### Get Team Members

```
GET /teams/{serviceId}/members
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "members": [
      {
        "id": "member-001",
        "email": "admin@company.com",
        "role": "admin",
        "permissions": ["view", "edit", "delete"],
        "joinedAt": "2026-09-01T08:00:00Z"
      },
      {
        "id": "member-301",
        "email": "newmember@company.com",
        "role": "admin",
        "permissions": ["view", "edit", "delete"],
        "joinedAt": "2026-09-26T10:45:00Z"
      }
    ]
  }
}
```

#### Get Audit Log

```
GET /teams/{serviceId}/audit-log?days=30
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "logs": [
      {
        "timestamp": "2026-09-26T10:45:00Z",
        "action": "member_added",
        "actor": "admin@company.com",
        "target": "newmember@company.com",
        "details": "Added as admin"
      }
    ]
  }
}
```

### 7. API Key Management

Generate and manage API keys for programmatic access.

#### Create API Key

```
POST /api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production Integration",
  "expiresIn": 365,
  "permissions": ["read", "write"]
}

Response:
{
  "status": "success",
  "data": {
    "id": "key-401",
    "name": "Production Integration",
    "key": "pk_live_abc123def456...",
    "expiresAt": "2027-09-26",
    "createdAt": "2026-09-26T10:50:00Z"
  }
}
```

#### List API Keys

```
GET /api-keys
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "keys": [
      {
        "id": "key-401",
        "name": "Production Integration",
        "maskedKey": "pk_live_...def456",
        "expiresAt": "2027-09-26",
        "createdAt": "2026-09-26T10:50:00Z",
        "lastUsed": "2026-09-26T10:55:00Z"
      }
    ]
  }
}
```

#### Rotate API Key

```
POST /api-keys/{keyId}/rotate
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "id": "key-401",
    "name": "Production Integration",
    "newKey": "pk_live_xyz789uvw012...",
    "rotatedAt": "2026-09-26T11:00:00Z"
  }
}
```

---

## Premium Features

### 8. Synthetic Monitoring

Simulate user interactions and transactions from multiple locations.

#### Create Synthetic Transaction

```
POST /synthetic/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "User Login Flow",
  "description": "Simulate complete user login process",
  "steps": [
    {
      "type": "navigate",
      "url": "https://pulsemonitor.com/login"
    },
    {
      "type": "fill",
      "selector": "input[name='email']",
      "value": "testuser@example.com"
    },
    {
      "type": "fill",
      "selector": "input[name='password']",
      "value": "password123"
    },
    {
      "type": "click",
      "selector": "button[type='submit']"
    },
    {
      "type": "waitFor",
      "selector": ".dashboard-header",
      "timeout": 5000
    }
  ],
  "regions": ["us-east-1", "eu-west-1", "ap-southeast-1"],
  "frequency": 5
}

Response:
{
  "status": "success",
  "data": {
    "id": "transaction-501",
    "name": "User Login Flow",
    "status": "active",
    "createdAt": "2026-09-26T11:05:00Z"
  }
}
```

#### Get Transaction Results

```
GET /synthetic/transactions/{transactionId}/results?days=7
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "results": [
      {
        "timestamp": "2026-09-26T11:00:00Z",
        "region": "us-east-1",
        "status": "passed",
        "duration": 2340,
        "screenshot": "https://...",
        "steps": [
          {
            "step": 1,
            "status": "completed",
            "duration": 450
          }
        ]
      }
    ]
  }
}
```

### 9. Anomaly Detection

Detect and predict anomalies using machine learning.

#### Get Anomaly Detections

```
GET /anomalies/detections?serviceId={serviceId}&days=30
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "anomalies": [
      {
        "id": "anomaly-601",
        "type": "traffic_spike",
        "timestamp": "2026-09-26T09:30:00Z",
        "severity": "high",
        "metric": "requestsPerSecond",
        "normalValue": 1200,
        "anomalousValue": 5600,
        "confidence": 0.98
      }
    ]
  }
}
```

#### Get Forecast

```
GET /anomalies/forecast?serviceId={serviceId}&hours=24
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "forecast": [
      {
        "timestamp": "2026-09-26T12:00:00Z",
        "predictedValue": 1250,
        "upperBound": 1450,
        "lowerBound": 1050,
        "confidence": 0.85
      }
    ]
  }
}
```

### 10. Dashboards

Create custom dashboards with widgets.

#### Create Dashboard

```
POST /dashboards
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Executive Overview",
  "description": "High-level system health dashboard",
  "isPublic": false,
  "widgets": [
    {
      "type": "metric",
      "title": "System Uptime",
      "metric": "uptime",
      "timeRange": "24h"
    },
    {
      "type": "chart",
      "title": "Response Time Trends",
      "metric": "responseTime",
      "timeRange": "7d",
      "chartType": "line"
    }
  ]
}

Response:
{
  "status": "success",
  "data": {
    "id": "dashboard-701",
    "name": "Executive Overview",
    "widgets": [],
    "createdAt": "2026-09-26T11:10:00Z"
  }
}
```

#### Share Dashboard

```
POST /dashboards/{dashboardId}/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "emails": ["stakeholder@company.com"],
  "permission": "view"
}

Response:
{
  "status": "success",
  "data": {
    "dashboardId": "dashboard-701",
    "sharedWith": 1,
    "shareLinks": [
      {
        "email": "stakeholder@company.com",
        "permission": "view",
        "sharedAt": "2026-09-26T11:15:00Z"
      }
    ]
  }
}
```

### 11. Status Pages

Public status pages for customer communication.

#### Create Status Page

```
POST /status-pages
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pulse Monitor Status",
  "description": "Real-time status of Pulse Monitor services",
  "subdomain": "status",
  "services": ["service-123", "service-124"],
  "theme": "light"
}

Response:
{
  "status": "success",
  "data": {
    "id": "status-page-801",
    "name": "Pulse Monitor Status",
    "url": "https://status.pulsemonitor.com",
    "createdAt": "2026-09-26T11:20:00Z"
  }
}
```

#### Publish Status Incident

```
POST /status-pages/{pageId}/incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Database Maintenance",
  "description": "Scheduled maintenance window",
  "status": "investigating",
  "services": ["service-123"],
  "startTime": "2026-09-26T23:00:00Z",
  "estimatedDuration": 3600
}

Response:
{
  "status": "success",
  "data": {
    "id": "incident-901",
    "statusPageId": "status-page-801",
    "title": "Database Maintenance",
    "status": "investigating",
    "publishedAt": "2026-09-26T11:25:00Z"
  }
}
```

### 12. Webhooks

Send real-time notifications to external systems.

#### Create Webhook

```
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "events": ["incident.created", "incident.resolved", "alert.triggered"],
  "enabled": true,
  "headers": {
    "X-Custom-Header": "value"
  }
}

Response:
{
  "status": "success",
  "data": {
    "id": "webhook-1001",
    "name": "Slack Notifications",
    "url": "https://hooks.slack.com/services/...",
    "events": ["incident.created", "incident.resolved", "alert.triggered"],
    "createdAt": "2026-09-26T11:30:00Z"
  }
}
```

#### Get Webhook Delivery History

```
GET /webhooks/{webhookId}/deliveries?days=7
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "deliveries": [
      {
        "id": "delivery-1",
        "timestamp": "2026-09-26T10:35:00Z",
        "event": "incident.created",
        "status": "success",
        "statusCode": 200,
        "responseTime": 234
      },
      {
        "id": "delivery-2",
        "timestamp": "2026-09-26T11:15:00Z",
        "event": "incident.resolved",
        "status": "success",
        "statusCode": 200,
        "responseTime": 156
      }
    ]
  }
}
```

### 13. Integrations

Connect with 12+ external platforms.

#### List Available Integrations

```
GET /integrations/available
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "integrations": [
      {
        "id": "slack",
        "name": "Slack",
        "category": "notifications",
        "configured": true
      },
      {
        "id": "pagerduty",
        "name": "PagerDuty",
        "category": "incident",
        "configured": false
      },
      {
        "id": "datadog",
        "name": "Datadog",
        "category": "monitoring",
        "configured": true
      }
    ]
  }
}
```

#### Configure Integration

```
POST /integrations/{integrationId}/configure
Authorization: Bearer <token>
Content-Type: application/json

{
  "credentials": {
    "apiKey": "your-api-key",
    "webhookUrl": "https://your-endpoint.com/webhook"
  },
  "settings": {
    "enableNotifications": true,
    "notificationChannels": ["incidents", "alerts"]
  }
}

Response:
{
  "status": "success",
  "data": {
    "id": "integration-1101",
    "integrationId": "slack",
    "status": "connected",
    "connectedAt": "2026-09-26T11:35:00Z",
    "lastSync": "2026-09-26T11:35:00Z"
  }
}
```

### 14. Database Optimization

Monitor and optimize database performance.

#### Get Database Metrics

```
GET /database/metrics?serviceId={serviceId}
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "metrics": {
      "connectionPoolUsage": 75,
      "queryPerformance": 145,
      "cacheHitRate": 0.82,
      "slowQueries": 23,
      "indexUsage": 0.95
    }
  }
}
```

#### Get Optimization Recommendations

```
GET /database/recommendations?serviceId={serviceId}
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "type": "query_optimization",
        "priority": "high",
        "query": "SELECT * FROM users WHERE status = 'active'",
        "impact": "Could reduce query time by 40%",
        "suggestedIndex": "CREATE INDEX idx_users_status ON users(status)"
      },
      {
        "type": "cache_strategy",
        "priority": "medium",
        "description": "Implement caching for frequently accessed data"
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "status": "error",
  "code": 400,
  "data": null,
  "message": "Descriptive error message"
}
```

### Common Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks permissions for the resource |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource already exists |
| 422 | Validation Error | Request validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |

### Error Example

```bash
GET /monitoring/invalid-service-id/metrics
Authorization: Bearer <token>

Response (404):
{
  "status": "error",
  "code": 404,
  "data": null,
  "message": "Service not found"
}
```

---

## Rate Limiting

- **Rate Limit:** 1000 requests per hour per API key
- **Headers:** Response includes rate limit information:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

```bash
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1695729600
```

---

## Frontend Integration

### Using the API Client

The frontend provides a centralized API client at `frontend/src/lib/api.ts`:

```typescript
import { apiClient } from '@/lib/api';

// Get performance metrics
const metrics = await apiClient.getPerformanceMetrics('service-123');

// Create alert rule
const alertRule = await apiClient.createAlertRule('service-123', {
  name: 'High Response Time',
  condition: 'responseTime > 1000',
  severity: 'high',
  notificationChannels: ['email', 'slack'],
  enabled: true,
  cooldownPeriod: 300
});

// Get incidents
const incidents = await apiClient.getIncidents('service-123');

// Create webhook
const webhook = await apiClient.createWebhook({
  name: 'Slack Notifications',
  url: 'https://hooks.slack.com/services/...',
  events: ['incident.created', 'alert.triggered'],
  enabled: true
});
```

### Using React Query

All API calls are wrapped with React Query for caching and state management:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Fetch performance metrics
const { data, isLoading, error } = useQuery({
  queryKey: ['metrics', serviceId],
  queryFn: () => apiClient.getPerformanceMetrics(serviceId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Create alert rule
const createAlertMutation = useMutation({
  mutationFn: (data) => apiClient.createAlertRule(serviceId, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['alerts', serviceId] });
  }
});
```

### Environment Variables

```env
# .env.local
VITE_API_URL=http://localhost:5000/api/v1
```

---

## WebSocket Support

Real-time updates for metrics and events are available via WebSocket.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onopen = () => {
  // Subscribe to service events
  ws.send(JSON.stringify({
    action: 'subscribe',
    channel: 'service:service-123',
    token: localStorage.getItem('token')
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
  // Handle: incident.created, alert.triggered, metric.updated
};
```

### Event Types

- `metric.updated` - Performance metric changed
- `alert.triggered` - Alert rule condition met
- `incident.created` - New incident created
- `incident.resolved` - Incident resolved
- `team.member.joined` - Team member added
- `status.changed` - Service status changed

---

## Code Examples

### Example 1: Complete Incident Workflow

```typescript
import { apiClient } from '@/lib/api';

async function handleIncident(serviceId: string) {
  // 1. Create incident
  const incident = await apiClient.createIncident(serviceId, {
    title: 'Database connection timeout',
    description: 'Connections to primary database are timing out',
    severity: 'high',
    affectedServices: [serviceId]
  });

  // 2. Add update to timeline
  await apiClient.addIncidentUpdate(serviceId, incident.id, {
    message: 'Investigating root cause',
    status: 'investigating'
  });

  // 3. Send communication
  await apiClient.sendIncidentCommunication(serviceId, incident.id, {
    channels: ['email', 'slack', 'status_page'],
    message: 'We are investigating a database connectivity issue'
  });

  // 4. Monitor and resolve
  await apiClient.updateIncident(serviceId, incident.id, {
    status: 'resolved',
    resolution: 'Restarted connection pool and increased pool size',
    rootCauseAnalysis: 'Connection leak in batch job'
  });
}
```

### Example 2: Setup Multi-Region Monitoring

```typescript
import { apiClient } from '@/lib/api';

async function setupMultiRegion(serviceId: string) {
  // Create multi-region config
  const config = await apiClient.createMultiRegionConfig(serviceId, {
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    primaryRegion: 'us-east-1',
    failoverEnabled: true,
    healthCheckInterval: 30
  });

  // Get regional health
  const health = await apiClient.getRegionalHealth(serviceId);
  console.log('Regional health:', health);

  // Monitor for degradation and trigger failover if needed
  const degradedRegion = health.regions.find(r => r.status !== 'healthy');
  if (degradedRegion) {
    await apiClient.triggerFailover(serviceId, 'eu-west-1', 
      `Primary region ${degradedRegion.region} is degraded`
    );
  }
}
```

### Example 3: Create Custom Dashboard

```typescript
import { apiClient } from '@/lib/api';

async function createDashboard() {
  const dashboard = await apiClient.createDashboard({
    name: 'Operations Team Dashboard',
    description: 'Real-time overview for ops team',
    isPublic: false,
    widgets: [
      {
        type: 'metric',
        title: 'System Uptime',
        metric: 'uptime',
        timeRange: '24h'
      },
      {
        type: 'chart',
        title: 'Response Time (7d)',
        metric: 'responseTime',
        timeRange: '7d',
        chartType: 'line'
      },
      {
        type: 'incidents',
        title: 'Recent Incidents',
        limit: 5
      },
      {
        type: 'regional_health',
        title: 'Regional Status',
        metric: 'multiRegion'
      }
    ]
  });

  // Share with team
  await apiClient.shareDashboard(dashboard.id, {
    emails: ['ops@company.com', 'devops@company.com'],
    permission: 'view'
  });

  return dashboard;
}
```

### Example 4: Setup Integrations

```typescript
import { apiClient } from '@/lib/api';

async function setupIntegrations() {
  // Configure Slack
  await apiClient.configureIntegration('slack', {
    credentials: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL
    },
    settings: {
      enableNotifications: true,
      notificationChannels: ['incidents', 'alerts']
    }
  });

  // Configure PagerDuty
  await apiClient.configureIntegration('pagerduty', {
    credentials: {
      apiKey: process.env.PAGERDUTY_API_KEY
    },
    settings: {
      enableNotifications: true,
      escalationPolicy: 'default'
    }
  });

  // List all integrations
  const integrations = await apiClient.getIntegrations();
  console.log('Configured integrations:', integrations);
}
```

---

## Support & Resources

- **Documentation:** [APP_DOCUMENTATION.md](./docs/APP_DOCUMENTATION.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)
- **Email:** support@pulsemonitor.com
- **Status Page:** https://status.pulsemonitor.com

---

**Last Updated:** September 26, 2026
**Version:** 1.0
