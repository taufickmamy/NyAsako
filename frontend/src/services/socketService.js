const SOCKET_URL = new URL(
  import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  window.location.href
).origin;

let socketPromise = null;
const listeners = new Set();

const dispatch = (notification) => {
  listeners.forEach((listener) => listener(notification));
};

export function subscribeToNotifications(listener) {
  listeners.add(listener);

  if (!socketPromise) {
    socketPromise = import("socket.io-client").then(({ io }) => {
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        auth: { token: localStorage.getItem("accessToken") },
      });
      socket.on("notification_created", dispatch);
      return socket;
    }).catch((error) => {
      socketPromise = null;
      console.error("Connexion temps réel impossible :", error);
      return null;
    });
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && socketPromise) {
      const pending = socketPromise;
      socketPromise = null;
      pending.then((socket) => {
        if (!socket) return;
        socket.off("notification_created", dispatch);
        socket.disconnect();
      });
    }
  };
}
