import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Lock, Unlock,
  FileText, CheckCircle2, XCircle, Search, Filter,
  Eye, User, DollarSign, Car, Clock, RefreshCw, ZoomIn,
  Building, Fingerprint, Layers, Sliders, ChevronRight,
  TrendingUp, FileSpreadsheet, ArrowUpRight, ArrowDownRight,
  Sparkles, Check, ExternalLink, Sun, Moon, Calendar, X,
  Printer, Download, Plus, Link as LinkIcon, Copy, ArrowRight
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_DEALERSHIPS = [
  { id: 'ALL', name: 'All Dealership Partners' },
  { id: 'Metro Ford Sales', name: 'Metro Ford Sales', activeDeals: 12, status: 'Connected', riskScore: 'Low Risk' },
  { id: 'Apex Exotic Motors', name: 'Apex Exotic Motors', activeDeals: 4, status: 'Flagged', riskScore: 'High Risk' },
  { id: 'Suburban Honda', name: 'Suburban Honda', activeDeals: 8, status: 'Connected', riskScore: 'Medium Risk' }
];

const INITIAL_DEALS = [
  {
    id: 'DEAL-1094',
    client: { name: 'Sarah Jenkins', ssn: '***-**-4892', email: 's.jenkins@example.com' },
    vehicle: '2024 Ford F-150 Lariat',
    vin: '1FTFW1ED4MFC12904',
    dealership: 'Metro Ford Sales',
    financeAmount: 48500,
    statedIncome: 8500,
    status: 'FUNDABLE',
    submittedAt: '2026-08-24',
    verifications: {
      income: { status: 'PASSED', verifiedAmount: 8450, details: 'Verified $8,450/mo average across W-2 Payroll & Gig Income.' },
      id: { status: 'PASSED', score: 99, details: 'AAMVA barcode validated. Facial liveness match: 99.2%.' },
      signature: { status: 'PASSED', score: 100, details: 'Cryptographic signature hash valid. IP geolocated to home address.' }
    }
  },
  {
    id: 'DEAL-1095',
    client: { name: 'Marcus Vance', ssn: '***-**-1102', email: 'mvance88@example.com' },
    vehicle: '2023 BMW M3 Competition',
    vin: 'WBS33AY08NFP88210',
    dealership: 'Apex Exotic Motors',
    financeAmount: 72000,
    statedIncome: 12000,
    status: 'LOCKED',
    submittedAt: '2026-08-20',
    verifications: {
      income: { status: 'FAILED', verifiedAmount: 7200, details: 'Income discrepancy alert: Stated $12,000 vs Verified $7,200.' },
      id: { status: 'PASSED', score: 98, details: 'AAMVA barcode validated.' },
      signature: { status: 'PASSED', score: 97, details: 'Signature captured on mobile browser.' }
    }
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('DASHBOARD');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [dealerships] = useState(INITIAL_DEALERSHIPS);

  // Active Modals & Views
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [activeVerifyDeal, setActiveVerifyDeal] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);
  const [copiedLink, setCopiedLink] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealership, setSelectedDealership] = useState('ALL');

  // New Deal Form State
  const [newDealForm, setNewDealForm] = useState({
    clientName: '',
    email: '',
    ssn: '',
    vehicle: '',
    vin: '',
    dealership: 'Metro Ford Sales',
    financeAmount: '',
    statedIncome: ''
  });

  const theme = {
    bg: isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900',
    sidebar: isDarkMode ? 'bg-[#0F1623] border-slate-800' : 'bg-white border-slate-200',
    header: isDarkMode ? 'bg-[#0F1623]/60 border-slate-800' : 'bg-white/80 border-slate-200',
    card: isDarkMode ? 'bg-[#0F1623] border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    innerCard: isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
    hover: isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            deal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            deal.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDealership = selectedDealership === 'ALL' || deal.dealership === selectedDealership;
      return matchesSearch && matchesDealership;
    });
  }, [deals, searchQuery, selectedDealership]);

  // Handle New Deal Submission
  const handleCreateDeal = (e) => {
    e.preventDefault();
    const newId = `DEAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdDeal = {
      id: newId,
      client: {
        name: newDealForm.clientName || 'Unassigned Client',
        ssn: newDealForm.ssn || '***-**-0000',
        email: newDealForm.email || 'client@example.com'
      },
      vehicle: newDealForm.vehicle || '2026 Vehicle',
      vin: newDealForm.vin || 'VIN-PENDING-123',
      dealership: newDealForm.dealership,
      financeAmount: Number(newDealForm.financeAmount) || 30000,
      statedIncome: Number(newDealForm.statedIncome) || 5000,
      status: 'PENDING_VERIFICATION',
      submittedAt: new Date().toISOString().split('T')[0],
      verifications: {
        income: { status: 'PENDING', verifiedAmount: 0, details: 'Awaiting customer FDX bank connection.' },
        id: { status: 'PENDING', score: 0, details: 'Awaiting AAMVA ID scan and biometric liveness.' },
        signature: { status: 'PENDING', score: 0, details: 'Awaiting PKI digital contract signature.' }
      }
    };

    setDeals([createdDeal, ...deals]);
    setIsAddDealOpen(false);
    setNewDealForm({ clientName: '', email: '', ssn: '', vehicle: '', vin: '', dealership: 'Metro Ford Sales', financeAmount: '', statedIncome: '' });
  };

  const copyVerificationLink = (dealId) => {
    const link = `https://autoverify-pro.vercel.app/verify/${dealId}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(dealId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Run Interactive Step-by-Step Verification Simulation
  const handleSimulateStepPass = (dealId, step) => {
    setDeals(prevDeals => prevDeals.map(d => {
      if (d.id !== dealId) return d;
      const updated = { ...d };
      if (step === 1) {
        updated.verifications.income = {
          status: 'PASSED',
          verifiedAmount: d.statedIncome,
          details: `FDX API verified $${d.statedIncome.toLocaleString()}/mo deposit stream.`
        };
      } else if (step === 2) {
        updated.verifications.id = {
          status: 'PASSED',
          score: 99,
          details: 'Biometric liveness passed. Driver license matched against state database.'
        };
      } else if (step === 3) {
        updated.verifications.signature = {
          status: 'PASSED',
          score: 100,
          details: 'Cryptographic PKI signature logged with IP forensic audit.'
        };
        updated.status = 'FUNDABLE';
      }
      return updated;
    }));

    if (step < 3) {
      setVerificationStep(step + 1);
    } else {
      setTimeout(() => {
        setActiveVerifyDeal(null);
        setVerificationStep(1);
      }, 1200);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-200`}>
      <div className="flex h-screen overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className={`w-64 ${theme.sidebar} border-r flex flex-col justify-between shrink-0`}>
          <div>
            <div className={`p-5 border-b ${theme.border} flex items-center gap-3`}>
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">AUTOVERIFY PRO</h1>
                <p className={`text-[11px] ${theme.textMuted}`}>F&I Risk & Funding Engine</p>
              </div>
            </div>

            <nav className="p-3 space-y-1">
              <button
                onClick={() => { setCurrentPage('DASHBOARD'); setActiveVerifyDeal(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'DASHBOARD' && !activeVerifyDeal ? 'bg-blue-600 text-white shadow-md' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <Car className="w-4 h-4" /> Deal Pipeline
              </button>
              <button
                onClick={() => { setCurrentPage('DEALERSHIPS'); setActiveVerifyDeal(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'DEALERSHIPS' ? 'bg-blue-600 text-white shadow-md' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <Building className="w-4 h-4" /> Dealership Partners
              </button>
            </nav>
          </div>

          <div className="p-3 space-y-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border ${theme.border} ${theme.innerCard} ${theme.textMain} text-xs font-medium`}
            >
              <span className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                {isDarkMode ? 'Dark Theme' : 'Light Theme'}
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`h-16 border-b ${theme.header} px-8 flex items-center justify-between shrink-0`}>
            <h2 className={`text-base font-bold ${theme.textMain}`}>
              {activeVerifyDeal ? `Customer Verification Portal (${activeVerifyDeal.id})` : 'F&I Funding Pipeline'}
            </h2>
            <div className="flex items-center gap-3">
              {!activeVerifyDeal && (
                <button
                  onClick={() => setIsAddDealOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" /> Add New Deal
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* INTERACTIVE CUSTOMER STEP-BY-STEP VERIFICATION PORTAL */}
            {activeVerifyDeal ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className={`p-6 rounded-3xl border ${theme.card} space-y-6 shadow-2xl`}>
                  <div className="flex justify-between items-center border-b pb-4 border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-blue-500 font-mono">STEP-BY-STEP VERIFICATION PORTAL</span>
                      <h3 className="text-lg font-bold text-white">{activeVerifyDeal.client.name}</h3>
                      <p className={`text-xs ${theme.textMuted}`}>{activeVerifyDeal.vehicle} • Financed Amount: ${activeVerifyDeal.financeAmount.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setActiveVerifyDeal(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Exit Portal
                    </button>
                  </div>

                  {/* Verification Step Progress Bar */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-2 rounded-full transition-all ${
                          verificationStep > step || (step === 1 && activeVerifyDeal.verifications.income.status === 'PASSED') || (step === 2 && activeVerifyDeal.verifications.id.status === 'PASSED') || (step === 3 && activeVerifyDeal.verifications.signature.status === 'PASSED')
                            ? 'bg-emerald-500'
                            : verificationStep === step
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* STEP 1: FDX Open Banking */}
                  {verificationStep === 1 && (
                    <div className={`p-6 rounded-2xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-600/10 text-blue-500">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Step 1: Connect Direct Deposit Banking (FDX)</h4>
                          <p className={`text-xs ${theme.textMuted}`}>Verify stated monthly income of ${activeVerifyDeal.statedIncome.toLocaleString()}/mo.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                        {activeVerifyDeal.verifications.income.details}
                      </div>
                      <button
                        onClick={() => handleSimulateStepPass(activeVerifyDeal.id, 1)}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Verify Bank Income Stream
                      </button>
                    </div>
                  )}

                  {/* STEP 2: ID & Biometrics */}
                  {verificationStep === 2 && (
                    <div className={`p-6 rounded-2xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-600/10 text-purple-500">
                          <Fingerprint className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Step 2: State ID Scan & Facial Liveness</h4>
                          <p className={`text-xs ${theme.textMuted}`}>Scan front/back of Driver's License and perform 3D liveness match.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                        {activeVerifyDeal.verifications.id.details}
                      </div>
                      <button
                        onClick={() => handleSimulateStepPass(activeVerifyDeal.id, 2)}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Pass Biometric & ID Verification
                      </button>
                    </div>
                  )}

                  {/* STEP 3: PKI Contract Signature */}
                  {verificationStep === 3 && (
                    <div className={`p-6 rounded-2xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-500">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Step 3: Execute PKI Encrypted e-Signature</h4>
                          <p className={`text-xs ${theme.textMuted}`}>Cryptographically sign financing documents to unlock loan funding.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                        {activeVerifyDeal.verifications.signature.details}
                      </div>
                      <button
                        onClick={() => handleSimulateStepPass(activeVerifyDeal.id, 3)}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Unlock className="w-4 h-4" /> Execute Digital Signature & Complete Deal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : currentPage === 'DASHBOARD' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border ${theme.card} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                  <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search borrower name, deal ID, or vehicle..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${theme.innerCard} border rounded-xl pl-9 pr-4 py-2 text-xs ${theme.textMain} focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <select
                    value={selectedDealership}
                    onChange={(e) => setSelectedDealership(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium ${theme.innerCard} ${theme.textMain} border ${theme.border}`}
                  >
                    {dealerships.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className={`rounded-2xl border ${theme.card} overflow-hidden shadow-xl`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${theme.innerCard} text-[11px] uppercase font-bold text-slate-400 border-b ${theme.border}`}>
                      <tr>
                        <th className="py-4 px-5">Deal & Borrower</th>
                        <th className="py-4 px-5">Vehicle & Finance</th>
                        <th className="py-4 px-5 text-center">FDX Income</th>
                        <th className="py-4 px-5 text-center">Status</th>
                        <th className="py-4 px-5 text-center">Verification Link</th>
                        <th className="py-4 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.border}`}>
                      {filteredDeals.map((deal) => (
                        <tr key={deal.id} className={`${theme.hover} transition-colors`}>
                          <td className="py-4 px-5">
                            <div className="font-bold text-blue-500">{deal.id}</div>
                            <div className={`text-xs font-semibold ${theme.textMain}`}>{deal.client.name}</div>
                            <div className={`text-[10px] ${theme.textMuted}`}>{deal.dealership}</div>
                          </td>
                          <td className="py-4 px-5">
                            <div className={`font-semibold ${theme.textMain}`}>{deal.vehicle}</div>
                            <div className="text-xs text-blue-500 font-bold">${deal.financeAmount.toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              deal.verifications.income.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-500' :
                              deal.verifications.income.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {deal.verifications.income.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              deal.status === 'FUNDABLE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              deal.status === 'PENDING_VERIFICATION' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                              {deal.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => copyVerificationLink(deal.id)}
                                className={`px-2.5 py-1 rounded-lg ${theme.innerCard} border ${theme.border} text-[11px] font-mono flex items-center gap-1 text-slate-300 hover:text-white`}
                              >
                                {copiedLink === deal.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                {copiedLink === deal.id ? 'Copied' : 'Copy Link'}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => { setActiveVerifyDeal(deal); setVerificationStep(1); }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-md"
                            >
                              Open Portal <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 2: DEALERSHIPS */}
            {currentPage === 'DEALERSHIPS' && !activeVerifyDeal && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dealerships.filter(d => d.id !== 'ALL').map((dlr) => (
                  <div key={dlr.id} className={`p-6 rounded-2xl border ${theme.card} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-blue-600/10 text-blue-500">
                        <Building className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        dlr.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {dlr.status}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${theme.textMain}`}>{dlr.name}</h3>
                      <p className={`text-xs ${theme.textMuted}`}>Integration: FDX Direct Webhook v5</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* CREATE NEW DEAL MODAL */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className={`${theme.card} border rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-4 border-slate-800">
              <h3 className="text-base font-bold text-white">Create New Deal Intake</h3>
              <button onClick={() => setIsAddDealOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Borrower Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={newDealForm.clientName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl px-3 py-2 ${theme.textMain} focus:outline-none focus:border-blue-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="david@example.com"
                    value={newDealForm.email}
                    onChange={(e) => setNewDealForm({ ...newDealForm, email: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl px-3 py-2 ${theme.textMain} focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">SSN (Last 4)</label>
                  <input
                    type="text"
                    required
                    placeholder="***-**-5512"
                    value={newDealForm.ssn}
                    onChange={(e) => setNewDealForm({ ...newDealForm, ssn: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl px-3 py-2 ${theme.textMain} focus:outline-none focus:border-blue-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Vehicle Description</label>
                  <input
                    type="text"
                    required
                    placeholder="2025 Tesla Model Y"
                    value={newDealForm.vehicle}
                    onChange={(e) => setNewDealForm({ ...newDealForm, vehicle: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl px-3 py-2 ${theme.textMain} focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Financed Amount ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="42000"
                    value={newDealForm.financeAmount}
                    onChange={(e) => setNewDealForm({ ...newDealForm, financeAmount: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl px-3 py-2 ${theme.textMain} focus:outline-none focus:border-blue-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Stated Monthly Income ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="7500"
                    value={newDealForm.statedIncome}
                    onChange={(e) => setNewDealForm({ ...newDealForm, statedIncome: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl px-3 py-2 ${theme.textMain} focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Dealership</label>
                  <select
                    value={newDealForm.dealership}
                    onChange={(e) => setNewDealForm({ ...newDealForm, dealership: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl px-3 py-2 ${theme.textMain} focus:outline-none focus:border-blue-500`}
                  >
                    {dealerships.filter(d => d.id !== 'ALL').map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDealOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg"
                >
                  Create & Generate Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
