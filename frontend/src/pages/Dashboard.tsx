import React from "react";
import { CampaignManager } from "@/components/dashboard/CampaignManager";
import { ChatbotManager } from "@/components/dashboard/ChatbotManager";
import { IntegrationsManager } from "@/components/dashboard/IntegrationsManager";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sindbad Dashboard</h1>
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns">
          <CampaignManager />
        </TabsContent>
        <TabsContent value="chatbot">
          <ChatbotManager />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsManager />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
