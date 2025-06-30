import React, { useState } from 'react';

export function ChatbotManager() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [payload, setPayload] = useState('{"event": "chatbot_message", "message": "Hello, how can I assist you?"}');
  const [status, setStatus] = useState('');

  const handleWebhookTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending chatbot webhook to:', webhookUrl, 'Payload:', payload);
      setStatus('Chatbot webhook triggered (mocked)! Check console for details.');
      // Uncomment when backend is running:
      /*
      const response = await fetch('http://localhost:5000/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      setStatus((await response.json()).message);
      */
    } catch (error) {
      setStatus('Error triggering chatbot webhook: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chatbot Management</h2>
      <div className="space-y-4">
        <p className="text-gray-600">Configure chatbot with LLM-powered responses.</p>
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium">Trigger Chatbot Webhook</h3>
          <form onSubmit={handleWebhookTrigger} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="http://localhost:5000/api/llm/chat"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"event": "chatbot_message", "message": "Hello, how can I assist you?"}'
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Trigger Chatbot Webhook
            </button>
          </form>
          {status && <p className="mt-2 text-green-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}
