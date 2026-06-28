/**
 * socket.js - Socket.IO real-time layer for TrustTicket.
 *
 * Responsibilities:
 *  - Attach a Socket.IO server to the existing HTTP server.
 *  - Hold the single `io` instance so controllers can broadcast events.
 *  - Expose small emit helpers for the three domain events used by the app.
 *
 * Custom events (in addition to the built-in "connect" / "disconnect"):
 *   Server -> clients:
 *     - "ticketCreated"   : a new ticket listing was created
 *     - "ticketUpdated"   : a ticket changed (edited / verified / status change)
 *     - "ticketPurchased" : a ticket was purchased (reserved by a buyer)
 *   Client -> server (re-broadcast, used to demo two-tab communication):
 *     - "announce"        : a client sends a short live message
 *     - "announcement"    : the server re-broadcasts it to every connected client
 */

const { Server } = require("socket.io");

// The single Socket.IO server instance, set once initSocket() runs.
let io = null;

/**
 * Initialize Socket.IO on top of an existing HTTP server.
 * @param {http.Server} httpServer - server returned by http.createServer(app)
 * @returns {Server} the Socket.IO server instance
 */
function initSocket(httpServer) {
    // Single-service deployment: the client is served from the same origin and
    // there are no cookies/credentials, so any origin may open the WebSocket.
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        // Let the freshly connected client know the handshake worked.
        socket.emit("welcome", {
            message: "Connected to TrustTicket live updates",
            socketId: socket.id,
            connectedClients: io.engine.clientsCount
        });

        // Tell everyone how many clients are currently online.
        io.emit("onlineCount", { count: io.engine.clientsCount });

        // Let a client ask for the current online count on demand. The socket is
        // a singleton with autoConnect, so a tab that is already connected when it
        // opens the Live page never re-fires "connect"; this lets it pull the count.
        socket.on("getOnlineCount", () => {
            socket.emit("onlineCount", { count: io.engine.clientsCount });
        });

        /**
         * Custom client -> server event. A client sends a short text message;
         * the server re-broadcasts it to ALL connected clients as "announcement".
         * This is what makes the two-browser-tab demo easy to show.
         */
        socket.on("announce", (payload) => {
            const text =
                payload && typeof payload.text === "string" ? payload.text.trim() : "";
            if (!text) return;

            io.emit("announcement", {
                text: text.slice(0, 280),
                from: socket.id,
                at: new Date().toISOString()
            });
        });

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
            io.emit("onlineCount", { count: io.engine.clientsCount });
        });
    });

    return io;
}

/**
 * Safe accessor for the io instance. Returns null if sockets are not ready,
 * so emit helpers can no-op instead of throwing during early startup.
 */
function getIO() {
    return io;
}

/** Broadcast that a new ticket was created. */
function emitTicketCreated(ticket) {
    if (io) io.emit("ticketCreated", ticket);
}

/** Broadcast that a ticket was updated (edit / verify / status change). */
function emitTicketUpdated(ticket) {
    if (io) io.emit("ticketUpdated", ticket);
}

/** Broadcast that a ticket was purchased. */
function emitTicketPurchased(payload) {
    if (io) io.emit("ticketPurchased", payload);
}

module.exports = {
    initSocket,
    getIO,
    emitTicketCreated,
    emitTicketUpdated,
    emitTicketPurchased
};
