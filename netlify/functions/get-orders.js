exports.handler = async (event) => {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      throw new Error("Google Script URL is not defined in environment variables.");
    }

    const response = await fetch(scriptUrl);
    if (!response.ok) throw new Error("فشل في جلب البيانات من جدول البيانات.");
    
    let rawData = await response.json();

    // توحيد الحقول والتأكد من أنها مصفوفة
    const orders = (Array.isArray(rawData) ? rawData : (rawData.orders || [])).map(o => ({
      id: o.id || o.orderId || '',
      customerName: o.customerName || o.customer_name || '',
      customerPhone: String(o.customerPhone || o.customer_phone || '').trim(),
      customerLocation: o.customerLocation || o.customer_location || '',
      items: o.items || '[]',
      total: Number(o.total) || 0,
      status: o.status || 'قيد المراجعة ⏳',
      date: o.date || o.created_at || new Date().toISOString()
    }));

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify(orders)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};

