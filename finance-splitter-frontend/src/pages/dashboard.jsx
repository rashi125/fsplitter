import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(res.data.groups);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Create Group
  const createGroup = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/groups",
        { name: groupName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroupName("");
      fetchGroups();
    } catch (err) {
      console.error("Error creating group", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Finance Split Dashboard</h1>

      {/* Create Group */}
      <div>
        <h2>Create New Group</h2>
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button onClick={createGroup}>Create Group</button>
      </div>

      {/* Existing Groups */}
      <div style={{ marginTop: "30px", backgroundColor: "#f0f0f0", padding: "10px", color: "black" }}>
        <h2>My Groups</h2>
        {Array.isArray(groups) && groups.length === 0 ? (
      <p>No groups found</p>
        ) : (
      groups?.map((group) => (
            <div
              key={group._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h3>{group.name}</h3>
              <p>Members: {group.members.length}</p>
              <button
                onClick={() =>
                  (window.location.href = `/group/${group._id}`)
                }
              >
                View Expenditure
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;