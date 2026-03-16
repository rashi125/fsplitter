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

  // Modals States
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Form States
  const [subForm, setSubForm] = useState({ name: "", totalCost: "", billingCycle: "monthly" });
  const [usageForm, setUsageForm] = useState({ subscriptionId: "", hours: "" });
  const [selectedSubName, setSelectedSubName] = useState("");

  // Split Results Mapping
  const [splitResults, setSplitResults] = useState({});

  const token = localStorage.getItem("token");
  const COLORS = ["bg-[#FF8A00]", "bg-[#00E5FF]", "bg-[#7000FF]", "bg-[#FF007A]"];

  const handleLogout = () => {
    localStorage.removeItem("token");
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
        } catch (err) { console.log(`No usage/split for ${sub.name}`); }
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
      alert("Usage logged!");
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
    Object.values(splitResults).forEach((subSplit) => {
      // NOTE: currentUserId backend se login response mein aana chahiye
      const myShare = subSplit.find((s) => s.userId === group?.currentUserId); 
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
              <div className="absolute right-0 mt-3 w-56 bg-[#101D1D] border border-[#1A2E2E] rounded-2xl shadow-2xl py-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">johndoe@email.com</p>
                </div>
                <button onClick={() => { setShowSummary(true); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#3cb387] hover:text-black font-bold transition-all">
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#101D1D] p-6 rounded-[2rem] border border-[#1A2E2E]">
            <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-1">Total Group Expense</p>
            <h2 className="text-3xl font-black">₹{subscriptions.reduce((acc, sub) => acc + sub.totalCost, 0)}</h2>
          </div>
          <div className="bg-[#101D1D] p-6 rounded-[2rem] border border-[#1A2E2E]">
            <p className="text-[10px] font-black text-[#FF007A] tracking-widest uppercase mb-1">You Have To Pay</p>
            <h2 className="text-3xl font-black text-[#FF007A]">₹{calculateTotalDue()}</h2>
          </div>
          {/* <div className="bg-[#101D1D] p-6 rounded-[2rem] border border-[#1A2E2E]">
            <p className="text-[10px] font-black text-[#24db92] tracking-widest uppercase mb-1">You Have To Take</p>
            <h2 className="text-3xl font-black text-[#24db92]">₹0.00</h2>
          </div> */}
        </div>

        <h1 className="text-4xl font-black mb-10 tracking-tighter uppercase">
          Analytics <span className="text-[#3cb387]">{group?.name}</span>
        </h1>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* Add Member */}
            <div className="bg-[#020406]/70 rounded-[2rem] p-8 border border-[#1A2E2E]">
              <h3 className="text-xl font-bold mb-6 italic uppercase tracking-tighter">Add Team Member</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input className="flex-1 bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387]" placeholder="teammate@email.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
                <button onClick={addMember} className="bg-[#3cb387] text-black font-black px-10 py-4 rounded-2xl">INVITE</button>
              </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold italic uppercase tracking-tighter underline decoration-[#3cb387]">Active Subscriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions.map((sub) => (
                  <div key={sub._id} className="bg-[#020406]/80 rounded-[2rem] p-8 border border-[#1A2E2E]">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-2xl font-black text-[#3cb387] uppercase tracking-tighter">{sub.name}</h4>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">₹{sub.totalCost} / {sub.billingCycle}</p>
                      </div>
                      <button onClick={() => { setSelectedSubName(sub.name); setUsageForm({ ...usageForm, subscriptionId: sub._id }); setIsUsageModalOpen(true); }} className="bg-white/10 hover:bg-[#3cb387] hover:text-black p-3 rounded-full transition-all text-xl">⏱️</button>
                    </div>

                    <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                      <p className="text-[10px] font-black text-gray-600 tracking-widest uppercase italic">Cost Breakdown</p>
                      {splitResults[sub._id] ? splitResults[sub._id].map((res, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-400">{res.name} ({res.usageHours}h)</span>
                          <span className="font-bold text-[#00E5FF]">₹{res.amountToPay}</span>
                        </div>
                      )) : <p className="text-xs text-gray-700 italic font-medium">Log hours to calculate split</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#020406]/70 rounded-[2rem] p-8 border border-[#1A2E2E]">
              <h3 className="text-xl font-bold mb-8 italic uppercase tracking-tighter">Actions</h3>
              <button onClick={() => setIsSubModalOpen(true)} className="w-full bg-[#3cb387] text-black font-black py-4 rounded-2xl shadow-lg hover:brightness-110">ADD NEW SUBSCRIPTION</button>
              <div className="mt-8 space-y-4">
                <p className="text-[10px] font-black text-gray-700 tracking-widest uppercase">Team</p>
                {groupMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`${COLORS[i % COLORS.length]} w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black`}>{m.name.substring(0, 2).toUpperCase()}</div>
                    <span className="text-sm font-bold">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101D1D] w-full max-w-md rounded-[2.5rem] p-10 border border-[#1A2E2E]">
            <h2 className="text-2xl font-black mb-6 uppercase italic">New <span className="text-[#3cb387]">Plan</span></h2>
            <form onSubmit={handleAddSubscription} className="space-y-4">
              <input required className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none" placeholder="Service Name" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />
              <input required type="number" className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none" placeholder="Cost" value={subForm.totalCost} onChange={(e) => setSubForm({ ...subForm, totalCost: e.target.value })} />
              <select className="w-full bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm text-gray-400 outline-none" value={subForm.billingCycle} onChange={(e) => setSubForm({ ...subForm, billingCycle: e.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button type="submit" className="w-full bg-[#3cb387] text-black font-black py-4 rounded-2xl uppercase">Create</button>
              <button type="button" onClick={() => setIsSubModalOpen(false)} className="w-full text-gray-600 text-[10px] font-bold mt-2 uppercase">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {isUsageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101D1D] w-full max-w-sm rounded-[2.5rem] p-10 border border-[#1A2E2E] text-center">
            <h2 className="text-xl font-black mb-4 uppercase italic">Log {selectedSubName}</h2>
            <form onSubmit={handleLogUsage} className="space-y-6">
              <input required type="number" className="w-full bg-[#081212] border border-[#1A2E2E] py-4 rounded-2xl text-center text-3xl font-black text-[#3cb387] outline-none" placeholder="0" value={usageForm.hours} onChange={(e) => setUsageForm({ ...usageForm, hours: e.target.value })} />
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl text-xs uppercase">Save</button>
              <button type="button" onClick={() => setIsUsageModalOpen(false)} className="text-gray-500 text-[10px] font-bold uppercase mt-2">Close</button>
            </form>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#101D1D] w-full max-w-4xl rounded-[3rem] p-10 border border-[#1A2E2E] relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setShowSummary(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white text-xl font-bold">✕</button>
             <h2 className="text-4xl font-black mb-10 tracking-tighter uppercase italic text-[#3cb387]">Usage Analytics</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Expense Share</h4>
                   {subscriptions.map(sub => {
                     const totalGroupCost = subscriptions.reduce((a, b) => a + b.totalCost, 0);
                     const percentage = totalGroupCost > 0 ? Math.round((sub.totalCost / totalGroupCost) * 100) : 0;
                     return (
                       <div key={sub._id} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                             <span>{sub.name}</span>
                             <span>{percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-black rounded-full overflow-hidden">
                             <div className="bg-[#3cb387] h-full shadow-[0_0_10px_#3cb387]" style={{ width: `${percentage}%` }}></div>
                          </div>
                       </div>
                     );
                   })}
                </div>
                <div className="bg-black/40 rounded-[2rem] p-8 border border-white/5 text-center flex flex-col justify-center">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Your Settlement Amount</p>
                   <h3 className="text-6xl font-black text-[#FF007A]">₹{calculateTotalDue()}</h3>
                   <p className="text-[10px] text-gray-600 font-bold mt-4 uppercase">Pay this to the group owner to settle up.</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;