const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Create an instance of Express
const app = express();
app.use(express.json()); // Middleware để parse JSON

app.use(
  cors({
    origin: "*", // Cho phép tất cả các nguồn
    methods: ["GET", "POST"], // Các phương thức bạn muốn cho phép
  })
);
// Create an HTTP server and bind it to Express
const server = http.createServer(app);

// Create a new instance of Socket.IO and bind it to the server
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả các nguồn
    methods: ["GET", "POST"],
  },
});
const connections = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  const role = socket.handshake.query.role;

  if (userId && role) {
    connections[userId] = { socket, role };
    console.log(`User ${userId} with role ${role} connected.`);

    // Emit online event
    socket.broadcast.emit("online", { userId, role });

    socket.on("disconnect", () => {
      console.log(`User ${userId} with role ${role} disconnected.`);
      delete connections[userId];
      socket.broadcast.emit("offline", { userId });
    });
    socket.on("online", () => {
      console.log("🚀 ~  online");
    });

    socket.on("message", ({ userId, toRole, message, message2 }) => {
      console.log(
        `User ${userId} with role ${role} sent message to ${toRole}: ${message}`
      );
      if (userId) {
        if (connections[userId] && connections[userId].role === toRole) {
          connections[userId].socket.emit("message", {
            userId,
            message,
            message2,
            toRole,
          });
        } else {
          socket.emit("error", "Admin not found or invalid admin ID.");
        }
      } else {
        Object.values(connections).forEach(({ socket, role }) => {
          if (role === toRole) {
            socket.emit("message", { userId, message, message2, toRole });
          }
        });
      }
    });
    socket.on("updateBetValue", (data) => {
      console.log("🚀 ~ updateBetValue:", data);
      Object.values(connections).forEach(({ socket, role }) => {
        if (role === "CLIENT") {
          socket.emit("updateBetValue", data);
        }
      });
    });
    socket.on("userBetItem", (data) => {
      console.log("🚀 ~ userBetItem:", data);
      Object.values(connections).forEach(({ socket, role }) => {
        if (role === "ADMIN") {
          socket.emit("userBetItem", data);
        }
      });
    });

    // socket.on("typing", (adminId) => {
    //   if (
    //     adminId &&
    //     connections[adminId] &&
    //     connections[adminId].role === "ADMIN"
    //   ) {
    //     connections[adminId].socket.emit("typing", userId);
    //   }
    // });
  } else {
    socket.disconnect();
  }
});

app.post("/updateBetValue", (req, res) => {
  const data = req.body; // Lấy dữ liệu từ request body
  console.log("Received updateBetValue request:", data);

  // Emit sự kiện updateBetValue cho tất cả CLIENT
  Object.values(connections).forEach(({ socket, role }) => {
    if (role === "CLIENT") {
      socket.emit("updateBetValue", data);
    }
  });

  res.status(200).send("Bet value updated"); // Gửi phản hồi
});
app.get("/", (req, res) => {
  res.send("Websocket server is running");
});
app.get("/hello-world", (req, res) => {
  res.send("Hello world");
});
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
