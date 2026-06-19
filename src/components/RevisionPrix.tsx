import React, { useState } from "react";
import { WorkItem, MeasurementLine, ProjectDetails, IndexHistory, WorkStop, DecompteRevision } from "../types";
import { indexHistoryBAT6 } from "../data/initialData";
import { 
  TrendingUp, 
  Settings2, 
  Info, 
  ArrowUpRight, 
  Scale, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Calendar, 
  Coins, 
  FileSpreadsheet, 
  SlidersHorizontal,
  Check,
  Printer,
  ChevronRight
} from "lucide-react";

interface RevisionPrixProps {
  workItems: WorkItem[];
  measurementLines: MeasurementLine[];
  projectDetails: ProjectDetails;
  setProjectDetails: (details: ProjectDetails) => void;
  calcItemTotalQuantity: (itemId: string) => number;
}

// Safer local date parser/formatter to prevent timezone discrepancies
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getFrenchMonthLabel(monthStr: string): string {
  const parts = monthStr.split("-");
  if (parts.length >= 2) {
    const yearShort = parts[0].slice(2);
    const mNum = parseInt(parts[1], 10);
    const months = [
      "janv", "févr", "mars", "avr", "mai", "juin",
      "juil", "août", "sept", "oct", "nov", "déc"
    ];
    return `${months[mNum - 1] || "indét"}-${yearShort}`;
  }
  return monthStr;
}

interface ActiveSubPeriod {
  monthKey: string; // YYYY-MM
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
}

interface DpCalculatedPeriod {
  dpId: string;
  dpName: string;
  dpDate: string;
  startDateStr: string;
  endDateStr: string;
  subPeriods: ActiveSubPeriod[];
  totalActiveDays: number;
  partialAmount: number;
  cumulativeAmount: number;
}

export default function RevisionPrix({
  workItems,
  measurementLines,
  projectDetails,
  setProjectDetails,
  calcItemTotalQuantity
}: RevisionPrixProps) {
  // Navigation: Simplified mode vs. Advanced (Pratata monthly DPs)
  const [mode, setMode] = useState<"advanced" | "simplified">("advanced");
  const [showConfig, setShowConfig] = useState(false);

  // Form input helper states
  const [newDpName, setNewDpName] = useState("");
  const [newDpDate, setNewDpDate] = useState("");
  const [newDpAmount, setNewDpAmount] = useState("");
  const [newDpIsCumulative, setNewDpIsCumulative] = useState(true);

  const [newStopDate, setNewStopDate] = useState("");
  const [newResumeDate, setNewResumeDate] = useState("");
  const [newStopReason, setNewStopReason] = useState("");

  const [editingIndices, setEditingIndices] = useState(false);

  // Backwards-compatible defaults
  const odscDate = projectDetails.odscDate || "2024-09-30";
  const decomptes = [...(projectDetails.decomptesRevisions || [])].sort((a, b) => a.date.localeCompare(b.date));
  const workStops = projectDetails.workStops || [];
  const customMonthlyIndices = projectDetails.customMonthlyIndices || {};

  // Find index values, with custom user overwrites prioritized
  const getIndexValue = (monthKey: string): number => {
    if (customMonthlyIndices[monthKey] !== undefined) {
      return customMonthlyIndices[monthKey];
    }
    const defaultNode = indexHistoryBAT6.find(x => x.date === monthKey);
    return defaultNode ? defaultNode.value : 243.8; // default fallback matching average Base
  };

  // ----------------------------------------------------
  // CALCULATE ACTIVE SUB-PERIODS PER DECOMPTE (DP)
  // ----------------------------------------------------
  const calculatedDps: DpCalculatedPeriod[] = [];

  for (let i = 0; i < decomptes.length; i++) {
    const cur = decomptes[i];
    
    // Determine the start date of this DP's period
    let startStr = odscDate;
    if (i > 0) {
      const prevDate = parseLocalDate(decomptes[i - 1].date);
      prevDate.setDate(prevDate.getDate() + 1); // physical start is the day after the last claim
      startStr = formatLocalDate(prevDate);
    }
    const endStr = cur.date;

    // Generate daily sequence and subtract stops
    const activeDates: Date[] = [];
    if (startStr <= endStr) {
      const curDate = parseLocalDate(startStr);
      const endDate = parseLocalDate(endStr);
      
      // Limit loop to avoid massive runaways on buggy dates
      let limit = 0;
      while (curDate <= endDate && limit < 1000) {
        limit++;
        const curStr = formatLocalDate(curDate);
        
        // Is this day inside an active work stoppage? (resumeDate is excluded because work has resumed)
        const isStopped = workStops.some(stop => curStr >= stop.stopDate && curStr < stop.resumeDate);
        if (!isStopped) {
          activeDates.push(new Date(curDate));
        }
        curDate.setDate(curDate.getDate() + 1);
      }
    }

    // Group active days by YYYY-MM
    const monthGroups: { [month: string]: Date[] } = {};
    activeDates.forEach(d => {
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(d);
    });

    // Translate groups to localized subperiods
    const subPeriods: ActiveSubPeriod[] = Object.keys(monthGroups).sort().map(monthKey => {
      const dates = monthGroups[monthKey];
      const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
      return {
        monthKey,
        startDate: formatLocalDate(sorted[0]),
        endDate: formatLocalDate(sorted[sorted.length - 1]),
        daysCount: dates.length
      };
    });

    const totalActiveDays = activeDates.length;

    // Resolve partial billing done in this interval
    let partialAmt = cur.amount;
    if (cur.isCumulative) {
      const prevAmount = i > 0 ? decomptes[i - 1].amount : 0;
      partialAmt = Math.max(0, cur.amount - prevAmount);
    }

    calculatedDps.push({
      dpId: cur.id,
      dpName: cur.name,
      dpDate: cur.date,
      startDateStr: startStr,
      endDateStr: endStr,
      subPeriods,
      totalActiveDays,
      partialAmount: partialAmt,
      cumulativeAmount: cur.isCumulative ? cur.amount : (i > 0 ? calculatedDps[i - 1].cumulativeAmount + cur.amount : cur.amount)
    });
  }

  // ----------------------------------------------------
  // MANAGE PARAMETER WRITERS (ATOMICAL SYNCHRONIZERS)
  // ----------------------------------------------------
  const triggerSaveDetails = (updated: Partial<ProjectDetails>) => {
    setProjectDetails({
      ...projectDetails,
      ...updated
    });
  };

  const handleAddDp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDpName || !newDpDate || !newDpAmount) return;
    const isCumulative = newDpIsCumulative;

    const newDp: DecompteRevision = {
      id: "dr-" + Date.now(),
      name: newDpName.trim(),
      date: newDpDate,
      amount: parseFloat(newDpAmount) || 0,
      isCumulative
    };

    const updated = [...decomptes, newDp].sort((a, b) => a.date.localeCompare(b.date));
    triggerSaveDetails({ decomptesRevisions: updated });

    // reset fields
    setNewDpName("");
    setNewDpDate("");
    setNewDpAmount("");
  };

  const handleDeleteDp = (id: string) => {
    const updated = decomptes.filter(d => d.id !== id);
    triggerSaveDetails({ decomptesRevisions: updated });
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopDate || !newResumeDate) return;

    const newStop: WorkStop = {
      id: "ws-" + Date.now(),
      stopDate: newStopDate,
      resumeDate: newResumeDate,
      reason: newStopReason.trim() || undefined
    };

    const updated = [...workStops, newStop].sort((a, b) => a.stopDate.localeCompare(b.stopDate));
    triggerSaveDetails({ workStops: updated });

    setNewStopDate("");
    setNewResumeDate("");
    setNewStopReason("");
  };

  const handleDeleteStop = (id: string) => {
    const updated = workStops.filter(s => s.id !== id);
    triggerSaveDetails({ workStops: updated });
  };

  const handleUpdateMonthlyIndex = (monthKey: string, val: number) => {
    const nextCustom = { ...customMonthlyIndices, [monthKey]: val };
    // also dynamically update base value or current execution index value in projectDetails if it matches selected calendar months
    let patchExtra: Partial<ProjectDetails> = {};
    if (monthKey === projectDetails.baseIndexMonth) {
      patchExtra.baseIndexValue = val;
    }
    if (monthKey === projectDetails.revisionIndexMonth) {
      patchExtra.revisionIndexValue = val;
    }

    setProjectDetails({
      ...projectDetails,
      ...patchExtra,
      customMonthlyIndices: nextCustom
    });
  };

  // ----------------------------------------------------
  // TOTAL REVISION CALCULATION (FOR ADVANCED TAB)
  // ----------------------------------------------------
  const baseValue = projectDetails.baseIndexValue || 243.8;
  const a = projectDetails.fixedPart;
  const b = projectDetails.revisedPart;

  let totalRevisedSurchargeHT = 0;
  let totalBilledPartialHT = 0;

  calculatedDps.forEach(dp => {
    totalBilledPartialHT += dp.partialAmount;
    dp.subPeriods.forEach(sub => {
      const prorata = dp.totalActiveDays > 0 ? (sub.daysCount / dp.totalActiveDays) : 0;
      const share = dp.partialAmount * prorata;
      const Im = getIndexValue(sub.monthKey);
      const Km = a + b * (Im / baseValue);
      const variation = Km - 1; // (P/P0) - 1
      const surcharge = share * variation;
      totalRevisedSurchargeHT += surcharge;
    });
  });

  const totalRevisedSurchargeTTC = totalRevisedSurchargeHT * (1 + projectDetails.tvaRate / 100);

  // ----------------------------------------------------
  // SIMPLIFIED SINGLE K CALCULATOR HELPERS
  // ----------------------------------------------------
  const handleBaseIndexSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = e.target.value;
    const val = getIndexValue(selectedDate);
    setProjectDetails({
      ...projectDetails,
      baseIndexMonth: selectedDate,
      baseIndexValue: val
    });
  };

  const handleRevisionIndexSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = e.target.value;
    const val = getIndexValue(selectedDate);
    setProjectDetails({
      ...projectDetails,
      revisionIndexMonth: selectedDate,
      revisionIndexValue: val
    });
  };

  const K_simple = a + b * (projectDetails.revisionIndexValue / (projectDetails.baseIndexValue || 1));

  const formatMAD = (v: number) => {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Notice regarding Moroccan CCAG-Travaux */}
      <div className="no-print bg-amber-500/[0.02] border border-brand-gold/30 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h4 className="font-sans font-black text-xs text-brand-brown uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-brand-gold shrink-0" /> RÉGLEMENTATION MAROCAINE : NOTE DE LA RÉVISION DES PRIX
            </h4>
            
            {/* Arabic legal explanation */}
            <div className="text-stone-700 text-[11px] leading-relaxed space-y-1.5" dir="rtl">
              <p className="font-semibold text-brand-brown">مواصفات مراجعة الأثمان طبقاً للقوانين الجاري بها العمل بالمملكة المغربية (CCAG-Travaux):</p>
              <p>
                يتم حساب فارق مراجعة الأسعار لكل دُفعة مؤقتة (<strong className="text-stone-900">DP - Décompte Provisoire</strong>) عبر تقسيم مدة الدفعة إلى فترات شهرية وحساب النسبة والتناسب (<strong className="text-stone-900">Prorata de jours</strong>). 
                يتأثر الحساب مباشرة بقرارات <span className="underline decoration-brand-gold font-bold">وقف واستئناف الأشغال</span> (Ordres de Service d'Arrêt et de Reprise) والتي تلغي الأيام الموقوفة من الاحتساب لمزيد من العدالة التعاقدية.
              </p>
            </div>

            {/* French Legal Explanation */}
            <div className="text-stone-600 text-[10.5px] leading-normal pt-1 border-t border-brand-gold/15 space-y-1 font-sans">
              <p>
                <strong>Calcul Prorata Temporis :</strong> La révision est ventilée mensuellement au prorata des jours d'activité réels de chaque décompte provisoire (DP). Les <strong>Arrêts de Travaux</strong> suspendent le décompte journalier du délai d'exécution et sont exclus de la répartition calendaire.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <a
              href="https://www.equipement.gov.ma/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-brown text-brand-gold px-4 py-2.5 text-xs font-black uppercase tracking-wider transition hover:bg-stone-850 shadow-xs"
            >
              Ministère de l'Équipement <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-stone-200 gap-4 no-print">
        <button
          onClick={() => setMode("advanced")}
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
            mode === "advanced" 
              ? "border-brand-brown text-brand-brown" 
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" /> Note de Révision Officielle (Décomptes & Arrêts)
        </button>
        <button
          onClick={() => setMode("simplified")}
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
            mode === "simplified" 
              ? "border-brand-brown text-brand-brown" 
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" /> Mode Global Simplifié (Coefficient Unique K)
        </button>
      </div>

      {/* PARAMETER CONFIGURATION AREA */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-display text-sm font-bold text-stone-900 flex items-center gap-2">
              <Settings2 className="h-4.5 w-4.5 text-brand-gold" /> Paramètres Techniques de Calcul • معاملات مراجعة الأسعار
            </h3>
            <p className="text-[11px] text-stone-500">
              Formulation de base contractuelle établie par l'attachement réglementaire : <span className="font-bold font-mono">K = a + b × (I / I₀)</span>
            </p>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-3 py-1.2 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
          >
            <Settings2 className="h-3.5 w-3.5" /> {showConfig ? "Fermer les paramètres" : "Ajuster les parties fermes/révisables"}
          </button>
        </div>

        {/* Coeff Parts Form Fields */}
        {showConfig && (
          <div className="grid grid-cols-1 gap-4 rounded-xl bg-stone-50 p-4 md:grid-cols-4 border border-stone-100 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-600 uppercase text-[10px]">Part Fixe Ferme (a)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={projectDetails.fixedPart}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  triggerSaveDetails({
                    fixedPart: val,
                    revisedPart: Math.max(0, 1 - val)
                  });
                }}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-stone-900"
              />
              <span className="text-[10px] text-stone-400 font-light block">Non révisable (défaut CCAG: 0.15)</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-600 uppercase text-[10px]">Part Révisable (b)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={projectDetails.revisedPart}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  triggerSaveDetails({
                    revisedPart: val,
                    fixedPart: Math.max(0, 1 - val)
                  });
                }}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-stone-900"
              />
              <span className="text-[10px] text-stone-400 font-light block">Soumise aux indices (défaut: 0.85)</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-600 uppercase text-[10px]">Domination d'Indice Principal</label>
              <input
                type="text"
                value={projectDetails.baseIndexName}
                onChange={(e) => triggerSaveDetails({ baseIndexName: e.target.value })}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 font-medium text-stone-900"
              />
              <span className="text-[10px] text-stone-400 font-light block">Exemple d'indice bâtiment : BAT6</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-600 uppercase text-[10px]">Taux de TVA (%)</label>
              <input
                type="number"
                value={projectDetails.tvaRate}
                onChange={(e) => triggerSaveDetails({ tvaRate: parseFloat(e.target.value) || 20 })}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-stone-900"
              />
              <span className="text-[10px] text-stone-400 font-light block">Standard au Maroc : 20%</span>
            </div>
          </div>
        )}

        {/* Global/Common Reference Index Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-stone-50 border border-stone-150 p-4 space-y-2">
            <span className="text-xs font-bold text-stone-700 uppercase block">Indice de Référence Base (I₀)</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase font-semibold">Mois de Référence</label>
                <select
                  value={projectDetails.baseIndexMonth}
                  onChange={handleBaseIndexSelect}
                  className="w-full rounded border border-stone-250 bg-white px-2 py-1"
                >
                  {indexHistoryBAT6.map((h, idx) => (
                    <option key={idx} value={h.date}>{h.date} - {h.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase font-semibold">Valeur I₀</label>
                <input
                  type="number"
                  step="any"
                  value={projectDetails.baseIndexValue}
                  onChange={(e) => triggerSaveDetails({ baseIndexValue: parseFloat(e.target.value) || 1 })}
                  className="w-full rounded border border-stone-250 bg-white px-2 py-1 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-stone-50 border border-stone-150 p-4 space-y-2">
            <span className="text-xs font-bold text-stone-700 uppercase block">Début d'exécution contractuelle (ODSC)</span>
            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-stone-500 uppercase font-semibold block">Date d'Ordre de Service de Commencement</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={odscDate}
                  onChange={(e) => triggerSaveDetails({ odscDate: e.target.value })}
                  className="w-full max-w-xs rounded border border-stone-250 bg-white px-3 py-1 font-mono text-xs text-stone-900"
                />
                <span className="text-[11px] text-stone-400 self-center">Date marquant le départ du jour journalier (ex: 30/09/2024)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE TAB 1: ADVANCED MOROCCAN PRORATA DECOMPTES ENGINE */}
      {/* ========================================================================= */}
      {mode === "advanced" && (
        <div className="space-y-6">
          
          {/* ADVANCED USER CONFIGURATION SIDEBARPANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
            
            {/* 1. DPs List & Insertion Form */}
            <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-4">
              <h3 className="font-display text-xs font-black uppercase tracking-wider text-brand-brown flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Coins className="h-4.5 w-4.5 text-brand-gold" /> Calendrier des Décomptes Provisoires (DPs)
              </h3>

              <form onSubmit={handleAddDp} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    required
                    placeholder="e.g., DP1"
                    value={newDpName}
                    onChange={e => setNewDpName(e.target.value)}
                    className="w-full rounded border border-stone-300 bg-white px-2 py-1.5"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="date"
                    required
                    value={newDpDate}
                    onChange={e => setNewDpDate(e.target.value)}
                    className="w-full rounded border border-stone-300 bg-white px-2 py-1.5 font-mono text-[11px]"
                  />
                </div>
                <div className="sm:col-span-5 flex gap-1">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Montant HT"
                    value={newDpAmount}
                    onChange={e => setNewDpAmount(e.target.value)}
                    className="w-full rounded border border-stone-300 bg-white px-2 py-1.5 font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-brand-brown hover:bg-stone-800 text-brand-gold font-bold px-3 rounded flex items-center justify-center shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="sm:col-span-12 flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="cumulativebox"
                    checked={newDpIsCumulative}
                    onChange={e => setNewDpIsCumulative(e.target.checked)}
                    className="rounded border-stone-300 text-brand-brown focus:ring-brand-gold h-3.5 w-3.5"
                  />
                  <label htmlFor="cumulativebox" className="text-[10px] text-stone-500 font-medium">
                    Le montant saisi est *Cumulé* (DP1 + DP2...). S'il est partiel, décochez la case.
                  </label>
                </div>
              </form>

              {/* Table list of claims */}
              <div className="overflow-x-auto border border-stone-150 rounded-lg max-h-56">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-150 font-bold text-stone-600">
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Date d'arrêté</th>
                      <th className="px-3 py-2 text-right">Montant Saisi</th>
                      <th className="px-3 py-2 text-center">Type</th>
                      <th className="px-3 py-2 text-right w-12 text-stone-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 font-mono text-[11px]">
                    {decomptes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-stone-400 font-sans italic">Aucun décompte enregistré</td>
                      </tr>
                    ) : (
                      decomptes.map((dp, idx) => (
                        <tr key={dp.id} className="hover:bg-stone-50/50">
                          <td className="px-3 py-2 font-bold text-stone-900 font-sans">{dp.name}</td>
                          <td className="px-3 py-2">{dp.date}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatMAD(dp.amount)}</td>
                          <td className="px-3 py-2 text-center font-sans text-[10px]">
                            {dp.isCumulative ? (
                              <span className="text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded font-bold">Cumulatif</span>
                            ) : (
                              <span className="text-brand-terracotta bg-red-50 px-1.5 py-0.5 rounded font-bold">Partiel</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-right font-sans">
                            <button
                              onClick={() => handleDeleteDp(dp.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Work Stops (Arrêts & Reprises) List & Insertion Form */}
            <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-4">
              <h3 className="font-display text-xs font-black uppercase tracking-wider text-brand-brown flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Calendar className="h-4.5 w-4.5 text-brand-gold" /> Ordres d'Arrêt et de Reprise des Travaux
              </h3>

              <form onSubmit={handleAddStop} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-4">
                  <label className="text-[9px] text-stone-400 uppercase font-black block mb-0.5">Date Arrêt</label>
                  <input
                    type="date"
                    required
                    value={newStopDate}
                    onChange={e => setNewStopDate(e.target.value)}
                    className="w-full rounded border border-stone-300 bg-white px-2 py-1 font-mono text-[11px]"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-[9px] text-stone-400 uppercase font-black block mb-0.5">Date Reprise</label>
                  <input
                    type="date"
                    required
                    value={newResumeDate}
                    onChange={e => setNewResumeDate(e.target.value)}
                    className="w-full rounded border border-stone-300 bg-white px-2 py-1 font-mono text-[11px]"
                  />
                </div>
                <div className="sm:col-span-4 flex gap-1 items-end">
                  <div className="w-full">
                    <label className="text-[9px] text-stone-400 uppercase font-black block mb-0.5">Description</label>
                    <input
                      type="text"
                      placeholder="Indisponibilité..."
                      value={newStopReason}
                      onChange={e => setNewStopReason(e.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-2 py-1"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-brown hover:bg-stone-800 text-brand-gold font-bold px-3 py-1.5 rounded flex items-center justify-center shrink-0 h-[30px]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Table list of work stops */}
              <div className="overflow-x-auto border border-stone-150 rounded-lg max-h-56">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-150 font-bold text-stone-600">
                      <th className="px-3 py-2">Fin de Travaux (Arrêt)</th>
                      <th className="px-3 py-2">Redémarrage (Reprise)</th>
                      <th className="px-3 py-2">Motif d'arrêt</th>
                      <th className="px-3 py-2 text-right w-12 text-stone-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 font-mono text-[11px]">
                    {workStops.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-stone-400 font-sans italic">Aucun arrêt de travail enregistré</td>
                      </tr>
                    ) : (
                      workStops.map((stop, sIdx) => (
                        <tr key={stop.id} className="hover:bg-stone-50/50">
                          <td className="px-3 py-2 font-bold text-red-700">{stop.stopDate}</td>
                          <td className="px-3 py-2 font-bold text-emerald-700">{stop.resumeDate}</td>
                          <td className="px-3 py-2 font-sans text-stone-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
                            {stop.reason || "Non spécifié"}
                          </td>
                          <td className="px-3 py-1.5 text-right font-sans">
                            <button
                              onClick={() => handleDeleteStop(stop.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. In-Place BAT6 Indices Quick Editor Panel */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3 no-print">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-display text-xs font-black uppercase tracking-wider text-brand-brown flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-brand-gold" /> Valeurs Courantes des Indices Mensuels BAT6 Marocains
              </h3>
              <button
                onClick={() => setEditingIndices(!editingIndices)}
                className="text-[11px] font-bold text-brand-brown border border-brand-gold/30 hover:bg-stone-50 rounded-md px-3 py-1.2 flex items-center gap-1.5 transition"
              >
                {editingIndices ? <span className="text-emerald-700">✓ Enregistrer les Évaluations</span> : "✍ Éditer les Indices BAT6 de Palier"}
              </button>
            </div>

            <p className="text-[11px] text-stone-500 leading-normal">
              Ci-dessous, les indices d'évolution enregistrés. Modifiez directement les cases pour calibrer le tableau d'indexation selon les barèmes officiels publiés au bulletin.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {/* Load a unified list representing months referenced in computed segments */}
              {(() => {
                const checkedMonths = new Set<string>();
                checkedMonths.add(projectDetails.baseIndexMonth);
                calculatedDps.forEach(dp => dp.subPeriods.forEach(sub => checkedMonths.add(sub.monthKey)));
                
                // Let's sort all months chronological
                const sortedUniqueMonths = Array.from(checkedMonths).sort();
                if (sortedUniqueMonths.length === 0) {
                  return <p className="text-xs text-stone-400 font-serif col-span-full">Configurez d'abord vos DPs pour afficher les indices requis.</p>;
                }

                return sortedUniqueMonths.map(month => {
                  const val = getIndexValue(month);
                  const isBase = month === projectDetails.baseIndexMonth;
                  return (
                    <div key={month} className={`rounded-lg border p-2 text-center text-xs space-y-1.5 transition-all ${
                      isBase ? "border-brand-gold bg-amber-500/[0.03] shadow-xs" : "border-stone-150 bg-stone-50"
                    }`}>
                      <div className="font-bold text-brand-brown">{getFrenchMonthLabel(month)}</div>
                      {editingIndices ? (
                        <input
                          type="number"
                          step="any"
                          className="w-full text-center font-mono font-bold font-xs text-stone-900 border border-stone-300 rounded p-1"
                          value={val}
                          onChange={(e) => handleUpdateMonthlyIndex(month, parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <div className="font-mono text-xs font-black text-stone-800">{val.toFixed(1)}</div>
                      )}
                      <div className="text-[9px] uppercase tracking-wider font-extrabold text-stone-400">
                        {isBase ? "Base I₀" : "Mensuel"}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE REAL NOTE DE REVISION PRINT REPLICA CONTAINER */}
          {/* ========================================================================= */}
          <div className="rounded-xl border border-stone-300 bg-white shadow-md p-6 sm:p-8 space-y-6 printable-container font-serif text-stone-900 relative">
            <div className="no-print absolute top-3 right-3 flex items-center">
              <button
                onClick={handlePrint}
                className="bg-brand-brown hover:bg-stone-850 text-brand-gold font-bold font-sans text-xs uppercase px-4 py-2.5 rounded shadow-sm inline-flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Imprimer le bordereau de révision
              </button>
            </div>

            {/* Document Header block */}
            <div className="text-center font-serif border-b-2 border-stone-800 pb-5 space-y-3">
              <h2 className="text-lg md:text-xl font-bold tracking-tight uppercase flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-brand-brown no-print" /> NOTE DE LA RÉVISION DES PRIX
              </h2>
              <div className="text-xs uppercase tracking-wide space-y-1 text-stone-600 font-sans">
                <p><strong className="text-stone-850">Chantier :</strong> {projectDetails.title}</p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
                  <p><strong className="text-stone-850">Maître d'Ouvrage :</strong> {projectDetails.client}</p>
                  <p><strong className="text-stone-850">Adjudicataire :</strong> {projectDetails.contractor}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
                  <p className="font-mono text-stone-800 font-bold">{projectDetails.contractNumber}</p>
                  <p><strong className="text-stone-850">ODSC :</strong> {odscDate}</p>
                  <p><strong className="text-stone-850">Base de Calcul :</strong> {projectDetails.baseIndexName} (I₀ = {baseValue} de {projectDetails.baseIndexMonth})</p>
                </div>
              </div>
            </div>

            {/* Upper Table Summary: Statement billing claims */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-stone-800 flex items-center gap-1 border-b border-stone-200 pb-1">
                <ChevronRight className="h-4 w-4" /> I. Récapitulatif Bancaire des Décomptes Enregistrés
              </h4>
              <div className="overflow-x-auto rounded-lg border border-stone-250 bg-amber-500/[0.01]">
                <table className="w-full text-left border-collapse text-xs font-serif">
                  <thead>
                    <tr className="bg-stone-100 border-b-2 border-stone-300 font-bold text-stone-700">
                      <th className="px-4 py-2 border-r border-stone-200">DP N°</th>
                      <th className="px-4 py-2 border-r border-stone-200">DATE DP</th>
                      <th className="px-4 py-2 text-right">MONTANT DU DÉCOMPTE (CUMULÉ)</th>
                      <th className="px-4 py-2 text-right">MONTANT PARTIEL (FACTURE PÉRIODE)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono text-stone-800">
                    {calculatedDps.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 font-sans italic text-stone-400">Aucune historique d'accompte encodé. Renseignez-les ci-dessus.</td>
                      </tr>
                    ) : (
                      calculatedDps.map((dp, idx) => (
                        <tr key={dp.dpId} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"}>
                          <td className="px-4 py-2.5 font-bold border-r border-stone-200 font-sans">{dp.dpName}</td>
                          <td className="px-4 py-2.5 border-r border-stone-200">{dp.dpDate}</td>
                          <td className="px-4 py-2.5 text-right font-medium">{formatMAD(dp.cumulativeAmount)}</td>
                          <td className="px-4 py-2.5 text-right text-stone-900 font-bold bg-amber-500/[0.02]">
                            {formatMAD(dp.partialAmount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Middle Section: Stops and Active Periods */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-stone-800 flex items-center gap-1 border-b border-stone-200 pb-1">
                <ChevronRight className="h-4 w-4" /> II. Égards de Délais & Décomptes d'Interruption
              </h4>
              <div className="overflow-x-auto rounded-lg border border-stone-250">
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-300 text-stone-600 font-bold">
                      <th className="px-3 py-1.5 border-r border-stone-200">Élément</th>
                      <th className="px-3 py-1.5 border-r border-stone-200 text-center">Début Arrêt</th>
                      <th className="px-3 py-1.5 border-r border-stone-200 text-center">Reprise Effective</th>
                      <th className="px-3 py-1.5 text-center">Jours de Suspension Éliminés</th>
                      <th className="px-3 py-1.5 text-right w-1/3">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono text-stone-800 text-center">
                    {workStops.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-2 text-stone-400 italic">Aucune période d'arrêt de chantier reportée. Délais d'exécution continus.</td>
                      </tr>
                    ) : (
                      workStops.map((stop, stopIdx) => {
                        const start = parseLocalDate(stop.stopDate);
                        const end = parseLocalDate(stop.resumeDate);
                        // The return-to-work (resume) date is not counted as a stopped day because work has resumed, so we exclude it (no + 1)
                        const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={stop.id} className="hover:bg-stone-50/25">
                            <td className="px-3 py-1.5 font-bold border-r border-stone-200 text-left font-sans">Arrêt N° {stopIdx + 1}</td>
                            <td className="px-3 py-1.5 border-r border-stone-200 font-serif">{stop.stopDate}</td>
                            <td className="px-3 py-1.5 border-r border-stone-200 font-serif">{stop.resumeDate}</td>
                            <td className="px-3 py-1.5 text-red-700 font-bold bg-red-500/[0.02]">{diffDays} jours</td>
                            <td className="px-3 py-1.5 text-left text-stone-500 font-sans font-light italic">{stop.reason || "Interruption d'avancement technique"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MAIN LOWER TABLE BLOCK: DETAILED DURATION AND PRORATA CALCULATION SHEET */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-stone-800 flex items-center gap-1 border-b border-stone-200 pb-1">
                <ChevronRight className="h-4 w-4" /> III. Feuille Analytique Calendaire d'Indexation & de Calcul du Coefficient
              </h4>
              <div className="overflow-x-auto rounded-lg border-2 border-stone-800 shadow-sm">
                <table className="w-full text-left border-collapse text-xs font-serif">
                  <thead>
                    {/* Header line 1 */}
                    <tr className="bg-stone-100 border-b border-stone-300 font-sans font-bold text-stone-700 text-center text-[10px] uppercase">
                      <th rowSpan={2} className="px-2 py-3 border-r border-stone-300 text-left w-14">DP N°</th>
                      <th rowSpan={2} className="px-2 py-3 border-r border-stone-300">PÉROIDE REPRÉENTATIVE</th>
                      <th colSpan={2} className="px-2 py-1.5 border-r border-stone-300 border-b border-stone-200">JOURÉES DE TRAVAUX</th>
                      <th rowSpan={2} className="px-2 py-3 border-r border-stone-300">% PRORATA DE PÉRIODE</th>
                      <th rowSpan={2} className="px-2 py-3 border-r border-stone-300 text-right w-24">PART FILTRÉ (HT)</th>
                      <th rowSpan={2} className="px-2 py-3 border-r border-stone-300 text-center w-14">INDEX BAT6</th>
                      <th rowSpan={2} className="px-2 py-3 border-r border-stone-300 text-right w-20">COEF {b} (Im/I₀)</th>
                      <th rowSpan={2} className="px-2 py-3 border-r border-stone-300 text-right w-20">(P/P₀) - 1</th>
                      <th rowSpan={2} className="px-2 py-3 text-right font-sans text-brand-brown w-28 font-bold">MONTANT RÉVISÉ (ECART)</th>
                    </tr>
                    {/* Header line 2 */}
                    <tr className="bg-stone-50 border-b border-stone-300 font-sans font-bold text-[9px] text-stone-550 text-center uppercase">
                      <th className="px-2 py-1 border-r border-stone-300 w-16">PARTIELLE</th>
                      <th className="px-1.5 py-1 border-r border-stone-300 w-16">CUMULÉE DP</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-stone-300 font-mono text-[11px] text-stone-800">
                    {calculatedDps.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-6 font-sans italic text-stone-400">Pour lancer la feuille de révision, veuillez ajouter vos décomptes provisoires ci-dessus.</td>
                      </tr>
                    ) : (
                      calculatedDps.map((dp) => {
                        return (
                          <React.Fragment key={dp.dpId}>
                            {/* Segment header for each DP block */}
                            <tr className="bg-stone-100/50 border-t-2 border-stone-400 font-sans font-bold text-stone-800">
                              <td colSpan={2} className="px-3 py-1.5 text-left border-r border-stone-200 tracking-wider">
                                SÉQUENCE {dp.dpName} • Facture Période : {formatMAD(dp.partialAmount)}
                              </td>
                              <td colSpan={2} className="px-2 py-1.5 border-r border-stone-200 text-center">
                                total : {dp.totalActiveDays} jrs actifs
                              </td>
                              <td className="px-2 py-1.5 border-r border-stone-200"></td>
                              <td colSpan={5} className="px-3 py-1.5 text-right font-mono text-[10px] text-stone-500 italic">
                                Intervalle Calendaire du {dp.startDateStr} au {dp.endDateStr}
                              </td>
                            </tr>

                            {/* Subperiods listing */}
                            {dp.subPeriods.map((sub, sIdx) => {
                              const prorata = dp.totalActiveDays > 0 ? (sub.daysCount / dp.totalActiveDays) : 0;
                              const share = dp.partialAmount * prorata;
                              
                              const Im = getIndexValue(sub.monthKey);
                              const Km_val = a + b * (Im / baseValue);
                              const variation = Km_val - 1; // (P/P0) - 1
                              const surcharge = share * variation;

                              const monthLabel = getFrenchMonthLabel(sub.monthKey);

                              return (
                                <tr key={sub.monthKey} className="hover:bg-amber-500/[0.01]">
                                  <td className="px-3 py-2 border-r border-stone-250 font-sans font-medium text-stone-500">{dp.dpName}</td>
                                  <td className="px-3 py-2 border-r border-stone-250 font-serif text-[11px] text-left text-stone-600">
                                    {monthLabel} : du {sub.startDate} au {sub.endDate}
                                  </td>
                                  <td className="px-2 py-2 border-r border-stone-250 text-center font-bold text-stone-900 bg-stone-50/50">{sub.daysCount}</td>
                                  <td className="px-2 py-2 border-r border-stone-250 text-center font-bold text-stone-500">
                                    {sIdx === dp.subPeriods.length - 1 ? dp.totalActiveDays : "-"}
                                  </td>
                                  <td className="px-2 py-2 border-r border-stone-250 text-center text-[10px]">
                                    {(prorata * 100).toFixed(2)} %
                                  </td>
                                  <td className="px-3 py-2 border-r border-stone-250 text-right text-stone-700">
                                    {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(share)}
                                  </td>
                                  <td className="px-3 py-2 border-r border-stone-250 text-center font-bold text-emerald-800">
                                    {Im.toFixed(1)}
                                  </td>
                                  <td className="px-3 py-2 border-r border-stone-250 text-right bg-stone-50/30 text-stone-600">
                                    {(b * (Im / baseValue)).toFixed(4)}
                                  </td>
                                  <td className={`px-3 py-2 border-r border-stone-250 text-right font-semibold ${
                                    variation >= 0 ? "text-emerald-700" : "text-red-700"
                                  }`}>
                                    {variation >= 0 ? "+" : ""}{variation.toFixed(4)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-black text-brand-brown bg-amber-500/[0.02]">
                                    {surcharge >= 0 ? "+" : ""}{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(surcharge)}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })
                    )}

                    {/* Grand Finishes summary inside invoice structure */}
                    <tr className="border-t-4 border-stone-800 bg-stone-100 text-stone-900 font-sans font-bold text-xs">
                      <td colSpan={4} className="px-4 py-3 border-r border-stone-300 text-right uppercase">
                        Somme Cumulative des Travaux Facturés HT :
                      </td>
                      <td colSpan={2} className="px-4 py-3 border-r border-stone-300 text-right font-mono text-stone-800 font-bold bg-stone-50">
                        {formatMAD(totalBilledPartialHT)}
                      </td>
                      <td colSpan={3} className="px-4 py-3 border-r border-stone-300 text-right uppercase text-brand-brown">
                        Total Ajustement d'Indexation (HT) :
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-base font-black text-brand-brown bg-amber-500/[0.04]">
                        {totalRevisedSurchargeHT >= 0 ? "+" : ""}{formatMAD(totalRevisedSurchargeHT)}
                      </td>
                    </tr>

                    <tr className="bg-stone-900 text-brand-gold font-sans font-black text-xs border-t-2 border-stone-700">
                      <td colSpan={4} className="px-4 py-3.5 text-right uppercase">
                        ÉCART DE RÉVISION GLOBAL NET À DÉLEGUER (TTC {projectDetails.tvaRate}% incl.) :
                      </td>
                      <td colSpan={2} className="px-4 py-3.5 text-right font-mono text-[11px] text-brand-gold font-medium bg-stone-850">
                        Montant de réexpédition
                      </td>
                      <td colSpan={3} className="px-4 py-3.5 text-right uppercase text-[12px] tracking-wider">
                        NET À PAYER DE LA RÉVISION :
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-lg font-black bg-stone-850">
                        {totalRevisedSurchargeTTC >= 0 ? "+" : ""}{formatMAD(totalRevisedSurchargeTTC)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-6 pt-16 font-sans text-xs uppercase text-stone-600 font-semibold text-center border-t border-stone-100">
              <div className="space-y-12">
                <p>L'Abonnateur Adjudicataire (Entreprise)<br/>TRADITION & PATRIMOINE DU SUD</p>
                <div className="h-10"></div>
                <p className="text-[10px] text-stone-400 font-light italic font-serif lowercase">lu et approuvé pour montant de révision de {formatMAD(totalRevisedSurchargeTTC)}</p>
              </div>

              <div className="space-y-12">
                <p>Le Maître d'Ouvrage (Administration)<br/>Région de Marrakech-Safi • Bureau du Contrôle</p>
                <div className="h-10"></div>
                <p className="text-[10px] text-stone-400 font-light italic font-serif lowercase">visé et validé par l'ordonnateur de crédit régional</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE TAB 2: SIMPLIFIED COEFFICIENT K CALCULATOR */}
      {/* ========================================================================= */}
      {mode === "simplified" && (
        <div className="space-y-6">
          {/* Timeline Selector for simplified calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-2 text-xs">
              <span className="font-bold text-stone-700 block uppercase">Indice d'Ouverture des Plis (I₀ - Base)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase">Mois d'Ouverture</label>
                  <select
                    value={projectDetails.baseIndexMonth}
                    onChange={handleBaseIndexSelect}
                    className="w-full rounded border border-stone-300 bg-white px-3 py-1 font-sans text-stone-850"
                  >
                    {indexHistoryBAT6.map((h, i) => (
                      <option key={i} value={h.date}>{h.date} - {h.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase">Valeur de l'index I₀</label>
                  <input
                    type="number"
                    step="any"
                    value={projectDetails.baseIndexValue}
                    onChange={(e) => triggerSaveDetails({ baseIndexValue: parseFloat(e.target.value) || 1 })}
                    className="w-full rounded border border-stone-300 bg-white px-3 py-1 font-mono font-bold text-stone-950"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-2 text-xs">
              <span className="font-bold text-stone-700 block uppercase">Indice Exécution Unitaire (I - Actuel)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase">Mois d'exécution</label>
                  <select
                    value={projectDetails.revisionIndexMonth}
                    onChange={handleRevisionIndexSelect}
                    className="w-full rounded border border-stone-300 bg-white px-3 py-1 font-sans text-stone-850"
                  >
                    {indexHistoryBAT6.map((h, i) => (
                      <option key={i} value={h.date}>{h.date} - {h.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase">Valeur de l'index I</label>
                  <input
                    type="number"
                    step="any"
                    value={projectDetails.revisionIndexValue}
                    onChange={(e) => triggerSaveDetails({ revisionIndexValue: parseFloat(e.target.value) || 1 })}
                    className="w-full rounded border border-stone-300 bg-white px-3 py-1 font-mono font-bold text-stone-950"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Golden Badge Formula K visualizer */}
          <div className="rounded-xl bg-gradient-to-r from-brand-brown/5 to-brand-gold/5 p-5 border border-brand-gold/15 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2 text-xs">
              <span className="font-sans font-black text-xs text-brand-brown uppercase tracking-wider block">Coefficient Simple CCAG-Travaux Marocain</span>
              <p className="text-stone-600 leading-normal">
                Cette formule estime le coefficient de facturation cumulé pour des travaux exécutés globalement sur un mois d'évaluation unique, sans proratisation d'intervalles intermédiaires.
              </p>
              <div className="font-mono text-xs font-semibold text-stone-850 mt-1 space-y-1 bg-white/80 border rounded p-2.5 max-w-fit">
                <div>Formule : K = {a} + {b} × ( I / I₀ )</div>
                <div className="text-brand-brown">Évaluation : K = {a} + {b} × ( {projectDetails.revisionIndexValue} / {projectDetails.baseIndexValue} ) = <span className="font-bold underline">{K_simple.toFixed(5)}</span></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-brand-gold/30 text-center space-y-1.5 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 block font-semibold">COEFFICIENT UNIQUE K</span>
              <span className="font-mono text-2xl font-bold text-brand-brown">{K_simple.toFixed(5)}</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold inline-block">
                Variation d'offres : + {((K_simple - 1) * 100).toFixed(2)} %
              </span>
            </div>
          </div>

          {/* Simple items grid breakdown */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold text-stone-900 uppercase tracking-widest">Impact sur Bordereau de Prix Unitaires (BPU) de Palier</h3>
            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
              <table className="w-full border-collapse text-left text-xs text-stone-600">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <th className="px-5 py-3 w-16">Prix Unit</th>
                    <th className="px-5 py-3">Ouvrage</th>
                    <th className="px-5 py-3 text-right">P.U Initial (MAD)</th>
                    <th className="px-5 py-3 text-right">P.U Révisé K (MAD)</th>
                    <th className="px-5 py-3 text-right w-24">Quantité</th>
                    <th className="px-5 py-3 text-right">Montant Initial HT</th>
                    <th className="px-5 py-3 text-right">Montant Révisé HT</th>
                    <th className="px-5 py-3 text-right text-brand-terracotta">Écart de Révision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 font-mono text-[11px]">
                  {workItems.map((item) => {
                    const qty = calcItemTotalQuantity(item.id);
                    const initCost = qty * item.unitPrice;
                    const revisedUnitPrice = item.unitPrice * K_simple;
                    const revisedCost = qty * revisedUnitPrice;
                    const gap = revisedCost - initCost;

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/25">
                        <td className="px-5 py-2.5 font-bold text-stone-900">{item.code}</td>
                        <td className="px-5 py-2.5 font-sans text-stone-600 line-clamp-1">{item.description}</td>
                        <td className="px-5 py-2.5 text-right">{item.unitPrice.toFixed(2)}</td>
                        <td className="px-5 py-2.5 text-right font-medium text-stone-950">{revisedUnitPrice.toFixed(2)}</td>
                        <td className="px-5 py-2.5 text-right font-bold text-stone-700">{qty.toFixed(3)}</td>
                        <td className="px-5 py-2.5 text-right">{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(initCost)}</td>
                        <td className="px-5 py-2.5 text-right font-semibold text-stone-900">{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(revisedCost)}</td>
                        <td className="px-5 py-2.5 text-right font-black text-brand-terracotta">+ {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(gap)}</td>
                      </tr>
                    );
                  })}

                  {/* Simplified Totals Statement */}
                  {(() => {
                    let totalInit = 0;
                    let totalRevised = 0;
                    workItems.forEach((item) => {
                      const q = calcItemTotalQuantity(item.id);
                      totalInit += q * item.unitPrice;
                      totalRevised += q * item.unitPrice * K_simple;
                    });
                    const totalGap = totalRevised - totalInit;

                    return (
                      <>
                        <tr className="bg-stone-50 font-sans text-xs border-t border-stone-200 font-bold">
                          <td colSpan={5} className="px-5 py-3 text-right text-stone-500 uppercase tracking-wider">
                            Somme Cumulative Hors Taxes (HT) :
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-stone-500">
                            {formatMAD(totalInit)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-stone-900">
                            {formatMAD(totalRevised)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-brand-terracotta font-bold">
                            + {formatMAD(totalGap)}
                          </td>
                        </tr>
                        <tr className="bg-stone-100 font-sans text-sm font-black text-brand-brown">
                          <td colSpan={5} className="px-5 py-3.5 text-right uppercase tracking-wider">
                            ÉCART DE RÉVISION TTC ({projectDetails.tvaRate}% TVA incl.) :
                          </td>
                          <td colSpan={3} className="px-5 py-3.5 text-right font-mono text-base font-black">
                            + {formatMAD(totalGap * (1 + projectDetails.tvaRate / 100))}
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
