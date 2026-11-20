
"use client";

import { useState, useEffect } from "react";

interface QueueItem {
  id: string;
  tokenNumber: string;
  customerName: string;
  mobileNumber: string;
  serviceType: string;
  status: string;
}

export default function AdminDashboard() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  // Manual Walk-in state
  const [walkName, setWalkName] = useState("");
  const [walkMobile, setWalkMobile] = useState("+91 ");
  const [walkService, setWalkService] = useState("Haircut");

  const fetchAdminData = async () => {
    const res = await fetch("/api/admin/queue");
    if (res.ok) {
      const data = await res.json();
      setQueue(data.queue);
      setIsOpen(data.isOpen);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 3000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setAuthenticated(true);
    } else {
      alert("Invalid PIN. (Default: 1234)");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: status }),
    });
    fetchAdminData();
  };

  const toggleShopStatus = async () => {
    await fetch("/api/admin/toggle-shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !isOpen }),
    });
    setIsOpen(!isOpen);
  };

  const handleAddWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: walkName, mobileNumber: walkMobile, serviceType: walkService }),
    });
    setWalkName("");
    fetchAdminData();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full space-y-4">
          <h1 className="text-xl font-bold text-center">Owner Dashboard PIN</h1>
          <input
            type="password"
            placeholder="Enter PIN (1234)"
            className="w-full border p-3 rounded-lg text-center text-2xl tracking-widest"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold">Barber Queue Dashboard</h1>
        <button
          onClick={toggleShopStatus}
          className={`px-4 py-2 rounded-lg font-bold ${isOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
        >
          Salon is {isOpen ? "OPEN" : "CLOSED"}
        </button>
      </header>

      {/* Walk-in Form */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-3">Add Walk-in Customer</h2>
        <form onSubmit={handleAddWalkin} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            required
            placeholder="Name"
            className="border p-2 rounded"
            value={walkName}
            onChange={(e) => setWalkName(e.target.value)}
          />
          <input
            type="text"
            required
            className="border p-2 rounded"
            value={walkMobile}
            onChange={(e) => setWalkMobile(e.target.value)}
          />
          <select
            className="border p-2 rounded bg-white"
            value={walkService}
            onChange={(e) => setWalkService(e.target.value)}
          >
            <option value="Haircut">Haircut (20m)</option>
            <option value="Beard">Beard (10m)</option>
            <option value="Facial">Facial (30m)</option>
            <option value="Combo">Combo (40m)</option>
          </select>
          <button type="submit" className="bg-green-600 text-white p-2 rounded font-bold">
            Add to Queue
          </button>
        </form>
      </section>

      {/* Queue List */}
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-3">Token</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Service</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <tr key={item.id} className="border-t text-sm">
                <td className="p-3 font-bold">{item.tokenNumber}</td>
                <td className="p-3">
                  <div className="font-semibold">{item.customerName}</div>
                  <div className="text-xs text-gray-500">{item.mobileNumber}</div>
                </td>
                <td className="p-3">{item.serviceType}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.status === 'In-Chair' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'Waiting' ? 'bg-orange-100 text-orange-800' :
                    item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  {item.status === "Waiting" && (
                    <button
                      onClick={() => updateStatus(item.id, "In-Chair")}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Start
                    </button>
                  )}
                  {item.status === "In-Chair" && (
                    <button
                      onClick={() => updateStatus(item.id, "Completed")}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Complete
                    </button>
                  )}
                  {item.status !== "Completed" && item.status !== "No-Show" && (
                    <button
                      onClick={() => updateStatus(item.id, "No-Show")}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Skip
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
