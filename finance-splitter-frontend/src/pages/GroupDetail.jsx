import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const GroupDetails = () => {
  const { groupId: rawGroupId } = useParams();
  const cleanGroupId = rawGroupId ? rawGroupId.replace(/[^a-fA-F0-9]/g, "").trim() : "";
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

  // Form States
  const [subForm, setSubForm] = useState({ name: "", totalCost: "", billingCycle: "monthly" });
  const [usageForm, setUsageForm] = useState({ subscriptionId: "", hours: "" });
  const [selectedSubName, setSelectedSubName] = useState("");

  // Split Results Mapping (SubscriptionId -> Split Array)
  const [splitResults, setSplitResults] = useState({});

  const userEmail = localStorage.getItem("userEmail") || "user@email.com";
  const token = localStorage.getItem("token");
  const COLORS = ["bg-[#FF8A00]", "bg-[#00E5FF]", "bg-[#7000FF]", "bg-[#FF007A]"];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const fetchData = async () => {
    if (!cleanGroupId) return;
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      
      const groupRes = await axios.get(`http://localhost:5000/api/groups/${cleanGroupId}`, headers);
      setGroup(groupRes.data);
      setGroupMembers(groupRes.data.members || []);

      const subRes = await axios.get(`http://localhost:5000/api/subscriptions/${cleanGroupId}`, headers);
      const subs = Array.isArray(subRes.data) ? subRes.data : [];
      setSubscriptions(subs);

      subs.forEach(async (sub) => {
        try {
          const splitRes = await axios.get(`http://localhost:5000/api/split/${sub._id}`, headers);
          if (splitRes.data.success) {
            setSplitResults((prev) => ({ ...prev, [sub._id]: splitRes.data.split }));
          }
        } catch (err) { console.log(`No split data for ${sub.name}`); }
      });
    } catch (err) { console.error("Fetch Error:", err); }
  };

  useEffect(() => { fetchData(); }, [cleanGroupId]);

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/subscriptions", 
        { ...subForm, groupId: cleanGroupId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubModalOpen(false);
      setSubForm({ name: "", totalCost: "", billingCycle: "monthly" });
      fetchData();
    } catch (err) { alert("Error adding subscription"); }
  };

  const handleLogUsage = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/usage", 
        { subscriptionId: usageForm.subscriptionId, usageHours: Number(usageForm.hours) }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsUsageModalOpen(false);
      setUsageForm({ subscriptionId: "", hours: "" });
      fetchData();
      alert("Usage logged successfully!");
    } catch (err) { alert("Failed to log usage"); }
  };

  const addMember = async () => {
    if (!newMemberEmail.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/groups/add-member`,
        { groupId: cleanGroupId, email: newMemberEmail.trim().toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMemberEmail("");
      fetchData();
    } catch (err) { alert("Error adding member"); }
  };

  const calculateTotalDue = () => {
    let total = 0;
    // Backend se check karo ki current user ki ID kya hai (State ya Token se)
    Object.values(splitResults).forEach((subSplit) => {
      const myShare = subSplit.find((s) => s.email === userEmail); 
      if (myShare) total += myShare.amountToPay;
    });
    return total.toFixed(2);
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white font-sans selection:bg-[#3cb387]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-[#1A2E2E] px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <button onClick={() => navigate("/dashboard")} className="text-white font-bold text-xs tracking-widest hover:text-[#3cb387]">
            ← BACK TO DASHBOARD
          </button>
          
          <div className="relative">
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-[#24db92] text-black w-10 h-10 rounded-full flex items-center justify-center font-black text-sm cursor-pointer shadow-lg hover:scale-105 transition-all">
              👩
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#101D1D] border border-[#1A2E2E] rounded-3xl shadow-2xl px-4 py-4 overflow-hidden z-[60]">
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase">Signed in as</p>
                  <p className="text-sm font-bold text-[#3cb387] truncate">{userEmail}</p>
                </div>
                <button onClick={() => { setShowSummary(true); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 mb-4 text-sm hover:bg-[#3cb387] hover:text-black font-bold transition-all">
                  📊 Visual Dashboard
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm hover:bg-red-500 hover:text-white font-bold transition-all">
                  🚪 Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#101D1D] p-8 rounded-[2rem] border border-[#1A2E2E] shadow-xl">
            <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-2">Total Expenses</p>
            <h2 className="text-4xl font-black">₹{subscriptions.reduce((acc, sub) => acc + sub.totalCost, 0)}</h2>
          </div>
          <div className="bg-[#101D1D] p-8 rounded-[2rem] border border-[#1A2E2E] shadow-xl">
            <p className="text-[10px] font-black text-[#FF007A] tracking-[0.2em] uppercase mb-2">Your Split Share</p>
            <h2 className="text-4xl font-black text-[#FF007A]">₹{calculateTotalDue()}</h2>
          </div>
        </div>

        <h1 className="text-4xl font-black mb-10 tracking-tighter uppercase italic">
          Analytics <span className="text-[#3cb387]">{group?.name || "Group"}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-10">
            {/* Add Member */}
            <div className="bg-[#020406]/70 rounded-[2.5rem] p-10 border border-[#1A2E2E]">
              <h3 className="text-xl font-bold mb-6 uppercase tracking-tighter">Add Team Member</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input className="flex-1 bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387]" placeholder="teammate@email.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
                <button onClick={addMember} className="bg-[#3cb387] text-black font-black px-10 py-4 rounded-2xl hover:brightness-110 transition-all">INVITE</button>
              </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => (
                <div key={sub._id} className="bg-[#020406]/80 rounded-[2.5rem] p-8 border border-[#1A2E2E] hover:border-[#3cb387]/30 transition-all group">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-2xl font-black text-[#3cb387] uppercase tracking-tighter">{sub.name}</h4>
                      <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">₹{sub.totalCost} • {sub.billingCycle}</p>
                    </div>
                    <button onClick={() => { setSelectedSubName(sub.name); setUsageForm({ ...usageForm, subscriptionId: sub._id }); setIsUsageModalOpen(true); }} className="bg-white/5 hover:bg-[#3cb387] hover:text-black p-3 rounded-full transition-all text-xl">⏱️</button>
                  </div>

                  <div className="space-y-3 border-t border-white/5 pt-6">
                    <p className="text-[10px] font-black text-gray-600 tracking-widest uppercase mb-2">Usage Split</p>
                    {splitResults[sub._id] ? splitResults[sub._id].map((res, i) => (
                      <div key={i} className="flex justify-between text-sm items-center">
                        <span className="text-gray-400 font-medium">{res.name} ({res.usageHours}h)</span>
                        <span className="font-bold text-[#00E5FF]">₹{res.amountToPay}</span>
                      </div>
                    )) : <p className="text-xs text-gray-700 italic font-medium">Log usage to see split</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#020406]/70 rounded-[2.5rem] p-8 border border-[#1A2E2E] sticky top-28">
              <h3 className="text-xl font-bold mb-8 uppercase tracking-tighter italic">Quick Actions</h3>
              <button onClick={() => setIsSubModalOpen(true)} className="w-full bg-[#3cb387] text-black font-black py-4 rounded-2xl shadow-lg mb-8 hover:scale-[1.02] transition-all">ADD SUBSCRIPTION</button>
              
              <p className="text-[10px] font-black text-gray-700 tracking-[0.2em] uppercase mb-4">Team Members</p>
              <div className="space-y-4">
                {groupMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-transparent hover:border-white/10 transition-all">
                    <div className={`${COLORS[i % COLORS.length]} w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black`}>{m.name.substring(0, 2).toUpperCase()}</div>
                    <span className="text-sm font-bold tracking-tight">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      {/* Sub Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101D1D] w-full max-w-md rounded-[3rem] p-10 border border-[#1A2E2E] shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setIsSubModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white font-bold">✕</button>
            <h2 className="text-3xl font-black mb-6 uppercase italic tracking-tighter">New <span className="text-[#3cb387]">Plan</span></h2>
            <form onSubmit={handleAddSubscription} className="space-y-5">
              <input required className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387] transition-all" placeholder="Netflix, Spotify etc." value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />
              <input required type="number" className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387] transition-all" placeholder="Amount (₹)" value={subForm.totalCost} onChange={(e) => setSubForm({ ...subForm, totalCost: e.target.value })} />
              <select className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm text-gray-400 outline-none" value={subForm.billingCycle} onChange={(e) => setSubForm({ ...subForm, billingCycle: e.target.value })}>
                <option value="monthly">Monthly Cycle</option>
                <option value="yearly">Yearly Cycle</option>
              </select>
              <button type="submit" className="w-full bg-[#3cb387] text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-[#3cb387]/20">Create Subscription</button>
            </form>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {isUsageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101D1D] w-full max-w-sm rounded-[3rem] p-10 border border-[#1A2E2E] text-center shadow-2xl relative animate-in zoom-in duration-200">
            <h2 className="text-xl font-black mb-2 uppercase italic tracking-tighter text-[#3cb387]">Log {selectedSubName}</h2>
            <p className="text-gray-500 text-xs mb-8 font-bold uppercase tracking-widest leading-relaxed">Enter your hours spent this month</p>
            <form onSubmit={handleLogUsage} className="space-y-6">
              <input required type="number" className="w-full bg-[#081212] border border-[#1A2E2E] py-5 rounded-3xl text-center text-4xl font-black text-[#3cb387] outline-none" placeholder="0" value={usageForm.hours} onChange={(e) => setUsageForm({ ...usageForm, hours: e.target.value })} />
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg">Save Hours</button>
              <button type="button" onClick={() => setIsUsageModalOpen(false)} className="text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Visual Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#101D1D] w-full max-w-4xl rounded-[3.5rem] p-12 border border-[#1A2E2E] relative my-auto shadow-2xl">
             <button onClick={() => setShowSummary(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white text-xl font-bold">✕</button>
             <h2 className="text-5xl font-black mb-2 tracking-tighter uppercase italic text-[#3cb387]">Visual Report</h2>
             <p className="text-gray-500 mb-12 font-bold tracking-[0.2em] text-[10px] uppercase underline decoration-[#3cb387]">Usage Analytics & Personal Share</p>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Expense Weight</h4>
                   {subscriptions.map(sub => {
                     const totalGroupCost = subscriptions.reduce((a, b) => a + b.totalCost, 0);
                     const percentage = totalGroupCost > 0 ? Math.round((sub.totalCost / totalGroupCost) * 100) : 0;
                     return (
                       <div key={sub._id} className="space-y-3">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                             <span>{sub.name}</span>
                             <span className="text-[#3cb387]">{percentage}%</span>
                          </div>
                          <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                             <div className="bg-[#3cb387] h-full shadow-[0_0_15px_#3cb387]" style={{ width: `${percentage}%` }}></div>
                          </div>
                       </div>
                     );
                   })}
                </div>
                <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5 text-center flex flex-col justify-center items-center">
                   <p className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-[0.2em]">Total Amount To Settle</p>
                   <h3 className="text-7xl font-black text-[#FF007A] tracking-tighter mb-6 shadow-text">₹{calculateTotalDue()}</h3>
                   <div className="h-1 w-20 bg-[#3cb387] mb-8"></div>
                   <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-xs">
                     Based on your reported hours, this is your share. Settle up with the group manager.
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