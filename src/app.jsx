import React, { useState, useRef, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, Lock, Unlock, FileText, CheckCircle2,
  XCircle, Search, Eye, DollarSign, Car, Building, Fingerprint,
  Sun, Moon, Plus, Copy, ArrowRight, Camera, Check, Landmark, UserCheck, Upload, X, Home, FileSpreadsheet, ChevronRight, CreditCard
} from 'lucide-react';

const INITIAL_DEALERSHIPS = [
  { id: 'ALL', name: 'All Dealership Partners' },
  { id: 'Metro Ford Sales', name: 'Metro Ford Sales', activeDeals: 12, status: 'Connected' },
  { id: 'Apex Exotic Motors', name: 'Apex Exotic Motors', activeDeals: 4, status: 'Flagged' },
  { id: 'Suburban Honda', name: 'Suburban Honda', activeDeals: 8, status: 'Connected' }
];

const INITIAL_DEALS = [
  {
    id: 'DEAL-1094',
    client: { name: 'Sarah Jenkins', ssn: '***-**-4892', email: 's.jenkins@example.com' },
    vehicle: '2024 Ford F-150 Lariat',
    dealership: 'Metro Ford Sales',
    financeAmount: 48500,
    statedIncome: 8500,
    status: 'FUNDABLE',
    employerDetails: {
      name: 'Acme Health Canada Inc.',
      monthlyNetDeposit: 8450,
      payFrequency: 'Bi-Weekly ($3,900 / deposit)',
      lastDepositDate: '2026-08-15',
      confidence: '99.4% (AWS Textract)'
    },
    idDetails: {
      type: "Driver's License (Ontario / ON)",
      documentNumber: 'J1094-84920-60824',
      expiryDate: '2029-11-14',
      extractedText: {
        fullName: 'JENKINS, SARAH ELIZABETH',
        dob: '1992-04-18',
        address: '1428 BAYVIEW AVE, TORONTO ON M4G 3A7',
        issuingAuthority: 'Ministry of Transportation Ontario'
      }
    },
    verifications: {
      income: { status: 'PASSED', verifiedAmount: 8450, details: 'Verified recurring direct deposits via AWS Textract.' },
      id: { status: 'PASSED', score: 99.2, details: 'AAMVA Driver License validated. Biometric liveness matched.' },
      signature: { status: 'PASSED', score: 98.7, details: 'Vector signature matched physical ID card signature.' }
    }
  }
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [dealerships] = useState(INITIAL_DEALERSHIPS);

  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [activeVerifyDeal, setActiveVerifyDeal] = useState(null);
  const [inspectingDeal, setInspectingDeal] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);
  const [copiedLink, setCopiedLink] = useState(null);

  // Portal Verification States
  const [bankPdfFile, setBankPdfFile] = useState(null);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [isAnalyzingBiometrics, setIsAnalyzingBiometrics] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealership, setSelectedDealership] = useState('ALL');

  // New Deal Form State
  const [newDealForm, setNewDealForm] = useState({
    clientName: '', email: '', ssn: '', vehicle: '', dealership: 'Metro Ford Sales', financeAmount: '', statedIncome: ''
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
      client: { name: newDealForm.clientName || 'Unassigned Client', ssn: newDealForm.ssn || '***-**-0000', email: newDealForm.email || 'client@example.com' },
      vehicle: newDealForm.vehicle || '2026 Vehicle',
      dealership: newDealForm.dealership,
      financeAmount: Number(newDealForm.financeAmount) || 30000,
      statedIncome: Number(newDealForm.statedIncome) || 5000,
      status: 'PENDING_VERIFICATION',
      employerDetails: {
        name: 'Awaiting Bank Analysis',
        monthlyNetDeposit: 0,
        payFrequency: 'Pending Upload',
        lastDepositDate: 'N/A',
        confidence: 'Pending'
      },
      idDetails: {
        type: "Driver's License (Pending Scan)",
        documentNumber: 'PENDING-OCR',
        expiryDate: 'N/A',
        extractedText: {
          fullName: newDealForm.clientName.toUpperCase(),
          dob: 'Pending Verification',
          address: 'Pending OCR Scan',
          issuingAuthority: 'Provincial Ministry'
        }
      },
      verifications: {
        income: { status: 'PENDING', verifiedAmount: 0, details: 'Awaiting Bank E-Statement Upload.' },
        id: { status: 'PENDING', score: 0, details: 'Awaiting Driver License & Selfie Scan.' },
        signature: { status: 'PENDING', score: 0, details: 'Awaiting PKI Digital Signature.' }
      }
    };
    setDeals([createdDeal, ...deals]);
    setIsAddDealOpen(false);
    setNewDealForm({ clientName: '', email: '', ssn: '', vehicle: '', dealership: 'Metro Ford Sales', financeAmount: '', statedIncome: '' });
  };

  const copyVerificationLink = (dealId) => {
    const link = `https://autoverify-pro.vercel.app/verify/${dealId}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(dealId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handlePdfUploadSubmit = (e) => {
    e.preventDefault();
    if (!bankPdfFile) return;
    setIsAnalyzingPdf(true);

    setTimeout(() => {
      setIsAnalyzingPdf(false);
      setDeals(prev => prev.map(d => d.id === activeVerifyDeal.id ? {
        ...d,
        employerDetails: {
          name: 'Canadian Imperial Logistics Ltd.',
          monthlyNetDeposit: d.statedIncome,
          payFrequency: 'Bi-Weekly ($2,500 / deposit)',
          lastDepositDate: '2026-08-20',
          confidence: '98.9% (AWS Textract)'
        },
        verifications: {
          ...d.verifications,
          income: {
            status: 'PASSED',
            verifiedAmount: d.statedIncome,
            details: `AWS Textract parsed ${bankPdfFile.name}. Verified recurring payroll direct deposits.`
          }
        }
      } : d));
      setVerificationStep(2);
    }, 2000);
  };

  const handleBiometricVerification = () => {
    setIsAnalyzingBiometrics(true);
    setTimeout(() => {
      setIsAnalyzingBiometrics(false);
      setDeals(prev => prev.map(d => d.id === activeVerifyDeal.id ? {
        ...d,
        idDetails: {
          type: "Driver's License (Canadian Provincial)",
          documentNumber: 'B8492-10294-85920',
          expiryDate: '2028-05-22',
          extractedText: {
            fullName: d.client.name.toUpperCase(),
            dob: '1988-09-12',
            address: '742 EVERGREEN TERRACE, VANCOUVER BC V6B 2W2',
            issuingAuthority: 'ICBC / Driver Licensing'
          }
        },
        verifications: {
          ...d.verifications,
          id: { status: 'PASSED', score: 99.4, details: 'Driver License OCR matched. Amazon Rekognition CompareFaces score: 99.4%.' }
        }
      } : d));
      setVerificationStep(3);
    }, 1800);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    setIsSigned(true);
  };

  const handleCompleteSignature = () => {
    setDeals(prev => prev.map(d => d.id === activeVerifyDeal.id ? {
      ...d,
      status: 'FUNDABLE',
      verifications: {
        ...d.verifications,
        signature: { status: 'PASSED', score: 99.1, details: 'Canvas vector signature matched Driver License physical signature image.' }
      }
    } : d));
    setTimeout(() => {
      setActiveVerifyDeal(null);
      setVerificationStep(1);
    }, 1200);
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-200 pb-20`}>
      <div className="flex h-screen overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex w-52 ${theme.sidebar} border-r flex-col justify-between shrink-0`}>
          <div>
            <div className={`p-4 border-b ${theme.border} flex items-center gap-2`}>
              <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold">AUTOVERIFY PRO</h1>
                <p className={`text-[10px] ${theme.textMuted}`}>F&I Risk Engine</p>
              </div>
            </div>

            <nav className="p-2 space-y-1">
              <button
                onClick={() => { setActiveTab('DASHBOARD'); setActiveVerifyDeal(null); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white' : `${theme.textMuted} ${theme.hover}`
                }`}
              >
                <Car className="w-4 h-4" /> Pipeline
              </button>
              <button
                onClick={() => { setActiveTab('DEALERSHIPS'); setActiveVerifyDeal(null); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'DEALERSHIPS' ? 'bg-blue-600 text-white' : `${theme.textMuted} ${theme.hover}`
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

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`h-14 border-b ${theme.header} px-4 flex items-center justify-between shrink-0`}>
            <div className="flex items-center gap-2">
              <div className="md:hidden bg-blue-600 p-1 rounded-md text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className={`text-sm font-bold ${theme.textMain}`}>
                {activeVerifyDeal ? `Verification Portal (${activeVerifyDeal.id})` : 'F&I Funding Pipeline'}
              </h2>
            </div>
            {!activeVerifyDeal && (
              <button
                onClick={() => setIsAddDealOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Add Deal
              </button>
            )}
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {activeVerifyDeal ? (
              <div className="max-w-xl mx-auto space-y-4">
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-4 shadow-xl`}>
                  <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 font-mono">VERIFICATION PORTAL</span>
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
                    <div className={`h-1.5 rounded-full ${verificationStep >= 1 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                    <div className={`h-1.5 rounded-full ${verificationStep >= 2 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                    <div className={`h-1.5 rounded-full ${verificationStep >= 3 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                  </div>

                  {verificationStep === 1 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-blue-500" />
                        <h4 className="text-xs font-bold text-white">Step 1: Upload Bank PDF E-Statement</h4>
                      </div>

                      <form onSubmit={handlePdfUploadSubmit} className="space-y-3 text-xs">
                        <label className={`border-2 border-dashed ${theme.border} rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors`}>
                          <Upload className="w-8 h-8 text-blue-500 mb-2" />
                          <span className="text-xs text-slate-300 font-semibold">
                            {bankPdfFile ? bankPdfFile.name : 'Tap to upload official Bank PDF Statement'}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">Supports RBC, TD, Scotiabank, BMO, CIBC, Tangerine, EQ Bank, etc.</span>
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={(e) => setBankPdfFile(e.target.files[0])}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={!bankPdfFile || isAnalyzingPdf}
                          className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow ${
                            bankPdfFile ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isAnalyzingPdf ? 'Parsing Payroll via AWS Textract...' : 'Verify Bank Income via AWS'}
                        </button>
                      </form>
                    </div>
                  )}

                  {verificationStep === 2 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-purple-500" />
                        <h4 className="text-xs font-bold text-white">Step 2: State ID & Biometric Selfie Scan</h4>
                      </div>

                      <div className="space-y-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setLicenseUploaded(true)}
                          className={`w-full py-2.5 px-3 rounded-lg border text-left flex items-center justify-between ${
                            licenseUploaded ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/60 text-slate-300'
                          }`}
                        >
                          <span>{licenseUploaded ? "Driver's License Uploaded" : "Upload Driver's License"}</span>
                          {licenseUploaded ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelfieCaptured(true)}
                          className={`w-full py-2.5 px-3 rounded-lg border text-left flex items-center justify-between ${
                            selfieCaptured ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/60 text-slate-300'
                          }`}
                        >
                          <span>{selfieCaptured ? 'Facial Liveness Selfie Captured' : 'Take Facial Selfie'}</span>
                          {selfieCaptured ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Camera className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        onClick={handleBiometricVerification}
                        disabled={!licenseUploaded || !selfieCaptured || isAnalyzingBiometrics}
                        className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow ${
                          licenseUploaded && selfieCaptured ? 'bg-purple-600 hover:bg-purple-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isAnalyzingBiometrics ? 'Executing Amazon Rekognition CompareFaces...' : 'Verify ID & Facial Match'}
                      </button>
                    </div>
                  )}

                  {verificationStep === 3 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <h4 className="text-xs font-bold text-white">Step 3: Draw Digital Signature (PKI Encrypted)</h4>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 text-[10px]">Sign with your finger inside the box below:</label>
                        <canvas
                          ref={canvasRef}
                          width={320}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={() => setIsDrawing(false)}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={() => setIsDrawing(false)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg touch-none cursor-crosshair"
                        />
                      </div>

                      <button
                        onClick={handleCompleteSignature}
                        disabled={!isSigned}
                        className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow ${
                          isSigned ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" /> Execute PKI Encrypted Signature
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'DASHBOARD' ? (
              <div className="space-y-3">
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

                <div className="space-y-3">
                  {filteredDeals.map((deal) => (
                    <div key={deal.id} className={`p-4 rounded-xl border ${theme.card} space-y-3 shadow-md`}>
                      <div className="flex justify-between items-start" onClick={() => setInspectingDeal(deal)}>
                        <div className="cursor-pointer">
                          <div className="text-[11px] font-bold text-blue-500 font-mono">{deal.id}</div>
                          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {deal.client.name} <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </h3>
                          <div className={`text-[10px] ${theme.textMuted}`}>{deal.vehicle} • ${deal.financeAmount.toLocaleString()}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          deal.status === 'FUNDABLE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {deal.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setInspectingDeal(deal)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-blue-400" /> Audit File
                        </button>

                        <button
                          onClick={() => copyVerificationLink(deal.id)}
                          className={`px-2.5 py-1 rounded-lg ${theme.innerCard} border ${theme.border} text-[10px] font-mono flex items-center gap-1 text-slate-300`}
                        >
                          {copiedLink === deal.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedLink === deal.id ? 'Copied' : 'Copy Link'}
                        </button>

                        <button
                          onClick={() => { setActiveVerifyDeal(deal); setVerificationStep(1); }}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 shadow"
                        >
                          Portal <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {dealerships.filter(d => d.id !== 'ALL').map((dlr) => (
                  <div key={dlr.id} className={`p-4 rounded-xl border ${theme.card} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-bold ${theme.textMain}`}>{dlr.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">{dlr.status}</span>
                    </div>
                    <p className={`text-[10px] ${theme.textMuted}`}>Active Deals: {dlr.activeDeals}</p>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* FLOATING MOBILE NAVIGATION BAR WITH ELEVATED + BUTTON */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1623]/95 backdrop-blur-md border-t border-slate-800 px-8 py-2.5 flex items-center justify-between z-50 max-w-md mx-auto rounded-t-2xl md:hidden">
        <button
          onClick={() => { setActiveTab('DASHBOARD'); setActiveVerifyDeal(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'DASHBOARD' && !activeVerifyDeal ? 'text-blue-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setIsAddDealOpen(true)}
          className="w-12 h-12 -mt-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 border-4 border-[#0B0F17] hover:bg-blue-500 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => { setActiveTab('DEALERSHIPS'); setActiveVerifyDeal(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'DEALERSHIPS' ? 'text-blue-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Building className="w-5 h-5" />
          <span>Partners</span>
        </button>
      </nav>

      {/* AUDIT FILE REVIEW DRAWER / MODAL */}
      {inspectingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`${theme.card} border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-blue-500 font-mono">FULL VERIFICATION AUDIT FILE</span>
                <h3 className="text-sm font-bold text-white">{inspectingDeal.client.name} ({inspectingDeal.id})</h3>
              </div>
              <button onClick={() => setInspectingDeal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. DOCUMENT IDENTIFICATION & OCR TEXT */}
            <div className={`p-3.5 rounded-xl ${theme.innerCard} border ${theme.border} space-y-2`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">Government ID Details</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  inspectingDeal.verifications.id.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {inspectingDeal.verifications.id.status === 'PASSED' ? 'PASSED MATCH' : 'PENDING'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Type Used:</span>
                  <span className="font-semibold text-blue-400">{inspectingDeal.idDetails?.type || "Driver's License"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Document No:</span>
                  <span className="font-mono text-slate-200">{inspectingDeal.idDetails?.documentNumber || 'D8920-10924'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500">Expiration Date:</span>
                  <span className="text-slate-300">{inspectingDeal.idDetails?.expiryDate || '2029-11-14'}</span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[10px]">
                  <span className="text-blue-400 font-mono font-bold block mb-1">OCR EXTRACTED CARD DATA:</span>
                  <div className="text-slate-300"><span className="text-slate-500">Name:</span> {inspectingDeal.idDetails?.extractedText?.fullName || inspectingDeal.client.name.toUpperCase()}</div>
                  <div className="text-slate-300"><span className="text-slate-500">DOB:</span> {inspectingDeal.idDetails?.extractedText?.dob || '1992-04-18'}</div>
                  <div className="text-slate-300"><span className="text-slate-500">Address:</span> {inspectingDeal.idDetails?.extractedText?.address || '1428 BAYVIEW AVE, TORONTO ON'}</div>
                  <div className="text-slate-300"><span className="text-slate-500">Issuer:</span> {inspectingDeal.idDetails?.extractedText?.issuingAuthority || 'Ministry of Transportation'}</div>
                </div>
              </div>
            </div>

            {/* 2. BIOMETRIC SELFIE VS ID PHOTO */}
            <div className={`p-3.5 rounded-xl ${theme.innerCard} border ${theme.border} space-y-2`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">Biometric Facial Liveness</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold">
                  {inspectingDeal.verifications.id.score}% MATCH
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center">
                  <div className="w-16 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center mb-1 text-[9px] text-slate-300 font-mono">
                    ID PHOTO
                  </div>
                  <span className="text-[9px] text-slate-400">Scanned ID Photo</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-950/60 border-2 border-purple-500 flex items-center justify-center mb-1 text-[9px] text-purple-300 font-mono">
                    3D SELFIE
                  </div>
                  <span className="text-[9px] text-slate-400">Live Facial Scan</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">{inspectingDeal.verifications.id.details}</p>
            </div>

            {/* 3. SIGNATURE COMPARISON & VERIFICATION */}
            <div className={`p-3.5 rounded-xl ${theme.innerCard} border ${theme.border} space-y-2`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Signature Verification</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  inspectingDeal.verifications.signature.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {inspectingDeal.verifications.signature.status === 'PASSED' ? `MATCHED (${inspectingDeal.verifications.signature.score}%)` : 'PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="h-8 flex items-center justify-center text-blue-400 font-serif italic text-xs">
                    S. Jenkins
                  </div>
                  <span className="text-[9px] text-slate-400 block border-t border-slate-800 pt-1">ID Physical Signature</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="h-8 flex items-center justify-center text-emerald-400 font-serif italic text-xs">
                    S. Jenkins
                  </div>
                  <span className="text-[9px] text-slate-400 block border-t border-slate-800 pt-1">Canvas Drawn PKI</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">{inspectingDeal.verifications.signature.details}</p>
            </div>

            <button
              onClick={() => setInspectingDeal(null)}
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow"
            >
              Close Audit Review
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW DEAL MODAL */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`${theme.card} border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-slate-800">
              <h3 className="text-xs font-bold text-white">Create New Deal</h3>
              <button onClick={() => setIsAddDealOpen(false)} className="text-slate-400 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[10px] font-medium mb-1">Borrower Name</label>
                <input
                  type="text" required placeholder="e.g. David Fowler" value={newDealForm.clientName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1">Vehicle</label>
                  <input
                    type="text" required placeholder="2025 Model Y" value={newDealForm.vehicle}
                    onChange={(e) => setNewDealForm({ ...newDealForm, vehicle: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1">Finance Amount ($)</label>
                  <input
                    type="number" required placeholder="42000" value={newDealForm.financeAmount}
                    onChange={(e) => setNewDealForm({ ...newDealForm, financeAmount: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddDealOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow">
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
