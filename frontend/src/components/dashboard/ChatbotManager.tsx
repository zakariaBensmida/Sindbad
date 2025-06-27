import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChatbotManager() {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");

  const createFlow = async () => {
    try {
      const response = await fetch("http://localhost:8000/chatbot/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, trigger, response }),
      });
      if (response.ok) {
        setStatus("Flow created!");
      } else {
        setStatus("Error creating flow");
      }
    } catch (error) {
      setStatus("Error creating flow");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Chatbot Flows</h2>
      <div className="mt-4">
        <Label>Flow Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter flow name" />
      </div>
      <div className="mt-4">
        <Label>Trigger</Label>
        <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Enter trigger phrase" />
      </div>
      <div className="mt-4">
        <Label>Response</Label>
        <Input value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Enter response" />
      </div>
      <Button onClick={createFlow} className="mt-4">Create Flow</Button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
