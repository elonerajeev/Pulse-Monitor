
export const alertTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #dee2e6;
    }
    .header {
      background-color: #0a0a0a;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
    }
    .content h2 {
      color: #d9534f; /* A reddish color for alerts */
      font-size: 20px;
    }
    .content p {
      line-height: 1.6;
    }
    .alert-details {
      background-color: #f9f9f9;
      border-left: 4px solid #d9534f;
      padding: 15px;
      margin: 20px 0;
    }
    .alert-details strong {
      display: inline-block;
      width: 150px;
    }
    .footer {
      background-color: #f4f4f4;
      color: #666666;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PulseMonitor</h1>
    </div>
    <div class="content">
      <h2>Website Alert: {{serviceName}} is {{status}}</h2>
      <p>Hello {{userName}},</p>
      <p>This is an alert that your website <strong>{{serviceName}}</strong> is currently experiencing issues. We were unable to reach your site as expected.</p>
      
      <div class="alert-details">
        <p><strong>Website:</strong> {{serviceName}}</p>
        <p><strong>URL:</strong> {{serviceTarget}}</p>
        <p><strong>Status:</strong> {{status}}</p>
        <p><strong>Timestamp:</strong> {{timestamp}}</p>
        <p><strong>Response Time:</strong> {{responseTime}}ms</p>
        <p><strong>Error:</strong> {{error}}</p>
      </div>

      <p>We recommend you investigate this issue to ensure your service is available to your users.</p>
    </div>
    <div class="footer">
      <p>Keep your websites <span style="color: #0a0a0a; font-weight: bold;">always online</span> with PulseMonitor.</p>
    </div>
  </div>
</body>
</html>
`;
