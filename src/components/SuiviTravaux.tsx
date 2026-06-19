import React, { useState } from "react";
import { WorkItem, WorkItemProgress } from "../types";
import { 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Save, 
  Edit3, 
  Check, 
  TrendingUp, 
  Info,
  Layers,
  FileText
} from "lucide-react";

interface SuiviTravauxProps {
  workItems: WorkItem[];
  suiviTravaux: WorkItemProgress[];
  onUpdateSuivi: (updated: WorkItemProgress[]) => void;
  calcItemTotalQuantity: (itemId: string) => number;
}

export default function SuiviTravaux({
  workItems,
  suiviTravaux,
  onUpdateSuivi,
  calcItemTotalQuantity
}: SuiviTravauxProps) {
  // Local state for editing progress values
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPercent, setEditPercent] = useState<number>(0);
  const [editRemarks, setEditRemarks] = useState<string>("");

  // Get progress for a specific item
  const getItemProgress = (itemId: string): WorkItemProgress => {
    const found = suiviTravaux.find(s => s.itemId === itemId);
    if (found) return found;
    return {
      itemId,
      progressPercentage: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      remarks: ""
    };
  };

  // List of unique categories for filtering
  const categories = Array.from(new Set(workItems.map(item => item.category || "Maçonnerie & Gros Œuvre")));
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  // Filter items
  const filteredItems = selectedCategory === "Tous" 
    ? workItems 
    : workItems.filter(item => (item.category || "Maçonnerie & Gros Œuvre") === selectedCategory);

  // Calculate statistics
  const calculateStats = () => {
    let totalEstimatedValue = 0;
    let totalExecutedValue = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;

    workItems.forEach(item => {
      const gty = calcItemTotalQuantity(item.id);
      const value = gty * item.unitPrice;
      totalEstimatedValue += value;

      const progress = getItemProgress(item.id);
      const executed = (value * progress.progressPercentage) / 100;
      totalExecutedValue += executed;

      if (progress.progressPercentage === 100) {
        completedCount++;
      } else if (progress.progressPercentage > 0) {
        inProgressCount++;
      } else {
        notStartedCount++;
      }
    });

    const averageProgress = totalEstimatedValue > 0 
      ? (totalExecutedValue / totalEstimatedValue) * 100 
      : 0;

    return {
      totalEstimatedValue,
      totalExecutedValue,
      averageProgress,
      completedCount,
      inProgressCount,
      notStartedCount
    };
  };

  const stats = calculateStats();

  const handleStartEdit = (item: WorkItem) => {
    const prog = getItemProgress(item.id);
    setEditingItemId(item.id);
    setEditPercent(prog.progressPercentage);
    setEditRemarks(prog.remarks || "");
  };

  const handleSaveProgress = (itemId: string) => {
    const otherProgress = suiviTravaux.filter(s => s.itemId !== itemId);
    const updatedRecord: WorkItemProgress = {
      itemId,
      progressPercentage: Math.min(100, Math.max(0, editPercent)),
      lastUpdated: new Date().toISOString().slice(0, 10),
      remarks: editRemarks.trim()
    };

    onUpdateSuivi([...otherProgress, updatedRecord]);
    setEditingItemId(null);
  };

  const formatMAD = (val: number) => {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(val);
  };

  const getStatusBadge = (percent: number) => {
    if (percent === 100) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Réalisé (100%)
        </span>
      );
    } else if (percent > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-black text-amber-700 border border-amber-200">
          <Clock className="h-3 w-3" /> En cours ({percent}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-500 border border-stone-200">
          Absence de début (0%)
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Arabic and French Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-250 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-terracotta bg-brand-clay/30 border border-brand-clay/50 px-3 py-1 rounded-full font-bold">
            Suivi des Travaux • تتبع سير الأشغال
          </span>
          <h2 className="text-xl font-extrabold text-stone-930 mt-2">
            Tableau d'Avancement Physique des Ouvrages
          </h2>
          <p className="text-stone-500 text-xs mt-1">
            Enregistrez l'avancement cumulé réel des travaux de chaque rubrique pour calculer le taux global de réalisation physique et prévisionnel.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-right">
          <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Taux de Réalisation Global (Pondéré)</span>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="text-2xl font-mono font-black text-brand-brown">
              {stats.averageProgress.toFixed(2)}%
            </span>
          </div>
          <div className="w-48 h-2 bg-stone-200 rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-gradient-to-r from-brand-gold to-brand-brown transition-all duration-500"
              style={{ width: `${stats.averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Montant Estimé Total</span>
            <strong className="text-lg font-mono font-black text-stone-900 block mt-1">
              {formatMAD(stats.totalEstimatedValue)}
            </strong>
          </div>
          <div className="bg-stone-50 text-stone-400 rounded-lg p-2.5">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Valorisation Travaux Réalisés</span>
            <strong className="text-lg font-mono font-black text-emerald-700 block mt-1">
              {formatMAD(stats.totalExecutedValue)}
            </strong>
          </div>
          <div className="bg-emerald-50 text-emerald-600 rounded-lg p-2.5">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">État d'Avancement des Prestations</span>
            <div className="flex gap-2.5 mt-1.5">
              <span className="text-xs text-stone-600 font-medium">Completed: <strong className="font-bold text-emerald-600">{stats.completedCount}</strong></span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-600 font-medium">In Progress: <strong className="font-bold text-amber-600">{stats.inProgressCount}</strong></span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-600 font-medium">Not Started: <strong className="font-bold text-stone-500">{stats.notStartedCount}</strong></span>
            </div>
          </div>
          <div className="bg-amber-100/50 text-brand-brown rounded-lg p-2.5">
            <BarChart2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main interactive grid list */}
      <div className="bg-white rounded-2xl border border-stone-250 overflow-hidden shadow-xs">
        {/* Navigation / Filter pills */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center justify-between overflow-x-auto gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <Layers className="h-4 w-4 text-brand-gold" />
            <span className="text-xs font-bold text-stone-700">Filtrer par Élément :</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setSelectedCategory("Tous")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedCategory === "Tous"
                  ? "bg-brand-brown text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-200"
              }`}
            >
              Tous ({workItems.length})
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-brand-brown text-white shadow-sm"
                    : "text-stone-500 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Work items grid */}
        <div className="divide-y divide-stone-200">
          {filteredItems.map(item => {
            const qty = calcItemTotalQuantity(item.id);
            const totalCost = qty * item.unitPrice;
            const progress = getItemProgress(item.id);
            const isEditingThis = editingItemId === item.id;
            const executedAmount = (totalCost * progress.progressPercentage) / 100;

            return (
              <div 
                key={item.id} 
                className={`p-4 transition duration-150 ${
                  isEditingThis ? "bg-amber-500/5" : "hover:bg-stone-50/50"
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                  {/* Left part: item descriptor */}
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-stone-200 text-stone-850 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        Code {item.code}
                      </span>
                      <span className="text-stone-400 text-xs">•</span>
                      <span className="text-stone-500 text-[10.5px] uppercase font-mono tracking-wide font-semibold">
                        {item.category || "Gros Œuvre / Maçonnerie"}
                      </span>
                    </div>
                    <h4 className="text-stone-900 font-bold text-xs md:text-sm">{item.description}</h4>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                      <span>Quantité: <strong className="font-semibold text-stone-800">{qty.toFixed(2)} {item.unit}</strong></span>
                      <span>•</span>
                      <span>Prix U: <strong className="font-semibold text-stone-800 font-mono">{formatMAD(item.unitPrice)}</strong></span>
                      <span>•</span>
                      <span>Budget Total: <strong className="font-semibold text-stone-900 font-mono">{formatMAD(totalCost)}</strong></span>
                    </div>

                    {progress.remarks && !isEditingThis && (
                      <div className="mt-2 text-[11px] bg-stone-50 border-l-2 border-brand-brown p-2 rounded text-stone-600 block italic">
                        <strong>Remarque de suivi : </strong> {progress.remarks}
                        <span className="text-[10px] text-stone-400 font-mono block not-italic mt-0.5">Mis à jour le {progress.lastUpdated}</span>
                      </div>
                    )}
                  </div>

                  {/* Right part: progress values or editing controls */}
                  <div className="lg:text-right flex flex-col md:flex-row lg:flex-col items-start md:items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 border-stone-100 pt-3 lg:pt-0 shrink-0">
                    {isEditingThis ? (
                      <div className="bg-white border border-stone-250 p-3 rounded-xl shadow-xs space-y-2.5 w-full md:w-80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-700">Ajuster l'avancement :</span>
                          <span className="font-mono font-black text-brand-brown">{editPercent}%</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={editPercent}
                            onChange={(e) => setEditPercent(parseInt(e.target.value) || 0)}
                            className="w-full accent-brand-brown cursor-pointer"
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editPercent}
                            onChange={(e) => setEditPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-14 p-1 text-center font-mono font-bold text-xs border border-stone-200 rounded h-7 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] text-stone-400 block uppercase font-bold">Remarques / Blocages / Observations</label>
                          <input
                            type="text"
                            placeholder="ex: Travaux en cours, encours séchage..."
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            className="w-full p-2 bg-stone-50 border border-stone-200 text-xs rounded text-stone-900 focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-1.5 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="px-2.5 py-1 text-[10px] font-bold text-stone-500 hover:text-stone-900 border border-stone-200 rounded"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveProgress(item.id)}
                            className="px-3 py-1 text-[10px] bg-brand-brown text-brand-gold rounded hover:opacity-90 font-bold inline-flex items-center gap-0.5"
                          >
                            <Save className="h-3 w-3" /> Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 block md:text-right">
                          <div className="flex items-center lg:justify-end gap-2">
                            {getStatusBadge(progress.progressPercentage)}
                          </div>
                          <p className="text-xs text-stone-500 font-mono">
                            Réalisé : <strong className="text-stone-900">{formatMAD(executedAmount)} HT</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-brand-brown hover:text-brand-gold text-stone-700 font-bold rounded-lg text-xs transition"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Mettre à jour (تحديث)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-stone-400 italic text-xs">
              Aucun élément d'ouvrage correspondant dans cette catégorie.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
