import React, { useState, useEffect } from 'react';
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
  Trash2,
  Edit,
  Send,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-serif text-xl font-semibold tracking-tight hidden sm:block">ASMIN Uganda</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/donations" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Donations</Link>
            <Link to="/branches" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Branches</Link>
            {user ? (
              <>
                {user.role === 'user' && <Link to="/dashboard" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Savings</Link>}
                {user.role === 'regional_officer' && <Link to="/admin/regional" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Branch Admin</Link>}
                {user.role === 'master_admin' && <Link to="/admin/master" className="text-stone-600 hover:text-emerald-700 font-medium transition-colors">Master Admin</Link>}
                <div className="flex items-center gap-4 pl-4 border-l border-stone-200">
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
            <Link to="/donations" onClick={() => setIsOpen(false)} className="text-lg font-medium">Donations</Link>
            <Link to="/branches" onClick={() => setIsOpen(false)} className="text-lg font-medium">Branches</Link>
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
    const res = await fetch('/api/donations');
    const data = await res.json();
    setDonations(data);
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
    fetch('/api/branches').then(res => res.json()).then(setBranches);
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
                <button onClick={() => setIsEditing(true)} className="text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1 mx-auto">
                  <Settings className="w-3 h-3" /> Edit Profile (Officer Only)
                </button>
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
  const [depositAmount, setDepositAmount] = useState('');
  const [manualPayAmount, setManualPayAmount] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchAccount = async () => {
    const res = await fetch(`/api/account/${user.id}`);
    const data = await res.json();
    setAccount(data);
  };

  useEffect(() => { fetchAccount(); }, [user.id]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/account/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: parseFloat(depositAmount) })
    });
    setDepositAmount('');
    fetchAccount();
    setLoading(false);
  };

  const handleToggleAutoPay = async (autoPay: boolean) => {
    await fetch('/api/account/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, autoPay })
    });
    fetchAccount();
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
    fetchAccount();
    setLoading(false);
  };

  if (!account) return <div className="pt-24 text-center">Loading account...</div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-2 space-y-8">
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

        <ConfirmationDialog 
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleManualPay}
          title="Confirm ASMIN Payment"
          message={`Are you sure you want to pay UGX ${parseFloat(manualPayAmount).toLocaleString()} to ASMIN collection? This transaction cannot be undone.`}
        />

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
  const [activeView, setActiveView] = useState<'applications' | 'communication' | 'resources' | 'activities'>('applications');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState({ to: '', content: '' });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState({ name: '', type: 'document' as any, description: '', url: '' });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState({ title: '', description: '' });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedApp, setSelectedApp] = useState<DonationApplication | null>(null);

  const fetchApps = async () => {
    const res = await fetch(`/api/admin/regional/applications/${user.branch_id}`);
    const data = await res.json();
    setApps(data);
  };

  const fetchResources = async () => {
    const res = await fetch(`/api/branches/${user.branch_id}`);
    const data = await res.json();
    setResources(data.resources || []);
    setActivities(data.activities || []);
  };

  useEffect(() => { 
    fetchApps();
    fetchResources();
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
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveView('applications')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeView === 'applications' ? "bg-white shadow-sm" : "text-stone-500")}
          >
            Applications
          </button>
          <button 
            onClick={() => setActiveView('communication')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeView === 'communication' ? "bg-white shadow-sm" : "text-stone-500")}
          >
            Communication Hub
          </button>
          <button 
            onClick={() => setActiveView('resources')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeView === 'resources' ? "bg-white shadow-sm" : "text-stone-500")}
          >
            Resources
          </button>
          <button 
            onClick={() => setActiveView('activities')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeView === 'activities' ? "bg-white shadow-sm" : "text-stone-500")}
          >
            Activities
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
      ) : activeView === 'communication' ? (
        <div className="glass-card p-8">
          <div className="flex gap-8 h-[500px]">
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
                    <div className="bg-stone-50 p-4 rounded-xl border border-dashed border-stone-200">
                      <img src={selectedApp.recommendation_letter} className="w-full h-auto rounded-lg shadow-sm" alt="Recommendation Letter" />
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="font-bold text-stone-900 mb-4 border-b pb-2">Evidence Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {JSON.parse(selectedApp.images).map((img: string, i: number) => (
                        <img key={i} src={img} className="w-full aspect-square object-cover rounded-xl shadow-sm border" alt={`Evidence ${i+1}`} />
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
    </div>
  );
};

const MasterAdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [officers, setOfficers] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
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

  const fetchData = async () => {
    const [res1, res2, res3] = await Promise.all([
      fetch('/api/admin/master/all-activities'),
      fetch('/api/admin/master/officers'),
      fetch('/api/admin/master/branches')
    ]);
    setData(await res1.json());
    setOfficers(await res2.json());
    setBranches(await res3.json());
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

  if (!data) return <div className="pt-24 text-center">Loading master dashboard...</div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-serif font-bold mb-8">Master Admin Dashboard</h2>
      
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

      <div className="mt-16">
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
    </div>
  );
};

const AuthPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
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
        setIsLogin(true);
        alert('Registration successful! Please login.');
      }
    } else {
      setError(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="pt-32 pb-16 flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold mb-2">{isLogin ? 'Welcome Back' : 'Join ASMIN'}</h2>
          <p className="text-stone-500">{isLogin ? 'Manage your savings and support' : 'Start your journey with us today'}</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
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
      <div className="min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        <main>
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
          </Routes>
        </main>
        
        <footer className="bg-stone-50 border-t border-stone-200 py-12 mt-20">
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
