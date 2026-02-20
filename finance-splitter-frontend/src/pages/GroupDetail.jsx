import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const GroupDetails = () => {
  const { groupId } = useParams();
  const [subscriptions, setSubscriptions] = useState([]);
  const token = localStorage.getItem("token");

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/subscriptions/group/${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubscriptions(res.data.subscriptions);
    } catch (err) {
      console.error("Error fetching subscriptions", err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>💳 Group Expenditure Tracking</h1>

      {subscriptions.map((sub) => (
        <div
          key={sub._id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>{sub.name}</h3>
          <p>Total Cost: ₹{sub.totalCost}</p>
          <p>Billing Cycle: {sub.billingCycle}</p>

          <button
            onClick={() =>
              (window.location.href = `/split/${sub._id}`)
            }
          >
            View Expense Split
          </button>
        </div>
      ))}
    </div>
  );
};

export default GroupDetails;