import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

export function AnalyticsDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [campaignData, setCampaignData] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [status, setStatus] = useState("");

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("http://localhost:8000/analytics/detailed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      const roiResponse = await fetch("http://localhost:8000/analytics/roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      const data = await response.json();
      const roiData = await roiResponse.json();
      setCampaignData(data.campaigns);
      setMessageData(data.messages);
      setSegmentData(data.segments);
      setTimeSeriesData(data.time_series);
      setRoiData(roiData.roi_data);
      setStatus("Analytics loaded");
    } catch (error) {
      setStatus("Error loading analytics");
    }
  };

  const prepareFunnelData = (campaign) => [
    { name: "Sent", value: campaign.sent },
    { name: "Clicked", value: campaign.clicked },
    { name: "Converted", value: campaign.converted },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      <div className="mt-4 flex gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Select start date"
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Select end date"
          />
        </div>
        <Button onClick={fetchAnalytics} className="mt-6">Load Analytics</Button>
      </div>
      {status && <p className="mt-4">{status}</p>}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={300} data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#8884d8" />
              <Line type="monotone" dataKey="clicked" stroke="#82ca9d" />
              <Line type="monotone" dataKey="converted" stroke="#ffc658" />
            </LineChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Message Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={messageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel (Latest Campaign)</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignData.length > 0 && (
              <PieChart width={500} height={300}>
                <Pie
                  data={prepareFunnelData(campaignData[campaignData.length - 1])}
                  cx="50%"
                  cy="50%"
                  outerRadius=100
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {prepareFunnelData(campaignData[campaignData.length - 1]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Segment Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#8884d8" />
              <Bar dataKey="clicked" fill="#82ca9d" />
              <Bar dataKey="converted" fill="#ffc658" />
            </BarChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Message Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={300} data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="WhatsApp" />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" name="SMS" />
              <Line type="monotone" dataKey="count" stroke="#ffc658" name="Email" />
            </LineChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaign ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#8884d8" />
              <Bar dataKey="revenue" fill="#82ca9d" />
              <Bar dataKey="roi" fill="#ffc658" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
