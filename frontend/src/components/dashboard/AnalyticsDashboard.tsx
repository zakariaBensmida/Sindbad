import React, { useState } from 'react';

export function AnalyticsDashboard() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [payload, setPayload] = useState('{"event": "shopify_order", "order_id": "12345"}');
  const [status, setStatus] = useState('');

  const handleWebhookTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending Shopify webhook to:', webhookUrl, 'Payload:', payload);
      setStatus('Shopify webhook triggered (mocked)! Check console for details.');
      // Uncomment when backend is running:
      /*
      const response = await fetch('http://localhost:5000/api/shopify/webhook/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      setStatus((await response.json()).message);
      */
    } catch (error) {
      setStatus('Error triggering Shopify webhook: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analytics Dashboard</h2>
      <div className="space-y-4">
        <p className="text-gray-600">View Shopify order analytics.</p>
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium">Trigger Shopify Webhook</h3>
          <form onSubmit={handleWebhookTrigger} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="http://localhost:5000/api/shopify/webhook/order"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"event": "shopify_order", "order_id": "12345"}'
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Trigger Shopify Webhook
            </button>
          </form>
          {status && <p className="mt-2 text-green-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}
