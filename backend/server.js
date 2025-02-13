const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const users = {}; // Store active users

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining with username
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("updateUsers", users);
  });

  // Handle private messaging
  socket.on("privateMessage", ({ sender, receiver, message }) => {
    const receiverSocketId = Object.keys(users).find((id) => users[id] === receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", { sender, message });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("updateUsers", users);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
