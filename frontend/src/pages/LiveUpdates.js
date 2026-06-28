import React, { useState, useEffect, useRef } from 'react';
import socket from '../services/socketService';
import '../styles/LiveUpdates.css';

// LiveUpdates - real-time activity feed powered by Socket.IO.
//
// It listens for the three domain events broadcast by the backend
// (ticketCreated / ticketUpdated / ticketPurchased) and also supports a small
// live "announce" feature so two browser tabs can clearly talk to each other.
function LiveUpdates({ user }) {
  const [connected, setConnected] = useState(socket.connected);
  const [onlineCount, setOnlineCount] = useState(0);
  const [feed, setFeed] = useState([]);
  const [message, setMessage] = useState('');
  const feedIdRef = useRef(0);

  // Prepend a new entry to the feed (newest first), keeping the list bounded.
  const addEntry = (type, text) => {
    feedIdRef.current += 1;
    const entry = {
      id: feedIdRef.current,
      type,
      text,
      at: new Date().toLocaleTimeString(),
    };
    setFeed((prev) => [entry, ...prev].slice(0, 50));
  };

  useEffect(() => {
    // Connection lifecycle (built-in events).
    const onConnect = () => {
      setConnected(true);
      // On (re)connect, pull the current online count right away so the counter
      // is correct immediately instead of waiting for the next join/leave.
      socket.emit('getOnlineCount');
    };
    const onDisconnect = () => setConnected(false);

    const onWelcome = (data) => {
      if (data?.connectedClients) setOnlineCount(data.connectedClients);
      addEntry('system', 'Connected to live updates');
    };
    const onOnlineCount = (data) => setOnlineCount(data?.count || 0);

    // Three custom domain events.
    const onTicketCreated = (t) =>
      addEntry(
        'created',
        `New listing: ${t.eventName} (${t.eventType}) - ₪${t.salePrice}`
      );
    const onTicketUpdated = (t) =>
      addEntry(
        'updated',
        `Ticket #${t.ticketId} updated: ${t.eventName} - status "${t.status}"`
      );
    const onTicketPurchased = (t) =>
      addEntry(
        'purchased',
        `Ticket #${t.ticketId} "${t.eventName}" was purchased for ₪${t.salePrice}`
      );

    // Live announcement re-broadcast (client -> server -> all clients).
    const onAnnouncement = (a) =>
      addEntry('announcement', `${a.text}`);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('welcome', onWelcome);
    socket.on('onlineCount', onOnlineCount);
    socket.on('ticketCreated', onTicketCreated);
    socket.on('ticketUpdated', onTicketUpdated);
    socket.on('ticketPurchased', onTicketPurchased);
    socket.on('announcement', onAnnouncement);

    // Make sure we are connected when the page mounts. If the singleton socket is
    // already connected (autoConnect), "connect" won't fire again, so ask for the
    // current online count now; otherwise onConnect will request it on connect.
    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('getOnlineCount');
    }

    // Remove listeners on unmount so we don't stack duplicates on re-mount.
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('welcome', onWelcome);
      socket.off('onlineCount', onOnlineCount);
      socket.off('ticketCreated', onTicketCreated);
      socket.off('ticketUpdated', onTicketUpdated);
      socket.off('ticketPurchased', onTicketPurchased);
      socket.off('announcement', onAnnouncement);
    };
  }, []);

  const sendAnnouncement = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    const name = user?.displayName || user?.name || 'A user';
    socket.emit('announce', { text: `${name}: ${text}` });
    setMessage('');
  };

  return (
    <div className="live-updates">
      <div className="live-header">
        <h1>Live Updates</h1>
        <div className="live-status">
          <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
          {connected ? 'Connected' : 'Disconnected'} · {onlineCount} online
        </div>
      </div>

      <p className="live-hint">
        Open this page in two browser tabs. Actions on tickets (create / verify /
        purchase) and messages below appear instantly in every tab.
      </p>

      <form className="live-announce" onSubmit={sendAnnouncement}>
        <input
          type="text"
          placeholder="Send a live message to all tabs..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
        />
        <button type="submit">Send</button>
      </form>

      <ul className="live-feed">
        {feed.length === 0 && (
          <li className="feed-empty">Waiting for live activity...</li>
        )}
        {feed.map((entry) => (
          <li key={entry.id} className={`feed-item feed-${entry.type}`}>
            <span className="feed-time">{entry.at}</span>
            <span className="feed-badge">{entry.type}</span>
            <span className="feed-text">{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LiveUpdates;
