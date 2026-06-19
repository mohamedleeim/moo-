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
  Plus
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

    const newWorker: Worker = {
      id: "wrk-" + Date.now(),
      name: newWorkerName.trim(),
      role: newWorkerRole.trim(),
      dailyRate: rate,
      phone: newWorkerPhone.trim() || undefined
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
  const updateActiveDayStatus = (workerId: string, status: "present" | "demi-journee" | "absent" | "conge") => {
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
    let daysAbsent = 0;
    let daysConge = 0;
    let wagesEarned = 0;
    let advancesReceived = 0;

    pointages.forEach(dp => {
      const pt = dp.pointages.find(p => p.workerId === worker.id);
      if (pt) {
        if (pt.status === "present") {
          daysPresent++;
          wagesEarned += worker.dailyRate;
        } else if (pt.status === "demi-journee") {
          daysDemi++;
          wagesEarned += (worker.dailyRate / 2);
        } else if (pt.status === "absent") {
          daysAbsent++;
        } else if (pt.status === "conge") {
          daysConge++;
          wagesEarned += worker.dailyRate; // Paid leave
        }

        if (pt.advancePaid) {
          advancesReceived += pt.advancePaid;
        }
      }
    });

    const netToPay = wagesEarned - advancesReceived;

    return {
      daysPresent,
      daysDemi,
      daysAbsent,
      daysConge,
      wagesEarned,
      advancesReceived,
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

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Téléphone (Opt)</label>
              <input
                type="text"
                placeholder="ex: +212 600000000"
                value={newWorkerPhone}
                onChange={e => setNewWorkerPhone(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900"
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
                    <strong className="text-stone-850 font-bold block">{w.id === "W1" || w.id === "W2" || w.id === "W3" ? w.name : w.name}</strong>
                    <span className="text-[10px] text-stone-400 block font-medium capitalize">{w.role} • <strong className="text-brand-brown font-semibold">{w.dailyRate} MAD/j</strong></span>
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
          <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3 text-stone-500 text-[10.5px] leading-relaxed flex gap-2 select-none">
            <AlertCircle className="h-4.5 w-4.5 text-brand-gold shrink-0 mt-0.5" />
            <p>
              Toute modification est enregistrée à la volée. 
              <strong> Présent</strong> attribue le tarif plein (1x). 
              <strong> Demi-journée</strong> attribue la moitié (0.5x). 
              <strong> Absent</strong> attribue 0. Les acomptes saisis s'ajoutent aux avances cumulées.
            </p>
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
                <div key={w.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <strong className="text-stone-850 font-bold block">{w.name}</strong>
                    <span className="text-[10.5px] text-stone-400 block leading-none">{w.role} • <strong>{w.dailyRate} MAD/j</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Status radio buttons group */}
                    <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                      <button
                        onClick={() => updateActiveDayStatus(w.id, "present")}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition ${
                          ptItem.status === "present"
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        الحاضر (P)
                      </button>
                      <button
                        onClick={() => updateActiveDayStatus(w.id, "demi-journee")}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition ${
                          ptItem.status === "demi-journee"
                            ? "bg-amber-500 text-stone-950 shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        نصف يوم (1/2)
                      </button>
                      <button
                        onClick={() => updateActiveDayStatus(w.id, "absent")}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition ${
                          ptItem.status === "absent"
                            ? "bg-rose-500 text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        غائب (A)
                      </button>
                    </div>

                    {/* Advance paid input during day */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Acompte (MAD)</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={ptItem.advancePaid || ""}
                        onChange={e => updateActiveDayAdvance(w.id, e.target.value)}
                        className="w-16 p-1 bg-stone-50 hover:bg-stone-100 font-mono text-center font-bold text-[11px] border border-stone-250 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {workers.length === 0 && (
              <div className="py-8 text-center text-stone-400 italic">
                Roster vide. Enrôlez des vôtres dans l'onglet de gauche pour dresser le premier appel.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recapitulative Financial Wages Roster Situation (Situation de chaque ouvrier) */}
      <div className="bg-white border border-stone-250 rounded-2xl overflow-hidden shadow-xs space-y-4">
        
        {/* Rec recap head */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 flex items-center justify-between">
          <div>
            <h4 className="font-sans font-extrabold text-stone-900 text-xs uppercase tracking-wider">Situation Individuelle de Chants & Salaires (Payroll Status)</h4>
            <p className="text-stone-500 text-[10px]">État de compte consolidé de chaque compagnon face au cumul des pointages et avances.</p>
          </div>
          
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-250 hover:border-stone-450 hover:bg-stone-50 text-stone-700 font-extrabold rounded-lg text-xs transition"
          >
            <Printer className="h-4 w-4" /> Imprimer Situation
          </button>
        </div>

        {/* Recap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-stone-600 border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[9px] text-center select-none">
                <th className="px-5 py-3 text-left">Nom Complet</th>
                <th className="px-4 py-3 text-left">Poste de Compagnon</th>
                <th className="px-4 py-3">Plafonnement Tarif</th>
                <th className="px-4 py-3">Jours Présent (P)</th>
                <th className="px-4 py-3">Demi-Jours (1/2 J)</th>
                <th className="px-4 py-3 text-right text-stone-900">Salaire Cumulé Brut</th>
                <th className="px-4 py-3 text-right text-amber-700">Acomptes Perçus</th>
                <th className="px-4 py-3 text-right text-brand-brown font-black">Reste Net à Payer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150">
              {workers.map(w => {
                const recap = getWorkerRecap(w);
                return (
                  <tr key={w.id} className="hover:bg-stone-50/25 transition">
                    <td className="px-5 py-3 font-bold text-stone-900 border-r border-stone-100">
                      {w.name}
                    </td>
                    <td className="px-4 py-3 capitalize font-semibold text-stone-500">
                      {w.role}
                    </td>
                    <td className="px-4 py-3 font-mono text-center font-bold text-stone-700">
                      {w.dailyRate} MAD
                    </td>
                    <td className="px-4 py-3 font-semibold text-center text-emerald-700 bg-emerald-500/[0.02]">
                      <span className="inline-flex items-center gap-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {recap.daysPresent} j
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-center text-amber-700 bg-amber-500/[0.02]">
                      {recap.daysDemi} j
                    </td>
                    <td className="px-4 py-3 font-mono font-black text-stone-900 text-right">
                      {formatMAD(recap.wagesEarned)}
                    </td>
                    <td className="px-4 py-3 font-mono font-black text-amber-655 text-right bg-amber-500/[0.01]">
                      {formatMAD(recap.advancesReceived)}
                    </td>
                    <td className={`px-4 py-3 font-mono font-black text-right border-l border-stone-100 text-xs ${recap.netToPay > 0 ? "text-brand-brown bg-brand-clay/10" : "text-stone-400"}`}>
                      {formatMAD(recap.netToPay)}
                    </td>
                  </tr>
                );
              })}

              {workers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 italic font-light text-xs">
                    Aucun ouvrier enregistré pour la paie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
