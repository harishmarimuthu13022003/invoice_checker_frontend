import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  History, 
  PieChart, 
  Menu,
  Bell,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileSearch,
  ShieldCheck,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { invoiceApi } from './api';

// Component definitions
const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState('Administrator');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({
    total_invoices: 0,
    approved: 0,
    pending: 0,
    flagged: 0
  });

  const roles = [
    { name: 'Administrator', icon: <ShieldCheck />, desc: 'Full System Control' },
    { name: 'Supplier', icon: <Upload />, desc: 'Invoice Upload & Tracking' },
    { name: 'Finance Officer', icon: <FileText />, desc: 'Approval & Category Management' },
    { name: 'Technical Monitor', icon: <History />, desc: 'Audit Logs & RAG Performance' }
  ];

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['Administrator', 'Supplier', 'Finance Officer'] },
    { id: 'upload', icon: <Upload size={20} />, label: 'Upload Invoice', roles: ['Administrator', 'Supplier'] },
    { id: 'invoices', icon: <FileText size={20} />, label: 'My Invoices', roles: ['Administrator', 'Supplier', 'Finance Officer'] },
    { id: 'requests', icon: <Plus size={20} />, label: 'Category Requests', roles: ['Administrator', 'Finance Officer'] },
    { id: 'audit', icon: <History size={20} />, label: 'Audit Logs', roles: ['Administrator', 'Technical Monitor'] },
    { id: 'codes', icon: <FileSearch size={20} />, label: 'Service Codes', roles: ['Administrator', 'Technical Monitor'] },
    { id: 'stats', icon: <PieChart size={20} />, label: 'RAG Stats', roles: ['Administrator', 'Technical Monitor'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  const fetchData = async () => {
    if (!loggedIn) return;
    setLoading(true);
    
    // Set role header synchronously
    api.defaults.headers['X-Role'] = role;

    try {
      const [invRes, reqRes] = await Promise.all([
        invoiceApi.getInvoices(),
        role === 'Administrator' || role === 'Finance Officer' ? invoiceApi.getCategoryRequests('Pending') : Promise.resolve({ data: [] })
      ]);
      setInvoices(invRes.data);
      setRequests(reqRes.data);
      
      setStats({
        total_invoices: invRes.data.length,
        approved: invRes.data.filter((i: any) => i.status === 'Approved').length,
        pending: invRes.data.filter((i: any) => i.status.includes('Pending')).length,
        flagged: invRes.data.flatMap((i: any) => i.line_items || []).filter((li: any) => li.flagged).length
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loggedIn) {
      fetchData();
      if (!filteredMenu.find(i => i.id === activeTab)) {
        setActiveTab(filteredMenu.length > 0 ? filteredMenu[0].id : 'dashboard');
      }
    }
  }, [role, loggedIn]);

  const handleLogin = (selectedRole: string) => {
    setRole(selectedRole);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setActiveTab('dashboard');
  };

  if (!loggedIn) {
    return (
      <div className="app-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.15), transparent)'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass" 
          style={{ 
            padding: '40px', 
            maxWidth: '500px', 
            width: '90%', 
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--primary)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InvoMap AI</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Select your portal access to continue</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {roles.map((r) => (
              <button 
                key={r.name}
                onClick={() => handleLogin(r.name)}
                className="btn btn-ghost"
                style={{ 
                  flexDirection: 'column', 
                  padding: '24px', 
                  height: 'auto', 
                  gap: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}
              >
                <div style={{ color: 'var(--primary)' }}>{r.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{r.desc}</div>
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '32px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            &copy; 2026 InvoMap AI - Advanced Invoice Mapping System
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <motion.aside 
        className="sidebar glass" 
        animate={{ width: sidebarOpen ? '260px' : '80px' }}
        style={{ 
          margin: '16px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--primary)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <ShieldCheck color="white" />
          </div>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>InvoMap AI</span>}
        </div>

        <nav style={{ flex: 1, padding: '10px' }}>
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="btn btn-ghost"
              style={{
                width: '100%',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: '12px',
                padding: '14px',
                marginBottom: '8px',
                background: activeTab === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: activeTab === item.id ? 'var(--text-main)' : 'var(--text-muted)',
                borderColor: activeTab === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
              {activeTab === item.id && sidebarOpen && (
                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className="btn btn-ghost" 
            style={{ width: '100%', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '12px' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button 
            className="btn btn-ghost" 
            style={{ width: '100%', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '12px', color: '#ef4444' }}
            onClick={handleLogout}
          >
            <X size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px', position: 'relative' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px',
          marginBottom: '24px',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{menuItems.find(i => i.id === activeTab)?.label}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Role: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{role}</span></p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{role}</span>
            </div>
            <button className="btn btn-ghost" style={{ padding: '10px' }} onClick={fetchData}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Bell size={20} />}
            </button>
            <div style={{ height: '30px', width: '1px', background: 'var(--glass-border)' }} />
            <div className="flex items-center gap-2">
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={18} color="white" />
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                <p style={{ fontWeight: 600 }}>{role} Portal</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Authorized Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ padding: '0 24px 40px 24px' }}
          >
            {activeTab === 'dashboard' && <DashboardView invoices={invoices} stats={stats} />}
            {activeTab === 'upload' && <UploadView onUploadSuccess={fetchData} />}
            
            {/* INVOICES VIEW - Filtered for Roles */}
            {activeTab === 'invoices' && (
              role === 'Administrator' ? 
              <AdminInvoiceView invoices={invoices} /> : 
              role === 'Finance Officer' ? 
              <FinanceReviewView invoices={invoices} onAction={fetchData} /> :
              <InvoicesView invoices={invoices} />
            )}
            
            {activeTab === 'requests' && <RequestsView requests={requests} onAction={fetchData} />}
            
            {activeTab === 'audit' && <TechnicalMonitorView />}
            {activeTab === 'codes' && <ServiceCodesView />}
            {activeTab === 'stats' && <RagStatsView />}

            {/* Other views placeholder */}
            {!['dashboard', 'upload', 'invoices', 'requests', 'audit', 'codes', 'stats'].includes(activeTab) && (
              <div className="card glass flex items-center justify-center" style={{ height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                  <Clock size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                  <h3>Module Under Construction</h3>
                  <p style={{ color: 'var(--text-muted)' }}>The {activeTab} module will be available soon.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- View Components ---

const DashboardView = ({ invoices, stats }: any) => (
  <div className="col gap-4">
    <div className="dashboard-grid">
      <StatCard icon={<FileText color="var(--primary)" />} title="Total Invoices" value={stats.total_invoices} trend="+12.5%" />
      <StatCard icon={<CheckCircle2 color="var(--success)" />} title="Approved" value={stats.approved} trend="+8.2%" />
      <StatCard icon={<Clock color="var(--warning)" />} title="Pending Approval" value={stats.pending} trend="-2.4%" />
      <StatCard icon={<AlertTriangle color="var(--danger)" />} title="Flagged (AI)" value={stats.flagged} trend="+4" />
    </div>

    <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
      <div className="card glass" style={{ flex: 2, minWidth: '400px' }}>
        <div className="flex justify-between items-center mb-6">
          <h3>Recent Upload Activity</h3>
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>View All <ArrowUpRight size={14} /></button>
        </div>
        <div className="col gap-2">
          {invoices.slice(0, 5).map((inv: any) => (
            <div key={inv.invoice_id} className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <div className="flex items-center gap-4">
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>{inv.invoice_id}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{inv.gender || 'Unknown'} • {new Date(inv.uploaded_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>${inv.total_amount?.toFixed(2) || '0.00'}</span>
                <span style={{ 
                  background: inv.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                  color: inv.status === 'Approved' ? 'var(--success)' : 'var(--warning)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card glass" style={{ flex: 1, minWidth: '300px' }}>
        <h3>AI Performance Tracker</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>RAG Confidence & Extraction</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ProgressItem label="PDF Content Extraction" percent={98} color="var(--primary)" />
          <ProgressItem label="Line Item Recognition" percent={92} color="var(--accent)" />
          <ProgressItem label="Service Code RAG Match" percent={85} color="var(--success)" />
          <ProgressItem label="Gender Determination" percent={80} color="var(--secondary)" />
        </div>
      </div>
    </div>
  </div>
);

// ADMIN SPECIFIC VIEW - DETAILED TABLE
const AdminInvoiceView = ({ invoices }: any) => {
  const [filterGender, setFilterGender] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const flattenedItems = invoices.flatMap((inv: any) => 
    (inv.line_items || []).map((item: any) => ({
      ...item,
      invoice_id: inv.invoice_id,
      gender: inv.gender,
      status: inv.status,
      date: inv.uploaded_at
    }))
  );

  const categories = ['All', ...new Set(flattenedItems.map((i: any) => i.category || 'General'))] as string[];

  const filteredItems = flattenedItems.filter((item: any) => {
    const matchGender = filterGender === 'All' || item.gender === filterGender;
    const matchCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      item.invoice_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchGender && matchCategory && matchSearch;
  });

  // Sort by date (descending) so newest are at the top
  const sortedItems = [...filteredItems].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="card glass">
      <div className="flex justify-between items-center mb-8">
        <h3>Master Invoice Item List</h3>
        <div className="flex gap-4">
          <select className="glass" style={{ padding: '8px', border: 'none', color: 'white' }} value={filterGender} onChange={e => setFilterGender(e.target.value)}>
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unknown">Unknown</option>
          </select>
          <select className="glass" style={{ padding: '8px', border: 'none', color: 'white' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Search descriptions..." 
            className="glass" 
            style={{ padding: '8px 16px', border: 'none', color: 'white' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <th style={{ padding: '16px', textAlign: 'left' }}>Service Code</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Invoice No</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Gender</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 700 }}>{item.suggested_code}</td>
                <td style={{ padding: '16px', fontWeight: 600 }}>{item.invoice_id}</td>
                <td style={{ padding: '16px' }}>{item.category || 'General'}</td>
                <td style={{ padding: '16px' }}>{item.description}</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>${item.amount?.toFixed(2) || '0.00'}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>{item.gender}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ color: item.status === 'Approved' ? 'var(--success)' : 'var(--warning)' }}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// FINANCE OFFICER VIEW - APPROVAL FLOW
const FinanceReviewView = ({ invoices, onAction }: any) => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/invoices/${id}/approve`);
      onAction();
      setSelectedInvoice(null);
      alert('Invoice approved successfully!');
    } catch (e) { alert('Approval failed'); }
  };

  return (
    <div className="flex gap-6">
      <div className="card glass" style={{ flex: 1 }}>
        <h3>Pending Approvals</h3>
        <div className="col gap-3 mt-4">
          {invoices.filter((i: any) => i.status !== 'Approved').map((inv: any) => (
            <button 
              key={inv.invoice_id} 
              className={`btn btn-ghost ${selectedInvoice?.invoice_id === inv.invoice_id ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'space-between', padding: '16px', background: selectedInvoice?.invoice_id === inv.invoice_id ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              onClick={() => setSelectedInvoice(inv)}
            >
              <div className="flex gap-4">
                <FileText size={20} color="var(--warning)" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 600 }}>{inv.invoice_id}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(inv.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span style={{ fontWeight: 700 }}>${inv.total_amount?.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 2 }}>
        {selectedInvoice ? (
          <div className="card glass">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2>Invoice: {selectedInvoice.invoice_id}</h2>
                <p style={{ color: 'var(--text-muted)' }}>Client: <span style={{ color: 'white' }}>{selectedInvoice.gender} Account</span></p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={() => handleApprove(selectedInvoice.invoice_id)}>Approve Full Invoice</button>
                <button className="btn btn-ghost" style={{ color: 'var(--danger)' }}>Reject</button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Suggested Category</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selectedInvoice.line_items || []).map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '12px' }}>{item.description}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                        {item.suggested_code}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>${item.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card glass flex items-center justify-center" style={{ height: '300px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Select an invoice to review line items</p>
          </div>
        )}
      </div>
    </div>
  );
};

// TECHNICAL MONITOR VIEW - SYSTEM LOGS & AI PERFORMANCE
const TechnicalMonitorView = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/audit-logs').then(res => {
      setLogs(res.data);
    });
  }, []);

  return (
    <div className="col gap-6">
      <div className="dashboard-grid">
        <StatCard icon={<ShieldCheck color="var(--primary)" />} title="Avg Conf Score" value="89.4%" trend="+2.1%" />
        <StatCard icon={<PieChart color="var(--accent)" />} title="Total Extraction" value={logs.length} trend="+15" />
        <StatCard icon={<TrendingUp color="var(--success)" />} title="RAG Hit Rate" value="94.2%" trend="+0.5%" />
      </div>

      <div className="card glass">
        <h3>System AI Performance Logs</h3>
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Timestamp</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Invoice Reference</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Details / Metadata</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '12px' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      background: log.action.includes('Upload') ? 'rgba(79, 70, 229, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: log.action.includes('Upload') ? 'var(--primary)' : 'var(--success)'
                    }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{log.invoice_id}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{log.details}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                      <div style={{ width: '85%', height: '100%', background: 'var(--success)', borderRadius: '2px' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const StatCard = ({ icon, title, value, trend }: any) => (
  <div className="card glass">
    <div className="flex justify-between items-start mb-4">
      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>{icon}</div>
      <span style={{ 
        fontSize: trend ? '0.8rem' : '0', 
        color: trend?.startsWith('+') ? 'var(--success)' : 'var(--danger)',
        background: trend ? (trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'transparent',
        padding: '2px 8px',
        borderRadius: '8px'
      }}>{trend || ''}</span>
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</p>
    <h1 style={{ fontSize: '2rem' }}>{value}</h1>
  </div>
);

const ProgressItem = ({ label, percent, color }: any) => (
  <div>
    <div className="flex justify-between mb-2">
      <span style={{ fontSize: '0.85rem' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{percent}%</span>
    </div>
    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${percent}%` }} 
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: '4px' }}
      />
    </div>
  </div>
);

const UploadView = ({ onUploadSuccess }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await invoiceApi.upload(file);
      onUploadSuccess();
      setFile(null);
      alert('Invoice uploaded! Processing line items and extracting gender from client name...');
    } catch (e) { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="col gap-6 items-center justify-center" style={{ height: '500px' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
          <Upload size={36} color="var(--primary)" />
        </div>
        <h2>Supplier Portal: Upload Invoice</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>AI will extract PDF text, generate embeddings with TF-IDF, and map descriptions into the vector store as service codes.</p>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" style={{ display: 'none' }} />
        <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '16px', padding: '40px', background: file ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255, 255, 255, 0.02)', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
          {file ? <p>{file.name}</p> : <p>Click to select PDF</p>}
        </div>
        <button className="btn btn-primary mt-6" style={{ width: '100%' }} onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : 'Process PDF -> RAG -> Vector DB'}
        </button>
      </div>
    </div>
  );
};

const InvoicesView = ({ invoices }: any) => (
  <div className="card glass">
    <div className="flex justify-between items-center mb-6">
      <h3>Invoice Status Dashboard</h3>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time updates from Finance & Admin</span>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <th style={{ padding: '16px' }}>Invoice ID</th>
            <th style={{ padding: '16px' }}>Client Gender</th>
            <th style={{ padding: '16px' }}>Uploaded</th>
            <th style={{ padding: '16px' }}>Total Amount</th>
            <th style={{ padding: '16px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv: any) => (
            <tr key={inv.invoice_id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '16px', fontWeight: 600 }}>{inv.invoice_id}</td>
              <td style={{ padding: '16px' }}>{inv.gender || 'Unknown'}</td>
              <td style={{ padding: '16px' }}>{new Date(inv.uploaded_at).toLocaleDateString()}</td>
              <td style={{ padding: '16px', fontWeight: 700 }}>${inv.total_amount?.toFixed(2)}</td>
              <td style={{ padding: '16px' }}>
                <span style={{ color: inv.status === 'Approved' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{inv.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RequestsView = ({ requests, onAction }: any) => (
  <div className="card glass">
    <h3>Category Review Queue</h3>
    <div className="col gap-4 mt-6">
      {requests.map((req: any) => (
        <div key={req._id} className="p-4 glass rounded flex items-center justify-between">
          <div>
            <h4 style={{ color: 'var(--primary)' }}>Suggesting: "{req.suggested_category}"</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From Item: {req.description}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={async () => { await invoiceApi.approveCategoryRequest(req._id); onAction(); }}>Approve</button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ServiceCodesView = () => (
  <div className="card glass">
    <h3>Master Service Code Management</h3>
    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Manage the central list of NDIS service categories and code mappings.</p>
    <div className="col gap-2">
      <div className="p-4 glass rounded flex justify-between">
        <div>
          <p style={{ fontWeight: 600 }}>Domestic Assistance</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>01_020_0120_1_1</p>
        </div>
        <button className="btn btn-ghost btn-sm">Edit</button>
      </div>
      <div className="p-4 glass rounded flex justify-between">
        <div>
          <p style={{ fontWeight: 600 }}>Personal Care</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>01_011_0107_1_1</p>
        </div>
        <button className="btn btn-ghost btn-sm">Edit</button>
      </div>
    </div>
  </div>
);

const RagStatsView = () => (
  <div className="card glass">
    <h3>RAG Engine Performance Monitor</h3>
    <div className="p-6 mt-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
      <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Extraction Accuracy: <span style={{ color: 'var(--success)' }}>94.2%</span></p>
      <div className="flex gap-8">
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Chunks</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>8,241</p>
        </div>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Avg Latency</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>1.2s</p>
        </div>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Vector Recall</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>98.1%</p>
        </div>
      </div>
    </div>
  </div>
);

export default App;
