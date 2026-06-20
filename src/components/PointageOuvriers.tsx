import React, { useState } from "react";
import { Worker, DailyPointage, WorkDayPointage } from "../types";
import { 
  UserPlus, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Coins, 
  Printer, 
  Users, 
  Save, 
  CheckCircle2, 
  Briefcase,
  AlertCircle,
  FileCheck2,
  DollarSign,
  Plus,
  X,
  Eye
} from "lucide-react";

interface PointageOuvriersProps {
  workers: Worker[];
  pointages: DailyPointage[];
  onUpdateWorkers: (updated: Worker[]) => void;
  onUpdatePointages: (updated: DailyPointage[]) => void;
}

export default function PointageOuvriers({
  workers,
  pointages,
  onUpdateWorkers,
  onUpdatePointages
}: PointageOuvriersProps) {
  // Workers roster form states
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerRole, setNewWorkerRole] = useState("Maçon traditionnel");
  const [newWorkerRate, setNewWorkerRate] = useState("");
  const [newWorkerPhone, setNewWorkerPhone] = useState("");
  const [newWorkerCin, setNewWorkerCin] = useState("");
  const [newWorkerAdvance, setNewWorkerAdvance] = useState("");

  // Printable situation state (Fiche de paie / reçu)
  const [printTarget, setPrintTarget] = useState<{ type: 'all' | 'individual', workerId?: string } | null>(null);

  // Pointage worksheet states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [timesheetNotes, setTimesheetNotes] = useState("");

  // Active worksheet values (temporary editing holds for selectedDate)
  const getPointageForDate = (dateStr: string): DailyPointage => {
    const found = pointages.find(p => p.date === dateStr);
    if (found) return found;
    
    // Fallback: seed with all workers marked as absent or unrecorded, with zero advance
    const initialDayPointages: WorkDayPointage[] = workers.map(w => ({
      workerId: w.id,
      status: "absent",
      advancePaid: 0,
      remarks: ""
    }));

    return {
      id: "ptg-" + Date.now() + Math.random().toString(36).substr(2, 4),
      date: dateStr,
      pointages: initialDayPointages,
      note: ""
    };
  };

  const activeDayPointage = getPointageForDate(selectedDate);

  // Handle worker enrollment
  const handleAddNewWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) {
      alert("Veuillez saisir le nom complet de l'ouvrier.");
      return;
    }
    const rate = parseFloat(newWorkerRate);
    if (isNaN(rate) || rate <= 0) {
      alert("Veuillez spécifier un tarif journalier valide supérieur à 0.");
      return;
    }

    const initialAdv = parseFloat(newWorkerAdvance) || 0;

    const newWorker: Worker = {
      id: "wrk-" + Date.now(),
      name: newWorkerName.trim(),
      role: newWorkerRole.trim(),
      dailyRate: rate,
      phone: newWorkerPhone.trim() || undefined,
      cin: newWorkerCin.trim() || undefined,
      initialAdvance: initialAdv
    };

    const updatedWorkers = [...workers, newWorker];
    onUpdateWorkers(updatedWorkers);

    // Propagate the new worker to already stored historical check-ins as absent
    const updatedPointages = pointages.map(ptg => {
      const hasWorker = ptg.pointages.some(p => p.workerId === newWorker.id);
      if (hasWorker) return ptg;
      return {
        ...ptg,
        pointages: [...ptg.pointages, { workerId: newWorker.id, status: "absent" as const, advancePaid: 0 }]
      };
    });
    onUpdatePointages(updatedPointages);

    // Reset fields
    setNewWorkerName("");
    setNewWorkerRate("");
    setNewWorkerPhone("");
    setNewWorkerCin("");
    setNewWorkerAdvance("");
  };

  // Handle worker firing/deletion
  const handleDeleteWorker = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (window.confirm(`Êtes-vous sûr de vouloir retirer définitivement l'ouvrier "${worker?.name}" ? Toute son historique de paie sera purgée.`)) {
      onUpdateWorkers(workers.filter(w => w.id !== workerId));
      onUpdatePointages(pointages.map(ptg => ({
        ...ptg,
        pointages: ptg.pointages.filter(p => p.workerId !== workerId)
      })));
    }
  };

  // Update status or wage advance inside active date check-in
  const updateActiveDayStatus = (workerId: string, status: "present" | "demi-journee" | "absent" | "conge" | "double-journee" | "jour-et-demi") => {
    const hasRecord = activeDayPointage.pointages.some(p => p.workerId === workerId);
    let updatedPoints: WorkDayPointage[];

    if (hasRecord) {
      updatedPoints = activeDayPointage.pointages.map(p => {
        if (p.workerId === workerId) {
          return { ...p, status };
        }
        return p;
      });
    } else {
      updatedPoints = [...activeDayPointage.pointages, { workerId, status, advancePaid: 0 }];
    }

    const nextDayPointages: DailyPointage = {
      ...activeDayPointage,
      pointages: updatedPoints,
      note: timesheetNotes || activeDayPointage.note
    };

    saveSingleDayPointage(nextDayPointages);
  };

  const updateActiveDayAdvance = (workerId: string, valueStr: string) => {
    const advance = parseFloat(valueStr) || 0;
    const hasRecord = activeDayPointage.pointages.some(p => p.workerId === workerId);
    let updatedPoints: WorkDayPointage[];

    if (hasRecord) {
      updatedPoints = activeDayPointage.pointages.map(p => {
        if (p.workerId === workerId) {
          return { ...p, advancePaid: Math.max(0, advance) };
        }
        return p;
      });
    } else {
      updatedPoints = [...activeDayPointage.pointages, { workerId, status: "absent", advancePaid: Math.max(0, advance) }];
    }

    const nextDayPointages: DailyPointage = {
      ...activeDayPointage,
      pointages: updatedPoints,
      note: timesheetNotes || activeDayPointage.note
    };

    saveSingleDayPointage(nextDayPointages);
  };

  const saveSingleDayPointage = (target: DailyPointage) => {
    const otherPointages = pointages.filter(p => p.date !== target.date);
    onUpdatePointages([...otherPointages, target]);
  };

  // Compute stats recapitulation for a single worker
  const getWorkerRecap = (worker: Worker) => {
    let daysPresent = 0;
    let daysDemi = 0;
    let daysDouble = 0;
    let daysJourEtDemi = 0;
    let daysAbsent = 0;
    let daysConge = 0;
    let wagesEarned = 0;
    let dailyAdvancesSum = 0;

    pointages.forEach(dp => {
      const pt = dp.pointages.find(p => p.workerId === worker.id);
      if (pt) {
        if (pt.status === "present") {
          daysPresent++;
          wagesEarned += worker.dailyRate;
        } else if (pt.status === "demi-journee") {
          daysDemi++;
          wagesEarned += (worker.dailyRate * 0.5);
        } else if (pt.status === "jour-et-demi") {
          daysJourEtDemi++;
          wagesEarned += (worker.dailyRate * 1.5);
        } else if (pt.status === "double-journee") {
          daysDouble++;
          wagesEarned += (worker.dailyRate * 2.0);
        } else if (pt.status === "absent") {
          daysAbsent++;
        } else if (pt.status === "conge") {
          daysConge++;
          wagesEarned += worker.dailyRate; // Paid leave
        }

        if (pt.advancePaid) {
          dailyAdvancesSum += pt.advancePaid;
        }
      }
    });

    const totalDaysEquivalent = daysPresent + (daysDemi * 0.5) + (daysJourEtDemi * 1.5) + (daysDouble * 2) + daysConge;
    const initialAdvance = worker.initialAdvance || 0;
    const totalAdvances = dailyAdvancesSum + initialAdvance;
    const netToPay = wagesEarned - totalAdvances;

    return {
      daysPresent,
      daysDemi,
      daysDouble,
      daysJourEtDemi,
      daysAbsent,
      daysConge,
      totalDaysEquivalent,
      wagesEarned,
      dailyAdvancesSum,
      initialAdvance,
      advancesReceived: totalAdvances,
      netToPay
    };
  };

  // Recapitulation sum for the whole project
  const calculateTotalPayroll = () => {
    let totalEarned = 0;
    let totalAdvances = 0;
    let totalNet = 0;

    workers.forEach(w => {
      const rec = getWorkerRecap(w);
      totalEarned += rec.wagesEarned;
      totalAdvances += rec.advancesReceived;
      totalNet += rec.netToPay;
    });

    return {
      totalEarned,
      totalAdvances,
      totalNet
    };
  };

  const payrollTotals = calculateTotalPayroll();

  // Helper currency format
  const formatMAD = (val: number) => {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(val);
  };

  // Detailed attendance and advances timeline for individual printing
  const getWorkerDetailedHistory = (workerId: string) => {
    const history: { date: string; status: string; statusLabel: string; wage: number; advance: number }[] = [];
    
    // Sort pointages by date ascending
    const sortedPointages = [...pointages].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedPointages.forEach(dp => {
      const pt = dp.pointages.find(p => p.workerId === workerId);
      if (pt) {
        let statusLabel = "";
        let multiplier = 0;
        const worker = workers.find(wrk => wrk.id === workerId);
        const rate = worker ? worker.dailyRate : 0;
        
        if (pt.status === "present") {
          statusLabel = "حاضر كامل اليوم (1.0)";
          multiplier = 1.0;
        } else if (pt.status === "demi-journee") {
          statusLabel = "نصف يوم عمل (0.5)";
          multiplier = 0.5;
        } else if (pt.status === "jour-et-demi") {
          statusLabel = "يوم ونصف (1.5)";
          multiplier = 1.5;
        } else if (pt.status === "double-journee") {
          statusLabel = "يومين (2.0)";
          multiplier = 2.0;
        } else if (pt.status === "absent") {
          statusLabel = "غائب (0.0)";
          multiplier = 0.0;
        } else if (pt.status === "conge") {
          statusLabel = "رخصة مؤدى عنها";
          multiplier = 1.0;
        }
        
        if (pt.status !== "absent" || pt.advancePaid) {
          history.push({
            date: dp.date,
            status: pt.status,
            statusLabel,
            wage: rate * multiplier,
            advance: pt.advancePaid || 0
          });
        }
      }
    });
    
    return history;
  };

  return (
    <div className="space-y-8 select-none font-sans">
      
      {/* Arabic and French Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-250 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-terracotta bg-brand-clay/30 border border-brand-clay/50 px-3 py-1 rounded-full font-bold">
            Pointage Ouvriers • تسجيل حضور العمال والأجور
          </span>
          <h2 className="text-xl font-extrabold text-stone-900 mt-2">
            Gestion du Personnel et de la Main d'œuvre
          </h2>
          <p className="text-stone-500 text-xs mt-1">
            Enrôlez les maîtres artisans (Maâlems) et manœuvres, enregistrez leur statut de présence journalier et gérez les acomptes ou avances sur salaire.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-right">
          <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Masse Salariale Nette Restante (MAD)</span>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <span className="text-xl font-mono font-black text-brand-brown">
              {formatMAD(payrollTotals.totalNet)}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-medium block">
            Coût brut cumulé: <strong className="text-stone-700">{formatMAD(payrollTotals.totalEarned)}</strong>
          </span>
        </div>
      </div>

      {/* Staff stats KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Effectif Ouvriers Enrôlé</span>
            <strong className="text-xl font-mono font-black text-stone-900 block mt-1">
              {workers.length} Personnes
            </strong>
          </div>
          <div className="bg-stone-50 text-stone-400 rounded-lg p-2 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Avances sur Salaires Payées</span>
            <strong className="text-xl font-mono font-black text-amber-700 block mt-1">
              {formatMAD(payrollTotals.totalAdvances)}
            </strong>
          </div>
          <div className="bg-amber-50 text-amber-600 rounded-lg p-2 rounded-xl">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Fiches Journalières Saisie</span>
            <strong className="text-xl font-mono font-black text-emerald-700 block mt-1">
              {pointages.length} fiches d'activité
            </strong>
          </div>
          <div className="bg-emerald-50 text-emerald-600 rounded-lg p-2 rounded-xl">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main split grid: roster of workers & daily sheet checkin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Enrollment & directory management */}
        <div className="bg-white lg:col-span-4 rounded-2xl border border-stone-250 p-5 shadow-xs space-y-5">
          <h3 className="font-sans font-black text-xs text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2.5 flex items-center gap-1">
            <UserPlus className="h-4 w-4 text-brand-gold" /> Enrôlement & Effectif du Chantier
          </h3>

          <form onSubmit={handleAddNewWorker} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Nom Complet *</label>
              <input
                type="text"
                required
                placeholder="ex: Mohamed Berrada"
                value={newWorkerName}
                onChange={e => setNewWorkerName(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Poste / Rôle *</label>
                <select
                  value={newWorkerRole}
                  onChange={e => setNewWorkerRole(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2"
                >
                  <option value="Chef de chantier">🔧 Chef de chantier</option>
                  <option value="Maçon Zelligeur">🧱 Maâlem Zellige / Bejmat</option>
                  <option value="Maçon Plâtrier">🎨 Maâlem Plâtre (Stuc)</option>
                  <option value="Maçon traditionnel">🧱 Maçon traditionnel</option>
                  <option value="Charpentier">🪵 Charpentier Traditionnel</option>
                  <option value="Ouvrier qualifié">⚒️ Ouvrier Qualifié</option>
                  <option value="Manœuvre">💪 Manœuvre</option>
                  <option value="Gardien">🔑 Gardien de Chantier</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Tarif Par Jour (MAD) *</label>
                <input
                  type="number"
                  required
                  placeholder="ex: 150"
                  value={newWorkerRate}
                  onChange={e => setNewWorkerRate(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 focus:ring-1 focus:ring-brand-gold focus:outline-none font-semibold text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">CIN (N° d'identité)</label>
                <input
                  type="text"
                  placeholder="ex: PB51721"
                  value={newWorkerCin}
                  onChange={e => setNewWorkerCin(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Téléphone (Opt)</label>
                <input
                  type="text"
                  placeholder="ex: 06..."
                  value={newWorkerPhone}
                  onChange={e => setNewWorkerPhone(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">تسبيق أولي (Avance)</label>
              <input
                type="number"
                min="0"
                placeholder="ex: 300"
                value={newWorkerAdvance}
                onChange={e => setNewWorkerAdvance(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 focus:ring-1 focus:ring-brand-gold focus:outline-none font-semibold text-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-brown hover:bg-stone-900 text-brand-gold hover:text-white rounded-xl font-bold font-sans transition shadow-xs flex items-center justify-center gap-1"
            >
              <Plus className="h-4 w-4" /> Enrôler l'Ouvrier (إضافة)
            </button>
          </form>

          {/* Real-time enrollment Directory */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-wider block mb-2">Membres actifs du personnel ({workers.length})</h4>
            <div className="divide-y divide-stone-150 max-h-56 overflow-y-auto">
              {workers.map(w => (
                <div key={w.id} className="py-2 flex items-center justify-between text-xs font-sans">
                  <div className="space-y-0.5">
                    <strong className="text-stone-850 font-bold block">{w.name}</strong>
                    <span className="text-[10px] text-stone-400 block font-medium capitalize">
                      {w.role} {w.cin && <span className="font-mono bg-stone-100 text-stone-700 px-1 rounded-sm text-[9px] font-bold uppercase">{w.cin}</span>} • <strong className="text-brand-brown font-semibold">{w.dailyRate} MAD/j</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteWorker(w.id)}
                    className="p-1 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {workers.length === 0 && (
                <div className="py-4 text-center text-stone-400 italic text-[11px]">
                  Roster d'ouvriers vide. Ajoutez des maîtres d'œuvre et compagnons ci-dessus.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily timesheet checkin check entries details */}
        <div className="bg-white lg:col-span-8 rounded-2xl border border-stone-250 p-5 shadow-xs space-y-4">
          
          {/* Timesheet Date header selecting details combo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-150 pb-4">
            <div className="flex items-center gap-2 select-none">
              <Calendar className="h-5 w-5 text-brand-gold" />
              <div>
                <h3 className="font-sans font-extrabold text-stone-900 text-sm">Feuille Journalière de Pointage</h3>
                <p className="text-stone-500 text-[10.5px]">Sélectionnez la date pour dresser l'appel de vos équippes.</p>
              </div>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-2.5 text-xs font-mono font-bold bg-stone-50 border border-stone-250 rounded-xl focus:outline-none"
            />
          </div>

          {/* Quick instructions indicator details banner */}
          <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3 text-stone-550 text-[10.5px] leading-relaxed flex gap-2 select-none">
            <AlertCircle className="h-4.5 w-4.5 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-850">ℹ️ تعليمات الاستخدام (Instructions) :</p>
              <p className="mt-0.5">
                تُحفظ التعديلات تلقائياً. 
                <span className="font-bold text-emerald-600"> حاضر (1.0)</span> يمنح يوم عمل كامل (1.0x). 
                <span className="font-bold text-amber-600"> نصف يوم (0.5)</span> يمنح نصف يوم عمل (0.5x). 
                <span className="font-bold text-indigo-600"> يوم ونصف (1.5)</span> يمنح يوماً ونصف عمل كاملين (1.5x). 
                <span className="font-bold text-rose-600"> غائب (0.0)</span> يمنح 0 أيام. 
                أي كاش أو تسبيق يُخصم تلقائياً عند حساب الأجر الصافي المتبقي لكل عامل.
              </p>
            </div>
          </div>

          {/* Worksheet Check-in Grid roster list */}
          <div className="divide-y divide-stone-150 text-xs font-sans">
            {workers.map(w => {
              // Extract current presence in selectedDate
              const ptItem = activeDayPointage.pointages.find(p => p.workerId === w.id) || {
                workerId: w.id,
                status: "absent",
                advancePaid: 0
              };

              return (
                <div key={w.id} className="py-3 flex flex-col md:flex-row justify-between md:items-center gap-3">
                  <div className="space-y-1">
                    <strong className="text-stone-850 font-bold block">{w.name}</strong>
                    
                    {/* Inline Rate and Role Editor */}
                    <div className="flex items-center gap-1 text-[10px] text-stone-500">
                      <span>{w.role} • الأجر اليومي:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="ثمن اليوم"
                        value={w.dailyRate || ""}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = workers.map(wrk => wrk.id === w.id ? { ...wrk, dailyRate: val } : wrk);
                          onUpdateWorkers(updated);
                        }}
                        className="w-16 px-1.5 py-0.5 bg-stone-50 border border-stone-250 rounded font-mono font-bold text-stone-800 text-center focus:ring-1 focus:ring-brand-gold focus:outline-none"
                      />
                      <span>درهم/يوم</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Status radio buttons group */}
                    <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                      <button
                        onClick={() => updateActiveDayStatus(w.id, "present")}
                        className={`px-2 py-1 text-[9.5px] font-bold rounded-md transition ${
                          ptItem.status === "present"
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                        title="Présent (1.0 jour)"
                      >
                        حاضر (1.0)
                      </button>
                      <button
                        onClick={() => updateActiveDayStatus(w.id, "demi-journee")}
                        className={`px-2 py-1 text-[9.5px] font-bold rounded-md transition ${
                          ptItem.status === "demi-journee"
                            ? "bg-amber-500 text-stone-950 shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                        title="Demi-journée (0.5 jour)"
                      >
                        نصف يوم (0.5)
                      </button>
                      <button
                        onClick={() => updateActiveDayStatus(w.id, "jour-et-demi")}
                        className={`px-2 py-1 text-[9.5px] font-bold rounded-md transition ${
                          ptItem.status === "jour-et-demi"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                        title="Jour et demi (1.5 jour)"
                      >
                        يوم ونصف (1.5)
                      </button>
                      <button
                        onClick={() => updateActiveDayStatus(w.id, "absent")}
                        className={`px-2 py-1 text-[9.5px] font-bold rounded-md transition ${
                          ptItem.status === "absent"
                            ? "bg-rose-500 text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                        title="Absent (0.0)"
                      >
                        غائب (0.0)
                      </button>
                    </div>

                    {/* Advance paid input during day with editing */}
                    <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-150 p-1 rounded-lg">
                      <span className="text-[9px] text-stone-500 font-extrabold uppercase">💰 تسبيق اليوم (MAD)</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={ptItem.advancePaid || ""}
                        onChange={e => updateActiveDayAdvance(w.id, e.target.value)}
                        className="w-16 p-1 bg-white font-mono text-center font-bold text-[11px] border border-stone-250 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                        title="Acompte / avance payée ce jour"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {workers.length === 0 && (
              <div className="py-8 text-center text-stone-400 italic">
                La liste des ouvriers est vide. Veuillez d'abord ajouter des ouvriers dans l'onglet à gauche.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recapitulative Financial Wages Roster Situation (Situation de chaque ouvrier) */}
      <div className="bg-white border border-stone-250 rounded-2xl overflow-hidden shadow-xs space-y-4 font-sans">
        
        {/* Rec recap head */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-sans font-black text-stone-900 text-sm flex items-center gap-1.5 direction-rtl">
              <span>📊 كشف حساب الأجور والتعويضات الفردية للعمال</span>
              <span className="text-xs text-stone-400 font-normal select-none">| Situation de Main d'œuvre</span>
            </h4>
            <p className="text-stone-500 text-[10.5px] mt-1">
              الاحتساب الآلي يعتمد على المعادلة التالية: <strong className="text-stone-700">الأجر المستحق = (عدد الأيام المكافئة × أجرة اليوم) - مجموع التسبيقات</strong>.
            </p>
          </div>
          
          <button
            onClick={() => setPrintTarget({ type: 'all' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-stone-250 hover:border-stone-450 hover:bg-stone-50 text-stone-700 font-extrabold rounded-lg text-xs transition select-none"
          >
            <Printer className="h-4 w-4 text-brand-gold" />
            <span>طباعة الجدول (Imprimer)</span>
          </button>
        </div>

        {/* Recap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-stone-600 border-collapse">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-stone-550 font-bold uppercase text-[9.5px] text-center select-none">
                <th className="px-4 py-3.5 text-left font-extrabold">الاسم الكامل (Nom)</th>
                <th className="px-4 py-3.5 text-left font-extrabold">الحرفة (Poste)</th>
                <th className="px-4 py-3.5 font-extrabold">أجرة اليوم (Tarif/j)</th>
                <th className="px-3 py-3.5 font-extrabold text-emerald-700 bg-emerald-500/[0.01]">حاضر (1.0ج)</th>
                <th className="px-3 py-3.5 font-extrabold text-amber-700 bg-amber-500/[0.01]">نصف يوم (0.5ج)</th>
                <th className="px-3 py-3.5 font-extrabold text-indigo-700 bg-indigo-500/[0.01]">يوم ونصف (1.5ج)</th>
                <th className="px-4 py-3.5 font-extrabold text-stone-700 bg-stone-100/50">إجمالي الأيام</th>
                <th className="px-4 py-3.5 text-right font-extrabold text-stone-900">مجموع الأجر الإجمالي</th>
                <th className="px-4 py-3.5 text-right font-extrabold text-rose-700">مجموع التسبيقات (Avances)</th>
                <th className="px-5 py-3.5 text-right font-extrabold text-brand-brown bg-brand-clay/5">الصافي المتبقي</th>
                <th className="px-3 py-3.5 text-center font-extrabold text-stone-500">طباعة (Fiche)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150">
              {workers.map(w => {
                const recap = getWorkerRecap(w);
                return (
                  <tr key={w.id} className="hover:bg-stone-50/25 transition">
                    <td className="px-4 py-3 font-bold text-stone-900 border-r border-stone-100">
                      {w.name}
                    </td>
                    <td className="px-4 py-3 capitalize font-semibold text-stone-400">
                      {w.role}
                    </td>
                    <td className="px-4 py-3 font-mono text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={w.dailyRate || ""}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = workers.map(wrk => wrk.id === w.id ? { ...wrk, dailyRate: val } : wrk);
                            onUpdateWorkers(updated);
                          }}
                          className="w-16 px-1.5 py-0.5 bg-stone-50 hover:bg-stone-100 border border-stone-250 rounded font-mono font-bold text-stone-800 text-center focus:ring-1 focus:ring-brand-gold focus:outline-none"
                        />
                        <span className="text-[9px] text-stone-400 font-bold">DH</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-center text-emerald-700 bg-emerald-500/[0.01]">
                      <span className="inline-flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {recap.daysPresent} يوم
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-center text-amber-700 bg-amber-500/[0.01]">
                      {recap.daysDemi} نصف
                    </td>
                    <td className="px-3 py-3 font-semibold text-center text-indigo-700 bg-indigo-500/[0.01]">
                      {recap.daysJourEtDemi} ي.ونصف
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-center text-stone-850 bg-stone-100/30">
                      {recap.totalDaysEquivalent} يوم
                    </td>
                    <td className="px-4 py-3 font-mono font-black text-stone-900 text-right">
                      {formatMAD(recap.wagesEarned)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right bg-rose-500/[0.01]">
                      <div className="flex items-center justify-end gap-1 select-none">
                        <span className="text-[9px] text-stone-400 font-bold" title="تسبيقات الحضور اليومية">({formatMAD(recap.dailyAdvancesSum)}) +</span>
                        <input
                          type="number"
                          min="0"
                          value={w.initialAdvance || ""}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = workers.map(wrk => wrk.id === w.id ? { ...wrk, initialAdvance: val } : wrk);
                            onUpdateWorkers(updated);
                          }}
                          placeholder="تسبيق كاش"
                          title="تسجيل تسبيق إضافي أو عام مدفوع نقداً للماعلم"
                          className="w-14 px-1 py-0.5 bg-white border border-rose-200 rounded font-mono font-bold text-rose-700 text-center focus:ring-1 focus:ring-rose-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-stone-500 font-extrabold ml-1">= {formatMAD(recap.advancesReceived)}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-3 font-mono font-black text-right border-l border-stone-150 text-xs ${recap.netToPay > 0 ? "text-brand-brown bg-brand-clay/15" : "text-emerald-700 bg-emerald-50"}`}>
                      {recap.netToPay < 0 ? (
                        <span title="Trop perçu par l'ouvrier" className="text-red-650">
                          {formatMAD(recap.netToPay)}
                        </span>
                      ) : (
                        formatMAD(recap.netToPay)
                      )}
                    </td>
                    <td className="px-3 py-3 text-center border-l border-stone-100 select-none">
                      <button
                        onClick={() => setPrintTarget({ type: 'individual', workerId: w.id })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-50 hover:bg-brand-gold/10 text-stone-700 hover:text-brand-gold border border-stone-250 hover:border-brand-gold/50 rounded font-black text-[10px] transition"
                        title="كشف حساب فردي وتفاصيل الأجر"
                      >
                        <Printer className="h-3 w-3 text-brand-gold" />
                        <span>كشف</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {workers.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-stone-400 italic font-light text-xs">
                    لم يتم تسجيل أي عامل في جدول الحسابات لتفصيل الأجور.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informational math formula footer card info */}
        <div className="p-4 bg-stone-50 border-t border-stone-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-[10px] text-stone-400 select-none">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-brand-gold shrink-0" />
            <p>
              <strong>طريقة الاحتساب:</strong> مجموع الأيام المعادلة = (حاضر {`×`} 1) + (نصف يوم {`×`} 0.5) + (يوم ونصف {`×`} 1.5).
            </p>
          </div>
          <p className="font-mono bg-white px-2 py-1 border border-stone-250 rounded font-medium text-[9.5px]">
            Wages formula: (Equivalent Days * Rate/j) - (Daily Advances + General Advance) = Net Balance
          </p>
        </div>
      </div>

      {/* ==================== PRINT PREVIEW MODAL & LEDGER SYSTEM ==================== */}
      {printTarget && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPrintTarget(null);
            }
          }}
          className="fixed inset-0 bg-stone-900/80 backdrop-blur-xs flex items-start justify-center z-50 p-4 md:p-8 overflow-y-auto print:p-0 print:bg-white print:absolute print:inset-0 cursor-pointer"
        >
          
          {/* Inject Dynamic Print Overrides to only show our target area */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-area, #printable-area * {
                visibility: visible !important;
              }
              #printable-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                color: black !important;
                padding: 10px !important;
                font-family: sans-serif !important;
              }
            }
          `}} />

          {/* Floating Close Button in Viewport (Hidden in Print) */}
          <button
            onClick={() => setPrintTarget(null)}
            className="fixed top-4 right-4 z-55 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-2xl transition cursor-pointer print:hidden flex items-center justify-center gap-1.5 font-bold text-xs border border-rose-500 hover:scale-105 active:scale-95"
            title="إغلاق المعاينة (Fermer) ✕"
          >
            <X className="h-4.5 w-4.5" />
            <span>إغلاق (Fermer) ✕</span>
          </button>

          <div id="printable-area" className="bg-white border border-stone-350 rounded-2xl w-full max-w-4xl p-6 md:p-8 shadow-2xl relative flex flex-col gap-6 print:shadow-none print:border-none print:rounded-none my-4 cursor-default">
            
            {/* Modal Actions Header (Hidden in Print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-4 gap-3 print:hidden select-none">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-brand-gold shrink-0" />
                <div>
                  <h3 className="font-black text-stone-900 text-sm">
                    {printTarget.type === 'all' 
                      ? "معاينة كشف الحساب العام للأجور" 
                      : "معاينة كشف الأجر الفردي بالتفصيل"
                    }
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    💡 يفتح المتصفح نافذة الطباعة تلقائياً؛ يمكنك أيضاً استخدام الاختصار (Ctrl + P) للطباعة.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-brand-gold hover:bg-brand-gold/90 text-stone-950 font-black rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-103 active:scale-97"
                >
                  <Printer className="h-4 w-4" />
                  <span>بدء الطباعة الآن (Imprimer)</span>
                </button>
                <button
                  onClick={() => setPrintTarget(null)}
                  className="px-3 py-2 border border-stone-300 hover:bg-stone-50 rounded-lg text-stone-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  title="إغلاق المعاينة"
                >
                  <X className="h-4 w-4 text-rose-600" />
                  <span>إغلاق (Fermer)</span>
                </button>
              </div>
            </div>

            {/* Print advice warning card explaining how to handle standard Iframe constraints in Chrome */}
            <div className="bg-amber-500/10 border border-brand-gold/30 p-3.5 rounded-xl text-stone-700 space-y-1.5 print:hidden select-text text-xs">
              <p className="font-extrabold text-brand-brown flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-brand-gold" />
                <span>💡 تنبيه هام لعملية الطباعة من داخل محرر الأكواد:</span>
              </p>
              <p className="leading-relaxed text-[11px] text-stone-600 pr-5">
                نظراً لقيود الحماية والأجهزة الافتراضية داخل إطارات العرض المعزولة (Iframe) لخدمات برمجة المعاينة، قد يتم منع فتح نافذة الطابعة تلقائياً. 
                يرجى **فتح اللعبة في نافذة حرة مستقلة (Open in New Tab)** بالضغط على سهم الخروج الصغير أعلى يمين الشاشة، ثم اضغط على زر المعاينة والطباعة لتتحصل على كشف الحساب والوضعية بنسخة ورقية جاهزة للتوقيع والتسريح.
              </p>
            </div>

            {/* Document Body */}
            <div className="space-y-6 text-stone-800 text-xs text-right" dir="rtl">
              
              {/* Document Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-stone-900 pb-5">
                <div className="text-right">
                  <h1 className="text-lg font-black text-stone-900">كشف حساب مصاريف وأجور اليد العاملة</h1>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">ورشة البناء العصرية والتقليدية المغربية</p>
                  <p className="text-[10.5px] text-stone-600 mt-1 select-text">
                    التاريخ المطبوع: <span className="font-mono font-bold">{new Date().toLocaleDateString('fr-FR')}</span>
                  </p>
                </div>

                <div className="text-left font-semibold text-[10px] text-stone-500">
                  <div className="text-stone-900 font-extrabold text-xs">شعار الأمانة والشفافية</div>
                  <div>متابعة تلقائية عبر نظام الحسابات</div>
                  <div className="font-mono">MAD (DH Moroccan Dirham)</div>
                </div>
              </div>

              {/* RENDER MODE A: Consolidated Team Payroll Table */}
              {printTarget.type === 'all' && (
                <div className="space-y-4">
                  <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg text-stone-700">
                    <p className="font-bold text-stone-850">📋 ملخص البيانات العامة للعمال والمساعدين:</p>
                    <p className="mt-1 text-[10.5px]">
                      هذا الجدول يلخص حضور عمال الورشة ومستحقاتهم المالية الإجمالية مع الخصم الفوري لجميع التسبيقات المستلمة نقدًا أو يوميًا في جدول الحضور.
                    </p>
                  </div>

                  <table className="w-full text-stone-800 border border-stone-300 border-collapse text-center">
                    <thead>
                      <tr className="bg-stone-100 uppercase text-[10px] border-b border-stone-300 font-black">
                        <th className="px-2 py-2.5 border-l border-stone-300">الاسم الكامل (Nom)</th>
                        <th className="px-2 py-2.5 border-l border-stone-300">الحرفة (Poste)</th>
                        <th className="px-2 py-2.5 border-l border-stone-300">أجرة اليوم (Tarif)</th>
                        <th className="px-2 py-2.5 border-l border-stone-300">حاضر (1.0)</th>
                        <th className="px-2 py-2.5 border-l border-stone-300">نصف يوم (0.5)</th>
                        <th className="px-2 py-2.5 border-l border-stone-300">يوم ونصف (1.5)</th>
                        <th className="px-2 py-2.5 border-l border-stone-300">مجموع الأيام</th>
                        <th className="px-2 py-2.5 border-l border-stone-300">الأجر المستحق</th>
                        <th className="px-2 py-2.5 border-l border-stone-300 text-rose-800">مجموع التسبيقات</th>
                        <th className="px-2 py-2.5 text-stone-950 font-black">الصافي المتبقي بـ (DH)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-250 font-medium">
                      {workers.map(w => {
                        const rec = getWorkerRecap(w);
                        return (
                          <tr key={w.id} className="hover:bg-stone-50 text-[10.5px]">
                            <td className="px-2 py-2 border-l border-stone-300 font-bold text-stone-900 text-right pr-3">{w.name}</td>
                            <td className="px-2 py-2 border-l border-stone-300 text-stone-600">{w.role}</td>
                            <td className="px-2 py-2 border-l border-stone-300 font-mono font-bold">{w.dailyRate} DH</td>
                            <td className="px-2 py-2 border-l border-stone-300 font-mono">{rec.daysPresent} ي</td>
                            <td className="px-2 py-2 border-l border-stone-300 font-mono">{rec.daysDemi} ن</td>
                            <td className="px-2 py-2 border-l border-stone-300 font-mono">{rec.daysJourEtDemi} ي.ونصف</td>
                            <td className="px-2 py-2 border-l border-stone-300 font-mono font-bold bg-stone-50">{rec.totalDaysEquivalent} يوم</td>
                            <td className="px-2 py-2 border-l border-stone-300 font-mono font-bold">{rec.wagesEarned} DH</td>
                            <td className="px-2 py-2 border-l border-stone-300 font-mono text-rose-700">-{rec.advancesReceived} DH</td>
                            <td className={`px-2 py-2 font-mono font-black text-left pl-3 ${rec.netToPay < 0 ? "text-red-700 bg-red-50" : "text-stone-900 bg-amber-500/5"}`}>
                              {formatMAD(rec.netToPay)}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Subtotal row */}
                      <tr className="bg-stone-100 font-bold border-t-2 border-stone-900 text-[11px]">
                        <td colSpan={2} className="px-2 py-3 border-l border-stone-300 text-right pr-3 font-black">إجمالي المصاريف الحسابية:</td>
                        <td className="px-2 py-3 border-l border-stone-300 font-mono text-stone-400 font-normal">-</td>
                        <td colSpan={4} className="px-2 py-3 border-l border-stone-300 text-stone-400 font-normal">-</td>
                        <td className="px-2 py-3 border-l border-stone-300 font-mono text-stone-900">{payrollTotals.totalEarned} DH</td>
                        <td className="px-2 py-3 border-l border-stone-300 font-mono text-rose-700">-{payrollTotals.totalAdvances} DH</td>
                        <td className="px-2 py-3 font-mono font-black text-left pl-3 text-brand-brown">{formatMAD(payrollTotals.totalNet)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* RENDER MODE B: Individual Worker Detailed Pay Receipt */}
              {printTarget.type === 'individual' && (() => {
                const worker = workers.find(wrk => wrk.id === printTarget.workerId);
                if (!worker) return <p className="text-center text-red-600">خطأ: لم يتم العثور على العامل المعني.</p>;
                
                const rec = getWorkerRecap(worker);
                const history = getWorkerDetailedHistory(worker.id);
                
                return (
                  <div className="space-y-5">
                    {/* Worker Info Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-stone-300 p-4 rounded-xl bg-stone-50 select-text">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400 block">العامل المتلقي (Bénéficiaire) :</span>
                        <strong className="text-sm text-stone-900 block font-black mt-0.5">{worker.name}</strong>
                        {worker.cin && <span className="text-[10px] text-stone-700 font-mono block">CIN: <strong className="font-bold">{worker.cin}</strong></span>}
                        {worker.phone && <span className="text-[10px] text-stone-500 font-mono block">الهاتف: {worker.phone}</span>}
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400 block">الحرفة والوظيفة (Rôle) :</span>
                        <span className="text-xs text-stone-700 block font-bold capitalize mt-0.5">{worker.role}</span>
                        <span className="text-[10px] text-stone-500 block font-mono">أجرة اليوم: {worker.dailyRate} DH/jour</span>
                      </div>

                      <div className="text-left">
                        <span className="text-[9px] uppercase font-bold text-stone-400 block">حالة الحساب بـ (Devise) :</span>
                        <span className="text-xs text-emerald-800 font-black block mt-0.5">الدرهم المغربي (MAD)</span>
                        <span className="text-[10px] font-bold text-stone-600 block">الوضعية الفردية القانونية للعمل</span>
                      </div>
                    </div>

                    {/* Financial summary blocks */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="border border-stone-250 p-3 rounded-lg">
                        <span className="text-[9px] text-stone-500 uppercase block font-extrabold pb-1">مجموع الأيام المعادلة</span>
                        <strong className="text-sm text-stone-900 font-mono block">{rec.totalDaysEquivalent} يوم</strong>
                        <span className="text-[8.5px] text-stone-400 block">({rec.daysPresent}ي حاضر + {rec.daysDemi}ن نصف + {rec.daysJourEtDemi}ي.ونصف)</span>
                      </div>

                      <div className="border border-stone-250 p-3 rounded-lg">
                        <span className="text-[9px] text-stone-500 uppercase block font-extrabold pb-1">إجمالي الأجر المكتسب</span>
                        <strong className="text-sm text-emerald-700 font-mono block">{formatMAD(rec.wagesEarned)}</strong>
                        <span className="text-[8.5px] text-stone-400 block">مكافئ الحضور × اليومية</span>
                      </div>

                      <div className="border border-stone-250 p-3 rounded-lg bg-rose-50/50">
                        <span className="text-[9px] text-rose-700 uppercase block font-extrabold pb-1">مجموع التسبيقات (الخصم)</span>
                        <strong className="text-sm text-rose-700 font-mono block">{formatMAD(rec.advancesReceived)}</strong>
                        <span className="text-[8.5px] text-stone-500 block">تسبيق أولي ({rec.initialAdvance}DH) + يومي ({rec.dailyAdvancesSum}DH)</span>
                      </div>

                      <div className="border-2 border-brand-brown/80 p-3 rounded-lg bg-brand-clay/[0.03]">
                        <span className="text-[9.5px] text-brand-brown uppercase block font-black pb-1">الصافي المتبقي للأداء</span>
                        <strong className="text-lg text-brand-brown font-mono block font-black">{formatMAD(rec.netToPay)}</strong>
                        <span className="text-[8.5px] text-stone-500 block font-bold">باقي الأجر المستحق للتصفية</span>
                      </div>
                    </div>

                    {/* Detailed presence history sub-table */}
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-stone-850 text-[11px] border-r-2 border-brand-gold pr-2">سجل الكرونولوجيا وحالات الحضور المستخلصة بالتفصيل:</h4>
                      
                      <div className="border border-stone-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-[10.5px] border-collapse text-right">
                          <thead>
                            <tr className="bg-stone-100/80 border-b border-stone-250 font-bold select-none text-center">
                              <th className="px-3 py-2 border-l border-stone-200">التاريخ (Date)</th>
                              <th className="px-3 py-2 border-l border-stone-200">حالة الحضور اليومي المقبولة</th>
                              <th className="px-3 py-2 border-l border-stone-200 text-left pl-4">الأجر اليومي المكتسب</th>
                              <th className="px-3 py-2 text-rose-700 text-left pl-4">تسبيق مالي مستحوذ (Acompte)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 font-medium">
                            {/* General initial advance if any */}
                            {rec.initialAdvance > 0 && (
                              <tr className="bg-rose-500/[0.02] italic">
                                <td className="px-3 py-2 border-l border-stone-200 font-mono text-stone-400">تاريخ التسجيل</td>
                                <td className="px-3 py-2 border-l border-stone-200 text-rose-700 font-bold">تسبيق كاش / عهدة سابقة (Avance générale initial)</td>
                                <td className="px-3 py-2 border-l border-stone-200 font-mono text-left pl-4 text-stone-400">0.00 DH</td>
                                <td className="px-3 py-2 font-mono text-left pl-4 text-rose-700 font-black">{rec.initialAdvance}.00 DH</td>
                              </tr>
                            )}
                            
                            {history.map((h, idx) => (
                              <tr key={idx} className="hover:bg-stone-50">
                                <td className="px-3 py-2 border-l border-stone-200 font-mono text-stone-800">{h.date}</td>
                                <td className="px-3 py-2 border-l border-stone-200 font-bold text-stone-600">{h.statusLabel}</td>
                                <td className="px-3 py-2 border-l border-stone-200 font-mono text-left pl-4 font-bold">{h.wage} DH</td>
                                <td className="px-3 py-2 font-mono text-left pl-4 text-rose-700 font-bold">
                                  {h.advance > 0 ? `${h.advance}.00 DH` : "-"}
                                </td>
                              </tr>
                            ))}

                            {history.length === 0 && !rec.initialAdvance && (
                              <tr>
                                <td colSpan={4} className="py-4 text-center text-stone-400 italic">
                                  لم يتم تقييد حضور أو تسبيقات لهذا العامل في السجل حتى الآن.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Printable Footer / Terms & Signature Block */}
              <div className="pt-10 grid grid-cols-2 gap-8 border-t border-stone-300 mt-10">
                <div className="text-right space-y-1.5">
                  <p className="font-extrabold text-stone-800">توقيع المسؤول عن الورشة (Site Manager)</p>
                  <p className="text-[10px] text-stone-400 select-none">بمثابة مصادقة وتسريح للأجر بعد المراجعة الحسابية</p>
                  <div className="h-16 w-44 border border-dashed border-stone-300 rounded-lg bg-stone-50/50 mt-1"></div>
                </div>

                <div className="text-left space-y-1.5">
                  <p className="font-extrabold text-stone-800">توقيع وإمضاء المعني بالأمر (Ouvrier)</p>
                  <p className="text-[10px] text-stone-400 select-none">اعتراف وتبرئة ذمة باستلام المبالغ النقدية المصرح بها كلياً</p>
                  <div className="h-16 w-44 border border-dashed border-stone-300 rounded-lg bg-stone-50/50 mt-1 inline-block"></div>
                </div>
              </div>

              {/* Print Notice (Visible ONLY in Print) */}
              <div className="hidden print:block text-center text-[9px] text-stone-450 mt-8 border-t border-stone-200 pt-3">
                تم الاحتساب والطباعة بنجاح بنظام كشف أجور العمال والمحاسبة الذاتية الحرة للورشة. الشفافية أساس الرزق الحلال.
              </div>
            </div>

            {/* Bottom Actions Row (Hidden in Print) */}
            <div className="flex justify-center border-t border-stone-200 pt-4 print:hidden select-none">
              <button
                onClick={() => setPrintTarget(null)}
                className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 hover:border-stone-400 font-extrabold rounded-lg text-xs transition cursor-pointer flex items-center gap-2"
              >
                <X className="h-4 w-4 text-rose-600" />
                <span>إغلاق كشف المعاينة (Fermer)</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
