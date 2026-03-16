import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  
  // States for Navbar functionality
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userEmail = localStorage.getItem("userEmail") || "user@email.com";

  const token = localStorage.getItem("token");
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

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white font-sans selection:bg-[#3cb387]">
      
      {/* --- STICKY TOP NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-[#1A2E2E] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <h2 className="text-[#24db92] font-black text-xl  italic">FINANCE SPLITTER</h2>
          
          <div className="relative">
            {/* User Avatar Dropdown Toggle */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="bg-[#24db92] text-black w-10 h-10 rounded-full flex items-center justify-center font-black text-sm cursor-pointer shadow-lg hover:scale-105 transition-all"
            >👩
              
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#101D1D] border border-[#1A2E2E] rounded-2xl shadow-2xl py-2 overflow-hidden z-[60]">
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Signed in as</p>
                  <p className="text-sm font-bold text-[#3cb387] truncate">{userEmail}</p>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-3 text-sm hover:bg-red-500 hover:text-white font-bold transition-all flex items-center gap-2"
                >
                  🚪 Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        
        <header className="mb-12">
          <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase italic">
            Finance <span className="text-[#3cb387] tracking-wide">Dashboard</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">Manage your shared expenses and groups efficiently.</p>
        </header>

        {/* Create Group Card */}
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
              + Create Group
            </button>
          </div>
        </section>

        {/* Existing Groups Grid */}
        <section>
          <h2 className="text-xl font-bold mb-8 uppercase tracking-tighter italic border-l-4 border-[#3cb387] pl-4">
            Your Active Groups
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-[#1A2E2E]">
                <p className="text-gray-600 font-bold uppercase tracking-widest italic">No active groups. Start by creating one above.</p>
              </div>
            ) : (
              groups.map((group) => (
                <div 
                  key={group._id} 
                  className="bg-[#101D1D] border border-[#1A2E2E] p-8 rounded-[2.5rem] hover:border-[#3cb387]/50 transition-all group flex flex-col justify-between"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-white group-hover:text-[#3cb387] transition-colors uppercase tracking-tight leading-none mb-4">
                      {group.name}
                    </h3>
                    <span className="text-[10px] font-black text-[#24db92] bg-[#24db92]/10 px-4 py-2 rounded-full uppercase tracking-widest border border-[#24db92]/20">
                      {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/group/${group._id}`)}
                    className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;