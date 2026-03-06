import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");

  const token = localStorage.getItem("token");

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
    <div style={styles.container} className="bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))]

from-[#1d4ed8]
via-[#1e40af]
to-[#111827]
">
      <div style={styles.contentWrapper}>
        <header style={styles.headerSection}>
          <h1 style={styles.headerTitle}>Finance Dashboard</h1>
          <p style={styles.headerSubtitle}>Manage your shared expenses and groups</p>
        </header>

        {/* Create Group Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle} className="text-black">
            Create New Group
          </h2>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="e.g. Trip to Japan, Housemates"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={styles.input}
            />
            <button onClick={createGroup} style={styles.primaryButton}>
              + Create Group
            </button>
          </div>
        </div>

        {/* Existing Groups */}
        <div style={styles.listSection}>
          <h2 style={styles.cardTitle} className="text-white">
            Your Active Groups
          </h2>
          <div style={styles.grid}>
            {Array.isArray(groups) && groups.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No active groups. Start by creating one above.</p>
              </div>
            ) : (
              groups?.map((group) => (
                <div key={group._id} style={styles.groupCard}>
                  <div style={styles.groupInfo}>
                    <h3 style={styles.groupName}>{group.name}</h3>
                    <span style={styles.memberBadge}>
                      {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                  <button
                    style={styles.secondaryButton}
                    onClick={() => (window.location.href = `/group/${group._id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "60px 20px",
    boxSizing: "border-box",
  },
  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  headerSection: {
    textAlign: "left",
    marginBottom: "40px",
  },
  headerTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "White",
    margin: "0 0 8px 0",
    letterSpacing: "-0.025em",
  },
  headerSubtitle: {
    color: "Gray",
    fontSize: "16px",
    margin: 0,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    marginBottom: "32px",
    border: "1px solid #E2E8F0",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
   
    marginBottom: "20px",
    marginTop: 0,
  },
  inputGroup: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "#F1F5F9",
  },
  primaryButton: {
    padding: "12px 24px",
    backgroundColor: "#4F46E5", // Modern Indigo
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "background-color 0.2s",
  },
  listSection: {
    marginTop: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  groupCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },
  groupName: {
    fontSize: "19px",
    fontWeight: "700",
    color: "#1E293B",
    margin: "0 0 8px 0",
  },
  memberBadge: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6366F1",
    backgroundColor: "#EEF2FF",
    padding: "4px 10px",
    borderRadius: "20px",
    display: "inline-block",
    marginBottom: "20px",
  },
  secondaryButton: {
    padding: "10px",
    backgroundColor: "#FFFFFF",
    color: "#475569",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#94A3B8",
    gridColumn: "1 / -1",
  }
};

export default Dashboard;