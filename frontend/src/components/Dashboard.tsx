import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Bell, 
  LogOut, 
  Eye
  ,EyeOff,Menu,X,
  CreditCard,
  BadgeDollarSign,
  UserCog,
  Mail,
  Lock,
} from 'lucide-react';
import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast';


import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



import CategoryManager from './UserCard';
import AdminCreatePlan from './AdminCreatePlan';
import axios from 'axios';
import ChatsManager from './chatManager';
import DashboardPage from './DashboardPage/DashboardPage';
import NotificationsManager from './NotificationPage/NotificationsManager';
import Footer from './footer/Footer';
import Header from './header/Header';
import { API_BASE } from '../constant/Constant';
import { MdOutlineMusicVideo, MdVideoCall } from 'react-icons/md';
import { MdLightbulb } from "react-icons/md";
import WellnessManager from './WellnessManager';
import ExtraAmount from './ExtraAmount';
import BlockedDatesManager from './BlockedDatesManager';
import BannerPage from '../BannerPage';
import UsersManager from './UsersManager';
import SettingsManager from './SettingsManager';


const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', subscription: 'Premium', status: 'Active', joinDate: '2024-01-15', lastActive: '2024-09-20' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', subscription: 'Basic', status: 'Active', joinDate: '2024-02-10', lastActive: '2024-09-22' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', subscription: 'Premium', status: 'Expired', joinDate: '2024-03-05', lastActive: '2024-09-18' }
];

const MOCK_CHATS = [
  { id: '1', userId: '1', userName: 'John Doe', message: 'Need help with my diet plan', timestamp: '2024-09-25 10:30', status: 'unread' },
  { id: '2', userId: '2', userName: 'Jane Smith', message: 'Question about workout routine', timestamp: '2024-09-25 09:15', status: 'replied' },
  { id: '3', userId: '3', userName: 'Mike Johnson', message: 'Subscription renewal issue', timestamp: '2024-09-24 14:20', status: 'unread' }
];



function AdminPanel() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [wellnessCategories, setWellnessCategories] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [registerData, setRegisterData] = useState({ email: '', password: '',name:'' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([]);
    const [chats, setChats] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    unreadChats: 0
  });
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [role, setRole] = useState(localStorage.getItem('adminRole') || 'admin');

  const handleMenuClick = (itemId) => {
    setCurrentView(itemId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  }
  // const API_BASE= "http://localhost:5000";

  useEffect(() => {
  const storedLoginState = localStorage.getItem('isLoggedIn');
  if (storedLoginState === 'true') {
    setIsLoggedIn(true);
  }
}, []);

const TOAST_LIB = 'hot'; 

// Toast message helper
const showToast = (message, type = 'success') => {
  switch (TOAST_LIB) {
    case 'toastify':
      toastifyToast[type](message);
      break;
    case 'hot':
      hotToast[type](message);
      break;
    case 'sonner':
      sonnerToast[type](message);
      break;
    case 'bootstrap':
      showBootstrapToast(message, type);
      break;
    default:
      console.log(`[TOAST] ${type}: ${message}`);
  }
};

const handleRegister = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      role: 'admin',
    });

    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      alert('Registration successful! You can now login.');

      // ✅ Prefill login form with registration data
      setLoginData({
        email: registerData.email,
        password: registerData.password
      });

      // Switch to login form
      setIsRegistering(false);

      // Clear register form
      setRegisterData({ name: '', email: '', password: '' });
    } else {
      alert(response.data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
};

const handlkeLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: loginData.email,
      password: loginData.password
    });

    if (response.data.success) {
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');

      showToast('Login successful!', 'success');
    } else {
      showToast(response.data.message || 'Invalid credentials', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed. Please try again.', 'error');
  }
};
const handleLogin = async (e) => {
  e.preventDefault();
   setIsLoading(true);
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: loginData.email,
      password: loginData.password
    });

    if (response.data.success) {
      const { token, user } = response.data;

      // Check if the user is admin
      if (user?.role === 'admin' || user?.role === 'staff') {
        if (token) {
          localStorage.setItem('token', token);
        }
        if (user?.name) localStorage.setItem('adminName', user.name);
        if (user?.email) localStorage.setItem('adminEmail', user.email);
        localStorage.setItem('adminRole', user.role);
        setRole(user.role);
        setIsLoggedIn(true);
        setIsLoading(false);
        localStorage.setItem('isLoggedIn', 'true');
        showToast('Login successful!', 'success');
      } else {
        showToast('This portal is for the care team.', 'error');
        setIsLoading(false);
      }

    } else {
      showToast(response.data.message || 'Invalid credentials', 'error');
      setIsLoading(false);
    }
  } catch (error) {
    console.error('Login error:', error);
    setIsLoading(false);
    showToast('Login failed. Please try again.', 'error');
  }
};


const handleLdogin = async (e) => {
  e.preventDefault();



  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: loginData.email,
      password: loginData.password
    });

    if (response.data.success) {
      const token = response.data.token;
      if (token) {
        // ✅ Save token for future use
        localStorage.setItem('token', token);
      }

      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      alert('Login successful!');
    } else {
      alert(response.data.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
};


const handleLogout = () => {
        showToast('Logout successful!', 'success');
  setIsLoggedIn(false);
  setLoginData({ email: '', password: '' });
  setCurrentView('dashboard');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('token');
  localStorage.removeItem('adminName');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminRole');
  setRole('admin');
};

 


 useEffect(() => {
    const storedLoginState = localStorage.getItem('isLoggedIn');
    if (storedLoginState === 'true') {
      setIsLoggedIn(true);
      fetchDashboardData(); // load dashboard immediately
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const user = res.data?.user;
        if (user?.role !== 'admin' && user?.role !== 'staff') return;
        localStorage.setItem('adminRole', user.role);
        if (user.name) localStorage.setItem('adminName', user.name);
        if (user.email) localStorage.setItem('adminEmail', user.email);
        setRole(user.role);
        if (user.role !== 'admin') setCurrentView((view) => (view === 'settings' ? 'dashboard' : view));
      })
      .catch(() => {});
  }, [isLoggedIn]);

  // ✅ Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const data = res.data.data;

        setStats({
          totalUsers: data.users?.total || 0,
          activeSubscriptions: data.subscriptions?.active || 0,
          totalRevenue: data.revenue?.total || 0,
          unreadChats: data.chats?.active || 0,
        });

        setUsers(data.recentUsers || []);
        setChats(data.recentChats || []);
      } else {
        // showToast('Failed to load dashboard data', 'error');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // showToast('Error loading dashboard data', 'error');
    }
  };


// const stats = {
//   totalUsers: MOCK_USERS.length,
//   activeSubscriptions: MOCK_USERS.filter(u => u.status === 'Active').length,
//   totalRevenue: MOCK_USERS.filter(u => u.status === 'Active').length * 29.99,
//   unreadChats: MOCK_CHATS.filter(c => c.status === 'unread').length,
// };



  // Notification function
  const sendNotification = () => {
    if (notificationMessage.trim()) {
      const recipients = selectedUsers.length > 0 ? selectedUsers.length : users.length;
      alert(`Notification sent to ${recipients} users: "${notificationMessage}"`);
      setNotificationMessage('');
      setSelectedUsers([]);
    }
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#efeae2] flex items-center justify-center p-4 sm:p-8">
        <HotToaster position="top-center" />
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(18,32,51,0.14)] grid lg:grid-cols-2">
          <section className="flex flex-col items-center justify-center bg-[#f2ede7] px-8 py-8 lg:px-12 lg:py-16">
            <img src="/assets/logo.jpg" alt="Vintage" className="w-44 object-contain lg:w-full lg:max-w-sm" />
            <p className="mt-1 hidden text-xs uppercase tracking-[0.28em] text-ink/45 lg:block">Care operations</p>
          </section>
          <section className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-16">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink/70">Admin portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Welcome back</h1>
            <p className="mt-2 mb-8 text-sm text-slate-500">Sign in with your care team account.</p>
            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    autoComplete="username"
                    required
                    placeholder="you@vintage.com"
                    className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                  />
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white shadow-sm hover:bg-ink/90 disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p className="mt-8 text-center text-xs uppercase tracking-[0.18em] text-slate-400">Staff access only</p>
          </section>
        </div>
      </div>
    );
  }

  const menuGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'users', label: 'Patients', icon: Users },
        { id: 'plans', label: 'Plans', icon: CreditCard },
        { id: 'extra', label: 'Extra fees', icon: BadgeDollarSign },
      ],
    },
    {
      label: 'Care',
      items: [
        { id: 'chats', label: 'Messages', icon: MessageSquare },
        { id: 'notifications', label: 'Meetings', icon: MdVideoCall },
        { id: 'blockedDates', label: 'Availability', icon: Bell },
      ],
    },
    {
      label: 'Content',
      items: [
        { id: 'categories', label: 'Categories', icon: Settings },
        { id: 'wellness', label: 'Daily thought', icon: MdLightbulb },
        { id: 'banner', label: 'Banners', icon: MdOutlineMusicVideo },
      ],
    },
    ...(role === 'admin'
      ? [{
          label: 'Account',
          items: [{ id: 'settings', label: 'Settings', icon: UserCog }],
        }]
      : []),
  ];
  const currentPage = menuGroups.flatMap((group) => group.items).find((item) => item.id === currentView);
  const adminName = localStorage.getItem('adminName') || 'Administrator';
  const adminEmail = localStorage.getItem('adminEmail') || '';

  const sidebar = (
    <div className="flex flex-col h-full bg-ink text-white">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <img src="/assets/logo.jpg" alt="Vintage" className="h-8 w-8 rounded-md object-cover" />
        <div>
          <p className="text-sm font-semibold leading-none">Vintage</p>
          <p className="text-[11px] text-white/50 mt-1">Admin</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.16em] text-white/40">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left ${
                    currentView === item.id ? 'bg-white text-ink' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <p className="px-2 text-sm font-medium truncate">{adminName}</p>
        {adminEmail && <p className="px-2 text-xs text-white/50 truncate mb-2">{adminEmail}</p>}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

 return (
    <div className="min-h-screen bg-canvas text-ink">
      <HotToaster position="top-right" />
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-line">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md hover:bg-slate-100" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">{currentPage?.label || 'Vintage'}</span>
        <span className="w-9" />
      </div>
      {isSidebarOpen && (
        <button className="lg:hidden fixed inset-0 bg-ink/50 z-40" aria-label="Close menu" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </aside>
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-line">
          <div>
            <h1 className="text-lg font-semibold">{currentPage?.label || 'Dashboard'}</h1>
            <p className="text-xs text-slate-500">Vintage care operations</p>
          </div>
          <p className="text-sm text-slate-500">{adminName}</p>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
        
           {currentView === 'dashboard' && (
            <DashboardPage onOpen={setCurrentView} />
          )}
          {currentView === 'users' && <UsersManager />}
          {currentView === 'plans' && <AdminCreatePlan />}
       
          {currentView === 'categories' && <CategoryManager />}
          {currentView === 'chats' && <ChatsManager/>}
      
          {currentView === 'notifications' && (
            <NotificationsManager
            />
          )}
           {currentView === 'wellness' && (
           <WellnessManager/>
          )}
           {currentView === 'extra' && (
           <ExtraAmount/>
          )}
          {currentView === 'blockedDates' && <BlockedDatesManager/>} 
          {currentView === 'banner' && <BannerPage/>}
          {currentView === 'settings' && role === 'admin' && (
            <SettingsManager
              onProfileSaved={(profile) => {
                if (profile.name) localStorage.setItem('adminName', profile.name);
                if (profile.email) localStorage.setItem('adminEmail', profile.email);
                setRole('admin');
              }}
            />
          )} 
        </main>
        <footer className="px-8 py-4 text-xs text-slate-400">Vintage</footer>
      </div>
    </div>
  );

}

export default AdminPanel;

