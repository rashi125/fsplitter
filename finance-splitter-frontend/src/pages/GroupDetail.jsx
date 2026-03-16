import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
// --- RECHARTS IMPORT ---
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const GroupDetails = () => {
  const { groupId: rawGroupId } = useParams();
  const cleanGroupId = rawGroupId
    ? rawGroupId.replace(/[^a-fA-F0-9]/g, "").trim()
    : "";
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Modals & UI States
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Edit/Delete States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);

  // Form States
  const [subForm, setSubForm] = useState({
    name: "",
    totalCost: "",
    billingCycle: "monthly",
  });
  const [usageForm, setUsageForm] = useState({ subscriptionId: "", hours: "" });
  const [selectedSubName, setSelectedSubName] = useState("");

  const [splitResults, setSplitResults] = useState({});
  const userEmail = localStorage.getItem("userEmail") || "user@email.com";
  const token = localStorage.getItem("token");

  // Colors for Recharts
  const COLORS_HEX = ["#FF8A00", "#00E5FF", "#7000FF", "#FF007A", "#24db92"];
  const COLORS = [
    "bg-[#FF8A00]",
    "bg-[#00E5FF]",
    "bg-[#7000FF]",
    "bg-[#FF007A]",
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const fetchData = async () => {
    if (!cleanGroupId) return;
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const groupRes = await axios.get(
        `http://localhost:5000/api/groups/${cleanGroupId}`,
        headers,
      );
      setGroup(groupRes.data);
      setGroupMembers(groupRes.data.members || []);

      const subRes = await axios.get(
        `http://localhost:5000/api/subscriptions/${cleanGroupId}`,
        headers,
      );
      const subs = Array.isArray(subRes.data) ? subRes.data : [];
      setSubscriptions(subs);

      subs.forEach(async (sub) => {
        try {
          const splitRes = await axios.get(
            `http://localhost:5000/api/split/${sub._id}`,
            headers,
          );
          if (splitRes.data.success) {
            setSplitResults((prev) => ({
              ...prev,
              [sub._id]: splitRes.data.split,
            }));
          }
        } catch (err) {
          console.log(`No split data for ${sub.name}`);
        }
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cleanGroupId]);

  // --- CREATE / EDIT HANDLER ---
  const handleAddSubscription = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `http://localhost:5000/api/subscriptions/${editingSubId}`
        : "http://localhost:5000/api/subscriptions";
      const method = isEditMode ? "put" : "post";

      await axios[method](
        url,
        { ...subForm, groupId: cleanGroupId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsSubModalOpen(false);
      setIsEditMode(false);
      setSubForm({ name: "", totalCost: "", billingCycle: "monthly" });
      fetchData();
      alert(`Subscription ${isEditMode ? "Updated" : "Created"} Successfully!`);
    } catch (err) {
      alert("Operation failed");
    }
  };

  // --- DELETE HANDLER ---
  const deleteSubscription = async (subId) => {
    if (
      !window.confirm(
        "Delete this subscription? Historical data might be lost.",
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/subscriptions/${subId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openEditModal = (sub) => {
    setSubForm({
      name: sub.name,
      totalCost: sub.totalCost,
      billingCycle: sub.billingCycle,
    });
    setEditingSubId(sub._id);
    setIsEditMode(true);
    setIsSubModalOpen(true);
  };

  const addMember = async () => {
    if (!newMemberEmail.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/groups/add-member`,
        { groupId: cleanGroupId, email: newMemberEmail.trim().toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewMemberEmail("");
      fetchData();
      alert("Member added!");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding member");
    }
  };

  const handleLogUsage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/usage",
        {
          subscriptionId: usageForm.subscriptionId,
          usageHours: Number(usageForm.hours),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsUsageModalOpen(false);
      setUsageForm({ subscriptionId: "", hours: "" });
      fetchData();
      alert("Usage logged successfully!");
    } catch (err) {
      alert("Failed to log usage");
    }
  };

  const calculateTotalDue = () => {
    let total = 0;
    Object.values(splitResults).forEach((subSplit) => {
      const myShare = subSplit.find((s) => s.email === userEmail);
      if (myShare) total += myShare.amountToPay;
    });
    return total.toFixed(2);
  };

  const getChartData = () => {
    return subscriptions.map((sub) => ({
      name: sub.name,
      value: Number(sub.totalCost),
    }));
  };
  const handleSettleUp = async () => {
    const confirm = window.confirm(
      "Are you sure? This will reset your usage hours for this group.",
    );
    if (!confirm) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/usage/settle-up/${cleanGroupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("Settled Up! Your hours are now 0 for a new cycle.");
      setShowSummary(false);
      fetchData(); // UI update karne ke liye
    } catch (err) {
      alert("Settle up failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white font-sans selection:bg-[#3cb387]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[white]/10 backdrop-blur-md border-b border-[#384242] px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white font-bold text-xs tracking-widest hover:text-[#3cb387]"
          >
            ← BACK TO DASHBOARD
          </button>

          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full animate-ping"></span>
              <div className="absolute right-0 mt-4 w-72 bg-[#101D1D] p-5 rounded-2xl border border-[#1A2E2E] hidden group-hover:block z-50 shadow-2xl">
                <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">
                  Monthly Notification
                </p>
                <p className="text-xs font-medium normal-case leading-relaxed">
                  System Reminder: Check your usage hours before the billing
                  cycle ends to ensure a fair split.
                </p>
              </div>
            </div>

            <div className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#24db92] text-black w-10 h-10 rounded-full flex items-center justify-center font-black text-sm cursor-pointer shadow-lg hover:scale-105 transition-all"
              >
                👩
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#101D1D] border border-[#1A2E2E] rounded-3xl shadow-2xl px-4 py-4 overflow-hidden z-[60]">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-[#3cb387] truncate">
                      {userEmail}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSummary(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 mb-4 text-sm hover:bg-[#3cb387] hover:text-black font-bold transition-all rounded-xl"
                  >
                    📊 Visual Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-red-500 hover:text-white font-bold transition-all rounded-xl"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#101D1D] p-8 rounded-[2rem] border border-[#1A2E2E] shadow-xl">
            <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mb-2">
              Group Total
            </p>
            <h2 className="text-4xl font-black">
              ₹{subscriptions.reduce((acc, sub) => acc + sub.totalCost, 0)}
            </h2>
          </div>
          <div className="bg-[#101D1D] p-8 rounded-[2rem] border border-[#1A2E2E] shadow-xl">
            <p className="text-[10px] font-black text-[#FF007A] tracking-[0.2em] uppercase mb-2">
              Personal Share
            </p>
            <h2 className="text-4xl font-black text-[#FF007A]">
              ₹{calculateTotalDue()}
            </h2>
          </div>
        </div>

        <h1 className="text-4xl font-black mb-10 tracking-tighter uppercase italic text-white">
          Analytics{" "}
          <span className="text-[#3cb387] tracking-wide">
            {group?.name || "Group"}
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-[#020406]/70 rounded-[2.5rem] p-10 border border-[#1A2E2E]">
              <h3 className="text-xl font-bold mb-6 uppercase tracking-tighter italic">
                Manage Team
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  className="flex-1 bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387]"
                  placeholder="teammate@email.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <button
                  onClick={addMember}
                  className="bg-[#3cb387] text-black font-black px-10 py-4 rounded-2xl hover:brightness-110"
                >
                  INVITE
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-[#020406]/80 rounded-[2.5rem] p-8 border border-[#1A2E2E] hover:border-[#3cb387]/30 transition-all group relative"
                >
                  {/* Delete Action */}
                  <button
                    onClick={() => deleteSubscription(sub._id)}
                    className="absolute top-6 right-18 opacity-0 group-hover:opacity-100 text-red-500 hover:scale-110 transition-all text-sm font-bold bg-black/50 p-2 rounded-lg"
                  >
                    🗑️
                  </button>

                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-2xl font-black text-[#3cb387] uppercase tracking-tighter">
                        {sub.name}
                      </h4>
                      <p className="text-gray-400 text-[10px] font-black tracking-widest uppercase">
                        ₹{sub.totalCost} • {sub.billingCycle}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="bg-white/5 hover:bg-white hover:text-black py-1 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubName(sub.name);
                          setUsageForm({
                            ...usageForm,
                            subscriptionId: sub._id,
                          });
                          setIsUsageModalOpen(true);
                        }}
                        className="bg-[#3cb387] text-black p-3 rounded-full transition-all text-xl shadow-lg shadow-[#3cb387]/20"
                      >
                        ⏱️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-white/5 pt-6">
                    {splitResults[sub._id] ? (
                      splitResults[sub._id].map((res, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm items-center"
                        >
                          <span className="text-gray-400 font-medium tracking-tight">
                            {res.name} ({res.usageHours}h)
                          </span>
                          <span className="font-bold text-[#00E5FF] tracking-tighter">
                            ₹{res.amountToPay}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-widest">
                        Awaiting Log Data
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#020406]/70 rounded-[2.5rem] p-8 border border-[#1A2E2E] sticky top-28 shadow-2xl">
              <h3 className="text-xl font-bold mb-8 uppercase tracking-tighter italic text-[#3cb387]">
                Control Panel
              </h3>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSubForm({
                    name: "",
                    totalCost: "",
                    billingCycle: "monthly",
                  });
                  setIsSubModalOpen(true);
                }}
                className="w-full bg-[#3cb387] text-black font-black py-4 rounded-2xl shadow-xl mb-8 hover:brightness-110"
              >
                ADD NEW PLAN
              </button>

              <p className="text-[10px] font-black text-gray-700 tracking-[0.2em] uppercase mb-4 italic">
                Active Members
              </p>
              <div className="space-y-4">
                {groupMembers.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-[1.5rem] border border-transparent hover:border-white/10"
                  >
                    <div
                      className={`${COLORS[i % COLORS.length]} w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-black/50`}
                    >
                      {m.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-200">
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- ADD / EDIT SUB MODAL --- */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#101D1D] w-full max-w-md rounded-[3rem] p-10 border border-[#1A2E2E] shadow-2xl relative animate-in zoom-in duration-200">
            <h2 className="text-3xl font-black mb-6 uppercase italic tracking-tighter text-white">
              {isEditMode ? "Update" : "Register"}{" "}
              <span className="text-[#3cb387]">Plan</span>
            </h2>
            <form onSubmit={handleAddSubscription} className="space-y-5">
              <input
                required
                className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387] transition-all"
                placeholder="Netflix, Spotify..."
                value={subForm.name}
                onChange={(e) =>
                  setSubForm({ ...subForm, name: e.target.value })
                }
              />
              <input
                required
                type="number"
                className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387]"
                placeholder="Total Cost"
                value={subForm.totalCost}
                onChange={(e) =>
                  setSubForm({ ...subForm, totalCost: e.target.value })
                }
              />
              <select
                className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm text-gray-400 outline-none"
                value={subForm.billingCycle}
                onChange={(e) =>
                  setSubForm({ ...subForm, billingCycle: e.target.value })
                }
              >
                <option value="monthly">Monthly Cycle</option>
                <option value="yearly">Yearly Cycle</option>
              </select>
              <button
                type="submit"
                className="w-full bg-[#3cb387] text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs"
              >
                {isEditMode ? "Confirm Update" : "Initialize Plan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubModalOpen(false);
                  setIsEditMode(false);
                }}
                className="w-full text-gray-600 text-[10px] font-black uppercase mt-4 hover:text-white transition-all"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- USAGE MODAL --- */}
      {isUsageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#101D1D] w-full max-w-sm rounded-[3rem] p-10 border border-[#1A2E2E] text-center shadow-2xl relative animate-in zoom-in duration-200">
            <h2 className="text-xl font-black mb-4 uppercase italic tracking-tighter text-[#3cb387]">
              Activity Log
            </h2>
            <p className="text-gray-500 text-[10px] mb-8 font-black tracking-widest uppercase italic underline decoration-[#3cb387]">
              Hours for {selectedSubName}
            </p>
            <form onSubmit={handleLogUsage} className="space-y-6">
              <input
                required
                type="number"
                className="w-full bg-[#081212] border border-[#1A2E2E] py-6 rounded-3xl text-center text-5xl font-black text-[#3cb387] outline-none"
                placeholder="0"
                value={usageForm.hours}
                onChange={(e) =>
                  setUsageForm({ ...usageForm, hours: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-white text-black font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl"
              >
                Confirm Hours
              </button>
              <button
                type="button"
                onClick={() => setIsUsageModalOpen(false)}
                className="text-gray-600 text-[10px] font-black uppercase mt-4"
              >
                Close Window
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- RECHARTS DASHBOARD MODAL --- */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#101D1D] w-full max-w-6xl rounded-[4rem] p-14 border border-[#1A2E2E] relative my-auto shadow-2xl shadow-[#3cb387]/5">
            <button
              onClick={() => setShowSummary(false)}
              className="absolute top-12 right-12 text-gray-500 hover:text-white text-2xl font-black italic"
            >
              ✕
            </button>
            <h2 className="text-6xl font-black mb-2 tracking-tighter uppercase italic text-[#3cb387]">
              Intelligence
            </h2>
            <p className="text-gray-500 mb-8 font-black tracking-[0.4em] text-[10px] uppercase italic">
              Automated Financial Insights
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="h-[450px] w-full">
                <h4 className="text-[12px] font-black text-gray-600 uppercase tracking-[0.3em] mb-10 italic border-l-2 border-[#3cb387] pl-4">
                  Expense Weight Distribution
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={150}
                      paddingAngle={10}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      stroke="none"
                    >
                      {getChartData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS_HEX[index % COLORS_HEX.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#081212",
                        border: "1px solid #1A2E2E",
                        borderRadius: "20px",
                      
                      }}
                      itemStyle={{ color: '#3cb387', fontWeight: 'bold' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#081212] rounded-[4rem] p-14 border border-white/5 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF007A]/10 blur-[80px] rounded-full"></div>
                <p className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-[0.3em] italic">
                  Current Settle Amount
                </p>
                <div className="bg-[#081212] rounded-[4rem] p-14 border border-white/5 text-center relative overflow-hidden">
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-6 italic">
                    Current Settle Amount
                  </p>
                  <h3 className="text-4xl font-black text-[#FF007A] tracking-tighter mb-10">
                    ₹{calculateTotalDue()}
                  </h3>

                  {/* SETTLE UP BUTTON */}
                  <button
                    onClick={handleSettleUp}
                    className="w-full bg-[#3cb387] text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-sm hover:scale-[1.05] transition-all shadow-[0_0_30px_rgba(60,179,135,0.3)] mb-8"
                  >
                    🤝 Settle Up & Reset
                  </button>

                  <p className="text-[11px] text-gray-400 font-black leading-relaxed max-w-xs mx-auto italic uppercase tracking-widest">
                    Clicking this will clear your recorded hours for this
                    billing cycle.
                  </p>
                </div>
                <h3 className="text-4xl font-black text-[#FF007A] tracking-tighter mb-10 drop-shadow-[0_0_25px_rgba(255,0,122,0.4)]">
                  ₹{calculateTotalDue()}
                </h3>
                <div className="h-1 w-24 bg-[#3cb387] mx-auto mb-10 shadow-[0_0_10px_#3cb387]"></div>
                <p className="text-[11px] text-gray-400 font-black leading-relaxed max-w-xs mx-auto italic uppercase tracking-widest">
                  Notification: Your share is calculated based on group usage
                  proportionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
