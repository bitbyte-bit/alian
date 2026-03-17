import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  PiggyBank, 
  Settings, 
  MapPin, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  Plus, 
  ArrowUpRight,
  Menu,
  X,
  ShieldCheck,
  Building2,
  Camera,
  FileText,
  Share2,
  Calendar,
  HandHelping,
  Info,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Trash2,
  Edit,
  Edit2,
  Check,
  Send,
  ArrowRight,
  ExternalLink,
  Search,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users as UsersIcon,
  QrCode,
  CreditCard,
  MessageSquare,
  Home,
  Compass,
  User as ProfileIcon,
  Image as ImageIcon,
  Smile,
  Reply,
  MoreHorizontal,
  Bell,
  CalendarDays,
  Clock,
  Users,
  AlertTriangle,
  ShieldAlert,
  Ban
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Cell, Pie, Legend 
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { User, Account, Donation, Branch, Transaction, Activity, Resource, DonationApplication } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  confirmText?: string;
  cancelText?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">{title}</h3>
        <p className="text-stone-600 mb-8">{message}</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="btn-secondary flex-1">{cancelText}</button>
          <button onClick={onConfirm} className="btn-primary flex-1">{confirmText}</button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications/${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(setNotifications)
        .catch(() => setNotifications([]));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
      });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-serif text-xl font-semibold tracking-tight hidden sm:block">ASMIN Uganda</span>
            {user?.role === 'master_admin' && (
              <span className="font-serif text-[9px] font-bold text-emerald-800 sm:hidden ml-1 leading-tight uppercase tracking-tighter border-l border-emerald-100 pl-2">Master Admin Dashboard</span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/donations" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Donations</Link>
            <Link to="/branches" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Branches</Link>
            <Link to="/events" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Events</Link>
            {user && <Link to="/chat" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Community Chat</Link>}
            {user ? (
              <>
                {user.role === 'user' && <Link to="/dashboard" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Savings</Link>}
                {user.role === 'regional_officer' && <Link to="/admin/regional" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Branch Admin</Link>}
                {user.role === 'master_admin' && <Link to="/admin/master" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Master Admin</Link>}
                
                <div className="flex items-center gap-4 pl-4 border-l border-stone-200">
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="text-stone-400 hover:text-stone-900 transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                            <h3 className="font-bold">Notifications</h3>
                            <span className="text-xs text-stone-400">{unreadCount} unread</span>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-stone-400 text-sm">No notifications yet</div>
                            ) : (
                              notifications.map(n => (
                                <div 
                                  key={n.id} 
                                  onClick={() => markAsRead(n.id)}
                                  className={cn(
                                    "p-4 border-b border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors",
                                    !n.read && "bg-emerald-50/30"
                                  )}
                                >
                                  <p className="text-sm font-bold mb-1">{n.title}</p>
                                  <p className="text-xs text-stone-600 leading-relaxed">{n.message}</p>
                                  <p className="text-[10px] text-stone-400 mt-2">
                                    {new Date(n.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to="/profile" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center overflow-hidden border border-stone-200">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-stone-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-stone-700">{user.name}</span>
                  </Link>
                  <button onClick={onLogout} className="text-stone-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary">Get Started</Link>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-stone-100 px-4 py-6 flex flex-col gap-4"
          >
            {user?.role === 'regional_officer' && (
              <Link to="/admin/regional" onClick={() => setIsOpen(false)} className="text-lg font-medium text-emerald-600">Branch Admin</Link>
            )}
            {user?.role === 'master_admin' && (
              <Link to="/admin/master" onClick={() => setIsOpen(false)} className="text-lg font-medium text-emerald-600">Master Admin</Link>
            )}
            <Link to="/donations" onClick={() => setIsOpen(false)} className="text-lg font-medium">Donations</Link>
            <Link to="/branches" onClick={() => setIsOpen(false)} className="text-lg font-medium">Branches</Link>
            <Link to="/events" onClick={() => setIsOpen(false)} className="text-lg font-medium">Events</Link>
            {user && <Link to="/chat" onClick={() => setIsOpen(false)} className="text-lg font-medium">Community Chat</Link>}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium">Savings</Link>
                <button onClick={() => { onLogout(); setIsOpen(false); }} className="text-lg font-medium text-red-500 text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary text-center">Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const UserTicket = ({ user, onClose, inline = false }: { user: User; onClose?: () => void; inline?: boolean }) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!ticketRef.current) return;
    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ASMIN_ID_${user.id}.pdf`);
  };

  const content = (
    <div className={cn("max-w-2xl w-full mx-auto", !inline && "fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md")}>
      <motion.div 
        initial={!inline ? { opacity: 0, scale: 0.9 } : undefined}
        animate={!inline ? { opacity: 1, scale: 1 } : undefined}
        className="w-full"
      >
        <div ref={ticketRef} className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-600 flex flex-row">
          <div className="bg-emerald-700 w-24 p-4 text-white flex flex-col justify-between items-center shrink-0">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-emerald-700 font-bold text-xl">A</div>
            <div className="[writing-mode:vertical-lr] rotate-180 font-serif font-bold tracking-widest text-sm opacity-80">ASMIN UGANDA</div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 leading-tight">Official <br/>Membership ID</h3>
                <p className="text-emerald-600 font-bold tracking-widest text-sm mt-1">ID: {user.card_id || `#${String(user.id).padStart(6, '0')}`}</p>
              </div>
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                <QRCodeSVG value={`ASMIN-USER-${user.id}-${user.card_id || user.email}`} size={60} />
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-4">
              <div className="w-24 h-24 bg-stone-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                {(user.card_photo || user.photo) ? (
                  <img src={user.card_photo || user.photo} alt={user.card_full_name || user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-50">
                    <UserIcon className="w-10 h-10 text-stone-300" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="text-xl font-serif font-bold text-stone-900">{user.card_full_name || user.name}</h4>
                <p className="text-stone-500 text-sm mb-2">{user.card_phone || user.phone || user.email}</p>
                <div className="grid grid-cols-3 gap-4 border-t pt-3">
                  <div>
                    <p className="text-[9px] text-stone-400 uppercase font-bold">Role</p>
                    <p className="text-xs font-bold text-stone-700 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-stone-400 uppercase font-bold">Issued</p>
                    <p className="text-xs font-bold text-stone-700">{user.card_issued_at ? new Date(user.card_issued_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-stone-400 uppercase font-bold">Expires</p>
                    <p className="text-xs font-bold text-red-600">{user.card_expires_at ? new Date(user.card_expires_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-[9px] text-stone-400 italic">Arise and Shine Ministries International • Uganda Official Document</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button onClick={downloadPDF} className="btn-primary flex-1 py-4 flex items-center justify-center gap-2">
            <Download className="w-5 h-5" /> Download ID Card
          </button>
          {!inline && onClose && (
            <button onClick={onClose} className="bg-white/10 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors">
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return content;
};

const LandingPage = () => (
  <div className="pt-24 pb-16">
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-6">
          Serving Communities Since 2008
        </span>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 mb-6 leading-tight">
          Arise and Shine <br />
          <span className="text-emerald-700 italic">Ministries International</span>
        </h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Empowering vulnerable communities across Uganda through faith, 
          compassion, and sustainable financial growth.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/donations" className="btn-primary text-lg px-8 py-4">Donate Now</Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-4">Join Savings Program</Link>
        </div>
      </motion.div>
    </section>

    <section className="bg-stone-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold">Community Support</h3>
            <p className="text-stone-600">We distribute donations to the most vulnerable families in Northern, Western, Eastern, and Southern Uganda.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold">Secure Savings</h3>
            <p className="text-stone-600">Our personal savings accounts help individuals build a financial safety net with transparent management.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold">National Presence</h3>
            <p className="text-stone-600">With branches across the country, we are always close to the people we serve.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const DonationsPage = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [formData, setFormData] = useState({ donorName: '', amount: '', message: '' });
  const [loading, setLoading] = useState(false);

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
    });
    setFormData({ donorName: '', amount: '', message: '' });
    fetchDonations();
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl font-serif font-bold mb-6">Support Our Mission</h2>
          <p className="text-stone-600 mb-10">Your contributions directly impact the lives of vulnerable community members. Every shilling counts.</p>
          
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Your Name</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.donorName}
                onChange={e => setFormData({...formData, donorName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Amount (UGX)</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Message (Optional)</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
              {loading ? 'Processing...' : 'Send Donation'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Recent Well-wishers</h3>
          <div className="space-y-4">
            {donations.map(donation => (
              <motion.div 
                key={donation.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-stone-900">{donation.donor_name}</h4>
                  <span className="text-emerald-700 font-bold">UGX {donation.amount.toLocaleString()}</span>
                </div>
                {donation.message && <p className="text-stone-500 text-sm italic">"{donation.message}"</p>}
                <p className="text-stone-400 text-xs mt-4">{new Date(donation.date).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BranchesPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.ok ? res.json() : [])
      .then(setBranches)
      .catch(() => setBranches([]));
  }, []);

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif font-bold mb-4">Our Regional Presence</h2>
        <p className="text-stone-600 max-w-2xl mx-auto">Select a region to view local activities, resources, and connect with our regional officers.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {branches.map(branch => (
          <motion.div 
            key={branch.id}
            whileHover={{ y: -5 }}
            className={cn(
              "glass-card p-8 relative overflow-hidden group",
              branch.is_head_office && "ring-2 ring-emerald-500 bg-emerald-50/30"
            )}
          >
            {branch.is_head_office && (
              <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold">
                Head Office
              </div>
            )}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-stone-100 rounded-xl">
                <MapPin className="w-6 h-6 text-stone-600" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold">{branch.region} Uganda</h3>
                <p className="text-stone-500">{branch.location}</p>
              </div>
            </div>
            
            <div className="border-t border-stone-100 pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-stone-200 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                  {branch.officer_photo ? (
                    <img src={branch.officer_photo} alt={branch.officer_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-stone-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">{branch.officer_name}</p>
                  <p className="text-xs text-stone-500">Regional Officer</p>
                </div>
              </div>
              <Link 
                to={`/branch/${branch.id}`} 
                className="btn-secondary w-full flex items-center justify-center gap-2 group-hover:bg-emerald-700 group-hover:text-white"
              >
                View Regional Page <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const BranchDetailPage = ({ user }: { user: User | null }) => {
  const { id } = useParams();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ officerName: '', officerBio: '', officerPhoto: '' });
  const [donationForm, setDonationForm] = useState({ donorName: '', amount: '', message: '' });
  const [requestForm, setRequestForm] = useState({ requesterName: '', contact: '', needDescription: '' });
  const [activeTab, setActiveTab] = useState<'activities' | 'resources' | 'forms'>('activities');

  const fetchBranch = async () => {
    const res = await fetch(`/api/branches/${id}`);
    const data = await res.json();
    setBranch(data);
    setEditForm({ 
      officerName: data.officer_name || '', 
      officerBio: data.officer_bio || '', 
      officerPhoto: data.officer_photo || '' 
    });
  };

  useEffect(() => { fetchBranch(); }, [id]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/branches/${id}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setIsEditing(false);
    fetchBranch();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditForm({ ...editForm, officerPhoto: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/branches/${id}/donate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...donationForm, amount: parseFloat(donationForm.amount) })
    });
    setDonationForm({ donorName: '', amount: '', message: '' });
    alert('Thank you for your regional donation!');
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/branches/${id}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestForm)
    });
    setRequestForm({ requesterName: '', contact: '', needDescription: '' });
    alert('Your request has been submitted to the regional office.');
  };

  if (!branch) return <div className="pt-24 text-center">Loading branch details...</div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-12 mb-16 items-start">
        <div className="w-full md:w-1/3">
          <div className="glass-card p-8 text-center relative">
            <div className="w-32 h-32 bg-stone-200 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow-lg relative group">
              {editForm.officerPhoto ? (
                <img src={editForm.officerPhoto} alt={branch.officer_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-16 h-16 text-stone-400 mt-6 mx-auto" />
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-8 h-8" />
                  <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                </label>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <input 
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  value={editForm.officerName}
                  onChange={e => setEditForm({...editForm, officerName: e.target.value})}
                  placeholder="Officer Name"
                />
                <textarea 
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm h-24"
                  value={editForm.officerBio}
                  onChange={e => setEditForm({...editForm, officerBio: e.target.value})}
                  placeholder="Officer Bio"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1 py-2 text-sm">Save</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-2xl font-serif font-bold mb-1">{branch.officer_name}</h3>
                <p className="text-emerald-700 text-sm font-medium mb-4">Regional Officer - {branch.region}</p>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">{branch.officer_bio}</p>
                {user?.role === 'regional_officer' && user.branch_id === branch.id && (
                  <button onClick={() => setIsEditing(true)} className="text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1 mx-auto">
                    <Settings className="w-3 h-3" /> Edit Profile (Officer Only)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">{branch.region} Uganda Branch</h1>
            <div className="flex items-center gap-2 text-stone-500">
              <MapPin className="w-4 h-4" /> {branch.location}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 mb-8">
            <button 
              onClick={() => setActiveTab('activities')}
              className={cn(
                "px-6 py-3 font-medium text-sm transition-all border-b-2",
                activeTab === 'activities' ? "border-emerald-600 text-emerald-700" : "border-transparent text-stone-500 hover:text-stone-700"
              )}
            >
              Regional Activities
            </button>
            <button 
              onClick={() => setActiveTab('resources')}
              className={cn(
                "px-6 py-3 font-medium text-sm transition-all border-b-2",
                activeTab === 'resources' ? "border-emerald-600 text-emerald-700" : "border-transparent text-stone-500 hover:text-stone-700"
              )}
            >
              Shared Resources
            </button>
            <button 
              onClick={() => setActiveTab('forms')}
              className={cn(
                "px-6 py-3 font-medium text-sm transition-all border-b-2",
                activeTab === 'forms' ? "border-emerald-600 text-emerald-700" : "border-transparent text-stone-500 hover:text-stone-700"
              )}
            >
              Support & Help
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'activities' && (
              <motion.div 
                key="activities"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {branch.activities?.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                    <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500">No recent activities recorded for this region.</p>
                  </div>
                ) : (
                  branch.activities?.map(activity => (
                    <div key={activity.id} className="glass-card p-6 flex gap-6 items-start">
                      <div className="bg-emerald-50 p-3 rounded-xl text-emerald-700">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 mb-1">{activity.title}</h4>
                        <p className="text-stone-600 text-sm mb-3">{activity.description}</p>
                        <span className="text-xs text-stone-400">{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div 
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {branch.resources?.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                    <Share2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500">No shared resources available yet.</p>
                  </div>
                ) : (
                  branch.resources?.map(resource => (
                    <div key={resource.id} className="glass-card p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-stone-900">{resource.name}</h4>
                        </div>
                        <p className="text-stone-600 text-sm mb-4">{resource.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded">
                          {resource.type}
                        </span>
                        {resource.url && (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> View Resource
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'forms' && (
              <motion.div 
                key="forms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Regional Donation */}
                <div className="glass-card p-6">
                  <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600" /> Donate to {branch.region}
                  </h4>
                  <form onSubmit={handleDonation} className="space-y-4">
                    <input 
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                      placeholder="Your Name"
                      required
                      value={donationForm.donorName}
                      onChange={e => setDonationForm({...donationForm, donorName: e.target.value})}
                    />
                    <input 
                      type="number"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                      placeholder="Amount (UGX)"
                      required
                      value={donationForm.amount}
                      onChange={e => setDonationForm({...donationForm, amount: e.target.value})}
                    />
                    <textarea 
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm h-20"
                      placeholder="Message"
                      value={donationForm.message}
                      onChange={e => setDonationForm({...donationForm, message: e.target.value})}
                    />
                    <button type="submit" className="btn-primary w-full py-2 text-sm">Submit Donation</button>
                  </form>
                </div>

                {/* Help Request */}
                <div className="glass-card p-6 bg-stone-900 text-white">
                  <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                    <HandHelping className="w-5 h-5 text-emerald-400" /> Request Assistance
                  </h4>
                  <div className="space-y-6">
                    <p className="text-stone-400 text-sm leading-relaxed">
                      If you or someone you know is in need of support, please complete our standard donation application. 
                      Your application will be reviewed by the regional office.
                    </p>
                    <Link to={`/branch/${id}/apply`} className="bg-white text-stone-900 w-full py-4 rounded-full font-bold text-center block hover:bg-stone-100 transition-colors">
                      Open Application Form
                    </Link>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-8 italic">
                    * All applications require a chairperson's recommendation letter.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [manualPayAmount, setManualPayAmount] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    const [accRes, transRes] = await Promise.all([
      fetch(`/api/account/${user.id}`),
      fetch(`/api/transactions/${user.id}`)
    ]);
    setAccount(await accRes.json());
    setTransactions(await transRes.json());
  };

  useEffect(() => { fetchData(); }, [user.id]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/account/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: parseFloat(depositAmount) })
    });
    setDepositAmount('');
    fetchData();
    setLoading(false);
  };

  const handleToggleAutoPay = async (autoPay: boolean) => {
    await fetch('/api/account/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, autoPay })
    });
    fetchData();
  };

  const handleManualPay = async () => {
    setShowConfirm(false);
    setLoading(true);
    const res = await fetch('/api/account/pay-asmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: parseFloat(manualPayAmount) })
    });
    if (!res.ok) alert('Insufficient balance');
    fetchData();
    setLoading(false);
  };

  const downloadSummary = async () => {
    if (!summaryRef.current) return;
    const canvas = await html2canvas(summaryRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.text("ASMIN Savings Summary", 10, 10);
    pdf.addImage(imgData, 'PNG', 10, 20, 190, 0);
    pdf.save(`Savings_Summary_${user.name}.pdf`);
  };

  if (!account) return <div className="pt-24 text-center">Loading account...</div>;

  const chartData = transactions.slice(0, 10).reverse().map(t => ({
    date: new Date(t.date).toLocaleDateString(),
    amount: t.amount,
    type: t.type
  }));

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold">My Savings Dashboard</h2>
        <button onClick={downloadSummary} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Download Summary
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-2 space-y-8">
          <div ref={summaryRef} className="space-y-8">
            <div className="bg-emerald-900 text-white p-10 rounded-3xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-emerald-300 text-sm font-medium uppercase tracking-wider mb-2">Total Savings</p>
                <h2 className="text-5xl font-serif font-bold mb-8">UGX {account.balance.toLocaleString()}</h2>
                <div className="flex gap-4">
                  <form onSubmit={handleDeposit} className="flex-1 flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Amount"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                      Deposit
                    </button>
                  </form>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Savings Growth
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif font-bold">Recent Transactions</h3>
              <CreditCard className="w-5 h-5 text-stone-400" />
            </div>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-center text-stone-500 py-8">No transactions yet.</p>
              ) : (
                transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        t.type === 'deposit' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {t.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 capitalize">{t.type.replace('_', ' ')}</p>
                        <p className="text-xs text-stone-500">{new Date(t.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className={cn(
                      "font-bold",
                      t.type === 'deposit' ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {t.type === 'deposit' ? '+' : '-'} UGX {t.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif font-bold">Account Settings</h3>
              <Settings className="w-5 h-5 text-stone-400" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                <div>
                  <p className="font-bold text-stone-900">Automatic ASMIN Collection</p>
                  <p className="text-sm text-stone-500">Automatically pay UGX 2,000 monthly</p>
                </div>
                <button 
                  onClick={() => handleToggleAutoPay(!account.auto_pay_asmin)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative",
                    account.auto_pay_asmin ? "bg-emerald-600" : "bg-stone-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
                    account.auto_pay_asmin ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              {!account.auto_pay_asmin && (
                <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-emerald-900">Manual Collection Payment</p>
                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex gap-4">
                    <input 
                      type="number" 
                      className="flex-1 px-4 py-2 rounded-xl border border-emerald-200 outline-none"
                      value={manualPayAmount}
                      onChange={e => setManualPayAmount(e.target.value)}
                    />
                    <button onClick={() => setShowConfirm(true)} className="btn-primary">Pay Now</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="glass-card p-8">
            <h4 className="font-serif font-bold text-xl mb-4">Why we collect?</h4>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              The ASMIN monthly collection of UGX 2,000 supports our administrative costs and emergency relief funds for vulnerables in all regions.
            </p>
            <Link to="/donations" className="text-emerald-700 font-bold text-sm flex items-center gap-1 group">
              View impact reports <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="glass-card p-8 bg-stone-900 text-white">
            <h4 className="font-serif font-bold text-xl mb-4">Need Help?</h4>
            <p className="text-stone-400 text-sm mb-6">Contact your regional officer for assistance with your savings account.</p>
            <Link to="/branches" className="block text-center py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors">
              Find My Branch
            </Link>
          </div>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleManualPay}
        title="Confirm ASMIN Payment"
        message={`Are you sure you want to pay UGX ${parseFloat(manualPayAmount).toLocaleString()} to ASMIN collection? This transaction cannot be undone.`}
      />
    </div>
  );
};

const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const ProfilePage = ({ user, onUpdate }: { user: User; onUpdate: (user: User) => void }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
    photo: user.photo || '',
    currentPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardFormData, setCardFormData] = useState({
    fullName: user.card_full_name || user.name,
    phone: user.card_phone || user.phone || '',
    photo: user.card_photo || user.photo || '',
    location: user.location || ''
  });

  const handleCardPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setCardFormData({ ...cardFormData, photo: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormData.photo) {
      alert('Please upload a passport size photo');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/card/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...cardFormData })
    });
    const data = await res.json();
    if (data.success) {
      const updatedUser: User = { 
        ...user, 
        card_status: 'pending' as const, 
        card_full_name: cardFormData.fullName,
        card_phone: cardFormData.phone,
        card_photo: cardFormData.photo,
        location: cardFormData.location,
        card_rejection_reason: undefined
      };
      onUpdate(updatedUser);
      setShowCardForm(false);
      alert('Membership card request submitted successfully');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...formData })
    });
    const data = await res.json();
    if (data.success) {
      onUpdate(data.user);
      alert('Profile updated successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '' });
    } else {
      setError(data.error);
    }
    setLoading(false);
  };

  const isRegionalOfficer = user.role === 'regional_officer';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setFormData({ ...formData, photo: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
      <h2 className="text-3xl font-serif font-bold mb-8">Profile Settings</h2>
      {isRegionalOfficer && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-8 flex gap-3 items-center text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>As a Regional Officer, you cannot change your core credentials (name, email, password) without permission from the Master Admin.</p>
        </div>
      )}
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 bg-stone-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg relative group">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-stone-300" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            <p className="text-xs text-stone-500">Click to upload profile picture</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
              <input 
                className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none disabled:bg-stone-50 disabled:text-stone-400"
                value={formData.name}
                disabled={isRegionalOfficer}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
              <input 
                className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none disabled:bg-stone-50 disabled:text-stone-400"
                value={formData.email}
                disabled={isRegionalOfficer}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
            <input 
              className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Bio</label>
            <textarea 
              className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none h-32"
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
            />
          </div>
          
          <div className="pt-6 border-t border-stone-100">
            <h3 className="font-bold mb-4">Change Password</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Current Password</label>
                <input 
                  type="password"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none"
                  value={formData.currentPassword}
                  onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">New Password (Optional)</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none disabled:bg-stone-50 disabled:text-stone-400"
                  value={formData.newPassword}
                  disabled={isRegionalOfficer}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-serif font-bold mb-6 text-center">Your Membership ID</h3>
        {user.card_status === 'approved' ? (
          <UserTicket user={user} inline={true} />
        ) : user.card_status === 'pending' ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-serif font-bold mb-2">Card Request Pending</h4>
            <p className="text-stone-600">Your membership card request is being reviewed by the administration. You will be notified once it is approved.</p>
          </div>
        ) : showCardForm || user.card_status === 'rejected' ? (
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-serif font-bold">Membership Card Request</h4>
              <button onClick={() => setShowCardForm(false)} className="text-stone-400 hover:text-stone-600"><X /></button>
            </div>

            {user.card_status === 'rejected' && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 flex gap-3 items-start text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Request Rejected</p>
                  <p className="opacity-80">Reason: {user.card_rejection_reason}</p>
                  <p className="mt-1 font-medium">Please correct the details below and resubmit.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCardRequest} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <p className="text-sm font-medium text-stone-700 mb-4">Passport Size Photo (Required)</p>
                <div className="w-32 h-40 bg-stone-100 rounded-xl overflow-hidden border-2 border-dashed border-stone-300 relative group">
                  {cardFormData.photo ? (
                    <img src={cardFormData.photo} alt="Passport" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Upload Photo</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Plus className="w-8 h-8 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleCardPhotoUpload} />
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Card Full Name</label>
                  <input 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none"
                    placeholder="Enter name as it should appear on card"
                    value={cardFormData.fullName}
                    onChange={e => setCardFormData({...cardFormData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Active Phone Number</label>
                  <input 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none"
                    placeholder="e.g. +256 700 000000"
                    value={cardFormData.phone}
                    onChange={e => setCardFormData({...cardFormData, phone: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Location (District/Village)</label>
                  <input 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none"
                    placeholder="e.g. Kampala, Nakasero"
                    value={cardFormData.location}
                    onChange={e => setCardFormData({...cardFormData, location: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                {loading ? 'Submitting...' : 'Submit Card Request'}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
              <CreditCard className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-serif font-bold mb-2">No Membership Card</h4>
            <p className="text-stone-600 mb-8">You haven't requested an official membership card yet. Request one to access exclusive community benefits.</p>
            <button 
              onClick={() => setShowCardForm(true)}
              disabled={loading}
              className="btn-primary"
            >
              Request Membership Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DonationApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vulnerableName: '',
    images: [] as string[],
    activePhone: '',
    altPhone: '',
    guardianName: '',
    country: 'Uganda',
    district: '',
    county: '',
    subCounty: '',
    parish: '',
    village: '',
    chairpersonName: '',
    chairpersonPhone: '',
    recommendationLetter: ''
  });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'letter') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'images') {
          setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
        } else {
          setFormData(prev => ({ ...prev, recommendationLetter: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length < 3) {
      alert('Please upload at least 3 images.');
      return;
    }
    setLoading(true);
    await fetch(`/api/branches/${id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    alert('Application submitted successfully!');
    navigate(`/branch/${id}`);
  };

  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-serif font-bold mb-8">Donation Application</h2>
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Vulnerable Name</label>
                <input required className="w-full px-4 py-2 rounded-xl border" value={formData.vulnerableName} onChange={e => setFormData({...formData, vulnerableName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Guardian's Name (if any)</label>
                <input className="w-full px-4 py-2 rounded-xl border" value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Active Phone Number</label>
                <input required className="w-full px-4 py-2 rounded-xl border" value={formData.activePhone} onChange={e => setFormData({...formData, activePhone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Alternative Phone Number</label>
                <input className="w-full px-4 py-2 rounded-xl border" value={formData.altPhone} onChange={e => setFormData({...formData, altPhone: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Address Details</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div><label className="block text-sm font-medium mb-2">Country</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">District</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">County</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.county} onChange={e => setFormData({...formData, county: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Sub-County</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.subCounty} onChange={e => setFormData({...formData, subCounty: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Parish</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.parish} onChange={e => setFormData({...formData, parish: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Village</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} /></div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Chairperson Verification</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium mb-2">Chairperson's Name</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.chairpersonName} onChange={e => setFormData({...formData, chairpersonName: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Chairperson's Phone</label><input required className="w-full px-4 py-2 rounded-xl border" value={formData.chairpersonPhone} onChange={e => setFormData({...formData, chairpersonPhone: e.target.value})} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recommendation Letter (Handwritten, Signed & Stamped)</label>
              <input type="file" required className="w-full" onChange={e => handleFileUpload(e, 'letter')} />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Images (Min 3)</h3>
            <input type="file" multiple required className="w-full" onChange={e => handleFileUpload(e, 'images')} />
            <div className="flex gap-2 flex-wrap">
              {formData.images.map((img, i) => <img key={i} src={img} className="w-20 h-20 object-cover rounded-lg" />)}
            </div>
          </section>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

const RegionalAdminDashboard = ({ user }: { user: User }) => {
  const [apps, setApps] = useState<DonationApplication[]>([]);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [activeView, setActiveView] = useState<'applications' | 'communication' | 'resources' | 'activities' | 'savings'>('applications');
  const [analytics, setAnalytics] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState({ to: '', content: '' });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState({ name: '', type: 'document' as any, description: '', url: '' });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState({ title: '', description: '' });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedApp, setSelectedApp] = useState<DonationApplication | null>(null);
  const [previewItem, setPreviewItem] = useState<{ type: 'image' | 'document', url: string, name?: string } | null>(null);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchApps = async () => {
    try {
      const res = await fetch(`/api/admin/regional/applications/${user.branch_id}`);
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/branches/${user.branch_id}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/regional/analytics/${user.branch_id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => { 
    fetchApps();
    fetchResources();
    fetchAnalytics();
  }, [user.branch_id]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/branches/${user.branch_id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newActivity)
    });
    setNewActivity({ title: '', description: '' });
    fetchResources();
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    await fetch(`/api/admin/master/activities/${editingActivity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingActivity)
    });
    setEditingActivity(null);
    fetchResources();
  };

  const handleDeleteActivity = async (id: number) => {
    if (confirm('Delete this activity?')) {
      await fetch(`/api/admin/master/activities/${id}`, { method: 'DELETE' });
      fetchResources();
    }
  };

  const handleToggleActivity = async (activity: Activity) => {
    const newStatus = activity.status === 'paused' ? 'active' : 'paused';
    await fetch(`/api/admin/master/activities/${activity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...activity, status: newStatus })
    });
    fetchResources();
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/branches/${user.branch_id}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResource)
    });
    setNewResource({ name: '', type: 'document', description: '', url: '' });
    fetchResources();
  };

  const handleDeleteResource = async (id: number) => {
    if (confirm('Delete this resource?')) {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      fetchResources();
    }
  };

  const handleReply = async (appId: number) => {
    await fetch('/api/admin/regional/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, reply: replyText[appId] })
    });
    fetchApps();
  };

  const handleForward = async (appId: number) => {
    await fetch('/api/admin/regional/forward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId })
    });
    fetchApps();
  };

  const handleStatusUpdate = async (appId: number, status: string) => {
    await fetch('/api/admin/regional/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, status })
    });
    fetchApps();
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, status } : null);
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold">Regional Admin Dashboard</h2>
        <div className="flex bg-stone-100 p-1 rounded-xl overflow-x-auto">
          <button 
            onClick={() => setActiveView('applications')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeView === 'applications' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}
          >
            Applications
          </button>
          <button 
            onClick={() => setActiveView('savings')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeView === 'savings' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}
          >
            Savings Analytics
          </button>
          <button 
            onClick={() => setActiveView('activities')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeView === 'activities' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}
          >
            Activities
          </button>
          <button 
            onClick={() => setActiveView('resources')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeView === 'resources' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}
          >
            Resources
          </button>
          <button 
            onClick={() => setActiveView('communication')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeView === 'communication' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}
          >
            Communication Hub
          </button>
        </div>
      </div>

      {activeView === 'applications' ? (
        <div className="space-y-8">
          {apps.map(app => (
            <div key={app.id} className="glass-card p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">{app.vulnerable_name}</h3>
                  <p className="text-stone-500 text-sm">{app.village}, {app.district}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                  app.status === 'pending' ? "bg-amber-100 text-amber-700" : 
                  app.status === 'forwarded' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {app.status}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2 text-sm">
                  <p><strong>Phone:</strong> {app.active_phone}</p>
                  <p><strong>Guardian:</strong> {app.guardian_name || 'N/A'}</p>
                  <p><strong>Chairperson:</strong> {app.chairperson_name} ({app.chairperson_phone})</p>
                </div>
                <div className="flex gap-2">
                  {JSON.parse(app.images).slice(0, 3).map((img: string, i: number) => (
                    <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg" />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedApp(app)}
                  className="btn-secondary flex-1 py-2 text-sm flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4" /> View Details & Review
                </button>
                <button onClick={() => handleForward(app.id)} className="btn-secondary h-11 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Forward to Master Admin
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeView === 'savings' ? (
        <div className="space-y-12">
          {analytics && (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" /> Regional Savings Growth
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.transactions.map((t: any) => ({ date: new Date(t.date).toLocaleDateString(), amount: t.amount }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" /> Application Status
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.applications.map((a: any) => ({ name: a.status, value: a.count }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.applications.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h4 className="font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> Transaction Performance
                </h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Total Deposits', value: analytics.transactions.filter((t: any) => t.type === 'deposit').reduce((acc: number, t: any) => acc + t.amount, 0) },
                      { name: 'Total Collections', value: analytics.transactions.filter((t: any) => t.type === 'asmin_collection').reduce((acc: number, t: any) => acc + t.amount, 0) }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      ) : activeView === 'communication' ? (
        <div className="glass-card p-8">
          <div className="flex gap-8 h-[350px]">
            <div className="w-64 border-r pr-6">
              <h4 className="font-bold mb-4 text-stone-400 uppercase text-xs tracking-widest">Contacts</h4>
              <div className="space-y-2">
                {['Regional Donors', 'Beneficiaries', 'Registered Users'].map(group => (
                  <button key={group} className="w-full text-left px-4 py-3 rounded-xl hover:bg-stone-50 font-medium text-stone-700">
                    {group}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-stone-50 rounded-2xl p-6 mb-4 flex items-center justify-center text-stone-400 italic">
                Select a group to start communicating with regional stakeholders.
              </div>
              <div className="flex gap-4">
                <input 
                  className="flex-1 px-4 py-3 rounded-xl border outline-none" 
                  placeholder="Type a message to the group..." 
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                />
                <button 
                  className="btn-primary px-8"
                  onClick={() => {
                    alert('Broadcast sent to ' + (broadcastMessage ? broadcastMessage : 'group'));
                    setBroadcastMessage('');
                  }}
                >
                  Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeView === 'resources' ? (
        <div className="space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">Add New Resource</h3>
            <form onSubmit={handleCreateResource} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input required placeholder="Resource Name" className="w-full px-4 py-2 rounded-xl border" value={newResource.name} onChange={e => setNewResource({...newResource, name: e.target.value})} />
                <select className="w-full px-4 py-2 rounded-xl border" value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})}>
                  <option value="document">Document</option>
                  <option value="tool">Tool</option>
                  <option value="fund">Fund</option>
                </select>
                <input placeholder="URL / Link (Optional)" className="w-full px-4 py-2 rounded-xl border" value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})} />
              </div>
              <div className="space-y-4">
                <textarea required placeholder="Description" className="w-full px-4 py-2 rounded-xl border h-32" value={newResource.description} onChange={e => setNewResource({...newResource, description: e.target.value})} />
                <button type="submit" className="btn-primary w-full py-3">Add Resource</button>
              </div>
            </form>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map(res => (
              <div key={res.id} className="glass-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <button onClick={() => handleDeleteResource(res.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-lg mb-2">{res.name}</h4>
                  <p className="text-stone-600 text-sm mb-4">{res.description}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-[10px] uppercase font-bold text-stone-400">{res.type}</span>
                  {res.url && (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">Add New Activity</h3>
            <form onSubmit={handleCreateActivity} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input required placeholder="Activity Title" className="w-full px-4 py-2 rounded-xl border" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} />
                <textarea required placeholder="Description" className="w-full px-4 py-2 rounded-xl border h-32" value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})} />
                <button type="submit" className="btn-primary w-full py-3">Add Activity</button>
              </div>
              <div className="bg-stone-50 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                <Calendar className="w-12 h-12 text-stone-300 mb-4" />
                <p className="text-stone-500 text-sm">Post regional activities, events, or updates for the community to see.</p>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {activities.map(act => (
              <div key={act.id} className={cn("glass-card p-6 flex justify-between items-center", act.status === 'paused' && "opacity-60 bg-stone-50")}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-lg">{act.title}</h4>
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded", act.status === 'paused' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                      {act.status}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm mb-2">{act.description}</p>
                  <p className="text-xs text-stone-400">{new Date(act.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <button onClick={() => setEditingActivity(act)} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleToggleActivity(act)} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600">
                    {act.status === 'paused' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
                  </button>
                  <button onClick={() => handleDeleteActivity(act.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Edit Modal */}
      <AnimatePresence>
        {editingActivity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold">Edit Activity</h3>
                <button onClick={() => setEditingActivity(null)}><X /></button>
              </div>
              <form onSubmit={handleUpdateActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input required className="w-full px-4 py-2 rounded-xl border" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea required className="w-full px-4 py-2 rounded-xl border h-32" value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary w-full py-3">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-serif font-bold">{selectedApp.vulnerable_name}</h3>
                  <p className="text-stone-500">Application Review</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-stone-100 rounded-full"><X /></button>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section>
                    <h4 className="font-bold text-stone-900 mb-4 border-b pb-2">Personal & Contact Info</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-stone-400">Guardian</p><p className="font-medium">{selectedApp.guardian_name || 'N/A'}</p></div>
                      <div><p className="text-stone-400">Phone</p><p className="font-medium">{selectedApp.active_phone}</p></div>
                      <div><p className="text-stone-400">Alt Phone</p><p className="font-medium">{selectedApp.alt_phone || 'N/A'}</p></div>
                      <div><p className="text-stone-400">Chairperson</p><p className="font-medium">{selectedApp.chairperson_name} ({selectedApp.chairperson_phone})</p></div>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-bold text-stone-900 mb-4 border-b pb-2">Location Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-stone-400">District</p><p className="font-medium">{selectedApp.district}</p></div>
                      <div><p className="text-stone-400">County</p><p className="font-medium">{selectedApp.county}</p></div>
                      <div><p className="text-stone-400">Sub-County</p><p className="font-medium">{selectedApp.sub_county}</p></div>
                      <div><p className="text-stone-400">Parish</p><p className="font-medium">{selectedApp.parish}</p></div>
                      <div><p className="text-stone-400">Village</p><p className="font-medium">{selectedApp.village}</p></div>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-bold text-stone-900 mb-4 border-b pb-2">Recommendation Letter</h4>
                    <div className="bg-stone-50 p-4 rounded-xl border border-dashed border-stone-200 relative group">
                      <img src={selectedApp.recommendation_letter} className="w-full h-auto rounded-lg shadow-sm cursor-pointer" alt="Recommendation Letter" onClick={() => setPreviewItem({ type: 'image', url: selectedApp.recommendation_letter, name: 'Recommendation Letter' })} />
                      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreviewItem({ type: 'image', url: selectedApp.recommendation_letter, name: 'Recommendation Letter' })} className="p-2 bg-white/90 rounded-full shadow-lg text-stone-600 hover:text-emerald-600"><ExternalLink className="w-4 h-4" /></button>
                        <button onClick={() => downloadFile(selectedApp.recommendation_letter, 'recommendation_letter.png')} className="p-2 bg-white/90 rounded-full shadow-lg text-stone-600 hover:text-emerald-600"><Download className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="font-bold text-stone-900 mb-4 border-b pb-2">Evidence Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {JSON.parse(selectedApp.images).map((img: string, i: number) => (
                        <div key={i} className="relative group aspect-square">
                          <img 
                            src={img} 
                            className="w-full h-full object-cover rounded-xl shadow-sm border cursor-pointer" 
                            alt={`Evidence ${i+1}`} 
                            onClick={() => setPreviewItem({ type: 'image', url: img, name: `Evidence ${i+1}` })}
                          />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setPreviewItem({ type: 'image', url: img, name: `Evidence ${i+1}` })} className="p-1.5 bg-white/90 rounded-full shadow-md text-stone-600 hover:text-emerald-600"><ExternalLink className="w-3.5 h-3.5" /></button>
                            <button onClick={() => downloadFile(img, `evidence_${i+1}.png`)} className="p-1.5 bg-white/90 rounded-full shadow-md text-stone-600 hover:text-emerald-600"><Download className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-stone-50 p-6 rounded-2xl space-y-4">
                    <h4 className="font-bold text-stone-900">Officer Action</h4>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Update Status</label>
                      <select 
                        className="w-full px-4 py-2 rounded-xl border bg-white"
                        value={selectedApp.status}
                        onChange={e => handleStatusUpdate(selectedApp.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="forwarded">Forwarded</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Reply to Applicant</label>
                      <textarea 
                        className="w-full px-4 py-2 rounded-xl border bg-white h-24"
                        placeholder="Type your reply here..."
                        value={replyText[selectedApp.id] || ''}
                        onChange={e => setReplyText({...replyText, [selectedApp.id]: e.target.value})}
                      />
                      <button 
                        onClick={() => handleReply(selectedApp.id)}
                        className="btn-primary w-full mt-2 py-2 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Send Reply
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={() => setPreviewItem(null)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center">
              {previewItem.type === 'image' ? (
                <img src={previewItem.url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Preview" />
              ) : (
                <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2 truncate w-full px-4">
                    {previewItem.name || 'Document'}
                  </h3>
                  <p className="text-stone-500 mb-8">Document Preview</p>
                  
                  {previewItem.url.startsWith('data:application/pdf') || previewItem.url.startsWith('data:text/plain') ? (
                    <iframe src={previewItem.url} className="w-full h-[400px] border rounded-lg mb-6" title="Document Preview" />
                  ) : (
                    <div className="w-full p-4 bg-stone-50 rounded-xl mb-8 text-stone-600 text-sm">
                      Preview not available for this file type. Please download to view.
                    </div>
                  )}

                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => downloadFile(previewItem.url, previewItem.name || 'document.pdf')}
                      className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button 
                      onClick={() => setPreviewItem(null)}
                      className="flex-1 bg-stone-100 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MasterAdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [officers, setOfficers] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingCards, setPendingCards] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'officers' | 'branches' | 'users' | 'analytics' | 'inbox'>('officers');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messagingUser, setMessagingUser] = useState<any>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [newOfficer, setNewOfficer] = useState({ name: '', email: '', password: '', branchName: '', isHeadOffice: false });
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    region: '',
    location: '',
    isHeadOffice: false,
    officerName: '',
    officerBio: '',
    officerPhotos: [] as string[]
  });
  const [showActivityManager, setShowActivityManager] = useState<Branch | null>(null);
  const [newActivity, setNewActivity] = useState({ title: '', description: '' });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [previewItem, setPreviewItem] = useState<{ type: 'image' | 'document', url: string, name?: string } | null>(null);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    try {
      const [res1, res2, res3, res4, res5, res6] = await Promise.all([
        fetch('/api/admin/master/all-activities'),
        fetch('/api/admin/master/officers'),
        fetch('/api/admin/master/branches'),
        fetch('/api/admin/master/users'),
        fetch('/api/admin/master/analytics'),
        fetch('/api/admin/pending-cards')
      ]);

      const safeJson = async (res: Response) => {
        if (!res.ok) return null;
        try {
          const text = await res.text();
          return text ? JSON.parse(text) : null;
        } catch (e) {
          return null;
        }
      };

      setData(await safeJson(res1));
      setOfficers(await safeJson(res2) || []);
      setBranches(await safeJson(res3) || []);
      setUsers(await safeJson(res4) || []);
      setAnalytics(await safeJson(res5));
      setPendingCards(await safeJson(res6) || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    await fetch(`/api/admin/master/branches/${editingBranch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchForm)
    });
    setEditingBranch(null);
    fetchData();
  };

  const handleDeleteBranch = async (id: number) => {
    if (confirm('Are you sure you want to delete this branch? All associated data will be lost.')) {
      await fetch(`/api/admin/master/branches/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showActivityManager) return;
    await fetch(`/api/branches/${showActivityManager.id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newActivity)
    });
    setNewActivity({ title: '', description: '' });
    fetchData();
  };

  const handleToggleActivity = async (activity: Activity) => {
    const newStatus = activity.status === 'paused' ? 'active' : 'paused';
    await fetch(`/api/admin/master/activities/${activity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...activity, status: newStatus })
    });
    fetchData();
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    await fetch(`/api/admin/master/activities/${editingActivity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingActivity)
    });
    setEditingActivity(null);
    fetchData();
  };

  const handleDeleteActivity = async (id: number) => {
    if (confirm('Delete this activity?')) {
      await fetch(`/api/admin/master/activities/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranchForm(prev => ({
          ...prev,
          officerPhotos: [...prev.officerPhotos, reader.result as string].slice(0, 4)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/master/officers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOfficer)
    });
    setNewOfficer({ name: '', email: '', password: '', branchName: '', isHeadOffice: false });
    fetchData();
  };

  const handleDeleteOfficer = async (id: number) => {
    if (confirm('Are you sure you want to delete this officer?')) {
      await fetch(`/api/admin/master/officers/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleSendAdminMessage = async () => {
    if (!messagingUser || !adminMessage.trim()) return;
    await fetch('/api/admin/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: messagingUser.id,
        message: adminMessage
      })
    });
    setAdminMessage('');
    setMessagingUser(null);
    alert('Message sent successfully!');
  };

  const handleWarnUser = async (id: number) => {
    const message = prompt('Enter warning message:');
    if (!message) return;
    await fetch(`/api/admin/users/${id}/warn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    alert('User warned');
    fetchData();
  };

  const handleSuspendUser = async (id: number) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      await fetch(`/api/admin/users/${id}/suspend`, { method: 'POST' });
      alert('User suspended');
      fetchData();
    }
  };

  const handleBanUser = async (id: number) => {
    if (confirm('Are you sure you want to ban this user?')) {
      await fetch(`/api/admin/users/${id}/ban`, { method: 'POST' });
      alert('User banned');
      fetchData();
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('CRITICAL: Are you sure you want to delete this user? All their data (savings, donations, card) will be permanently removed.')) {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      alert('User deleted');
      fetchData();
    }
  };

  if (!data) return <div className="pt-24 text-center">Loading master dashboard...</div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-3xl font-serif font-bold">Master Admin Dashboard</h2>
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="flex bg-stone-100 p-1 rounded-xl flex-nowrap w-max">
            <button onClick={() => setActiveTab('officers')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeTab === 'officers' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}>Officers</button>
            <button onClick={() => setActiveTab('branches')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeTab === 'branches' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}>Branches</button>
            <button onClick={() => setActiveTab('users')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeTab === 'users' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}>Users</button>
            <button onClick={() => setActiveTab('analytics')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap", activeTab === 'analytics' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}>Analytics</button>
            <button onClick={() => setActiveTab('inbox')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all relative whitespace-nowrap", activeTab === 'inbox' ? "bg-white shadow-sm text-emerald-700" : "text-stone-500")}>
              Inbox
              {pendingCards.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                  {pendingCards.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6 bg-emerald-900 text-white">
          <p className="text-emerald-300 text-xs uppercase font-bold mb-1">Total Donations</p>
          <p className="text-2xl font-serif font-bold">UGX {data.donations.reduce((acc: number, d: any) => acc + d.amount, 0).toLocaleString()}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-stone-400 text-xs uppercase font-bold mb-1">Total Users</p>
          <p className="text-2xl font-serif font-bold">{data.users.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-stone-400 text-xs uppercase font-bold mb-1">Applications</p>
          <p className="text-2xl font-serif font-bold">{data.applications.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-stone-400 text-xs uppercase font-bold mb-1">Regional Officers</p>
          <p className="text-2xl font-serif font-bold">{officers.length}</p>
        </div>
      </div>

      {activeTab === 'officers' ? (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6">Manage Regional Officers</h3>
            <div className="space-y-4">
              {officers.map(off => (
                <div key={off.id} className="glass-card p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{off.name}</p>
                    <p className="text-sm text-stone-500">{off.email} • Branch ID: {off.branch_id}</p>
                  </div>
                  <button onClick={() => handleDeleteOfficer(off.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">Assign New Officer</h3>
            <form onSubmit={handleCreateOfficer} className="glass-card p-6 space-y-4">
              <input required className="w-full px-4 py-2 rounded-xl border" placeholder="Name" value={newOfficer.name} onChange={e => setNewOfficer({...newOfficer, name: e.target.value})} />
              <input required className="w-full px-4 py-2 rounded-xl border" placeholder="Email" value={newOfficer.email} onChange={e => setNewOfficer({...newOfficer, email: e.target.value})} />
              <input required type="password" className="w-full px-4 py-2 rounded-xl border" placeholder="Password" value={newOfficer.password} onChange={e => setNewOfficer({...newOfficer, password: e.target.value})} />
              <input required className="w-full px-4 py-2 rounded-xl border" placeholder="Branch Name (e.g. Northern)" value={newOfficer.branchName} onChange={e => setNewOfficer({...newOfficer, branchName: e.target.value})} />
              <div className="flex items-center gap-2 px-2">
                <input 
                  type="checkbox" 
                  id="isHeadOffice"
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  checked={newOfficer.isHeadOffice} 
                  onChange={e => setNewOfficer({...newOfficer, isHeadOffice: e.target.checked})} 
                />
                <label htmlFor="isHeadOffice" className="text-sm text-stone-600 font-medium cursor-pointer">Mark as Head Office</label>
              </div>
              <button type="submit" className="btn-primary w-full">Create Officer</button>
            </form>
          </div>
        </div>
      ) : activeTab === 'branches' ? (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-6">Manage Branches</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map(branch => (
              <div key={branch.id} className="glass-card p-6 relative">
                {branch.is_head_office === 1 && (
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold">
                    Head Office
                  </div>
                )}
                <h4 className="text-xl font-serif font-bold mb-2">{branch.region}</h4>
                <p className="text-stone-500 text-sm mb-4">{branch.location}</p>
                
                <div className="flex gap-2 mb-6">
                  <button 
                    onClick={() => {
                      setEditingBranch(branch);
                      setBranchForm({
                        region: branch.region,
                        location: branch.location,
                        isHeadOffice: branch.is_head_office === 1,
                        officerName: branch.officer_name || '',
                        officerBio: branch.officer_bio || '',
                        officerPhotos: branch.officer_photos ? JSON.parse(branch.officer_photos) : []
                      });
                    }}
                    className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => setShowActivityManager(branch)}
                    className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" /> Activities
                  </button>
                  <button 
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="text-red-500 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-6">System Users</h3>
          <div className="glass-card overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[1200px]">
              <thead className="bg-stone-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-stone-400">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-stone-400">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-stone-400">Location</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-stone-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-stone-400">Donations</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-stone-400">Card</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-stone-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => {
                  const userDonations = data.donations.filter((d: any) => d.donor_name === u.name);
                  const totalDonated = userDonations.reduce((acc: number, d: any) => acc + d.amount, 0);
                  
                  return (
                    <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-stone-100 rounded-full overflow-hidden flex-shrink-0">
                            {u.photo ? (
                              <img src={u.photo} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <UserIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.name}</p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{u.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{u.email}</p>
                        <p className="text-xs text-stone-500">{u.phone || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{u.location || 'Not set'}</p>
                        <p className="text-[10px] text-stone-400">{branches.find(b => b.id === u.branch_id)?.region || 'No Branch'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          u.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                          u.status === 'suspended' ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">UGX {totalDonated.toLocaleString()}</p>
                        <p className="text-[10px] text-stone-400">{userDonations.length} donations</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-widest",
                          u.card_status === 'approved' ? "text-emerald-600" :
                          u.card_status === 'pending' ? "text-amber-600" :
                          u.card_status === 'rejected' ? "text-red-600" :
                          "text-stone-400"
                        )}>
                          {u.card_status || 'none'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleWarnUser(u.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Warn User"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleSuspendUser(u.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Suspend User"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleBanUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setMessagingUser(u)}
                            className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Send Message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'inbox' ? (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-6">Pending Card Requests</h3>
          <div className="space-y-4">
            {pendingCards.length === 0 ? (
              <div className="glass-card p-12 text-center text-stone-500">
                No pending card requests at the moment.
              </div>
            ) : (
              pendingCards.map(user => (
                <div key={user.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-1 items-center gap-6">
                    <div className="w-20 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0 border-2 border-stone-200 relative group">
                      {user.card_photo ? (
                        <>
                          <img src={user.card_photo} alt={user.card_full_name} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewItem({ type: 'image', url: user.card_photo!, name: user.card_full_name })} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => setPreviewItem({ type: 'image', url: user.card_photo!, name: user.card_full_name })} className="p-1.5 bg-white rounded-full text-stone-600 hover:text-emerald-600"><ExternalLink className="w-3.5 h-3.5" /></button>
                            <button onClick={() => downloadFile(user.card_photo!, 'card_photo.png')} className="p-1.5 bg-white rounded-full text-stone-600 hover:text-emerald-600"><Download className="w-3.5 h-3.5" /></button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{user.card_full_name || user.name}</h4>
                        <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-500 font-bold uppercase">{user.role.replace('_', ' ')}</span>
                      </div>
                      <p className="text-stone-500 text-sm flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                      <p className="text-stone-500 text-sm flex items-center gap-1"><Phone className="w-3 h-3" /> {user.card_phone || 'No phone provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={async () => {
                        const reason = prompt('Enter reason for rejection:');
                        if (reason) {
                          await fetch(`/api/admin/reject-card/${user.id}`, { 
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reason })
                          });
                          fetchData();
                        }
                      }}
                      className="px-6 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> Reject
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm(`Approve card for ${user.card_full_name || user.name}?`)) {
                          await fetch(`/api/admin/approve-card/${user.id}`, { method: 'POST' });
                          fetchData();
                        }
                      }}
                      className="btn-primary flex items-center gap-2 px-8"
                    >
                      <CheckCircle className="w-5 h-5" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        <div className="mt-8 space-y-12">
          {analytics && (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" /> Donation Growth
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.donations.map((d: any) => ({ date: new Date(d.date).toLocaleDateString(), amount: d.amount }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" /> Transaction Volume
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Deposits', value: analytics.transactions.filter((t: any) => t.type === 'deposit').length },
                        { name: 'Collections', value: analytics.transactions.filter((t: any) => t.type === 'asmin_collection').length }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="glass-card p-8 md:col-span-1">
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" /> User Roles
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Users', value: users.length },
                            { name: 'Officers', value: officers.length },
                            { name: 'Admins', value: 1 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#8b5cf6" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Message Modal */}
      <AnimatePresence>
        {messagingUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold">Message User</h3>
                <button onClick={() => setMessagingUser(null)}><X /></button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">To</p>
                  <p className="font-bold">{messagingUser.name}</p>
                  <p className="text-xs text-emerald-600">{messagingUser.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Your Message</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border bg-white h-32 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Type your message here..."
                    value={adminMessage}
                    onChange={e => setAdminMessage(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleSendAdminMessage}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold">User Details</h3>
                <button onClick={() => setSelectedUser(null)}><X /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">
                    {selectedUser.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{selectedUser.name}</p>
                    <p className="text-stone-500 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-2xl">
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Role</p>
                    <p className="font-bold capitalize">{selectedUser.role}</p>
                  </div>
                  <div className="p-4 border rounded-2xl">
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Branch</p>
                    <p className="font-bold">{branches.find(b => b.id === selectedUser.branch_id)?.region || 'None'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Branch Edit Modal */}
      <AnimatePresence>
        {editingBranch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold">Edit Branch & Officer</h3>
                <button onClick={() => setEditingBranch(null)}><X /></button>
              </div>
              
              <form onSubmit={handleUpdateBranch} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Region Name</label>
                    <input required className="w-full px-4 py-2 rounded-xl border" value={branchForm.region} onChange={e => setBranchForm({...branchForm, region: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input required className="w-full px-4 py-2 rounded-xl border" value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="editIsHeadOffice" checked={branchForm.isHeadOffice} onChange={e => setBranchForm({...branchForm, isHeadOffice: e.target.checked})} />
                  <label htmlFor="editIsHeadOffice" className="text-sm font-medium">Mark as Head Office</label>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-bold mb-4">Officer Details</h4>
                  <div className="space-y-4">
                    <input placeholder="Officer Name" className="w-full px-4 py-2 rounded-xl border" value={branchForm.officerName} onChange={e => setBranchForm({...branchForm, officerName: e.target.value})} />
                    <textarea placeholder="Officer Bio" className="w-full px-4 py-2 rounded-xl border h-24" value={branchForm.officerBio} onChange={e => setBranchForm({...branchForm, officerBio: e.target.value})} />
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Officer Photos (Max 4)</label>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {branchForm.officerPhotos.map((photo, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                            <img src={photo} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setBranchForm(prev => ({ ...prev, officerPhotos: prev.officerPhotos.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {branchForm.officerPhotos.length < 4 && (
                          <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50">
                            <Plus className="w-6 h-6 text-stone-400" />
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Activity Management Modal */}
      <AnimatePresence>
        {showActivityManager && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold">Manage Activities: {showActivityManager.region}</h3>
                <button onClick={() => setShowActivityManager(null)}><X /></button>
              </div>

              <div className="mb-8">
                <h4 className="font-bold mb-4">Add New Activity</h4>
                <form onSubmit={handleAddActivity} className="space-y-4">
                  <input required placeholder="Activity Title" className="w-full px-4 py-2 rounded-xl border" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} />
                  <textarea required placeholder="Description" className="w-full px-4 py-2 rounded-xl border h-20" value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})} />
                  <button type="submit" className="btn-primary w-full py-2">Add Activity</button>
                </form>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-bold mb-4">Existing Activities</h4>
                <div className="space-y-4">
                  {branches.find(b => b.id === showActivityManager.id)?.activities?.map(act => (
                    <div key={act.id} className={cn("p-4 rounded-2xl border flex justify-between items-center", act.status === 'paused' ? "bg-stone-50 border-stone-200 opacity-60" : "bg-white border-stone-100")}>
                      <div>
                        <p className="font-bold">{act.title}</p>
                        <p className="text-xs text-stone-500">{new Date(act.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleToggleActivity(act)}
                          className={cn("px-3 py-1 rounded-lg text-xs font-bold", act.status === 'paused' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}
                        >
                          {act.status === 'paused' ? 'Resume' : 'Pause'}
                        </button>
                        <button 
                          onClick={() => setEditingActivity(act)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteActivity(act.id)} className="text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Activity Edit Modal */}
      <AnimatePresence>
        {editingActivity && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold">Edit Activity</h3>
                <button onClick={() => setEditingActivity(null)}><X /></button>
              </div>
              <form onSubmit={handleUpdateActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input required className="w-full px-4 py-2 rounded-xl border" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea required className="w-full px-4 py-2 rounded-xl border h-32" value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary w-full py-3">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={() => setPreviewItem(null)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center">
              {previewItem.type === 'image' ? (
                <img src={previewItem.url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Preview" />
              ) : (
                <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2 truncate w-full px-4">
                    {previewItem.name || 'Document'}
                  </h3>
                  <p className="text-stone-500 mb-8">Document Preview</p>
                  
                  {previewItem.url.startsWith('data:application/pdf') || previewItem.url.startsWith('data:text/plain') ? (
                    <iframe src={previewItem.url} className="w-full h-[400px] border rounded-lg mb-6" title="Document Preview" />
                  ) : (
                    <div className="w-full p-4 bg-stone-50 rounded-xl mb-8 text-stone-600 text-sm">
                      Preview not available for this file type. Please download to view.
                    </div>
                  )}

                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => downloadFile(previewItem.url, previewItem.name || 'document.pdf')}
                      className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button 
                      onClick={() => setPreviewItem(null)}
                      className="flex-1 bg-stone-100 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      if (isLogin) {
        onLogin(data.user);
        if (data.user.role === 'master_admin') navigate('/admin/master');
        else if (data.user.role === 'regional_officer') navigate('/admin/regional');
        else navigate('/dashboard');
      } else {
        setRegisteredUser(data.user);
        alert('Registration successful! Please download your ID card and then login.');
      }
    } else {
      setError(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="pt-32 pb-16 flex justify-center px-4">
      {registeredUser && (
        <UserTicket user={registeredUser} onClose={() => {
          setRegisteredUser(null);
          setIsLogin(true);
        }} />
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold mb-2">{isLogin ? 'Welcome Back' : 'Join ASMIN'}</h2>
          <p className="text-stone-500">{isLogin ? 'Manage your savings and support' : 'Start your journey with us today'}</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. +256 700 000000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-100 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-stone-500 hover:text-emerald-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatRoom = ({ user, isOpen, onClose }: { user: User; isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
  const [previewItem, setPreviewItem] = useState<{ type: 'image' | 'document', url: string, name?: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [editingMessage, setEditingMessage] = useState<any | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log('Connected to Chat');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        const parsedMessages = data.messages.map((m: any) => ({
          ...m,
          reactions: typeof m.reactions === 'string' ? JSON.parse(m.reactions) : m.reactions,
          read_by: typeof m.read_by === 'string' ? JSON.parse(m.read_by) : m.read_by,
          reply_to: m.reply_to ? (typeof m.reply_to === 'string' ? JSON.parse(m.reply_to) : m.reply_to) : null
        }));
        setMessages(parsedMessages);
        // Mark all as read
        parsedMessages.forEach((m: any) => {
          if (!m.read_by?.includes(user.id)) {
            ws.send(JSON.stringify({ type: 'read', messageId: m.id, userId: user.id }));
          }
        });
      } else if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
        ws.send(JSON.stringify({ type: 'read', messageId: data.message.id, userId: user.id }));
      } else if (data.type === 'typing') {
        setTypingUsers(prev => {
          const next = { ...prev };
          if (data.isTyping) next[data.userId] = data.userName;
          else delete next[data.userId];
          return next;
        });
      } else if (data.type === 'reaction_update') {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, reactions: data.reactions } : m));
      } else if (data.type === 'read_update') {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, read_by: data.readBy } : m));
      } else if (data.type === 'delete_update') {
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      } else if (data.type === 'edit_update') {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, message: data.newMessage } : m));
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [isOpen, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, typingUsers]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (!socket) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    socket.send(JSON.stringify({ type: 'typing', userId: user.id, userName: user.name, isTyping: true }));
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.send(JSON.stringify({ type: 'typing', userId: user.id, userName: user.name, isTyping: false }));
    }, 2000);
  };

  const sendMessage = (e?: React.FormEvent, image?: string, document?: string, documentName?: string) => {
    if (e) e.preventDefault();
    if (!input.trim() && !image && !document || !socket) return;

    if (editingMessage) {
      socket.send(JSON.stringify({
        type: 'edit',
        messageId: editingMessage.id,
        userId: user.id,
        newMessage: input.trim()
      }));
      setEditingMessage(null);
    } else {
      socket.send(JSON.stringify({
        type: 'message',
        userId: user.id,
        userName: user.name,
        userPhoto: user.photo || null,
        message: image ? '[Image]' : (document ? `[Document: ${documentName}]` : input.trim()),
        image: image || null,
        document: document || null,
        documentName: documentName || null,
        replyTo: replyingTo ? {
          id: replyingTo.id,
          userName: replyingTo.user_name,
          message: replyingTo.message
        } : null
      }));
    }

    setInput('');
    setReplyingTo(null);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.send(JSON.stringify({ type: 'typing', userId: user.id, userName: user.name, isTyping: false }));
    }
  };

  const toggleReaction = (messageId: number, emoji: string) => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: 'reaction', messageId, userId: user.id, emoji }));
  };

  const deleteMessage = (messageId: number) => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: 'delete', messageId, userId: user.id }));
  };

  const startEdit = (msg: any) => {
    setEditingMessage(msg);
    setInput(msg.message);
    setReplyingTo(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage(undefined, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage(undefined, undefined, reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const commonEmojis = ['❤️', '👍', '🔥', '😂', '😮', '😢'];

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col safe-bottom"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-stone-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-stone-400 hover:text-stone-900">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold">Community Chat</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">ASMIN Uganda</p>
        </div>
        <button className="p-2 -mr-2 text-stone-400">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {messages.map((msg, idx) => {
          const isMe = msg.user_id === user.id;
          const reactions = msg.reactions || {};
          const readBy = msg.read_by || [];
          const isReadByOthers = readBy.some((id: number) => id !== user.id);

          return (
            <div key={msg.id || idx} className="relative">
              <motion.div 
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) {
                    setReplyingTo(msg);
                    setEditingMessage(null);
                  } else if (info.offset.x < -50) {
                    if (isMe) {
                      if (confirm('Delete this message?')) {
                        deleteMessage(msg.id);
                      }
                    }
                  }
                }}
                dragSnapToOrigin
                className={cn("flex gap-3 relative z-10 bg-white", isMe ? "flex-row-reverse" : "flex-row")}
              >
                {/* Swipe Indicators */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 -z-10 text-emerald-500">
                  <Reply className="w-5 h-5" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 -z-10 text-red-500">
                  <Trash2 className="w-5 h-5" />
                </div>

                {/* Profile Photo */}
                <div className="flex-shrink-0 mt-1">
                  {msg.user_photo ? (
                    <img src={msg.user_photo} className="w-8 h-8 rounded-full object-cover border border-stone-100" alt={msg.user_name} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className={cn(
                  "max-w-[75%] group relative flex flex-col",
                  isMe ? "items-end" : "items-start"
                )}>
                  {!isMe && (
                    <span className="text-[10px] font-bold text-stone-400 mb-1 ml-1 uppercase tracking-tighter">
                      {msg.user_name}
                    </span>
                  )}
                  
                  <motion.div 
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 50 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.y > 30 && isMe) {
                        startEdit(msg);
                      }
                    }}
                    dragSnapToOrigin
                    className={cn(
                      "p-3.5 rounded-2xl shadow-sm relative",
                      isMe ? "bg-emerald-600 text-white rounded-tr-none" : "bg-stone-100 text-stone-800 rounded-tl-none"
                    )}
                  >
                    {/* Swipe Down Indicator */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-3 h-3" />
                    </div>

                    {msg.reply_to && (
                      <div className={cn(
                        "mb-2 p-2 rounded-lg text-[10px] border-l-2",
                        isMe ? "bg-emerald-700/50 border-emerald-300" : "bg-stone-200/50 border-stone-400"
                      )}>
                        <p className="font-bold opacity-60 uppercase tracking-wider mb-0.5">
                          {typeof msg.reply_to === 'string' ? JSON.parse(msg.reply_to).userName : msg.reply_to.userName}
                        </p>
                        <p className="truncate opacity-80 italic">
                          {typeof msg.reply_to === 'string' ? JSON.parse(msg.reply_to).message : msg.reply_to.message}
                        </p>
                      </div>
                    )}
                  {msg.image && (
                    <div className="relative group/media mb-2">
                      <img 
                        src={msg.image} 
                        className="rounded-xl max-h-60 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        alt="Sent image"
                        onClick={() => setPreviewItem({ type: 'image', url: msg.image })}
                      />
                      <button 
                        onClick={() => downloadFile(msg.image, `image_${msg.id}.png`)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {msg.document && (
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-xl mb-2 border",
                      isMe ? "bg-emerald-700/30 border-emerald-500/30" : "bg-white border-stone-200"
                    )}>
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isMe ? "bg-emerald-500/20" : "bg-stone-100"
                      )}>
                        <FileText className={cn("w-5 h-5", isMe ? "text-emerald-200" : "text-stone-500")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-[11px] font-bold truncate", isMe ? "text-white" : "text-stone-900")}>
                          {msg.document_name || 'Document'}
                        </p>
                        <p className={cn("text-[9px] opacity-60", isMe ? "text-emerald-100" : "text-stone-500")}>
                          Attachment
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setPreviewItem({ type: 'document', url: msg.document, name: msg.document_name })}
                          className={cn("p-1.5 rounded-full transition-colors", isMe ? "hover:bg-emerald-500/30 text-emerald-100" : "hover:bg-stone-100 text-stone-500")}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => downloadFile(msg.document, msg.document_name || 'document.pdf')}
                          className={cn("p-1.5 rounded-full transition-colors", isMe ? "hover:bg-emerald-500/30 text-emerald-100" : "hover:bg-stone-100 text-stone-500")}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[12px] leading-relaxed">{msg.message}</p>
                  
                  {/* Reactions */}
                  {Object.keys(reactions).length > 0 && (
                    <div className="absolute -bottom-3 left-2 flex flex-wrap gap-1">
                      {Object.entries(reactions).map(([emoji, uids]: [string, any]) => (
                        <button 
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className={cn(
                            "bg-white shadow-sm border rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 transition-all",
                            uids.includes(user.id) ? "border-emerald-200 bg-emerald-50" : "border-stone-100"
                          )}
                        >
                          <span>{emoji}</span>
                          <span className="font-bold opacity-60">{uids.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>

                <div className={cn(
                  "flex items-center gap-2 mt-2 px-1 transition-opacity",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  {/* Quick Reactions Menu */}
                  <div className="hidden group-hover:flex items-center gap-1 bg-white shadow-lg border border-stone-100 rounded-full px-2 py-1 absolute -top-8 right-0 z-20">
                    {commonEmojis.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => toggleReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <button className="text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100"><Reply className="w-3 h-3" /></button>
                  <span className="text-[9px] text-stone-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {isMe && (
                    <div className="flex items-center">
                      {isReadByOthers ? (
                        <div className="flex -space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 -ml-1.5" />
                        </div>
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-stone-300" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          );
        })}

        {/* Typing Indicators */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="flex items-center gap-2 text-stone-400 text-[10px] font-medium animate-pulse ml-2">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>{Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100 sticky bottom-0 z-10">
        {replyingTo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 p-2 bg-stone-50 border-l-2 border-emerald-500 rounded-r-lg flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Replying to {replyingTo.user_name}</p>
              <p className="text-[11px] text-stone-500 truncate">{replyingTo.message}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {editingMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 p-2 bg-stone-50 border-l-2 border-blue-500 rounded-r-lg flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Editing Message</p>
              <p className="text-[11px] text-stone-500 truncate">{editingMessage.message}</p>
            </div>
            <button onClick={() => { setEditingMessage(null); setInput(''); }} className="p-1 text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={docInputRef} 
          onChange={handleDocUpload} 
          accept=".pdf,.doc,.docx,.txt" 
          className="hidden" 
        />
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <div className="flex items-center gap-1 mb-1">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea 
              rows={1}
              placeholder="Message..."
              className="w-full bg-stone-100 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none max-h-32"
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={!input.trim()}
            className={cn(
              "p-3 rounded-2xl transition-all",
              input.trim() 
                ? (editingMessage ? "bg-blue-600 text-white" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20") 
                : "bg-stone-100 text-stone-300"
            )}
          >
            {editingMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={() => setPreviewItem(null)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center">
              {previewItem.type === 'image' ? (
                <img src={previewItem.url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Preview" />
              ) : (
                <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2 truncate w-full px-4">
                    {previewItem.name || 'Document'}
                  </h3>
                  <p className="text-stone-500 mb-8">Document Preview</p>
                  
                  {previewItem.url.startsWith('data:application/pdf') || previewItem.url.startsWith('data:text/plain') ? (
                    <iframe src={previewItem.url} className="w-full h-[400px] border rounded-lg mb-6" title="Document Preview" />
                  ) : (
                    <div className="w-full p-4 bg-stone-50 rounded-xl mb-8 text-stone-600 text-sm">
                      Preview not available for this file type. Please download to view.
                    </div>
                  )}

                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => downloadFile(previewItem.url, previewItem.name || 'document.pdf')}
                      className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button 
                      onClick={() => setPreviewItem(null)}
                      className="flex-1 bg-stone-100 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BottomNav = ({ user, onChatOpen }: { user: User | null; onChatOpen: () => void }) => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: CalendarDays, label: 'Events', path: '/events' },
    { icon: MessageSquare, label: 'Chat', action: onChatOpen },
    { icon: ProfileIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-stone-100 px-6 pt-3 pb-8 md:hidden flex justify-between items-center">
      {navItems.map((item, idx) => {
        const isActive = location === item.path;
        return (
          <button 
            key={idx}
            onClick={() => item.action ? item.action() : navigate(item.path!)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-emerald-600" : "text-stone-400"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "fill-emerald-600/10")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const EventsPage = ({ user }: { user: User | null }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userRsvps, setUserRsvps] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(res => res.ok ? res.json() : []),
      fetch('/api/branches').then(res => res.ok ? res.json() : [])
    ]).then(([eventsData, branchesData]) => {
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user && Array.isArray(events)) {
      events.forEach(event => {
        fetch(`/api/events/${event.id}/rsvps`)
          .then(res => res.json())
          .then(uids => {
            if (uids.includes(user.id)) {
              setUserRsvps(prev => Array.from(new Set([...prev, event.id])));
            }
          });
      });
    }
  }, [events, user]);

  const handleRsvp = async (eventId: number) => {
    if (!user) return;
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    const data = await res.json();
    if (data.success) {
      if (data.rsvp) {
        setUserRsvps(prev => [...prev, eventId]);
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvp_count: e.rsvp_count + 1 } : e));
      } else {
        setUserRsvps(prev => prev.filter(id => id !== eventId));
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvp_count: e.rsvp_count - 1 } : e));
      }
    }
  };

  const filteredEvents = (filterBranch === 'all' 
    ? events 
    : events.filter(e => e.branch_id === parseInt(filterBranch))) || [];

  if (loading) return <div className="pt-32 text-center">Loading events...</div>;

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Community Events</h1>
          <p className="text-stone-500">Stay connected with workshops, gatherings, and more.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.region} - {b.location}</option>
            ))}
          </select>

          {(user?.role === 'regional_officer' || user?.role === 'master_admin') && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Event
            </button>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl">
          <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No events found for this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full">
                    {event.category}
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">
                    {event.branch_name}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-stone-600 text-sm line-clamp-3 mb-4">{event.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-stone-500 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-stone-50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 text-stone-400 text-xs">
                  <Users className="w-3 h-3" />
                  <span>{event.rsvp_count} attending</span>
                </div>
                
                <button 
                  onClick={() => handleRsvp(event.id)}
                  disabled={!user}
                  className={cn(
                    "px-6 py-2 rounded-full font-bold text-sm transition-all active:scale-95",
                    userRsvps.includes(event.id) 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-stone-900 text-white hover:bg-stone-800"
                  )}
                >
                  {userRsvps.includes(event.id) ? 'Going' : 'RSVP'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <CreateEventModal 
            user={user!} 
            branches={branches}
            onClose={() => setShowCreateModal(false)} 
            onSuccess={(newEvent) => {
              setEvents(prev => [newEvent, ...prev]);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateEventModal = ({ user, branches, onClose, onSuccess }: { user: User; branches: Branch[]; onClose: () => void; onSuccess: (event: Event) => void }) => {
  const [formData, setFormData] = useState({
    branchId: user.role === 'regional_officer' ? user.branch_id?.toString() : '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      const branch = branches.find(b => b.id === parseInt(formData.branchId!));
      onSuccess({
        id: data.eventId,
        ...formData,
        branch_id: parseInt(formData.branchId!),
        branch_name: branch ? `${branch.region} - ${branch.location}` : 'Unknown',
        rsvp_count: 0,
        created_at: new Date().toISOString()
      } as any);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full h-[92%] sm:h-auto sm:max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-stone-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">Post New Event</h2>
            <p className="text-sm text-stone-500">Share community updates</p>
          </div>
          <button onClick={onClose} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 no-scrollbar">
          {user.role === 'master_admin' && (
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Target Branch</label>
              <select 
                required
                value={formData.branchId}
                onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.region} - {b.location}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Event Title</label>
            <input 
              required
              type="text"
              placeholder="e.g., Financial Literacy Workshop"
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Date</label>
              <input 
                required
                type="date"
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Time</label>
              <input 
                required
                type="time"
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Location</label>
            <input 
              required
              type="text"
              placeholder="e.g., Branch Office Hall"
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Category</label>
            <select 
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Workshop">Workshop</option>
              <option value="Meeting">Community Meeting</option>
              <option value="Gathering">Social Gathering</option>
              <option value="Training">Training Session</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Description</label>
            <textarea 
              required
              rows={3}
              placeholder="What is this event about?"
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 mt-2"
          >
            {loading ? 'Posting...' : 'Post Event'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const NotificationBanner = ({ user }: { user: User }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentNotification, setCurrentNotification] = useState<any | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications/${user.id}`);
        const data = await res.json();
        if (data.success) {
          const unread = data.notifications.filter((n: any) => !n.is_read);
          setNotifications(unread);
          if (unread.length > 0) {
            setCurrentNotification(unread[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user.id]);

  const markAsRead = async () => {
    if (!currentNotification) return;
    try {
      await fetch(`/api/notifications/${currentNotification.id}/read`, { method: 'POST' });
      const remaining = notifications.filter(n => n.id !== currentNotification.id);
      setNotifications(remaining);
      setCurrentNotification(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const closeBanner = () => {
    const remaining = notifications.filter(n => n.id !== currentNotification.id);
    setNotifications(remaining);
    setCurrentNotification(remaining.length > 0 ? remaining[0] : null);
  };

  if (!currentNotification) return null;

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-20 left-4 right-4 z-[200] md:left-auto md:right-8 md:w-96"
    >
      <div className="bg-white border border-stone-200 shadow-2xl rounded-2xl p-4 flex items-start gap-4">
        <div className={clsx(
          "p-2 rounded-xl",
          currentNotification.type === 'message' ? "bg-blue-100 text-blue-600" :
          currentNotification.type === 'event' ? "bg-amber-100 text-amber-600" :
          "bg-emerald-100 text-emerald-600"
        )}>
          {currentNotification.type === 'message' ? <MessageSquare className="w-5 h-5" /> :
           currentNotification.type === 'event' ? <Calendar className="w-5 h-5" /> :
           <Bell className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{currentNotification.title}</h4>
          <p className="text-xs text-stone-500 line-clamp-2">{currentNotification.message}</p>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={markAsRead}
              className="text-[10px] uppercase font-bold tracking-widest bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-colors"
            >
              Mark as Read
            </button>
            <button 
              onClick={closeBanner}
              className="text-[10px] uppercase font-bold tracking-widest border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('asmin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load user from localStorage:', e);
      return null;
    }
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogin = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('asmin_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to save user to localStorage:', e);
      try {
        // If quota exceeded, try saving without the photo
        const { photo, ...rest } = userData;
        localStorage.setItem('asmin_user', JSON.stringify(rest));
      } catch (innerError) {
        console.error('Critical failure saving to localStorage:', innerError);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('asmin_user');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fdfcf9]">
        {user && <NotificationBanner user={user} />}
        <Navbar user={user} onLogout={handleLogout} />
        <main className="pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/branch/:id" element={<BranchDetailPage user={user} />} />
            <Route path="/branch/:id/apply" element={<DonationApplicationForm />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfilePage user={user} onUpdate={handleLogin} /> : <Navigate to="/login" />} />
            <Route path="/admin/regional" element={user?.role === 'regional_officer' ? <RegionalAdminDashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin/master" element={user?.role === 'master_admin' ? <MasterAdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/events" element={<EventsPage user={user} />} />
            <Route path="/chat" element={user ? <ChatRoom user={user} isOpen={true} onClose={() => window.history.back()} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <AnimatePresence>
          {user && isChatOpen && (
            <ChatRoom user={user} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          )}
        </AnimatePresence>

        <BottomNav user={user} onChatOpen={() => setIsChatOpen(true)} />
        
        <footer className="bg-stone-50 border-t border-stone-200 py-12 mt-20 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center gap-2 items-center mb-6">
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">A</div>
              <span className="font-serif font-bold text-lg">ASMIN Uganda</span>
            </div>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              Arise and Shine Ministries International is a registered NGO dedicated to community transformation across Uganda.
            </p>
            <div className="mt-8 pt-8 border-t border-stone-200 text-stone-400 text-xs">
              &copy; {new Date().getFullYear()} ASMIN. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
