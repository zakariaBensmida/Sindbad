import React, { useState } from 'react';

export function CampaignManager() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [payload, setPayload] = useState('{"event": "campaign_trigger"}');
  const [status, setStatus] = useState('');

  const handleWebhookTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending campaign webhook to:', webhookUrl, 'Payload:', payload);
      setStatus('Campaign webhook triggered (mocked)! Check console for details.');
    } catch (error) {
      setStatus('Error triggering webhook: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Campaign Management</h2>
      <div className="space-y-4">
        <p className="text-gray-600">Create and manage marketing campaigns.</p>
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium">Trigger Campaign Webhook</h3>
          <form onSubmit={handleWebhookTrigger} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="http://localhost:5000/api/webhook"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"event": "campaign_trigger"}'
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Trigger Webhook
            </button>
          </form>
          {status && <p className="mt-2 text-green-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}
