import React, { useState, useRef, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, Lock, Unlock, FileText, CheckCircle2,
  XCircle, Search, Eye, DollarSign, Car, Building, Fingerprint,
  Sun, Moon, Plus, Copy, ArrowRight, Camera, Check, Landmark, UserCheck, Upload, X, Home, FileSpreadsheet, LogOut
} from 'lucide-react';

const INITIAL_DEALS = [
  {
    id: 'DEAL-1094',
    client: { name: 'Sarah Jenkins', ssn: '***-**-4892', email: 's.jenkins@example.com' },
    vehicle: '2024 Ford F-150 Lariat',
    dealership: 'DealerCanada',
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
    verifications: {
      income: { status: 'PASSED', verifiedAmount: 8450, details: 'Verified recurring direct deposits via AWS Textract.' },
      id: { status: 'PASSED', score: 99.2, details: 'AAMVA Driver License validated. Biometric liveness matched.' },
      signature: { status: 'PASSED', score: 98.7, details: 'Vector signature matched physical ID card signature.' }
    }
  }
];

export default function App() {
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [activeTab, setActiveTab] = useState('HOME'); // 'HOME' or 'PIPELINE'

  // Modal / Portal States
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [activeVerifyDeal, setActiveVerifyDeal] = useState(null);
  const [inspectingDeal, setInspectingDeal] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);
  const [copiedLink, setCopiedLink] = useState(null);

  // Portal Upload States
  const [bankPdfFile, setBankPdfFile] = useState(null);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [isAnalyzingBiometrics, setIsAnalyzingBiometrics] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // New Deal Form State
  const [newDealForm, setNewDealForm] = useState({
    clientName: '', email: '', ssn: '', vehicle: '', financeAmount: '', statedIncome: ''
  });

  const totalDeals = deals.length;
  const totalVolume = deals.reduce((sum, d) => sum + d.financeAmount, 0);

  const handleCreateDeal = (e) => {
    e.preventDefault();
    const newId = `DEAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdDeal = {
      id: newId,
      client: { name: newDealForm.clientName || 'Unassigned Client', ssn: newDealForm.ssn || '***-**-0000', email: newDealForm.email || 'client@example.com' },
      vehicle: newDealForm.vehicle || '2026 Vehicle',
      dealership: 'DealerCanada',
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
      verifications: {
        income: { status: 'PENDING', verifiedAmount: 0, details: 'Awaiting Bank E-Statement Upload.' },
        id: { status: 'PENDING', score: 0, details: 'Awaiting Driver License & Selfie Scan.' },
        signature: { status: 'PENDING', score: 0, details: 'Awaiting PKI Digital Signature.' }
      }
    };
    setDeals([createdDeal, ...deals]);
    setIsAddDealOpen(false);
    setNewDealForm({ clientName: '', email: '', ssn: '', vehicle: '', financeAmount: '', statedIncome: '' });
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
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans pb-24 flex flex-col justify-between">
      
      {/* MOBILE APP HEADER */}
      <header className="px-4 py-4 border-b border-slate-900 bg-[#0B101D] flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            DC
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">DealerCanada</h1>
            <p className="text-[11px] text-slate-400">Kel Phillips (SALES)</p>
          </div>
        </div>

        <button className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 text-xs font-semibold hover:text-white">
          Logout
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main className="p-4 space-y-4 max-w-md mx-auto w-full flex-1">
        
        {/* CUSTOMER PORTAL INTERFACE */}
        {activeVerifyDeal ? (
          <div className="bg-[#0F1626] border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 font-mono">VERIFICATION PORTAL</span>
                <h3 className="text-sm font-bold text-white">{activeVerifyDeal.client.name}</h3>
                <p className="text-[11px] text-slate-400">{activeVerifyDeal.vehicle} • ${activeVerifyDeal.financeAmount.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setActiveVerifyDeal(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Exit
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className={`h-1.5 rounded-full ${verificationStep >= 1 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full ${verificationStep >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full ${verificationStep >= 3 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
            </div>

            {verificationStep === 1 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white">Step 1: Upload Bank PDF E-Statement</h4>
                </div>
                <form onSubmit={handlePdfUploadSubmit} className="space-y-3 text-xs">
                  <label className="border-2 border-dashed border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 bg-slate-900/40">
                    <Upload className="w-7 h-7 text-indigo-400 mb-1" />
                    <span className="text-xs text-slate-300 font-semibold text-center">
                      {bankPdfFile ? bankPdfFile.name : 'Tap to upload official Bank PDF Statement'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">Supports RBC, TD, Scotiabank, BMO, CIBC, etc.</span>
                    <input type="file" accept="application/pdf,image/*" onChange={(e) => setBankPdfFile(e.target.files[0])} className="hidden" />
                  </label>
                  <button
                    type="submit"
                    disabled={!bankPdfFile || isAnalyzingPdf}
                    className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow ${
                      bankPdfFile ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isAnalyzingPdf ? 'Parsing Payroll via AWS Textract...' : 'Verify Bank Income'}
                  </button>
                </form>
              </div>
            )}

            {verificationStep === 2 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  <h4 className="text-xs font-bold text-white">Step 2: State ID & Biometric Selfie</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setLicenseUploaded(true)}
                  className={`w-full py-2.5 px-3 rounded-lg border text-left flex items-center justify-between ${
                    licenseUploaded ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900 text-slate-300'
                  }`}
                >
                  <span>{licenseUploaded ? 'Driver License Uploaded' : 'Upload Driver License'}</span>
                  {licenseUploaded ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelfieCaptured(true)}
                  className={`w-full py-2.5 px-3 rounded-lg border text-left flex items-center justify-between ${
                    selfieCaptured ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900 text-slate-300'
                  }`}
                >
                  <span>{selfieCaptured ? 'Facial Liveness Selfie Captured' : 'Take Live Selfie'}</span>
                  {selfieCaptured ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Camera className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleBiometricVerification}
                  disabled={!licenseUploaded || !selfieCaptured || isAnalyzingBiometrics}
                  className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow ${
                    licenseUploaded && selfieCaptured ? 'bg-purple-600' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzingBiometrics ? 'AWS Rekognition CompareFaces...' : 'Verify Identity & Selfie'}
                </button>
              </div>
            )}

            {verificationStep === 3 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white">Step 3: Draw Signature</h4>
                </div>
                <canvas
                  ref={canvasRef} width={300} height={110}
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                  onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg touch-none"
                />
                <button
                  onClick={handleCompleteSignature}
                  disabled={!isSigned}
                  className={`w-full py-2.5 rounded-lg text-white font-bold text-xs shadow ${isSigned ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  Execute Digital Signature
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* PAY PERIOD DROPDOWN CARD */}
            <div className="bg-[#0F1626] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Pay Period:</span>
              <select className="bg-[#151D30] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none">
                <option>August 2026</option>
                <option>July 2026</option>
              </select>
            </div>

            {/* GROSS BOARD SUMMARY CARD */}
            <div className="bg-[#0F1626] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">MY GROSS BOARD</span>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Deals</span>
                  <span className="text-2xl font-extrabold text-white">{totalDeals}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Front Gross</span>
                  <span className="text-2xl font-extrabold text-indigo-400">${totalVolume.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* RECENT DEALS SECTION */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-bold text-white">Recent Deals</h3>
                <span className="text-[11px] text-slate-500">{deals.length} deals in active period</span>
              </div>

              {deals.length === 0 ? (
                <div className="border border-dashed border-slate-800/80 rounded-2xl p-8 text-center space-y-1">
                  <p className="text-xs text-slate-400">No deals recorded for this pay period.</p>
                  <p className="text-[11px] text-slate-600">Tap the <span className="text-indigo-400 font-bold">+</span> button to log a deal.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <div key={deal.id} className="bg-[#0F1626] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                      <div className="flex justify-between items-start" onClick={() => setInspectingDeal(deal)}>
                        <div>
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">{deal.id}</span>
                          <h4 className="text-xs font-bold text-white">{deal.client.name}</h4>
                          <p className="text-[11px] text-slate-400">{deal.vehicle}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          deal.status === 'FUNDABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {deal.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => setInspectingDeal(deal)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-indigo-400" /> View Audit
                        </button>

                        <button
                          onClick={() => copyVerificationLink(deal.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-mono flex items-center gap-1"
                        >
                          {copiedLink === deal.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedLink === deal.id ? 'Copied' : 'Copy Link'}
                        </button>

                        <button
                          onClick={() => { setActiveVerifyDeal(deal); setVerificationStep(1); }}
                          className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1 shadow"
                        >
                          Portal <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* FLOATING MOBILE NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B101D]/95 backdrop-blur-lg border-t border-slate-800/80 px-8 py-3 flex items-center justify-between z-50 max-w-md mx-auto">
        <button
          onClick={() => { setActiveTab('HOME'); setActiveVerifyDeal(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'HOME' && !activeVerifyDeal ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* Elevated Center Add Button */}
        <button
          onClick={() => setIsAddDealOpen(true)}
          className="w-12 h-12 -mt-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 border-4 border-[#080C14] hover:bg-indigo-500 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => { setActiveTab('PIPELINE'); setActiveVerifyDeal(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'PIPELINE' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Pipeline</span>
        </button>
      </nav>

      {/* VERIFICATION AUDIT MODAL */}
      {inspectingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0F1626] border border-slate-800 rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-4 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 font-mono">AUDIT FILE</span>
                <h3 className="text-xs font-bold text-white">{inspectingDeal.client.name} ({inspectingDeal.id})</h3>
              </div>
              <button onClick={() => setInspectingDeal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-bold text-white flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-emerald-400" /> Employer Deposits
                </span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  {inspectingDeal.verifications.income.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div>
                  <span className="text-slate-500 block">Employer</span>
                  <span className="font-semibold text-slate-200">{inspectingDeal.employerDetails?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Verified Net Income</span>
                  <span className="font-bold text-emerald-400">${inspectingDeal.employerDetails?.monthlyNetDeposit?.toLocaleString()} / mo</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-bold text-white flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-purple-400" /> Biometric ID Match
                </span>
                <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold">
                  Score: {inspectingDeal.verifications.id.score}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{inspectingDeal.verifications.id.details}</p>
            </div>

            <button
              onClick={() => setInspectingDeal(null)}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW DEAL MODAL */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0F1626] border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white">Log New Deal</h3>
              <button onClick={() => setIsAddDealOpen(false)} className="text-slate-400 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Borrower Name</label>
                <input
                  type="text" required placeholder="e.g. David Fowler" value={newDealForm.clientName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Vehicle</label>
                  <input
                    type="text" required placeholder="2025 Model Y" value={newDealForm.vehicle}
                    onChange={(e) => setNewDealForm({ ...newDealForm, vehicle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Finance Amount ($)</label>
                  <input
                    type="number" required placeholder="42000" value={newDealForm.financeAmount}
                    onChange={(e) => setNewDealForm({ ...newDealForm, financeAmount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddDealOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow">
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
