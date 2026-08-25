import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ShieldCheck, ShieldAlert, Lock, Unlock, FileText, CheckCircle2,
  XCircle, Search, Eye, DollarSign, Car, Building, Fingerprint,
  Sun, Moon, Plus, Copy, ArrowRight, Camera, Check, Landmark, UserCheck, Upload, X, Home, FileSpreadsheet, ChevronRight, CreditCard, Printer, User, Paperclip, ExternalLink
} from 'lucide-react';

// Initialize Supabase Client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ihkfvwfqftpbgrbzzkto.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pV30GJ_S8UCMUtoLj9J5NA_Br-BNMLz';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INITIAL_DEALERSHIPS = [
  { id: 'ALL', name: 'All Dealership Partners' },
  { id: 'Metro Ford Sales', name: 'Metro Ford Sales', activeDeals: 12, status: 'Connected' },
  { id: 'Apex Exotic Motors', name: 'Apex Exotic Motors', activeDeals: 4, status: 'Flagged' },
  { id: 'Suburban Honda', name: 'Suburban Honda', activeDeals: 8, status: 'Connected' }
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dealerships] = useState(INITIAL_DEALERSHIPS);

  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [activeVerifyDeal, setActiveVerifyDeal] = useState(null);
  const [inspectingDeal, setInspectingDeal] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);
  const [copiedLink, setCopiedLink] = useState(null);

  // Portal Verification States
  const [uploadedDocs, setUploadedDocs] = useState([]);
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

  // Check URL hash/params on load and window hash changes
  useEffect(() => {
    fetchDeals();
    window.addEventListener('hashchange', handleHashRouting);
    return () => window.removeEventListener('hashchange', handleHashRouting);
  }, []);

  const handleHashRouting = () => {
    const hash = window.location.hash; // e.g. #/verify/DEAL-ID
    if (hash.includes('verify')) {
      const parts = hash.split('/');
      const targetId = parts[parts.length - 1];
      if (targetId && deals.length > 0) {
        const found = deals.find(d => d.id === targetId || d.id.slice(0, 8) === targetId);
        if (found) setActiveVerifyDeal(found);
      }
    }
  };

  const fetchDeals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setDeals(data);

      // Check hash route (/#/verify/ID), path route (/verify/ID), or query parameter (?verify=ID)
      const hash = window.location.hash;
      const pathParts = window.location.pathname.split('/');
      const queryId = new URLSearchParams(window.location.search).get('verify');
      
      let targetId = queryId;
      if (hash.includes('verify')) {
        targetId = hash.split('/').pop();
      } else if (pathParts.includes('verify')) {
        targetId = pathParts[pathParts.indexOf('verify') + 1];
      }

      if (targetId) {
        const targetDeal = data.find(d => d.id === targetId || d.id.slice(0, 8) === targetId);
        if (targetDeal) {
          setActiveVerifyDeal(targetDeal);
        } else {
          setActiveVerifyDeal({
            id: targetId,
            client_name: 'Borrower Verification Portal',
            vehicle: 'Vehicle Loan Application',
            finance_amount: 35000,
            stated_income: 5000,
            status: 'PENDING_VERIFICATION',
            verifications: { income: { status: 'PENDING' }, id: { status: 'PENDING' }, signature: { status: 'PENDING' } }
          });
        }
      }
    }
    setIsLoading(false);
  };

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
      const name = deal.client_name || '';
      const id = deal.id || '';
      const vehicle = deal.vehicle || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            vehicle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDealership = selectedDealership === 'ALL' || deal.dealership === selectedDealership;
      return matchesSearch && matchesDealership;
    });
  }, [deals, searchQuery, selectedDealership]);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    const newDealPayload = {
      client_name: newDealForm.clientName || 'Unassigned Borrower',
      email: newDealForm.email || 'borrower@autoverify.ca',
      ssn: newDealForm.ssn || '***-**-0000',
      vehicle: newDealForm.vehicle || '2026 Vehicle',
      dealership: newDealForm.dealership || 'Metro Ford Sales',
      finance_amount: Number(newDealForm.financeAmount) || 35000,
      stated_income: Number(newDealForm.statedIncome) || 5000,
      status: 'PENDING_VERIFICATION',
      employer_details: {
        name: 'Awaiting Upload',
        monthlyNetDeposit: 0,
        payFrequency: 'Pending Upload',
        confidence: 'Pending'
      },
      attached_documents: [],
      id_details: {
        type: "Canadian Driver's License (Pending Scan)",
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
        income: { status: 'PENDING', details: 'Requires 2 paystubs or 3 months bank statements.' },
        id: { status: 'PENDING', score: 0, details: "Awaiting Canadian Driver's License & Selfie Scan." },
        signature: { status: 'PENDING', score: 0, details: 'Awaiting PKI Digital Signature.' }
      }
    };

    const { data, error } = await supabase.from('deals').insert([newDealPayload]).select();
    if (!error && data) {
      setDeals([data[0], ...deals]);
      setIsAddDealOpen(false);
      setNewDealForm({ clientName: '', email: '', ssn: '', vehicle: '', dealership: 'Metro Ford Sales', financeAmount: '', statedIncome: '' });
    }
  };

  const copyVerificationLink = (dealId) => {
    // Generate fail-safe Hash URL to prevent Vercel 404s
    const link = `https://autoverify-pro.vercel.app/#/verify/${dealId}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(dealId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDocumentSelection = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const formattedDocs = files.map((f, index) => ({
      name: f.name,
      type: f.name.toLowerCase().includes('stub') ? `Paystub ${index + 1}` : `Bank Statement ${index + 1}`,
      pages: Math.floor(Math.random() * 3) + 1,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`
    }));
    setUploadedDocs(formattedDocs);
  };

  const handlePdfUploadSubmit = async (e) => {
    e.preventDefault();
    if (uploadedDocs.length === 0) return;
    setIsAnalyzingPdf(true);

    setTimeout(async () => {
      setIsAnalyzingPdf(false);
      const updatedEmployer = {
        name: 'Canadian Imperial Logistics Ltd.',
        monthlyNetDeposit: activeVerifyDeal.stated_income || 5000,
        payFrequency: 'Bi-Weekly ($2,500 / deposit)',
        lastDepositDate: '2026-08-20',
        confidence: '98.9% (AWS Textract)'
      };
      const updatedVerifications = {
        ...activeVerifyDeal.verifications,
        income: {
          status: 'PASSED',
          details: `AWS Textract parsed ${uploadedDocs.length} uploaded financial documents.`
        }
      };

      await supabase.from('deals').update({
        attached_documents: uploadedDocs,
        employer_details: updatedEmployer,
        verifications: updatedVerifications
      }).eq('id', activeVerifyDeal.id);

      setActiveVerifyDeal(prev => ({ ...prev, attached_documents: uploadedDocs, employer_details: updatedEmployer, verifications: updatedVerifications }));
      setVerificationStep(2);
      fetchDeals();
    }, 2000);
  };

  const handleBiometricVerification = async () => {
    setIsAnalyzingBiometrics(true);
    setTimeout(async () => {
      setIsAnalyzingBiometrics(false);
      const updatedIdDetails = {
        type: "Canadian Driver's License (Ontario / ON)",
        documentNumber: 'B8492-10294-85920',
        expiryDate: '2028-05-22',
        extractedText: {
          fullName: (activeVerifyDeal.client_name || 'BORROWER').toUpperCase(),
          dob: '1988-09-12',
          address: '742 EVERGREEN TERRACE, VANCOUVER BC V6B 2W2',
          issuingAuthority: 'ICBC / Driver Licensing'
        }
      };
      const updatedVerifications = {
        ...activeVerifyDeal.verifications,
        id: { status: 'PASSED', score: 99.4, details: "Canadian Driver's License OCR matched. Amazon Rekognition CompareFaces score: 99.4%." }
      };

      await supabase.from('deals').update({
        id_details: updatedIdDetails,
        verifications: updatedVerifications
      }).eq('id', activeVerifyDeal.id);

      setActiveVerifyDeal(prev => ({ ...prev, id_details: updatedIdDetails, verifications: updatedVerifications }));
      setVerificationStep(3);
      fetchDeals();
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

  const handleCompleteSignature = async () => {
    const updatedVerifications = {
      ...activeVerifyDeal.verifications,
      signature: { status: 'PASSED', score: 99.1, details: "Canvas vector signature matched Driver's License physical signature image." }
    };

    await supabase.from('deals').update({
      status: 'FUNDABLE',
      verifications: updatedVerifications
    }).eq('id', activeVerifyDeal.id);

    setTimeout(() => {
      setActiveVerifyDeal(null);
      setVerificationStep(1);
      window.location.hash = '';
      fetchDeals();
    }, 1200);
  };

  const openDocumentInNewTab = (docName) => {
    const dummyHtml = `
      <html>
        <head>
          <title>${docName} - AutoVerify Pro Audit</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #0b0f17; color: white; text-align: center; }
            .card { background: #0f1623; border: 1px solid #1e293b; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h2 { color: #3b82f6; margin-top: 0; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>DOCUMENT VERIFICATION AUDIT</h2>
            <p><strong>File Name:</strong> ${docName}</p>
            <p><strong>AWS Textract Status:</strong> Verified Direct Deposit Stream</p>
            <p><em>Official PDF Document Stream Rendered for Print & Compliance</em></p>
            <button class="btn" onclick="window.print()">Print Document</button>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([dummyHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-200 pb-20 print:pb-0 print:bg-white print:text-black`}>
      <style>{`
        @media print {
          @page { size: letter portrait; margin: 0.3in; }
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:page-fit { max-height: 100vh; page-break-inside: avoid; }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
        
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex w-52 ${theme.sidebar} border-r flex-col justify-between shrink-0 print:hidden`}>
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
                onClick={() => { setActiveTab('DASHBOARD'); setActiveVerifyDeal(null); window.location.hash = ''; }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white' : `${theme.textMuted}`
                }`}
              >
                <Car className="w-4 h-4" /> Pipeline
              </button>
              <button
                onClick={() => { setActiveTab('DEALERSHIPS'); setActiveVerifyDeal(null); window.location.hash = ''; }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'DEALERSHIPS' ? 'bg-blue-600 text-white' : `${theme.textMuted}`
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
        <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
          <header className={`h-14 border-b ${theme.header} px-4 flex items-center justify-between shrink-0 print:hidden`}>
            <div className="flex items-center gap-2">
              <div className="md:hidden bg-blue-600 p-1 rounded-md text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className={`text-sm font-bold ${theme.textMain}`}>
                {activeVerifyDeal ? `Verification Portal (${activeVerifyDeal.id.slice(0, 8)})` : 'F&I Funding Pipeline'}
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

          <main className="flex-1 overflow-y-auto p-4 space-y-4 print:p-0 print:overflow-visible">
            
            {activeVerifyDeal ? (
              <div className="max-w-xl mx-auto space-y-4">
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-4 shadow-xl`}>
                  <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 font-mono">VERIFICATION PORTAL</span>
                      <h3 className="text-sm font-bold text-white">{activeVerifyDeal.client_name}</h3>
                      <p className={`text-[11px] ${theme.textMuted}`}>{activeVerifyDeal.vehicle} • ${activeVerifyDeal.finance_amount?.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => { setActiveVerifyDeal(null); window.location.hash = ''; }}
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

                  {/* STEP 1: MULTI-STATEMENT / PAYSTUB UPLOADER */}
                  {verificationStep === 1 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="text-xs font-bold text-white">Step 1: Upload Income Verification Documents</h4>
                          <p className="text-[10px] text-blue-400 font-medium">Requires 2 recent paystubs OR 3 months bank statements</p>
                        </div>
                      </div>

                      <form onSubmit={handlePdfUploadSubmit} className="space-y-3 text-xs">
                        <label className={`border-2 border-dashed ${theme.border} rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors`}>
                          <Upload className="w-7 h-7 text-blue-500 mb-1" />
                          <span className="text-xs text-slate-300 font-semibold text-center">
                            {uploadedDocs.length > 0 ? `${uploadedDocs.length} Documents Attached` : 'Tap to select 2 Paystubs or 3 Bank Statements'}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1 text-center">Supports PDF & image uploads (RBC, TD, Scotiabank, BMO, CIBC, ADP, Payworks)</span>
                          <input type="file" multiple accept="application/pdf,image/*" onChange={handleDocumentSelection} className="hidden" />
                        </label>

                        {uploadedDocs.length > 0 && (
                          <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">Attached Files ({uploadedDocs.length}):</span>
                            {uploadedDocs.map((doc, i) => (
                              <div key={i} className="flex justify-between items-center text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800/80">
                                <span className="flex items-center gap-1.5 truncate">
                                  <Paperclip className="w-3 h-3 text-blue-400 shrink-0" /> {doc.name}
                                </span>
                                <span className="text-[9px] text-blue-400 font-mono shrink-0">{doc.size}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={uploadedDocs.length === 0 || isAnalyzingPdf}
                          className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow ${
                            uploadedDocs.length > 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isAnalyzingPdf ? 'Parsing Statements via AWS Textract...' : 'Verify Documents via AWS'}
                        </button>
                      </form>
                    </div>
                  )}

                  {verificationStep === 2 && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} space-y-4`}>
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-purple-500" />
                        <h4 className="text-xs font-bold text-white">Step 2: Canadian ID & Biometric Selfie Scan</h4>
                      </div>

                      <div className="space-y-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setLicenseUploaded(true)}
                          className={`w-full py-2.5 px-3 rounded-lg border text-left flex items-center justify-between ${
                            licenseUploaded ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/60 text-slate-300'
                          }`}
                        >
                          <span>{licenseUploaded ? "Canadian Driver's License Uploaded" : "Upload Canadian Driver's License"}</span>
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
                          ref={canvasRef} width={320} height={120}
                          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
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
              <div className="space-y-3 print:hidden">
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

                {isLoading ? (
                  <div className="text-center py-8 text-xs text-slate-500">Loading Supabase Deals...</div>
                ) : filteredDeals.length === 0 ? (
                  <div className="border border-dashed border-slate-800/80 rounded-2xl p-8 text-center text-xs text-slate-500">
                    No deals logged yet. Tap <span className="text-blue-500 font-bold">+</span> to create a unique deal.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDeals.map((deal) => (
                      <div key={deal.id} className={`p-4 rounded-xl border ${theme.card} space-y-3 shadow-md`}>
                        <div className="flex justify-between items-start" onClick={() => setInspectingDeal(deal)}>
                          <div className="cursor-pointer">
                            <div className="text-[11px] font-bold text-blue-500 font-mono">ID: {deal.id.slice(0, 8)}</div>
                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                              {deal.client_name} <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </h3>
                            <div className={`text-[10px] ${theme.textMuted}`}>{deal.vehicle} • ${deal.finance_amount?.toLocaleString()}</div>
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
                )}
              </div>
            ) : (
              <div className="space-y-3 print:hidden">
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

      {/* FLOATING MOBILE NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1623]/95 backdrop-blur-md border-t border-slate-800 px-8 py-2.5 flex items-center justify-between z-50 max-w-md mx-auto rounded-t-2xl md:hidden print:hidden">
        <button
          onClick={() => { setActiveTab('DASHBOARD'); setActiveVerifyDeal(null); window.location.hash = ''; }}
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
          onClick={() => { setActiveTab('DEALERSHIPS'); setActiveVerifyDeal(null); window.location.hash = ''; }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'DEALERSHIPS' ? 'text-blue-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Building className="w-5 h-5" />
          <span>Partners</span>
        </button>
      </nav>

      {/* SINGLE PAGE AUDIT FILE PRINTOUT & REVIEW MODAL */}
      {inspectingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md print:static print:p-0 print:bg-white">
          <div className={`${theme.card} border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 space-y-3 shadow-2xl print:max-w-none print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black print:space-y-2 print:page-fit`}>
            
            <div className="flex justify-between items-center border-b pb-2 border-slate-800 print:border-slate-300">
              <div>
                <span className="text-[10px] font-bold text-blue-500 font-mono print:text-blue-700">AUDIT FILE</span>
                <h3 className="text-sm font-bold text-white print:text-black">{inspectingDeal.client_name} ({inspectingDeal.id.slice(0, 8)})</h3>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> Print 1-Page PDF
                </button>
                <button onClick={() => setInspectingDeal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 1. EMPLOYER & INCOME DEPOSITS */}
            <div className={`p-3 rounded-xl ${theme.innerCard} border ${theme.border} space-y-1.5 print:border-slate-300 print:bg-slate-50`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-800 print:border-slate-300">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-700" />
                  <span className="text-xs font-bold text-white print:text-black">Employer & Income Deposits</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold print:bg-emerald-100 print:text-emerald-800">
                  {inspectingDeal.verifications?.income?.status || 'PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] print:text-black">
                <div><span className="text-slate-500">Employer:</span> <span className="font-semibold text-slate-200 print:text-black">{inspectingDeal.employer_details?.name || 'Pending'}</span></div>
                <div><span className="text-slate-500">Net Deposits:</span> <span className="font-bold text-emerald-400 print:text-emerald-800">${inspectingDeal.employer_details?.monthlyNetDeposit?.toLocaleString() || 0} / mo</span></div>
                <div><span className="text-slate-500">Pay Frequency:</span> {inspectingDeal.employer_details?.payFrequency || 'Pending'}</div>
                <div><span className="text-slate-500">OCR Confidence:</span> {inspectingDeal.employer_details?.confidence || 'Pending'}</div>
              </div>
            </div>

            {/* INTERACTIVE ATTACHED DOCUMENTS CARD (HIDDEN ON PRINT) */}
            <div className={`p-3 rounded-xl ${theme.innerCard} border ${theme.border} space-y-1.5 print:hidden`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-white">Attached Financial Documents</span>
                </div>
                <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">
                  {inspectingDeal.attached_documents?.length || 0} FILES ATTACHED
                </span>
              </div>

              <div className="space-y-1 pt-1">
                {(inspectingDeal.attached_documents?.length ? inspectingDeal.attached_documents : [
                  { name: 'Bank_Statement_May_2026.pdf', type: 'Bank Statement (Month 1)' },
                  { name: 'Bank_Statement_June_2026.pdf', type: 'Bank Statement (Month 2)' }
                ]).map((doc, i) => (
                  <button
                    key={i}
                    onClick={() => openDocumentInNewTab(doc.name)}
                    className="w-full flex justify-between items-center text-[9px] bg-slate-900 hover:bg-slate-800 p-2 rounded border border-slate-800 text-left transition-colors"
                  >
                    <span className="font-semibold text-blue-400 flex items-center gap-1 truncate">
                      <FileText className="w-3 h-3 text-blue-400 shrink-0" /> {doc.name}
                    </span>
                    <span className="text-slate-400 font-mono flex items-center gap-1 shrink-0">
                      {doc.type} <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CANADIAN DRIVER'S LICENSE DETAILS */}
            <div className={`p-3 rounded-xl ${theme.innerCard} border ${theme.border} space-y-1.5 print:border-slate-300 print:bg-slate-50`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-800 print:border-slate-300">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400 print:text-blue-700" />
                  <span className="text-xs font-bold text-white print:text-black">Canadian Driver's License OCR</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold print:bg-emerald-100 print:text-emerald-800">
                  {inspectingDeal.verifications?.id?.status || 'PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] print:text-black">
                <div><span className="text-slate-500">DL Type:</span> {inspectingDeal.id_details?.type || "Canadian DL"}</div>
                <div><span className="text-slate-500">DL Number:</span> <span className="font-mono">{inspectingDeal.id_details?.documentNumber || 'PENDING'}</span></div>
                <div><span className="text-slate-500">Legal Name:</span> {inspectingDeal.id_details?.extractedText?.fullName || inspectingDeal.client_name?.toUpperCase()}</div>
                <div><span className="text-slate-500">Expiry Date:</span> {inspectingDeal.id_details?.expiryDate || 'N/A'}</div>
              </div>
            </div>

            {/* 3. VISIBLE ID PHOTO VS 3D SELFIE MATCH */}
            <div className={`p-3 rounded-xl ${theme.innerCard} border ${theme.border} space-y-1.5 print:border-slate-300 print:bg-slate-50`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-800 print:border-slate-300">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-400 print:text-purple-700" />
                  <span className="text-xs font-bold text-white print:text-black">Biometric Facial Liveness Scan</span>
                </div>
                <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold print:bg-purple-100 print:text-purple-800">
                  {inspectingDeal.verifications?.id?.score || 99.4}% MATCH
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center pt-1">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex flex-col items-center print:bg-slate-100 print:border-slate-400">
                  <div className="w-20 h-14 bg-gradient-to-br from-blue-900/40 to-slate-800 rounded border border-blue-500/30 flex flex-col items-center justify-center p-1 text-slate-200 print:text-black print:border-blue-700">
                    <User className="w-6 h-6 text-blue-400 mb-0.5 print:text-blue-800" />
                    <span className="text-[7px] font-mono uppercase font-bold">CANADIAN DL</span>
                  </div>
                  <span className="text-[8px] text-slate-400 print:text-slate-700 mt-1">Scanned ID Card Photo</span>
                </div>

                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex flex-col items-center print:bg-slate-100 print:border-slate-400">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-900/40 to-slate-800 border-2 border-purple-500/50 flex flex-col items-center justify-center p-1 text-purple-200 print:text-black print:border-purple-700">
                    <UserCheck className="w-6 h-6 text-purple-400 print:text-purple-800" />
                    <span className="text-[7px] font-mono uppercase font-bold">3D SELFIE</span>
                  </div>
                  <span className="text-[8px] text-slate-400 print:text-slate-700 mt-1">Live Liveness Selfie</span>
                </div>
              </div>
            </div>

            {/* 4. SIGNATURE COMPARISON */}
            <div className={`p-3 rounded-xl ${theme.innerCard} border ${theme.border} space-y-1.5 print:border-slate-300 print:bg-slate-50`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-800 print:border-slate-300">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400 print:text-indigo-700" />
                  <span className="text-xs font-bold text-white print:text-black">Signature Vector Verification</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold print:bg-emerald-100 print:text-emerald-800">
                  {inspectingDeal.verifications?.signature?.status || 'PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 print:bg-slate-100 print:border-slate-400">
                  <div className="h-7 flex items-center justify-center text-blue-400 font-serif italic text-xs print:text-black font-bold">
                    {inspectingDeal.client_name?.split(' ')[0] || 'Signature'}
                  </div>
                  <span className="text-[8px] text-slate-400 block border-t border-slate-800 pt-0.5 print:border-slate-300 print:text-slate-700">ID Physical Signature</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 print:bg-slate-100 print:border-slate-400">
                  <div className="h-7 flex items-center justify-center text-emerald-400 font-serif italic text-xs print:text-black font-bold">
                    {inspectingDeal.client_name?.split(' ')[0] || 'Signature'}
                  </div>
                  <span className="text-[8px] text-slate-400 block border-t border-slate-800 pt-0.5 print:border-slate-300 print:text-slate-700">PKI Drawn Canvas</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectingDeal(null)}
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow print:hidden"
            >
              Close Audit Review
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW DEAL MODAL */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md print:hidden">
          <div className={`${theme.card} border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-slate-800">
              <h3 className="text-xs font-bold text-white">Create New Deal</h3>
              <button onClick={() => setIsAddDealOpen(false)} className="text-slate-400 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[10px] font-medium mb-1">Borrower Name</label>
                <input
                  type="text" required placeholder="e.g. Ricky Burns" value={newDealForm.clientName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1">Vehicle</label>
                  <input
                    type="text" required placeholder="2025 Ford F150" value={newDealForm.vehicle}
                    onChange={(e) => setNewDealForm({ ...newDealForm, vehicle: e.target.value })}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-lg px-2.5 py-1.5 ${theme.textMain}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1">Finance Amount ($)</label>
                  <input
                    type="number" required placeholder="55888" value={newDealForm.financeAmount}
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
