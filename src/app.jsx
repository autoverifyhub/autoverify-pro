import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Lock, Unlock,
  FileText, CheckCircle2, XCircle, Search, Filter,
  Eye, User, DollarSign, Car, Clock, RefreshCw, ZoomIn,
  Building, Fingerprint, Layers, Sliders, ChevronRight,
  TrendingUp, FileSpreadsheet, ArrowUpRight, ArrowDownRight,
  Sparkles, Check, ExternalLink, Sun, Moon, Calendar, X,
  Printer, Download
} from 'lucide-react';

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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deals] = useState(INITIAL_DEALS);

  const theme = {
    bg: isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900',
    card: isDarkMode ? 'bg-[#0F1623] border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    innerCard: isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-8 font-sans transition-colors duration-200`}>
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AUTOVERIFY PRO</h1>
            <p className={`text-xs ${theme.textMuted}`}>Automotive F&I Risk Engine</p>
          </div>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-3 py-1.5 rounded-xl border ${theme.border} ${theme.innerCard} text-xs font-semibold`}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className={`p-6 rounded-2xl border ${theme.card} space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-blue-500 font-bold">{deal.id}</span>
                <h2 className="text-base font-bold mt-1">{deal.client.name}</h2>
                <p className={`text-xs ${theme.textMuted}`}>{deal.vehicle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                deal.status === 'FUNDABLE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {deal.status}
              </span>
            </div>

            <div className={`p-4 rounded-xl ${theme.innerCard} border ${theme.border} text-xs space-y-2`}>
              <div className="flex justify-between">
                <span className={theme.textMuted}>Financed Amount:</span>
                <span className="font-bold text-blue-500">${deal.financeAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme.textMuted}>FDX Income Verification:</span>
                <span className={`font-semibold ${deal.verifications.income.status === 'PASSED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {deal.verifications.income.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
