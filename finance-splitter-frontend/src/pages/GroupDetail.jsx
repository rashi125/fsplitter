import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const GroupDetails = () => {
  const { groupId: rawGroupId } = useParams();
  const cleanGroupId = rawGroupId ? rawGroupId.replace(/[^a-fA-F0-9]/g, "").trim() : "";
  const navigate = useNavigate();
 const [group, setGroup] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const token = localStorage.getItem("token");
  
  const COLORS = ["bg-[#FF8A00]", "bg-[#00E5FF]", "bg-[#7000FF]", "bg-[#FF007A]"];

  const fetchData = async () => {
    if (!cleanGroupId) return;
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Fetch Group & Members
      const groupRes = await axios.get(`http://localhost:5000/api/groups/${cleanGroupId}`, headers);
      setGroupMembers(groupRes.data.members || []);
      setGroup(groupRes.data);
      // 2. Fetch Group Subscriptions
      const subRes = await axios.get(`http://localhost:5000/api/subscriptions/group/${cleanGroupId}`, headers);
      setSubscriptions(Array.isArray(subRes.data) ? subRes.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cleanGroupId]);

  const addMember = async () => {
    if (!newMemberEmail.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/groups/add-member`,
        { groupId: cleanGroupId, email: newMemberEmail.trim().toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMemberEmail("");
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Error adding member");
    }
  };

  return (
    // ROOT DIV WITH SOLID BACKGROUND COLOUR
    <div className="min-h-screen w-full bg-gradient-to-br from-[#091842] via-[#082175] to-[#111827]  text-white font-sans selection:bg-[#00E5FF] selection:text-black">
      
      {/* STICKY TOP NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-md border-b border-[#1A2E2E] px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => navigate("/dashboard")} 
              className="text-[#00E5FF] font-bold flex items-center gap-2 hover:brightness-125 transition-all text-xs tracking-widest"
            >
              <span>←</span> BACK TO DASHBOARD
            </button>
            
            {/* Nav Links for Desktop */}
            <div className="hidden lg:flex items-center gap-8 text-[10px] font-black tracking-[0.2em] text-gray-500">
              <span className="text-[#00E5FF] cursor-pointer">OVERVIEW</span>
              <span className="hover:text-white cursor-pointer transition-colors">ANALYTICS</span>
              <span className="hover:text-white cursor-pointer transition-colors">HISTORY</span>
              <span className="hover:text-white cursor-pointer transition-colors">SETTINGS</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="cursor-pointer text-gray-400 hover:text-white text-xl">🔔</span>
            <div className="bg-[#00E5FF] text-black w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1600px] mx-auto px-6 py-10">
        
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black leading-none mb-4">
            Analytics <span className="text-3xl md:text-4xl font-black leading-none mb-4">{group?.name || "Unnamed Group"}</span></h1>
          <p className="text-gray-500 text-lg max-w-2xl font-medium">
            Manage your team's collective insights, track detailed usage, and automate group billing.
          </p>
        </section>

        {/* Responsive Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SECTION (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Add Member Card */}
            <div className="bg-[#020406]/70 rounded-[2rem] p-8 border border-[#1A2E2E] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#1A2E2E] p-3 rounded-xl text-[#00E5FF] text-xl">👤</div>
                <h3 className="text-xl font-bold tracking-tight">Add Team Member</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-xl">📧</span>
                  <input
                    className="w-full bg-[#081212] border border-[#1A2E2E] py-4 pl-14 pr-6 rounded-2xl text-sm focus:outline-none focus:border-[#00E5FF] transition-all placeholder:text-gray-700"
                    placeholder="teammate@email.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <button 
                  onClick={addMember}
                  className="bg-[#00E5FF] text-black font-black px-10 py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#00E5FF]/20 whitespace-nowrap"
                >
                  INVITE NOW ➤
                </button>
              </div>
            </div>

            {/* Members Display Card */}
            <div className="bg-[#020406]/80  rounded-[2rem] p-8 border border-[#1A2E2E] shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1A2E2E] p-3 rounded-xl text-[#00E5FF] text-xl">👥</div>
                  <h3 className="text-xl font-bold tracking-tight">Active Members</h3>
                </div>
                <span className="bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-black border border-[#00E5FF]/20 px-4 py-2 rounded-full tracking-[0.1em]">
                  {groupMembers.length} ONLINE
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                {groupMembers.length > 0 ? (
                  groupMembers.map((m, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[#1A2E2E] border border-[#253D3D] py-3 px-5 rounded-2xl hover:border-[#00E5FF]/40 transition-all group cursor-default">
                      <div className={`${COLORS[i % COLORS.length]} w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shadow-inner`}>
                        {m.name ? m.name.substring(0, 2).toUpperCase() : "??"}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{m.name || "User"}</div>
                        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Team Member</div>
                      </div>
                      <button className="ml-4 opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all">✕</button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700 font-medium italic">No members found in this group.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Span 4) */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-[#020406]/70   rounded-[2rem] p-8 border border-[#1A2E2E] shadow-2xl h-full flex flex-col sticky top-28">
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-[#1A2E2E] p-3 rounded-xl text-[#00E5FF] text-xl">🏷️</div>
                <h3 className="text-xl font-bold tracking-tight">Subscriptions</h3>
              </div>

              {/* Plans Area */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="text-7xl opacity-5 mb-6">📂</div>
                <h4 className="font-bold text-lg mb-2">No active plans</h4>
                <p className="text-gray-600 text-xs max-w-[200px] leading-relaxed mb-8">
                  Link a plan to this group to start tracking shared usage.
                </p>
                <button className="w-full border border-[#1A2E2E] text-[#00E5FF] py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-[#00E5FF] hover:text-black transition-all">
                  BROWSE ALL PLANS
                </button>
              </div>

              {/* Usage Stats Section */}
              <div className="mt-auto pt-8 border-t border-[#1A2E2E]">
                <p className="text-[10px] font-black text-gray-700 tracking-[0.2em] mb-6 uppercase">Real-time Usage</p>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-gray-500 mb-2 tracking-wider">
                      <span>DATA TOKENS</span> <span>0 / 100%</span>
                    </div>
                    <div className="h-1 bg-[#081212] rounded-full overflow-hidden">
                      <div className="bg-[#00E5FF] h-full w-[5%] rounded-full shadow-[0_0_8px_#00E5FF]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-black text-gray-500 mb-2 tracking-wider">
                      <span>SHARED STORAGE</span> <span>0.0 GB</span>
                    </div>
                    <div className="h-1 bg-[#081212] rounded-full overflow-hidden">
                      <div className="bg-[#7000FF] h-full w-[15%] rounded-full shadow-[0_0_8px_#7000FF]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDetails;