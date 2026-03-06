import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const GroupDetails = () => {
  const { groupId } = useParams();
  const [subscriptions, setSubscriptions] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [splitData, setSplitData] = useState({}); // Stores split for each sub
  const token = localStorage.getItem("token");

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const fetchData = async () => {
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Fetch Subscriptions
      const subRes = await axios.get(`http://localhost:5000/api/subscriptions/group/${groupId}`, headers);
      setSubscriptions(subRes.data);

      // 2. Fetch Group Members (To show list)
      const groupRes = await axios.get(`http://localhost:5000/api/groups/${groupId}`, headers);
      setGroupMembers(groupRes.data.members || []);

      // 3. Fetch Splits for each subscription automatically
      subRes.data.forEach(async (sub) => {
        const splitRes = await axios.get(`http://localhost:5000/api/split/usage/${sub._id}`, headers);
        setSplitData(prev => ({ ...prev, [sub._id]: splitRes.data.split }));
      });

    } catch (err) {
      console.error("Data Fetch Error", err);
    }
  };

  useEffect(() => { fetchData(); }, [groupId]);

  const addMember = async () => {
    try {
      // Note: You might need a helper API to find userId by Email first
      // Assuming your backend 'addMemberToGroup' takes groupId and email
      await axios.post(`http://localhost:5000/api/groups/add-member`, 
        { groupId, email: newMemberEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Member Added!");
      fetchData();
    } catch (err) { alert("Failed to add member"); }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📊 Group Intelligence Dashboard</h1>
      </header>

      <div style={styles.mainGrid}>
        {/* LEFT COLUMN: Members & Subscriptions */}
        <div style={styles.leftCol}>
          <section style={styles.card}>
            <h3>Add Member</h3>
            <div style={styles.inputGroup}>
              <input 
                placeholder="User Email" 
                value={newMemberEmail} 
                onChange={(e) => setNewMemberEmail(e.target.value)}
                style={styles.input}
              />
              <button onClick={addMember} style={styles.btnPrimary}>Add</button>
            </div>
          </section>

          <section style={styles.card}>
            <h3>Active Subscriptions</h3>
            {subscriptions.map(sub => (
              <div key={sub._id} style={styles.subItem}>
                <strong>{sub.name}</strong> - ₹{sub.totalCost}
              </div>
            ))}
          </section>
        </div>

        {/* RIGHT COLUMN: Splits & Graphs */}
        <div style={styles.rightCol}>
          {subscriptions.map(sub => (
            <div key={sub._id} style={styles.splitCard}>
              <div style={styles.splitHeader}>
                <h2>{sub.name} Split Analysis</h2>
                <span style={styles.badge}>Auto-Billing Active</span>
              </div>

              <div style={styles.analysisBox}>
                {/* Graph Representation */}
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={splitData[sub._id] || []}
                        dataKey="amountToPay"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={80}
                        label
                      >
                        {(splitData[sub._id] || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Billing Table */}
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Usage</th>
                      <th>Bill Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(splitData[sub._id] || []).map(item => (
                      <tr key={item.userId}>
                        <td>{item.name}</td>
                        <td>{item.usageHours} hrs</td>
                        <td style={styles.amount}>₹{item.amountToPay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "40px", backgroundColor: "#f3f4f6", minHeight: "100vh", fontFamily: "Inter, sans-serif" },
  header: { marginBottom: "30px" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" },
  card: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "20px" },
  splitCard: { backgroundColor: "white", padding: "25px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", marginBottom: "30px" },
  inputGroup: { display: "flex", gap: "10px", marginTop: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  btnPrimary: { padding: "10px 20px", backgroundColor: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  subItem: { padding: "10px 0", borderBottom: "1px solid #eee" },
  splitHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  badge: { backgroundColor: "#D1FAE5", color: "#065F46", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
  amount: { fontWeight: "bold", color: "#4F46E5" }
};

export default GroupDetails;