
export const serviceAddedTemplate = `
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
      color: #28a745; /* A green color for success */
      font-size: 20px;
    }
    .content p {
      line-height: 1.6;
    }
    .service-details {
      background-color: #f9f9f9;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 20px 0;
    }
    .service-details strong {
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
      <h2>New Monitoring Service Added</h2>
      <p>Hello {{userName}},</p>
      <p>You have successfully added a new monitoring service to PulseMonitor. We will start monitoring it shortly.</p>
      
      <div class="service-details">
        <p><strong>Website:</strong> {{serviceName}}</p>
        <p><strong>URL:</strong> {{serviceTarget}}</p>
        <p><strong>Check Interval:</strong> {{interval}} minutes</p>
      </div>

      <p>You will be notified once the service is active.</p>
    </div>
    <div class="footer">
      <p>Keep your websites <span style="color: #0a0a0a; font-weight: bold;">always online</span> with PulseMonitor.</p>
    </div>
  </div>
</body>
</html>
`;
