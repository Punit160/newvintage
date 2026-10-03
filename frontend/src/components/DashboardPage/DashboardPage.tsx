import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { API_BASE } from "../../constant/Constant";

type RecentUser = {
  _id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
  subscription?: string;
};

type RecentChat = {
  _id?: string;
  userName?: string;
  lastMessage?: string;
  message?: string;
  status?: string;
  updatedAt?: string;
};

type Stats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  openChats: number;
  scheduledMeetings: number;
  symptomEntries: number;
};

const emptyStats: Stats = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  activeSubscriptions: 0,
  totalRevenue: 0,
  openChats: 0,
  scheduledMeetings: 0,
  symptomEntries: 0,
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

const when = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function DashboardPage({ onOpen }: { onOpen?: (view: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [chats, setChats] = useState<RecentChat[]>([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Sign in again to load the dashboard.");
        return;
      }
      const res = await axios.get(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || {};
      setStats({
        totalUsers: data.users?.total || 0,
        activeUsers: data.users?.active || 0,
        inactiveUsers: data.users?.inactive || 0,
        activeSubscriptions: data.subscriptions?.active || 0,
        totalRevenue: data.revenue?.total || 0,
        openChats: data.chats?.active || 0,
        scheduledMeetings: data.meetings?.scheduled || 0,
        symptomEntries: data.symptoms?.totalEntries || 0,
      });
      setUsers(data.recentUsers || []);
      setChats(data.recentChats || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "The dashboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeShare = stats.totalUsers
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const bars = [
    { label: "Patients", value: stats.totalUsers, color: "#122033" },
    { label: "Plans", value: stats.activeSubscriptions, color: "#1f6f5b" },
    { label: "Chats", value: stats.openChats, color: "#b45309" },
    { label: "Meetings", value: stats.scheduledMeetings, color: "#1d4ed8" },
    { label: "Symptoms", value: stats.symptomEntries, color: "#6d28d9" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-ink text-white px-6 py-6 md:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 overflow-hidden relative">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute right-16 bottom-0 h-24 w-24 rounded-full bg-pine/40" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">{today}</p>
          <h2 className="text-3xl font-semibold mt-2">Today at Vintage</h2>
          <p className="text-sm text-white/70 mt-2 max-w-xl">
            {stats.totalUsers} patients on file, {stats.activeSubscriptions} plans in force, and {stats.openChats} conversations still open.
          </p>
        </div>
        <button
          onClick={load}
          className="relative self-start md:self-auto px-4 py-2 text-sm rounded-md bg-white text-ink hover:bg-white/90"
        >
          Refresh
        </button>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Loading figures…</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Patient status">
          <div className="py-4 flex items-center gap-6">
            <Donut active={stats.activeUsers} inactive={stats.inactiveUsers} />
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-pine" /> Active {stats.activeUsers}</p>
              <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Inactive {stats.inactiveUsers}</p>
              <p className="text-slate-500">{activeShare}% of patients are active</p>
            </div>
          </div>
        </Panel>
        <Panel title="Care activity">
          <div className="py-4 space-y-3">
            {bars.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max((bar.value / Math.max(...bars.map((item) => item.value), 1)) * 100, bar.value ? 6 : 0)}%`,
                      backgroundColor: bar.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Card title="Patients" value={stats.totalUsers} hint={`${stats.activeUsers} active · ${stats.inactiveUsers} inactive`} onClick={() => onOpen?.("users")} />
        <Card title="Active plans" value={stats.activeSubscriptions} hint="Subscriptions in force" onClick={() => onOpen?.("plans")} />
        <Card title="Revenue" value={money(stats.totalRevenue)} hint="Sum of active plan prices" />
        <Card title="Open chats" value={stats.openChats} hint="Conversations still active" onClick={() => onOpen?.("chats")} />
        <Card title="Meetings" value={stats.scheduledMeetings} hint="Currently scheduled" onClick={() => onOpen?.("notifications")} />
        <Card title="Symptom entries" value={stats.symptomEntries} hint="Logged by patients" />
        <Card title="Active share" value={`${activeShare}%`} hint="Active patients out of all patients" />
        <Card title="Needs a reply" value={chats.filter((chat) => chat.status === "unread").length} hint="Latest chats waiting on staff" onClick={() => onOpen?.("chats")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Recent patients" action="Open directory" onAction={() => onOpen?.("users")}>
          {users.length === 0 && <p className="text-sm text-slate-500">No patients yet.</p>}
          <ul className="divide-y divide-line">
            {users.map((user) => (
              <li key={user._id || user.email} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.name || "Unnamed"}</p>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{when(user.createdAt)}</p>
                  <p className={`text-xs mt-1 ${user.subscription && user.subscription !== "No Active Plan" ? "text-pine" : "text-slate-400"}`}>
                    {user.subscription || "No plan"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent messages" action="Open messages" onAction={() => onOpen?.("chats")}>
          {chats.length === 0 && <p className="text-sm text-slate-500">No chats yet.</p>}
          <ul className="divide-y divide-line">
            {chats.map((chat, index) => (
              <li key={chat._id || `${chat.userName}-${index}`} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{chat.userName || "Unknown"}</p>
                  <p className="text-sm text-slate-500 truncate">{chat.lastMessage || chat.message || "No messages yet"}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${chat.status === "unread" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                  {chat.status || "read"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Donut({ active, inactive }: { active: number; inactive: number }) {
  const total = active + inactive;
  const share = total ? active / total : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * share;
  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e4e7ec" strokeWidth="14" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#1f6f5b"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference - filled}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" textAnchor="middle" fontSize="18" fontWeight="600" fill="#122033">
        {total ? `${Math.round(share * 100)}%` : "0%"}
      </text>
      <text x="60" y="74" textAnchor="middle" fontSize="9" fill="#64748b">
        active
      </text>
    </svg>
  );
}

function Card({
  title,
  value,
  hint,
  onClick,
}: {
  title: string;
  value: string | number;
  hint: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`bg-white border border-line rounded-lg px-4 py-4 text-left ${onClick ? "hover:border-ink/30" : ""}`}
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Tag>
  );
}

function Panel({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-line rounded-lg">
      <div className="px-5 py-3 border-b border-line flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action && onAction && (
          <button onClick={onAction} className="text-xs font-medium text-pine hover:underline">
            {action}
          </button>
        )}
      </div>
      <div className="px-5">{children}</div>
    </section>
  );
}
