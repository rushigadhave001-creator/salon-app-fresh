
"use client";

import { useState, useEffect } from "react";

interface QueueItem {
  id: string;
  tokenNumber: string;
  customerName: string;
  serviceType: string;
  status: string;
}

export default function CustomerView() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("+91 ");
  const [service, setService] = useState("Haircut");
  const [myToken, setMyToken] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [shopOpen, setShopOpen] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue/status");
      const data = await res.json();
      setQueue(data.queue || []);
      setShopOpen(data.isOpen ?? true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: name, mobileNumber: mobile, serviceType: service }),
    });
    const data = await res.json();
    setMyToken(data.tokenNumber);
    fetchQueue();
  };

  const currentlyServing = queue.find(q => q.status === "In-Chair") || queue.find(q => q.status === "Waiting");
  const waitingList = queue.filter(q => q.status === "Waiting");
  const myPosition = myToken ? waitingList.findIndex(q => q.tokenNumber === myToken) + 1 : 0;
  const estimatedWaitMinutes = myPosition > 0 ? (myPosition - 1) * 15 + 15 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto font-sans">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">✂️ StyleCraft Salon</h1>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${shopOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {shopOpen ? '🟢 OPEN' : '🔴 CLOSED'}
        </span>
      </header>

      {/* Live Status Board */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">LIVE QUEUE STATUS</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">SERVING</p>
            <p className="text-xl font-bold text-blue-900">{currentlyServing ? currentlyServing.tokenNumber : "None"}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-orange-600 font-medium">WAITING</p>
            <p className="text-xl font-bold text-orange-900">{waitingList.length}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-purple-600 font-medium">EST. WAIT</p>
            <p className="text-xl font-bold text-purple-900">{waitingList.length * 15}m</p>
          </div>
        </div>
      </section>

      {/* My Token Status */}
      {myToken && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-xl mb-6 shadow-md text-center">
          <p className="text-sm opacity-90">Your Digital Token</p>
          <h3 className="text-4xl font-extrabold my-1">{myToken}</h3>
          <p className="text-sm mt-2">Queue Position: <span className="font-bold">#{myPosition}</span></p>
          <p className="text-sm">Est. Time: <span className="font-bold">~{estimatedWaitMinutes} mins</span></p>
        </div>
      )}

      {/* Booking Form */}
      {!myToken && shopOpen && (
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Book Your Spot</h2>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                className="w-full border p-2.5 rounded-lg text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mobile Number</label>
              <input
                type="text"
                required
                className="w-full border p-2.5 rounded-lg text-sm"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Service Type</label>
              <select
                className="w-full border p-2.5 rounded-lg text-sm bg-white"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="Haircut">Haircut (20 mins)</option>
                <option value="Beard">Beard Trim (10 mins)</option>
                <option value="Facial">Facial (30 mins)</option>
                <option value="Combo">Combo Hair + Beard (40 mins)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition-colors"
            >
              Get Queue Token
            </button>
          </form>
        </div>
      )}

      {!shopOpen && !myToken && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center">
          <p className="font-bold">Salon is currently closed or on break.</p>
          <p className="text-sm">Please check back later.</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <a href="/admin" className="text-xs text-gray-500 underline">Salon Owner / Barber Login</a>
      </div>
    </div>
  );
}
