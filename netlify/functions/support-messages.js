exports.handler = async (event) => {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) throw new Error("Google Script URL is not defined.");

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const payload = {
        action: "handleSupportMessage",
        customerPhone: body.customerPhone,
        customerName: body.customerName,
        message: body.message,
        sender: body.sender, // 'customer' أو 'admin'
        timestamp: body.timestamp || new Date().toISOString()
      };

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, result })
      };
    } 
    
    else if (event.httpMethod === 'GET') {
      // جلب الرسائل (إما الكل للإدارة، أو المخصصة لرقم زبون معين)
      const phoneQuery = event.queryStringParameters ? event.queryStringParameters.phone : null;
      const response = await fetch(`${scriptUrl}?action=getSupportMessages${phoneQuery ? '&phone=' + phoneQuery : ''}`);
      const data = await response.json();

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(data)
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};

