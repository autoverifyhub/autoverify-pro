import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Lock, Unlock,
  FileText, CheckCircle2, XCircle, Search, Filter,
  Eye, User, DollarSign, Car, Clock, RefreshCw, ZoomIn,
  Building, Fingerprint, Layers, Sliders, ChevronRight,
  TrendingUp, FileSpreadsheet, ArrowUpRight, ArrowDownRight,
  Sparkles, Check, ExternalLink, Sun, Moon, Calendar, X,
  Download, Printer
} from 'lucide-react';

// --- MOCK DATABASE DATA ---
const MOCK_DEALERSHIPS = [
  { id: 'ALL', name: 'All Dealership Partners' },
  { id: 'Metro Ford Sales', name: 'Metro Ford Sales' },
  { id: 'Apex Exotic Motors', name: 'Apex Exotic Motors' },
  { id: 'Suburban Honda', name: 'Suburban Honda' }
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
    submittedAtDisplay: '12 mins ago',
    verifications: {
      income: {
        status: 'PASSED',
        verifiedAmount: 8450,
        variance: -0.0058,
        source: 'FDX Direct Bank API',
        lastUpdated: '10 mins ago',
        details: 'Verified $8,450/mo average across W-2 Payroll ($7,200) & Uber Gig Income ($1,250).',
        streams: [
          { type: 'W-2 Payroll', entity: 'TechCorp Inc', amount: 7200, cadence: 'Bi-Weekly', verified: true },
          { type: '1099 Gig', entity: 'Uber Technologies', amount: 1250, cadence: 'Weekly', verified: true }
        ]
      },
      id: {
        status: 'PASSED',
        score: 99,
        source: 'AAMVA DB + Biometric Liveness',
        lastUpdated: '12 mins ago',
        details: 'AAMVA barcode validated. Facial liveness match: 99.2%. No synthetic identity risk.'
      },
      signature: {
        status: 'PASSED',
        score: 100,
        source: 'PKI Timestamp & IP Forensics',
        lastUpdated: '15 mins ago',
        details: 'Cryptographic signature hash valid. IP geolocated to home address (No VPN/Proxy).'
      }
    },
    documents: [
      { id: 'DOC-1', name: 'Drivers_License_Front.jpg', type: 'ID', verified: true, score: 99 },
      { id: 'DOC-2', name: 'FDX_Bank_Ledger_90d.pdf', type: 'INCOME', verified: true, score: 98 },
      { id: 'DOC-3', name: 'Retail_Installment_Contract.pdf', type: 'CONTRACT', verified: true, score: 100 }
    ]
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
    submittedAtDisplay: '4 days ago',
    verifications: {
      income: {
        status: 'FAILED',
        verifiedAmount: 7200,
        variance: -0.4000,
        source: 'FDX Direct Bank API',
        lastUpdated: '4 days ago',
        details: 'Income discrepancy alert: Stated $12,000 vs Verified $7,200. Exceeds 10% threshold.',
        streams: [
          { type: 'W-2 Payroll', entity: 'Apex Logistics LLC', amount: 7200, cadence: 'Bi-Weekly', verified: true }
        ]
      },
      id: {
        status: 'PASSED',
        score: 98,
        source: 'AAMVA DB + Biometric Liveness',
        lastUpdated: '4 days ago',
        details: 'AAMVA barcode validated. Facial liveness match: 98.4%.'
      },
      signature: {
        status: 'PASSED',
        score: 97,
        source: 'PKI Timestamp & IP Forensics',
        lastUpdated: '4 days ago',
        details: 'Signature captured on mobile browser. Geolocation matches application address.'
      }
    },
    documents: [
      { id: 'DOC-4', name: 'Drivers_License_Front.jpg', type: 'ID', verified: true, score: 98 },
      { id: 'DOC-5', name: 'FDX_Bank_Ledger_90d.pdf', type: 'INCOME', verified: false, score: 45, flag: 'Income Variance > 10%' }
    ]
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
    submittedAtDisplay: '9 days ago',
    verifications: {
      income: {
        status: 'PASSED',
        verifiedAmount: 5150,
        variance: -0.0096,
        source: 'FDX Direct Bank API',
        lastUpdated: '9 days ago',
        details: 'Verified via 3 consecutive direct deposits from State Health Authority.',
        streams: [
          { type: 'W-2 Payroll', entity: 'State Health Authority', amount: 5150, cadence: 'Monthly', verified: true }
        ]
      },
      id: {
        status: 'FAILED',
        score: 42,
        source: 'OCR Visual Forensics',
        lastUpdated: '9 days ago',
        details: 'FRAUD ALERT: Font misalignment detected in License DOB field. Document tampered.'
      },
      signature: {
        status: 'PASSED',
        score: 96,
        source: 'PKI Timestamp & IP Forensics',
        lastUpdated: '9 days ago',
        details: 'Signature verified against audit log.'
      }
    },
    documents: [
      { id: 'DOC-6', name: 'DL_Scanned_Copy.jpg', type: 'ID', verified: false, score: 42, flag: 'Font & DOB Tampering' },
      { id: 'DOC-7', name: 'Paystub_Aug_2026.pdf', type: 'INCOME', verified: true, score: 96 }
    ]
  }
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [printReportDeal, setPrintReportDeal] = useState(null);
  
  // Interactive Filter States
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealership, setSelectedDealership] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');

  // Modal inspection states
  const [inspectionModalTab, setInspectionModalTab] = useState('OVERVIEW');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  // Dynamic Theme Tokens
  const theme = {
    bg: isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900',
    sidebar: isDarkMode ? 'bg-[#0F1623] border-slate-800/80' : 'bg-white border-slate-200',
    header: isDarkMode ? 'bg-[#0F1623]/60 border-slate-800/80' : 'bg-white/80 border-slate-200',
    card: isDarkMode ? 'bg-[#0F1623] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm',
    innerCard: isDarkMode ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    border: isDarkMode ? 'border-slate-800/80' : 'border-slate-200',
    hover: isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100',
    modalBg: isDarkMode ? 'bg-[#0F1623] border-slate-800' : 'bg-white border-slate-200',
    modalHeader: isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200',
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesTab = activeTab === 'ALL' || deal.status === activeTab;
      const matchesSearch = deal.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            deal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            deal.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDealership = selectedDealership === 'ALL' || deal.dealership === selectedDealership;

      const dealDate = new Date(deal.submittedAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const matchesDate = (!start || dealDate >= start) && (!end || dealDate <= end);

      return matchesTab && matchesSearch && matchesDealership && matchesDate;
    });
  }, [deals, activeTab, searchQuery, selectedDealership, startDate, endDate]);

  const stats = useMemo(() => {
    return {
      total: filteredDeals.length,
      fundable: filteredDeals.filter(d => d.status === 'FUNDABLE').length,
      locked: filteredDeals.filter(d => d.status === 'LOCKED').length,
      fundedVolume: filteredDeals.filter(d => d.status === 'FUNDABLE' || d.status === 'FUNDED')
                                 .reduce((acc, d) => acc + d.financeAmount, 0)
    };
  }, [filteredDeals]);

  const handleExportCSV = () => {
    const headers = [
      'Deal ID', 'Client Name', 'Dealership', 'Vehicle', 'VIN',
      'Finance Amount ($)', 'Stated Monthly ($)', 'Verified Monthly ($)',
      'Income Variance (%)', 'Income Gate', 'ID Gate Score',
      'Signature Gate Score', 'Funding Status', 'Submitted Date'
    ];

    const rows = filteredDeals.map(d => [
      d.id, `"${d.client.name}"`, `"${d.dealership}"`, `"${d.vehicle}"`, d.vin,
      d.financeAmount, d.statedIncome, d.verifications.income.verifiedAmount,
      (d.verifications.income.variance * 100).toFixed(2) + '%',
      d.verifications.income.status, d.verifications.id.score,
      d.verifications.signature.score, d.status, d.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Compliance_Audit_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setActiveTab('ALL');
    setSearchQuery('');
    setSelectedDealership('ALL');
    setStartDate('2026-08-01');
    setEndDate('2026-08-31');
  };

  const handleFundingRelease = (dealId) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'FUNDED' } : d));
    setFundingSuccess(true);
    setTimeout(() => {
      setFundingSuccess(false);
      setSelectedDeal(null);
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans antialiased selection:bg-blue-500 selection:text-white transition-colors duration-200`}>
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`w-64 ${theme.sidebar} border-r flex flex-col justify-between shrink-0 transition-colors duration-200`}>
          <div>
            <div className={`p-5 border-b ${theme.border} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h1 className={`text-sm font-bold tracking-tight ${theme.textMain} flex items-center gap-1.5`}>
                    AUTOVERIFY <span className="bg-blue-500/10 text-blue-500 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">PRO</span>
                  </h1>
                  <p className={`text-[11px] ${theme.textMuted}`}>Automotive F&I Risk Engine</p>
                </div>
              </div>
            </div>

            <nav className="p-3 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-500 border border-blue-500/20 text-xs font-semibold">
                <Car className="w-4 h-4" /> Deal Pipeline
              </button>
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${theme.textMuted} ${theme.hover} text-xs font-medium transition-colors`}>
                <Building className="w-4 h-4" /> Dealership Partners
              </button>
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${theme.textMuted} ${theme.hover} text-xs font-medium transition-colors`}>
                <FileSpreadsheet className="w-4 h-4" /> Audit & Compliance Logs
              </button>
            </nav>
          </div>

          <div className="p-3 m-3 space-y-3">
            <div className={`p-3 rounded-xl ${theme.innerCard} text-xs space-y-2`}>
              <div className="flex items-center justify-between text-slate-400">
                <span className={`font-medium ${theme.textMuted}`}>FDX Open Banking:</span>
                <span className="flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                </span>
              </div>
              <div className={`text-[10px] ${theme.textMuted}`}>
                FDX v5.0 API PKCE Handshake Online
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border ${theme.border} ${theme.innerCard} ${theme.textMain} text-xs font-medium transition-all`}
            >
              <span className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                {isDarkMode ? 'Dark Theme' : 'Light Theme'}
              </span>
              <span className={`text-[10px] ${theme.textMuted} uppercase tracking-wider font-semibold`}>
                Toggle
              </span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`h-16 border-b ${theme.header} backdrop-blur-md px-8 flex items-center justify-between shrink-0 transition-colors duration-200`}>
            <div className="flex items-center gap-4">
              <h2 className={`text-base font-bold ${theme.textMain}`}>F&I Funding Compliance Workspace</h2>
              <span className={`text-xs ${theme.textMuted}`}>|</span>
              <span className={`text-xs ${theme.textMuted}`}>Strict Gate Enforcement Active</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button className={`p-2 rounded-lg ${theme.innerCard} ${theme.hover} ${theme.textMain} transition-colors`}>
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-500 flex items-center justify-center font-bold text-xs">
                JD
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SaaSKpiCard
                title="Active Pipeline Volume"
                value={`$${(stats.fundedVolume / 1000).toFixed(1)}k`}
                subtitle="Filtered verification volume"
                trend="+12.4%"
                trendUp={true}
                icon={<DollarSign className="w-5 h-5 text-blue-500" />}
                theme={theme}
              />
              <SaaSKpiCard
                title="Fundable Deals (Passed)"
                value={stats.fundable}
                subtitle="100% 3-Gate Compliance"
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                theme={theme}
              />
              <SaaSKpiCard
                title="Locked Fraud / Variance"
                value={stats.locked}
                subtitle="Auto-Gated pre-funding"
                icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
                theme={theme}
              />
              <SaaSKpiCard
                title="Filtered Deal Count"
                value={stats.total}
                subtitle="Deals matching filters"
                icon={<Clock className="w-5 h-5 text-indigo-500" />}
                theme={theme}
              />
            </div>

            <div className={`p-4 rounded-2xl border ${theme.card} space-y-4`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className={`flex items-center gap-1 ${theme.innerCard} p-1 rounded-xl border ${theme.border}`}>
                  {['ALL', 'FUNDABLE', 'LOCKED', 'FUNDED'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : `${theme.textMuted} hover:${theme.textMain}`
                      }`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={selectedDealership}
                      onChange={(e) => setSelectedDealership(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium ${theme.innerCard} ${theme.textMain} border ${theme.border} focus:outline-none focus:border-blue-500`}
                    >
                      {MOCK_DEALERSHIPS.map(dlr => (
                        <option key={dlr.id} value={dlr.id}>{dlr.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium ${theme.innerCard} ${theme.textMain} border ${theme.border} focus:outline-none focus:border-blue-500`}
                    />
                    <span className={`text-xs ${theme.textMuted}`}>to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium ${theme.innerCard} ${theme.textMain} border ${theme.border} focus:outline-none focus:border-blue-500`}
                    />
                  </div>

                  <button
                    onClick={handleResetFilters}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${theme.innerCard} ${theme.textMuted} hover:${theme.textMain} border ${theme.border} flex items-center gap-1.5 transition-colors`}
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search client name, deal ID, VIN, or vehicle model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${theme.innerCard} border rounded-xl pl-9 pr-4 py-2 text-xs ${theme.textMain} placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                />
              </div>
            </div>

            <div className={`rounded-2xl border ${theme.card} overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${theme.innerCard} text-[11px] uppercase font-bold tracking-wider ${theme.textMuted} border-b ${theme.border}`}>
                    <tr>
                      <th className="py-4 px-5">Deal & Borrower</th>
                      <th className="py-4 px-5">Vehicle & Finance</th>
                      <th className="py-4 px-5 text-center">FDX Income</th>
                      <th className="py-4 px-5 text-center">ID / Biometrics</th>
                      <th className="py-4 px-5 text-center">Signature Audit</th>
                      <th className="py-4 px-5 text-center">Gate Status</th>
                      <th className="py-4 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border}`}>
                    {filteredDeals.length > 0 ? (
                      filteredDeals.map((deal) => (
                        <tr key={deal.id} className={`${theme.hover} transition-colors`}>
                          <td className="py-4 px-5">
                            <div className={`font-bold ${theme.textMain} flex items-center gap-2`}>
                              {deal.id}
                              <span className={`text-[10px] font-normal ${theme.textMuted} font-mono`}>({deal.client.ssn})</span>
                            </div>
                            <div className={`text-xs font-semibold ${theme.textMain} mt-0.5`}>{deal.client.name}</div>
                            <div className={`text-[10px] ${theme.textMuted}`}>{deal.dealership} • Submitted {deal.submittedAt}</div>
                          </td>

                          <td className="py-4 px-5">
                            <div className={`font-semibold ${theme.textMain}`}>{deal.vehicle}</div>
                            <div className={`text-[10px] ${theme.textMuted} font-mono`}>VIN: {deal.vin}</div>
                            <div className="text-xs text-blue-500 font-bold mt-0.5">
                              ${deal.financeAmount.toLocaleString()}
                            </div>
                          </td>

                          <td className="py-4 px-5 text-center">
                            <SaaSVerificationBadge status={deal.verifications.income.status} label="FDX INCOME" />
                            <div className={`text-[10px] ${theme.textMuted} mt-1`}>
                              Stated: ${deal.statedIncome.toLocaleString()} | Verified: ${deal.verifications.income.verifiedAmount.toLocaleString()}
                            </div>
                          </td>

                          <td className="py-4 px-5 text-center">
                            <SaaSVerificationBadge status={deal.verifications.id.status} label="ID LIVENESS" />
                            <div className={`text-[10px] ${theme.textMuted} mt-1`}>
                              Score: {deal.verifications.id.score}/100
                            </div>
                          </td>

                          <td className="py-4 px-5 text-center">
                            <SaaSVerificationBadge status={deal.verifications.signature.status} label="PKI SIG" />
                            <div className={`text-[10px] ${theme.textMuted} mt-1`}>
                              Score: {deal.verifications.signature.score}/100
                            </div>
                          </td>

                          <td className="py-4 px-5 text-center">
                            <SaaSStatusBadge status={deal.status} />
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPrintReportDeal(deal)}
                                className={`p-1.5 rounded-lg ${theme.innerCard} ${theme.textMuted} hover:${theme.textMain} border transition-all`}
                                title="Print Compliance Summary"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setSelectedDeal(deal); setInspectionModalTab('OVERVIEW'); }}
                                className={`px-3 py-1.5 rounded-xl ${theme.innerCard} text-blue-500 hover:text-blue-600 font-semibold text-xs inline-flex items-center gap-1 border transition-all`}
                              >
                                <Eye className="w-3.5 h-3.5" /> Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className={`py-12 text-center ${theme.textMuted}`}>
                          No deals found matching the selected dealership, date range, or search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className={`${theme.modalBg} border rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl my-8 transition-colors`}>
            <div className={`px-8 py-5 border-b ${theme.border} ${theme.modalHeader} flex items-center justify-between`}>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-bold ${theme.textMain}`}>Deal Inspection Workspace: {selectedDeal.id}</h3>
                  <SaaSStatusBadge status={selectedDeal.status} />
                </div>
                <p className={`text-xs ${theme.textMuted} mt-1`}>
                  Borrower: <span className={`${theme.textMain} font-medium`}>{selectedDeal.client.name}</span> | Dealership: <span className={`${theme.textMain} font-medium`}>{selectedDeal.dealership}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedDeal(null)}
                className={`p-2 rounded-xl ${theme.innerCard} ${theme.textMuted} hover:${theme.textMain}`}
              >
                ✕
              </button>
            </div>

            <div className={`px-8 border-b ${theme.border} ${theme.modalHeader} flex items-center gap-6 text-xs font-semibold`}>
              <button
                onClick={() => setInspectionModalTab('OVERVIEW')}
                className={`py-3.5 border-b-2 transition-colors ${
                  inspectionModalTab === 'OVERVIEW' ? 'border-blue-500 text-blue-500' : `border-transparent ${theme.textMuted}`
                }`}
              >
                Verification Gates Overview
              </button>
              <button
                onClick={() => setInspectionModalTab('FORENSICS')}
                className={`py-3.5 border-b-2 transition-colors ${
                  inspectionModalTab === 'FORENSICS' ? 'border-blue-500 text-blue-500' : `border-transparent ${theme.textMuted}`
                }`}
              >
                Forensic Document Inspector
              </button>
              <button
                onClick={() => setInspectionModalTab('FDX_INCOME')}
                className={`py-3.5 border-b-2 transition-colors ${
                  inspectionModalTab === 'FDX_INCOME' ? 'border-blue-500 text-blue-500' : `border-transparent ${theme.textMuted}`
                }`}
              >
                FDX Multi-Stream Income Breakdown
              </button>
            </div>

            <div className="p-8 max-h-[65vh] overflow-y-auto">
              {inspectionModalTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="text-xs text-blue-600 dark:text-blue-200 leading-relaxed">
                      <strong className={theme.textMain}>Strict Funding Policy:</strong> All 3 verification gates (FDX Income, ID Liveness, Signature PKI) must pass before loan release is unlocked.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl ${theme.innerCard} border space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${theme.textMuted} flex items-center gap-1.5`}>
                          <DollarSign className="w-4 h-4 text-emerald-500" /> Gate 1: Income
                        </span>
                        <SaaSVerificationBadge status={selectedDeal.verifications.income.status} label="FDX" />
                      </div>
                      <div className={`text-xs space-y-1.5 pt-2 border-t ${theme.border}`}>
                        <div className={`flex justify-between ${theme.textMuted}`}>
                          <span>Stated Income:</span>
                          <span className={`${theme.textMain} font-mono`}>${selectedDeal.statedIncome.toLocaleString()}</span>
                        </div>
                        <div className={`flex justify-between ${theme.textMuted}`}>
                          <span>FDX Verified:</span>
                          <span className={`${theme.textMain} font-mono`}>${selectedDeal.verifications.income.verifiedAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className={`text-[11px] ${theme.textMuted} leading-relaxed`}>
                        {selectedDeal.verifications.income.details}
                      </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${theme.innerCard} border space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${theme.textMuted} flex items-center gap-1.5`}>
                          <Fingerprint className="w-4 h-4 text-blue-500" /> Gate 2: ID Liveness
                        </span>
                        <SaaSVerificationBadge status={selectedDeal.verifications.id.status} label="AAMVA" />
                      </div>
                      <div className={`text-xs space-y-1.5 pt-2 border-t ${theme.border}`}>
                        <div className={`flex justify-between ${theme.textMuted}`}>
                          <span>Biometric Score:</span>
                          <span className={`${theme.textMain} font-mono`}>{selectedDeal.verifications.id.score}/100</span>
                        </div>
                        <div className={`flex justify-between ${theme.textMuted}`}>
                          <span>AAMVA Check:</span>
                          <span className="text-emerald-500 font-semibold">VALIDATED</span>
                        </div>
                      </div>
                      <p className={`text-[11px] ${theme.textMuted} leading-relaxed`}>
                        {selectedDeal.verifications.id.details}
                      </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${theme.innerCard} border space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${theme.textMuted} flex items-center gap-1.5`}>
                          <FileText className="w-4 h-4 text-purple-500" /> Gate 3: Signature
                        </span>
                        <SaaSVerificationBadge status={selectedDeal.verifications.signature.status} label="PKI" />
                      </div>
                      <div className={`text-xs space-y-1.5 pt-2 border-t ${theme.border}`}>
                        <div className={`flex justify-between ${theme.textMuted}`}>
                          <span>Authenticity:</span>
                          <span className={`${theme.textMain} font-mono`}>{selectedDeal.verifications.signature.score}/100</span>
                        </div>
                        <div className={`flex justify-between ${theme.textMuted}`}>
                          <span>IP Geolocation:</span>
                          <span className={`${theme.textMain} font-mono`}>Matched</span>
                        </div>
                      </div>
                      <p className={`text-[11px] ${theme.textMuted} leading-relaxed`}>
                        {selectedDeal.verifications.signature.details}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {inspectionModalTab === 'FORENSICS' && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between ${theme.innerCard} p-3 rounded-xl border text-xs`}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setZoomLevel(prev => Math.max(prev - 25, 75))} className={`p-1 rounded ${theme.card}`}>
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <span className={`font-mono ${theme.textMain}`}>{zoomLevel}%</span>
                      <button onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))} className={`p-1 rounded ${theme.card}`}>
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className={`flex items-center gap-1.5 ${theme.textMain} cursor-pointer`}>
                        <input type="checkbox" checked={showOverlays} onChange={(e) => setShowOverlays(e.target.checked)} className="rounded" />
                        <Layers className="w-3.5 h-3.5 text-blue-500" /> Fraud Hotspots
                      </label>
                      <label className={`flex items-center gap-1.5 ${theme.textMain} cursor-pointer`}>
                        <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} className="rounded" />
                        <Sliders className="w-3.5 h-3.5 text-purple-500" /> Pixel Heatmap
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${theme.innerCard} p-4 rounded-xl border text-center`}>
                      <span className="text-xs font-bold text-rose-500 block mb-2">SUBMITTED CLIENT DOCUMENT</span>
                      <div className="relative overflow-hidden border rounded-lg">
                        <img
                          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
                          alt="Submitted Document"
                          className={`w-full ${showHeatmap ? 'contrast-200 hue-rotate-90' : ''}`}
                        />
                        {showOverlays && (
                          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 p-2 rounded bg-rose-500/80 text-white font-bold text-[10px] animate-pulse">
                            Font Misalignment Detected
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`${theme.innerCard} p-4 rounded-xl border text-center`}>
                      <span className="text-xs font-bold text-emerald-500 block mb-2">VERIFIED STATE TEMPLATE</span>
                      <div className="border rounded-lg overflow-hidden opacity-80">
                        <img
                          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
                          alt="Template"
                          className="w-full grayscale"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {inspectionModalTab === 'FDX_INCOME' && (
                <div className="space-y-4">
                  <h4 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>Itemized Direct Deposit Income Streams</h4>
                  <div className="space-y-2">
                    {selectedDeal.verifications.income.streams?.map((stream, idx) => (
                      <div key={idx} className={`p-4 rounded-xl ${theme.innerCard} border flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${theme.textMain}`}>{stream.entity}</div>
                            <div className={`text-[10px] ${theme.textMuted}`}>{stream.type} • {stream.cadence} Pay Cycle</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-emerald-500">+${stream.amount.toLocaleString()}/mo</div>
                          <span className={`text-[10px] ${theme.textMuted} font-semibold`}>100% Bank Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`px-8 py-5 border-t ${theme.border} ${theme.modalHeader} flex items-center justify-between`}>
              <div>
                <span className={`text-xs ${theme.textMuted}`}>Decision Lock Engine:</span>
                <div className="text-xs font-bold">
                  {selectedDeal.status === 'FUNDABLE' ? (
                    <span className="text-emerald-500">Ready for automated funding release.</span>
                  ) : (
                    <span className="text-rose-500">Deal locked. Gate failures present.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className={`px-4 py-2 rounded-xl ${theme.innerCard} text-xs font-semibold ${theme.textMain} transition-colors`}
                >
                  Close
                </button>

                <button
                  disabled={selectedDeal.status !== 'FUNDABLE'}
                  onClick={() => handleFundingRelease(selectedDeal.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    selectedDeal.status === 'FUNDABLE'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : `${theme.innerCard} ${theme.textMuted} cursor-not-allowed`
                  }`}
                >
                  {fundingSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Funding Released!
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" /> Release Loan Funding
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE COMPLIANCE SUMMARY REPORT MODAL */}
      {printReportDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 space-y-6 shadow-2xl print:p-0 print:shadow-none">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">AutoVerify Pro - Executive Compliance Certificate</h2>
                <p className="text-xs text-slate-500">Generated: {new Date().toLocaleDateString()} | Deal Reference: {printReportDeal.id}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  printReportDeal.status === 'FUNDABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  STATUS: {printReportDeal.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <strong className="block text-slate-500 font-medium">Borrower Name:</strong>
                <span className="font-bold text-slate-900 text-sm">{printReportDeal.client.name} ({printReportDeal.client.ssn})</span>
              </div>
              <div>
                <strong className="block text-slate-500 font-medium">Dealership Partner:</strong>
                <span className="font-bold text-slate-900 text-sm">{printReportDeal.dealership}</span>
              </div>
              <div>
                <strong className="block text-slate-500 font-medium">Vehicle Description:</strong>
                <span className="font-semibold text-slate-800">{printReportDeal.vehicle}</span>
              </div>
              <div>
                <strong className="block text-slate-500 font-medium">Financed Amount:</strong>
                <span className="font-bold text-blue-600 text-sm">${printReportDeal.financeAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Gate Audit Verification Log</h3>
              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border-b">Verification Gate</th>
                    <th className="p-2.5 border-b text-center">Score / Check</th>
                    <th className="p-2.5 border-b text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5">Gate 1: FDX Open Banking Income</td>
                    <td className="p-2.5 text-center font-mono">Stated: ${printReportDeal.statedIncome} vs Verified: ${printReportDeal.verifications.income.verifiedAmount}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">{printReportDeal.verifications.income.status}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Gate 2: AAMVA ID & Biometric Liveness</td>
                    <td className="p-2.5 text-center font-mono">{printReportDeal.verifications.id.score}/100 Match Score</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">{printReportDeal.verifications.id.status}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Gate 3: PKI Cryptographic Signature</td>
                    <td className="p-2.5 text-center font-mono">{printReportDeal.verifications.signature.score}/100 Authenticity</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">{printReportDeal.verifications.signature.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t pt-4 border-slate-200 print:hidden">
              <button
                onClick={() => setPrintReportDeal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Printer className="w-4 h-4" /> Print / Save to PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaaSKpiCard({ title, value, subtitle, trend, trendUp, icon, theme }) {
  return (
    <div className={`p-5 rounded-2xl ${theme.card} shadow-lg space-y-2 relative overflow-hidden transition-colors`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${theme.textMuted}`}>{title}</span>
        <div className={`p-2 rounded-xl ${theme.innerCard}`}>{icon}</div>
      </div>
      <div className={`text-2xl font-black ${theme.textMain}`}>{value}</div>
      <div className="flex items-center justify-between text-[11px] pt-1">
        <span className={theme.textMuted}>{subtitle}</span>
        {trend && (
          <span className={`font-semibold flex items-center gap-0.5 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function SaaSStatusBadge({ status }) {
  switch (status) {
    case 'FUNDABLE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Unlock className="w-3 h-3" /> FUNDABLE
        </span>
      );
    case 'LOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <Lock className="w-3 h-3" /> LOCKED
        </span>
      );
    case 'FUNDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <CheckCircle2 className="w-3 h-3" /> FUNDED
        </span>
      );
    default:
      return null;
  }
}

function SaaSVerificationBadge({ status, label }) {
  if (status === 'PASSED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> {label} PASS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
      <XCircle className="w-3 h-3" /> {label} FAIL
    </span>
  );
}
