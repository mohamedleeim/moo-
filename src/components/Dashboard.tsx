import React, { useState } from "react";
import { WorkItem, MeasurementLine, ProjectDetails } from "../types";
import { 
  Briefcase, 
  User, 
  FileText, 
  TrendingUp, 
  Calculator, 
  MapPin, 
  Calendar,
  Percent,
  Compass,
  Edit2,
  Check
} from "lucide-react";

interface DashboardProps {
  workItems: WorkItem[];
  measurementLines: MeasurementLine[];
  projectDetails: ProjectDetails;
  setProjectDetails: (details: ProjectDetails) => void;
  calcItemTotalQuantity: (itemId: string) => number;
}

export default function Dashboard({
  workItems,
  measurementLines,
  projectDetails,
  setProjectDetails,
  calcItemTotalQuantity
}: DashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<ProjectDetails>({ ...projectDetails });

  const handleSave = () => {
    setProjectDetails(editedDetails);
    setIsEditing(false);
  };

  // Calculations
  const calculateTotals = () => {
    let totalBaseHT = 0;
    workItems.forEach((item) => {
      const gty = calcItemTotalQuantity(item.id);
      totalBaseHT += gty * item.unitPrice;
    });

    const K = projectDetails.fixedPart + projectDetails.revisedPart * (projectDetails.revisionIndexValue / projectDetails.baseIndexValue);
    const totalRevisedHT = totalBaseHT * K;
    const revisionPlusValue = totalRevisedHT - totalBaseHT;

    const baseTva = (totalBaseHT * projectDetails.tvaRate) / 100;
    const baseTtc = totalBaseHT + baseTva;

    const revisedTva = (totalRevisedHT * projectDetails.tvaRate) / 100;
    const revisedTtc = totalRevisedHT + revisedTva;

    return {
      totalBaseHT,
      K,
      totalRevisedHT,
      revisionPlusValue,
      baseTva,
      baseTtc,
      revisedTva,
      revisedTtc
    };
  };

  const totals = calculateTotals();

  // Get distribution by category
  const getCategoryStats = () => {
    const categories: { [key: string]: number } = {};
    workItems.forEach((item) => {
      const qty = calcItemTotalQuantity(item.id);
      const totalCost = qty * item.unitPrice;
      const cat = item.category || "Autre";
      categories[cat] = (categories[cat] || 0) + totalCost;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const categoryStats = getCategoryStats();
  const maxCategoryCost = Math.max(...categoryStats.map((c) => c.value), 1);

  // Format currencies
  const formatMAD = (val: number) => {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner / Project Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-brown to-stone-900 p-8 text-white shadow-xl">
        {/* Decorative backdrop patterns resembling Moroccan zellige contours */}
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-12 -translate-y-12 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="h-full w-full">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" />
            <circle cx="50" cy="50" r="30" />
            <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-brand-gold">
              <Compass className="h-3.5 w-3.5" /> Restaurations Historiques
            </span>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setEditedDetails({ ...projectDetails });
                  setIsEditing(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-white focus:ring-2 focus:ring-brand-gold/50"
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4" /> Enregistrer les infos
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" /> Modifier l'en-tête
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-stone-400">Titre du Marché</label>
                <input
                  type="text"
                  value={editedDetails.title}
                  onChange={(e) => setEditedDetails({ ...editedDetails, title: e.target.value })}
                  className="w-full rounded-md border border-stone-700 bg-stone-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-stone-400">N° de Marché</label>
                <input
                  type="text"
                  value={editedDetails.contractNumber}
                  onChange={(e) => setEditedDetails({ ...editedDetails, contractNumber: e.target.value })}
                  className="w-full rounded-md border border-stone-700 bg-stone-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-stone-400">Maître d'Ouvrage (Client)</label>
                <input
                  type="text"
                  value={editedDetails.client}
                  onChange={(e) => setEditedDetails({ ...editedDetails, client: e.target.value })}
                  className="w-full rounded-md border border-stone-700 bg-stone-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-stone-400">Entreprise Adjudicataire</label>
                <input
                  type="text"
                  value={editedDetails.contractor}
                  onChange={(e) => setEditedDetails({ ...editedDetails, contractor: e.target.value })}
                  className="w-full rounded-md border border-stone-700 bg-stone-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-stone-400">Taux de TVA (%)</label>
                <input
                  type="number"
                  value={editedDetails.tvaRate}
                  onChange={(e) => setEditedDetails({ ...editedDetails, tvaRate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-stone-700 bg-stone-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3.5xl text-brand-clay leading-tight">
                {projectDetails.title}
              </h1>
              <p className="text-sm font-light text-stone-300 max-w-3xl">
                Suivi quantitatif (métré), valorisation financière (décompte) et calcul automatique de la révision des prix pour les ouvrages traditionnels restructurés selon les normes du patrimoine historique de Marrakech.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-3 gap-x-6 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-3 text-xs text-stone-300 font-mono">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-gold" />
              <span>{projectDetails.contractNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-gold" />
              <span>M.O : {projectDetails.client}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-gold" />
              <span>Entr : {projectDetails.contractor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Base Total */}
        <div id="kpi-base" className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Montant de Base HT</span>
            <div className="rounded-lg bg-stone-100 p-2 text-stone-600">
              <Calculator className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-xl font-bold text-stone-900 md:text-2xl">
              {formatMAD(totals.totalBaseHT)}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              TTC: {formatMAD(totals.baseTtc)} <span className="font-sans text-[10px] bg-stone-200/50 px-1.5 py-0.5 rounded">TVA {projectDetails.tvaRate}%</span>
            </p>
          </div>
        </div>

        {/* Revision Coefficient K */}
        <div id="kpi-k" className="rounded-xl border border-brand-gold/30 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-brown">Coefficient Révision K</span>
            <div className="rounded-lg bg-brand-clay p-2 text-brand-brown">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-xl font-bold text-brand-brown md:text-2xl">
              {totals.K.toFixed(5)}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Formule: <span className="font-semibold">{projectDetails.fixedPart} + {projectDetails.revisedPart} × (I/I₀)</span>
            </p>
          </div>
        </div>

        {/* Revised Total */}
        <div id="kpi-revised" className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Montant Révisé HT</span>
            <div className="rounded-lg bg-stone-100 p-2 text-stone-600">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-xl font-bold text-stone-900 md:text-2xl">
              {formatMAD(totals.totalRevisedHT)}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              TTC Révisé: {formatMAD(totals.revisedTtc)}
            </p>
          </div>
        </div>

        {/* Plus-Value / Margin */}
        <div id="kpi-plusvalue" className="rounded-xl border border-brand-terracotta/20 bg-brand-terracotta/[0.02] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-terracotta">Plus-Value de révision</span>
            <div className="rounded-lg bg-brand-terracotta/10 p-2 text-brand-terracotta">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-xl font-bold text-brand-terracotta md:text-2xl">
              + {formatMAD(totals.revisionPlusValue)}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Escalation des coûts: <span className="font-semibold text-brand-terracotta">{((totals.K - 1) * 100).toFixed(2)}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* cost comparisons & Moroccan Architecture notes */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cost Comparison graph */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-stone-900 mb-4">Comparaison Financière : Base vs Révisé</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-stone-700">Montant de Base (Initial)</span>
                <span className="font-mono font-bold text-stone-900">{formatMAD(totals.totalBaseHT)} HT</span>
              </div>
              <div className="h-4 w-full rounded-full bg-stone-100 overflow-hidden">
                <div 
                  className="h-full bg-stone-400 transition-all duration-500"
                  style={{ width: `${Math.min((totals.totalBaseHT / Math.max(totals.totalRevisedHT, 1)) * 100, 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-stone-400 flex justify-between">
                <span>0%</span>
                <span>Provisoire</span>
                <span>{formatMAD(totals.baseTtc)} TTC</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-brand-brown">Montant Révisé (Réajusté)</span>
                <span className="font-mono font-bold text-brand-brown">{formatMAD(totals.totalRevisedHT)} HT</span>
              </div>
              <div className="h-4 w-full rounded-full bg-stone-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-gold to-brand-terracotta transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="text-[11px] text-stone-400 flex justify-between">
                <span>0%</span>
                <span>Indices de travaux {projectDetails.baseIndexName}</span>
                <span>{formatMAD(totals.revisedTtc)} TTC</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-stone-50 p-4 text-xs text-stone-600 border border-stone-100 space-y-1.5 font-sans">
            <p className="font-bold text-stone-800">💡 Fonctionnement réglementaire au Maroc :</p>
            <p>La révision est calculée à chaque décompte mensuel s'il y a des variations dans l'indice de référence (<strong>{projectDetails.baseIndexName}</strong>). L'indice initial (<strong>I₀ = {projectDetails.baseIndexValue}</strong>) de {projectDetails.baseIndexMonth} est comparé à l'indice de réalisation (<strong>I = {projectDetails.revisionIndexValue}</strong>) de {projectDetails.revisionIndexMonth} pour rétablir l'équilibre financier de l'entreprise face à la hausse des coûts des matériaux traditionnels.</p>
          </div>
        </div>

        {/* Moroccan architecture & Palier Bahia Historic Notes */}
        <div className="rounded-xl border border-brand-gold/20 bg-brand-clay/35 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-brown text-white">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-md font-bold text-brand-brown">Palier El Bahia</h4>
                <p className="text-[11px] font-mono tracking-widest uppercase text-stone-500">Marrakech, Maroc</p>
              </div>
            </div>
            
            <p className="text-xs text-stone-700 leading-relaxed font-light">
              Le <strong>Palais de la Bahia</strong> (XIXe siècle) est un chef-d'œuvre de l'architecture marocaine. La reconstruction de ses paliers nécessite l'usage exclusif de matériaux indigènes récompensés au sillage traditionnel de briques de terre cuite posées au mortier de chaux grasse et de sable ocre de l'Oued Tensift, des revêtements en Bejmat fait main, et des mosaïques de Zellij aux colorations minérales naturelles.
            </p>
          </div>

          <div className="border-t border-brand-gold/20 pt-4 mt-2 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-stone-500">Indices de base (I₀) :</span>
              <span className="font-bold text-stone-800">{projectDetails.baseIndexValue} ({projectDetails.baseIndexMonth})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Indices d'actuel (I) :</span>
              <span className="font-bold text-stone-800">{projectDetails.revisionIndexValue} ({projectDetails.revisionIndexMonth})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Coeff. de Sécurité d'Escalation :</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">Actif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Category Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-stone-900">Répartition Budgétaire Hors Taxe</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categoryStats.map((cat, idx) => {
            const percentage = (cat.value / Math.max(totals.totalBaseHT, 1)) * 100;
            return (
              <div key={idx} className="rounded-xl border border-stone-150 bg-white p-4 shadow-xs">
                <div className="flex justify-between text-xs font-semibold text-stone-500 mb-1">
                  <span className="truncate max-w-[210px]">{cat.name}</span>
                  <span className="font-mono text-stone-900">{formatMAD(cat.value)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                  <div 
                    className="h-full bg-brand-gold transition-all duration-300"
                    style={{ width: `${(cat.value / maxCategoryCost) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
