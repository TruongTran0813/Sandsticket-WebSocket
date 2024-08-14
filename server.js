const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer();
const io = socketIo(server, {
  cors: {
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

server.listen(8080, () => {
  console.log("Socket.io server is listening on ws://localhost:8080");
});
