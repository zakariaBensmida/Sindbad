import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function IntegrationsManager() {
  const [productId, setProductId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [plan, setPlan] = useState("starter");
  const [userId, setUserId] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [message, setMessage] = useState("");

  const sendProductCheckout = async () => {
    try {
      const response = await fetch("http://localhost:8000/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, phone, email, channel }),
      });
      const data = await response.json();
      setMessage(`Checkout link sent: ${data.checkout_url}`);
    } catch (error) {
      setMessage("Error sending checkout link");
    }
  };

  const sendPaymentLink = async () => {
    try {
      const response = await fetch("http://localhost:8000/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: `Payment for product ${productId}`,
          redirect_url: "https://your-store.myshopify.com/thank-you",
          phone,
          email,
          channel,
        }),
      });
      const data = await response.json();
      setMessage(`Payment link sent: ${data.payment_url}`);
    } catch (error) {
      setMessage("Error sending payment link");
    }
  };

  const createSubscription = async () => {
    try {
      const response = await fetch("http://localhost:8000/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, plan, phone, email }),
      });
      const data = await response.json();
      setMessage(`Subscribed to ${plan} plan: ${data.subscription_id}`);
    } catch (error) {
      setMessage("Error creating subscription");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Shopify & Payment Integration</h2>
      <div className="mt-4">
        <Label>Product ID</Label>
        <Input
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Shopify product ID"
        />
      </div>
      <div className="mt-4">
        <Label>Phone Number</Label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone (e.g., +1234567890)"
        />
      </div>
      <div className="mt-4">
        <Label>Email</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
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
      <Button onClick={sendProductCheckout} className="mt-4">Send Checkout Link</Button>
      <div className="mt-4">
        <Label>Payment Amount (€)</Label>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter payment amount"
        />
      </div>
      <Button onClick={sendPaymentLink} className="mt-4">Send Payment Link</Button>
      <div className="mt-4">
        <Label>User ID</Label>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
        />
      </div>
      <div className="mt-4">
        <Label>Subscription Plan</Label>
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger>
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="starter">Starter (€10/month)</SelectItem>
            <SelectItem value="pro">Pro (€30/month)</SelectItem>
            <SelectItem value="enterprise">Enterprise (€80/month)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={createSubscription} className="mt-4">Create Subscription</Button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
