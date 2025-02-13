import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Container, TextField, Button, Typography, Box, MenuItem, Select } from "@mui/material";

const socket = io("http://localhost:5000");

const Chat = () => {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState({});
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("updateUsers", (users) => {
      setUsers(users);
    });

    socket.on("receiveMessage", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    return () => {
      socket.off("updateUsers");
      socket.off("receiveMessage");
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit("join", username);
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() && receiver) {
      socket.emit("privateMessage", { sender: username, receiver, message });
      setMessages((prev) => [...prev, { sender: "You", message }]);
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      {!loggedIn ? (
        <>
          <Typography variant="h4" gutterBottom>Enter Your Name</Typography>
          <TextField fullWidth label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={joinChat}>Join Chat</Button>
        </>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>Welcome, {username}!</Typography>
          <Select fullWidth displayEmpty value={receiver} onChange={(e) => setReceiver(e.target.value)} sx={{ mb: 2 }}>
            <MenuItem value="" disabled>Select User</MenuItem>
            {Object.values(users).filter((user) => user !== username).map((user) => (
              <MenuItem key={user} value={user}>{user}</MenuItem>
            ))}
          </Select>
          <Box sx={{ height: 300, overflowY: "auto", border: "1px solid #ccc", p: 2, mb: 2 }}>
            {messages.map((msg, index) => (
              <Typography key={index} sx={{ mb: 1, background: msg.sender === "You" ? "#DFFFD6" : "#f3f3f3", p: 1, borderRadius: 1 }}>
                <strong>{msg.sender}: </strong> {msg.message}
              </Typography>
            ))}
          </Box>
          <TextField fullWidth label="Type a message" variant="outlined" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} />
          <Button variant="contained" sx={{ mt: 2 }} fullWidth onClick={sendMessage}>Send</Button>
        </>
      )}
    </Container>
  );
};

export default Chat;
