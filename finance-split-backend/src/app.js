
const express = require("express");
const cors = require("cors");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.get("/", (req, res) => {
  res.send("API running");
});

module.exports = app;