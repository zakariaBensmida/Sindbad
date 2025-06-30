import React from 'react';
import { CampaignManager } from '@/components/dashboard/CampaignManager';
import { ChatbotManager } from '@/components/dashboard/ChatbotManager';
import { IntegrationsManager } from '@/components/dashboard/IntegrationsManager';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { PaymentManager } from '@/components/dashboard/PaymentManager';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Sindbad Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your campaigns, chatbot, integrations, analytics, and payments</p>
      </header>
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="campaigns" className="flex-1">Campaigns</TabsTrigger>
          <TabsTrigger value="chatbot" className="flex-1">Chatbot</TabsTrigger>
          <TabsTrigger value="integrations" className="flex-1">Integrations</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="mt-4">
          <CampaignManager />
        </TabsContent>
        <TabsContent value="chatbot" className="mt-4">
          <ChatbotManager />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <IntegrationsManager />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsDashboard />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
