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
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('DASHBOARD');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [dealerships] = useState(INITIAL_DEALERSHIPS);

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [activeVerifyDeal, setActiveVerifyDeal] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);
  const [copiedLink, setCopiedLink] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealership, setSelectedDealership] = useState('ALL');

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
        <aside className={`w-52 ${theme.sidebar} border-r flex flex-col justify-between shrink-0`}>
          <div>
            <div className={`p-4 border-b ${theme.border} flex items-center gap-2`}>
              <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-tight">AUTOVERIFY PRO</h1>
                <p className={`text-[10px] ${theme.textMuted}`}>F&I Risk Engine</p>
              </div>
            </div>

            <nav className="p-2 space-y-1">
              <button
                onClick={() => { setCurrentPage('DASHBOARD'); setActiveVerifyDeal(null); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'DASHBOARD' && !activeVerifyDeal ? 'bg-blue-600 text-white' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <Car className="w-4 h-4" /> Pipeline
              </button>
              <button
                onClick={() => { setCurrentPage('DEALERSHIPS'); setActiveVerifyDeal(null); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'DEALERSHIPS' ? 'bg-blue-600 text-white' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <Building className="w-4 h-4" /> Partners
              </button>
            </nav>
          </div>

          <div className="p-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border ${theme.border} ${theme.innerCard} ${theme.textMain} text-[11px] font-medium`}
            >
              <span>{isDarkMode ? 'Dark' : 'Light'}</span>
              {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`h-14 border-b ${theme.header} px-4 flex items-center justify-between shrink-0`}>
            <h2 className={`text-sm font-bold ${theme.textMain}`}>
              {activeVerifyDeal ? `Verification Portal` : 'F&I Funding Pipeline'}
            </h2>
            {!activeVerifyDeal && (
              <button
                onClick={() => setIsAddDealOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Deal
              </button>
            )}
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {activeVerifyDeal ? (
              <div className="max-w-xl mx-auto space-y-4">
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-4 shadow-xl`}>
                  <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 font-mono">CUSTOMER PORTAL</span>
                      <h3 className="text-sm font-bold text-white">{activeVerifyDeal.client.name}</h3>
                      <p className={`text-[11px] ${theme.textMuted}`}>{activeVerifyDeal.vehicle} • ${activeVerifyDeal.financeAmount.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setActiveVerifyDeal(null)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Exit
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all ${
                          verificationStep > step || (step === 1 && activeVerifyDeal.verifications.income.status === 'PASSED') || (step === 2 && activeVerifyDeal.verifications.id.status === 'PASSED') || (step === 3 && activeVerifyDeal.verifications.signature.status === 'PASSED')
                            ? 'bg-emerald-500'
                            : verificationStep === step
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {verificationStep === 1 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-3`}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-500" />
                        <h4 className="text-xs font-bold text-white">Step 1: Connect Direct Deposit (FDX API)</h4>
                      </div>
                      <p className="text-[11px] text-slate-300">{activeVerifyDeal.verifications.income.details}</p>
                      <button
                        onClick={() => handleSimulateStepPass(activeVerifyDeal.id, 1)}
                        className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify Bank Income
                      </button>
                    </div>
                  )}

                  {verificationStep === 2 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-3`}>
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-purple-500" />
                        <h4 className="text-xs font-bold text-white">Step 2: Biometric Facial Liveness</h4>
                      </div>
                      <p className="text-[11px] text-slate-300">{activeVerifyDeal.verifications.id.details}</p>
                      <button
                        onClick={() => handleSimulateStepPass(activeVerifyDeal.id, 2)}
                        className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass Biometric Match
                      </button>
                    </div>
                  )}

                  {verificationStep === 3 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-3`}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <h4 className="text-xs font-bold text-white">Step 3: PKI Digital Contract Signature</h4>
                      </div>
                      <p className="text-[11px] text-slate-300">{activeVerifyDeal.verifications.signature.details}</p>
                      <button
                        onClick={() => handleSimulateStepPass(activeVerifyDeal.id, 3)}
                        className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Execute Digital Signature
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : currentPage === 'DASHBOARD' && (
              <div className="space-y-4">
                <div className={`p-3 rounded-xl border ${theme.card} flex items-center justify-between gap-2`}>
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search borrower or vehicle..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${theme.innerCard} border rounded-lg pl-8 pr-3 py-1.5 text-xs ${theme.textMain} focus:outline-none`}
                    />
                  </div>
                  <select
                    value={selectedDealership}
                    onChange={(e) => setSelectedDealership(e.target.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs ${theme.innerCard} ${theme.textMain} border ${theme.border}`}
                  >
                    {dealerships.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* MOBILE RESPONSIVE DEAL CARDS & TABLE */}
                <div className="space-y-3">
                  {filteredDeals.map((deal) => (
                    <div key={deal.id} className={`p-4 rounded-xl border ${theme.card} space-y-3 shadow-md`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[11px] font-bold text-blue-500 font-mono">{deal.id}</div>
                          <h3 className="text-xs font-bold text-white">{deal.client.name}</h3>
                          <div className={`text-[10px] ${theme.textMuted}`}>{deal.vehicle} • ${deal.financeAmount.toLocaleString()}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          deal.status === 'FUNDABLE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          deal.status === 'PENDING_VERIFICATION' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {deal.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <button
                          onClick={() => copyVerificationLink(deal.id)}
                          className={`px-2.5 py-1 rounded-lg ${theme.innerCard} border ${theme.border} text-[10px] font-mono flex items-center gap-1 text-slate-300`}
                        >
                          {copiedLink === deal.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedLink === deal.id ? 'Copied Link' : 'Copy Verify Link'}
                        </button>

                        <button
                          onClick={() => { setActiveVerifyDeal(deal); setVerificationStep(1); }}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 shadow"
                        >
                          Open Portal <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'DEALERSHIPS' && !activeVerifyDeal && (
              <div className="grid grid-cols-1 gap-3">
                {dealerships.filter(d => d.id !== 'ALL').map((dlr) => (
                  <div key={dlr.id} className={`p-4 rounded-xl border ${theme.card} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-bold ${theme.textMain}`}>{dlr.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">{dlr.status}</span>
                    </div>
                    <p className={`text-[10px] ${theme.textMuted}`}>Active Deals: {dlr.activeDeals} | Risk: {dlr.riskScore}</p>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`${theme.card} border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-slate-800">
              <h3 className="text-xs font-bold text-white">Create New Deal Intake</h3>
              <button onClick={() => setIsAddDealOpen(false)} className="text-slate-400 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[10px] font-medium mb-1">Borrower Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Fowler"
                  value={newDealForm.clientName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain} focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1">Vehicle</label>
                  <input
                    type="text"
                    required
                    placeholder="2025 Model Y"
                    value={newDealForm.vehicle}
                    onChange={(e) => setNewDealForm({ ...newDealForm, vehicle: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain} focus:outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1">Finance Amount ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="42000"
                    value={newDealForm.financeAmount}
                    onChange={(e) => setNewDealForm({ ...newDealForm, financeAmount: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain} focus:outline-none`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDealOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow"
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
