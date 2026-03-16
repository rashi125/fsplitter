import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const userEmail = localStorage.getItem("userEmail") || "user@email.com";
  const token = localStorage.getItem("token");
  // Maan lijiye aapne login ke waqt userId bhi save ki hai, agar nahi ki to hum token se nikaal sakte hain
  const currentUserId = localStorage.getItem("userId"); 

  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    try {
      await axios.post(
        "http://localhost:5000/api/groups",
        { name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroupName("");
      fetchGroups();
    } catch (err) {
      console.error("Error creating group", err);
    }
  };

  // --- DELETE GROUP (ONLY ADMIN) ---
  const deleteGroup = async (groupId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All data will be lost.`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete group.");
    }
  };

  // --- LEAVE GROUP (FOR MEMBERS) ---
  const handleLeaveGroup = async (groupId, name) => {
    if (!window.confirm(`Are you sure you want to leave "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/groups/leave/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("You have left the group.");
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave group.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white font-sans selection:bg-[#3cb387] relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3cb387]/20 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-[#00E5FF]/15 blur-[100px] rounded-full pointer-events-none"></div>

      <nav className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-[#1A2E2E] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <h2 className="text-[#24db92] font-black text-xl italic tracking-tighter">FINANCE SPLITTER</h2>
          
          <div className="relative">
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="bg-[#24db92] text-black w-10 h-10 rounded-full flex items-center justify-center font-black text-sm cursor-pointer shadow-lg hover:scale-105 transition-all"
            >👩</div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#101D1D] border border-[#1A2E2E] rounded-2xl shadow-2xl py-2 overflow-hidden z-[60]">
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Signed in as</p>
                  <p className="text-sm font-bold text-[#3cb387] truncate">{userEmail}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-3 text-sm hover:bg-red-500 hover:text-white font-bold transition-all"
                >🚪 Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        <header className="mb-12">
          <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase italic">
            Finance <span className="text-[#3cb387] tracking-wide">Dashboard</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">Manage your shared expenses and groups efficiently.</p>
        </header>

        <section className="bg-[#101D1D] p-8 rounded-[2.5rem] border border-[#1A2E2E] mb-12 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-tighter text-white">Create New Group</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="e.g. Trip to Japan, Housemates"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 bg-[#081212] border border-[#1A2E2E] py-4 px-6 rounded-2xl text-sm outline-none focus:border-[#3cb387] transition-all"
            />
            <button 
              onClick={createGroup} 
              className="bg-[#10B981] text-black font-black px-10 py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#10B981]/20 uppercase text-xs tracking-widest"
            >
              + Create
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-8 uppercase tracking-tighter italic border-l-4 border-[#3cb387] pl-4">Your Active Groups</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-[#1A2E2E]">
                <p className="text-gray-600 font-bold uppercase tracking-widest italic">No active groups found.</p>
              </div>
            ) : (
              groups.map((group) => {
                // Check if current user is the owner/admin
                // Backend me Group model me 'owner' field hai, to wahi use karenge
                const isAdmin = group.owner === currentUserId;

                return (
                  <div 
                    key={group._id} 
                    className="bg-[#101D1D] border border-[#1A2E2E] p-8 rounded-[2.5rem] hover:border-[#3cb387]/40 transition-all group flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* --- DYNAMIC ACTION ICON (DELETE OR LEAVE) --- */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAdmin) {
                          deleteGroup(group._id, group.name);
                        } else {
                          handleLeaveGroup(group._id, group.name);
                        }
                      }}
                      className="absolute top-6 right-6 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-125 font-bold text-xs"
                      title={isAdmin ? "Delete Group" : "Leave Group"}
                    >
                      {isAdmin ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      ) : (
                        <span className="bg-red-500/10 px-2 py-1 rounded text-red-500">LEAVE 🚪</span>
                      )}
                    </button>

                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-white group-hover:text-[#3cb387] transition-colors uppercase tracking-tight mb-4 pr-10">
                        {group.name}
                      </h3>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-[#24db92] bg-[#24db92]/10 px-4 py-2 rounded-full uppercase tracking-widest border border-[#24db92]/20 w-fit">
                          {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                        </span>
                        {/* Visual Badge for Role */}
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">
                           {isAdmin ? "Admin / Owner" : "Member"}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/group/${group._id}`)}
                      className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
                    >
                      View Details
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;