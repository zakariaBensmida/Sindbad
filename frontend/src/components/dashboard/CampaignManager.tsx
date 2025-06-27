import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function CampaignManager() {
  const [isABTest, setIsABTest] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messageA, setMessageA] = useState("");
  const [messageB, setMessageB] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectA, setSubjectA] = useState("");
  const [subjectB, setSubjectB] = useState("");
  const [audience, setAudience] = useState("all");
  const [channel, setChannel] = useState("whatsapp");
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [status, setStatus] = useState("");

  const createCampaign = async () => {
    try {
      const endpoint = isABTest ? "/ab_campaign" : "/campaign";
      const payload = isABTest
        ? { name, message_a: messageA, message_b: messageB, subject_a: subjectA, subject_b: subjectB, audience, channel, split_ratio: splitRatio }
        : { name, message, subject, audience, channel };
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setStatus(`Campaign ${isABTest ? "A/B" : ""} created and sent!`);
      } else {
        setStatus("Error creating campaign");
      }
    } catch (error) {
      setStatus("Error creating campaign");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Create Campaign</h2>
      <div className="mt-4 flex items-center gap-4">
        <Label>A/B Test</Label>
        <Switch checked={isABTest} onCheckedChange={setIsABTest} />
      </div>
      <div className="mt-4">
        <Label>Campaign Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter campaign name" />
      </div>
      {!isABTest ? (
        <>
          <div className="mt-4">
            <Label>Message</Label>
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter message" />
          </div>
          <div className="mt-4">
            <Label>Email Subject (if email or multi-channel)</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject" />
          </div>
        </>
      ) : (
        <>
          <div className="mt-4">
            <Label>Message A</Label>
            <Input value={messageA} onChange={(e) => setMessageA(e.target.value)} placeholder="Enter message A" />
          </div>
          <div className="mt-4">
            <Label>Message B</Label>
            <Input value={messageB} onChange={(e) => setMessageB(e.target.value)} placeholder="Enter message B" />
          </div>
          <div className="mt-4">
            <Label>Email Subject A (if email or multi-channel)</Label>
            <Input value={subjectA} onChange={(e) => setSubjectA(e.target.value)} placeholder="Enter subject A" />
          </div>
          <div className="mt-4">
            <Label>Email Subject B (if email or multi-channel)</Label>
            <Input value={subjectB} onChange={(e) => setSubjectB(e.target.value)} placeholder="Enter subject B" />
          </div>
          <div className="mt-4">
            <Label>Split Ratio (A)</Label>
            <Input
              type="number"
              value={splitRatio}
              onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
              placeholder="Enter split ratio (0.0 to 1.0)"
              min="0"
              max="1"
              step="0.1"
            />
          </div>
        </>
      )}
      <div className="mt-4">
        <Label>Audience</Label>
        <Select value={audience} onValueChange={setAudience}>
          <SelectTrigger>
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="returning">Returning</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4">
        <Label>Channel</Label>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger>
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="multi">Multi-Channel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={createCampaign} className="mt-4">Send Campaign</Button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
