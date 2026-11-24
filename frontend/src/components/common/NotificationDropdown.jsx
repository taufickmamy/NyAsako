
import { useState, useEffect } from "react";
import { getNotifications, markAsRead } from "../../services/notificationService";
import { subscribeToNotifications } from "../../services/socketService";
import { formatDate } from "../../utils/dates";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Récupération des notifications depuis le backend
  useEffect(() => {
    let active = true;
    async function fetchNotifications() {
      try {
        const data = await getNotifications();
        if (!active) return;
        setNotifications(data);

        // Calcul du nombre de notifications non lues
        const unread = data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Erreur lors de la récupération des notifications", err);
      }
    }

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications((prev) =>
        prev.some((item) => item.id === notification.id)
          ? prev
          : [notification, ...prev].slice(0, 50)
      );
      if (!notification.is_read) setUnreadCount((prev) => prev + 1);
    });

    return () => {
      active = false;
      window.clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Ouverture et fermeture du menu des notifications
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Marquer une notification comme lue lorsqu'on clique dessus
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);

      const notification = notifications.find((item) => item.id === id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erreur lors du marquage de la notification", err);
    }
  };

  return (
    <div className="relative">
      {/* Bouton de notification (icône de cloche) */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ""}`}
        aria-expanded={isOpen}
        className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        title="Notifications"
      >
        {/* Icône de cloche au format SVG */}
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Petit indicateur bleu en présence de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {/* Menu déroulant contenant la liste des notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 z-50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Notifications
            </h3>

            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {unreadCount} non lue(s)
            </span>
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Aucune notification pour le moment.
              </p>
            ) : (
              notifications.map((notif) => (
                <button
                  type="button"
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`block w-full text-left rounded-xl p-3 text-xs transition-colors ${
                    notif.is_read
                      ? "bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400"
                      : "bg-blue-50/60 font-medium text-slate-900 dark:bg-blue-500/10 dark:text-white"
                  }`}
                >
                  <p>{notif.message}</p>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {formatDate(notif.created_at)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
