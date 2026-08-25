import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Lock, Unlock,
  FileText, CheckCircle2, XCircle, Search, Filter,
  Eye, User, DollarSign, Car, Clock, RefreshCw, ZoomIn,
  Building, Fingerprint, Layers, Sliders, ChevronRight,
  TrendingUp, FileSpreadsheet, ArrowUpRight, ArrowDownRight,
  Sparkles, Check, ExternalLink, Sun, Moon, Calendar, X,
  Printer, Download, Activity, Database, Settings
} from 'lucide-react';

// --- MOCK DATABASE DATA ---
const MOCK_DEALERSHIPS = [
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
      income: { status: 'PASSED', verifiedAmount: 8450, variance: -0.0058, source: 'FDX Direct Bank API', details: 'Verified $8,450/mo average across W-2 Payroll & Gig Income.' },
      id: { status: 'PASSED', score: 99, source: 'AAMVA DB + Biometrics', details: 'AAMVA barcode validated. Facial liveness match: 99.2%.' },
      signature: { status: 'PASSED', score: 100, source: 'PKI Timestamp & IP Forensics', details: 'Cryptographic signature hash valid. IP geolocated to home address.' }
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
      income: { status: 'FAILED', verifiedAmount: 7200, variance: -0.4000, source: 'FDX Direct Bank API', details: 'Income discrepancy alert: Stated $12,000 vs Verified $7,200.' },
      id: { status: 'PASSED', score: 98, source: 'AAMVA DB + Biometrics', details: 'AAMVA barcode validated. Facial liveness match: 98.4%.' },
      signature: { status: 'PASSED', score: 97, source: 'PKI Timestamp & IP Forensics', details: 'Signature captured on mobile browser.' }
    }
  },
  {
    id: 'DEAL-1096',
    client: { name: 'Alex Rivera', ssn: '***-**-7741', email: 'arivera@example.com' },
    vehicle: '2025 Honda CR-V Hybrid',
    vin: '7FARW2H84RH091238',
    dealership: 'Suburban Honda',
    financeAmount: 34100,
    statedIncome: 5200,
    status: 'LOCKED',
    submittedAt: '2026-08-15',
    verifications: {
      income: { status: 'PASSED', verifiedAmount: 5150, variance: -0.0096, source: 'FDX Direct Bank API', details: 'Verified via 3 consecutive direct deposits.' },
      id: { status: 'FAILED', score: 42, source: 'OCR Visual Forensics', details: 'FRAUD ALERT: Font misalignment detected in License DOB field.' },
      signature: { status: 'PASSED', score: 96, source: 'PKI Timestamp & IP Forensics', details: 'Signature verified against audit log.' }
    }
  }
];

const INITIAL_AUDIT_LOGS = [
  { id: 'LOG-8801', timestamp: '2026-08-24 19:42:10', event: 'FDX Bank Direct Verification Executed', dealId: 'DEAL-1094', status: 'SUCCESS' },
  { id: 'LOG-8802', timestamp: '2026-08-24 18:15:22', event: 'AAMVA Biometric Match Passed (99.2%)', dealId: 'DEAL-1094', status: 'SUCCESS' },
  { id: 'LOG-8803', timestamp: '2026-08-20 14:02:05', event: 'Income Gate Auto-Lock Triggered (>10% Variance)', dealId: 'DEAL-1095', status: 'WARNING' },
  { id: 'LOG-8804', timestamp: '2026-08-15 09:30:44', event: 'Document Tampering Detected in Drivers License', dealId: 'DEAL-1096', status: 'ALERT' }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('DASHBOARD');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealership, setSelectedDealership] = useState('ALL');

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
                <p className={`text-[11px] ${theme.textMuted}`}>F&I Compliance Suite</p>
              </div>
            </div>

            <nav className="p-3 space-y-1">
              <button
                onClick={() => setCurrentPage('DASHBOARD')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <Car className="w-4 h-4" /> Deal Pipeline
              </button>
              <button
                onClick={() => setCurrentPage('DEALERSHIPS')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'DEALERSHIPS' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <Building className="w-4 h-4" /> Dealership Partners
              </button>
              <button
                onClick={() => setCurrentPage('AUDIT_LOGS')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'AUDIT_LOGS' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Audit & Compliance Logs
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
              {currentPage === 'DASHBOARD' && 'F&I Funding Pipeline'}
              {currentPage === 'DEALERSHIPS' && 'Dealer Network Management'}
              {currentPage === 'AUDIT_LOGS' && 'System Audit Trail'}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Engine Active
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* PAGE 1: DASHBOARD */}
            {currentPage === 'DASHBOARD' && (
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
                    {MOCK_DEALERSHIPS.map(d => (
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
                        <th className="py-4 px-5 text-center">FDX Income Gate</th>
                        <th className="py-4 px-5 text-center">ID Liveness</th>
                        <th className="py-4 px-5 text-center">Status</th>
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
                              deal.verifications.income.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {deal.verifications.income.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              deal.verifications.id.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {deal.verifications.id.status} ({deal.verifications.id.score}%)
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              deal.status === 'FUNDABLE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                              {deal.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => setSelectedDeal(deal)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-md"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspect
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
            {currentPage === 'DEALERSHIPS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_DEALERSHIPS.filter(d => d.id !== 'ALL').map((dlr) => (
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
                    <div className={`p-3 rounded-xl ${theme.innerCard} border ${theme.border} text-xs space-y-1.5`}>
                      <div className="flex justify-between">
                        <span className={theme.textMuted}>Active Pipeline Deals:</span>
                        <span className="font-bold text-blue-500">{dlr.activeDeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.textMuted}>Dealer Risk Category:</span>
                        <span className="font-bold text-slate-300">{dlr.riskScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGE 3: AUDIT LOGS */}
            {currentPage === 'AUDIT_LOGS' && (
              <div className={`rounded-2xl border ${theme.card} overflow-hidden shadow-xl`}>
                <table className="w-full text-left text-xs">
                  <thead className={`${theme.innerCard} text-[11px] uppercase font-bold text-slate-400 border-b ${theme.border}`}>
                    <tr>
                      <th className="py-4 px-5">Log ID & Time</th>
                      <th className="py-4 px-5">System Event</th>
                      <th className="py-4 px-5">Deal Ref</th>
                      <th className="py-4 px-5 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border}`}>
                    {INITIAL_AUDIT_LOGS.map((log) => (
                      <tr key={log.id} className={`${theme.hover} transition-colors`}>
                        <td className="py-4 px-5">
                          <div className="font-mono font-bold text-blue-500">{log.id}</div>
                          <div className={`text-[10px] ${theme.textMuted}`}>{log.timestamp}</div>
                        </td>
                        <td className={`py-4 px-5 font-semibold ${theme.textMain}`}>{log.event}</td>
                        <td className="py-4 px-5 font-mono text-slate-400">{log.dealId}</td>
                        <td className="py-4 px-5 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                            log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className={`${theme.card} border rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-4 border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Deal Inspection: {selectedDeal.id}</h3>
                <p className={`text-xs ${theme.textMuted}`}>{selectedDeal.client.name} • {selectedDeal.vehicle}</p>
              </div>
              <button onClick={() => setSelectedDeal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-2`}>
                <div className="flex justify-between text-xs">
                  <span className={theme.textMuted}>FDX Income Verification Details:</span>
                  <span className="font-bold text-emerald-500">${selectedDeal.verifications.income.verifiedAmount}/mo</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedDeal.verifications.income.details}</p>
              </div>

              <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-2`}>
                <div className="flex justify-between text-xs">
                  <span className={theme.textMuted}>ID & Facial Biometrics Check:</span>
                  <span className="font-bold text-blue-500">{selectedDeal.verifications.id.score}% Match</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedDeal.verifications.id.details}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDeal(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
