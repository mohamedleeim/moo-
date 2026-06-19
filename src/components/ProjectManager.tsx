import React, { useState } from "react";
import { Project, ProjectDetails } from "../types";
import { 
  Folder, 
  FolderPlus, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Building, 
  UserCheck, 
  Hash, 
  Calendar, 
  Check, 
  X, 
  Briefcase,
  FileSpreadsheet,
  Coins,
  Sparkles,
  Info
} from "lucide-react";
import { initialWorkItems, initialMeasurementLines, defaultProjectDetails, indexHistoryBAT6 } from "../data/initialData";

interface ProjectManagerProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onAddProject: (newProj: Project) => void;
  onUpdateProject: (id: string, updatedProj: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectManager({
  projects,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject
}: ProjectManagerProps) {
  
  // App switcher states
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);

  // Form states for adding
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [client, setClient] = useState("Maître d'ouvrage de l'État");
  const [contractor, setContractor] = useState("Entreprise de BTP S.A.R.L.");
  const [contractNumber, setContractNumber] = useState("Marché N° ___/2026");
  const [tvaRate, setTvaRate] = useState(20);

  // Date-centric index selectors (asking for dates, auto-mapping to index values)
  const [baseIndexMonth, setBaseIndexMonth] = useState("2024-07");
  const [baseCustomMonthName, setBaseCustomMonthName] = useState("");
  const [baseCustomIndexVal, setBaseCustomIndexVal] = useState("243.8");
  const [isBaseCustom, setIsBaseCustom] = useState(false);

  const [revisionIndexMonth, setRevisionIndexMonth] = useState("2025-04");
  const [revisionCustomMonthName, setRevisionCustomMonthName] = useState("");
  const [revisionCustomIndexVal, setRevisionCustomIndexVal] = useState("248.0");
  const [isRevisionCustom, setIsRevisionCustom] = useState(false);

  const [useTemplate, setUseTemplate] = useState(true);

  // Form states for editing
  const [editProjName, setEditProjName] = useState("");
  const [editProjDesc, setEditProjDesc] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editContractor, setEditContractor] = useState("");
  const [editContractNumber, setEditContractNumber] = useState("");
  const [editTvaRate, setEditTvaRate] = useState(20);

  // Editing Date-centric index selectors
  const [editBaseIndexMonth, setEditBaseIndexMonth] = useState("2024-07");
  const [editBaseCustomMonthName, setEditBaseCustomMonthName] = useState("");
  const [editBaseCustomIndexVal, setEditBaseCustomIndexVal] = useState("243.8");
  const [isEditBaseCustom, setIsEditBaseCustom] = useState(false);

  const [editRevisionIndexMonth, setEditRevisionIndexMonth] = useState("2025-04");
  const [editRevisionCustomMonthName, setEditRevisionCustomMonthName] = useState("");
  const [editRevisionCustomIndexVal, setEditRevisionCustomIndexVal] = useState("248.0");
  const [isEditRevisionCustom, setIsEditRevisionCustom] = useState(false);

  const handleStartEdit = (p: Project) => {
    setEditingProjId(p.id);
    setEditProjName(p.name);
    setEditProjDesc(p.description || "");
    setEditClient(p.details.client);
    setEditContractor(p.details.contractor);
    setEditContractNumber(p.details.contractNumber);
    setEditTvaRate(p.details.tvaRate);

    // Resolve Base Month
    const bMonth = p.details.baseIndexMonth || "2024-07";
    const baseObj = indexHistoryBAT6.find(h => h.date === bMonth);
    if (baseObj) {
      setEditBaseIndexMonth(bMonth);
      setIsEditBaseCustom(false);
    } else {
      setEditBaseIndexMonth("custom");
      setIsEditBaseCustom(true);
      setEditBaseCustomMonthName(bMonth);
      setEditBaseCustomIndexVal(p.details.baseIndexValue ? p.details.baseIndexValue.toString() : "243.8");
    }

    // Resolve Revision Month
    const rMonth = p.details.revisionIndexMonth || "2025-04";
    const revObj = indexHistoryBAT6.find(h => h.date === rMonth);
    if (revObj) {
      setEditRevisionIndexMonth(rMonth);
      setIsEditRevisionCustom(false);
    } else {
      setEditRevisionIndexMonth("custom");
      setIsEditRevisionCustom(true);
      setEditRevisionCustomMonthName(rMonth);
      setEditRevisionCustomIndexVal(p.details.revisionIndexValue ? p.details.revisionIndexValue.toString() : "248.0");
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      alert("Veuillez saisir un nom pour le projet.");
      return;
    }

    // Determine Base month name and value
    const resolvedBaseMonth = isBaseCustom ? (baseCustomMonthName || "Autre") : baseIndexMonth;
    const resolvedBaseValue = isBaseCustom 
      ? (parseFloat(baseCustomIndexVal) || 243.8) 
      : (indexHistoryBAT6.find(h => h.date === baseIndexMonth)?.value || 243.8);

    // Determine Revision month name and value
    const resolvedRevisionMonth = isRevisionCustom ? (revisionCustomMonthName || "Autre") : revisionIndexMonth;
    const resolvedRevisionValue = isRevisionCustom 
      ? (parseFloat(revisionCustomIndexVal) || 248.0) 
      : (indexHistoryBAT6.find(h => h.date === revisionIndexMonth)?.value || 248.0);

    const newProjectDetails: ProjectDetails = {
      title: newProjName.trim(),
      client: client.trim() || defaultProjectDetails.client,
      contractor: contractor.trim() || defaultProjectDetails.contractor,
      contractNumber: contractNumber.trim() || defaultProjectDetails.contractNumber,
      tvaRate: tvaRate || 20,
      baseIndexName: defaultProjectDetails.baseIndexName,
      baseIndexMonth: resolvedBaseMonth,
      baseIndexValue: resolvedBaseValue,
      revisionIndexMonth: resolvedRevisionMonth,
      revisionIndexValue: resolvedRevisionValue,
      fixedPart: defaultProjectDetails.fixedPart,
      revisedPart: defaultProjectDetails.revisedPart
    };

    const newProject: Project = {
      id: "project-" + Date.now(),
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      details: newProjectDetails,
      workItems: useTemplate ? [...initialWorkItems] : [],
      measurementLines: useTemplate ? [...initialMeasurementLines] : []
    };

    onAddProject(newProject);
    
    // Reset inputs
    setNewProjName("");
    setNewProjDesc("");
    setClient("Maître d'ouvrage de l'État");
    setContractor("Entreprise de BTP S.A.R.L.");
    setContractNumber("Marché N° ___/2026");
    setIsAddingMode(false);
  };

  const handleSaveEditSubmit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjName.trim()) {
      alert("Veuillez saisir un nom de projet.");
      return;
    }

    const matchedProject = projects.find(p => p.id === id);
    if (!matchedProject) return;

    // Determine Base month name and value
    const resolvedBaseMonth = isEditBaseCustom ? (editBaseCustomMonthName || "Autre") : editBaseIndexMonth;
    const resolvedBaseValue = isEditBaseCustom 
      ? (parseFloat(editBaseCustomIndexVal) || 243.8) 
      : (indexHistoryBAT6.find(h => h.date === editBaseIndexMonth)?.value || 243.8);

    // Determine Revision month name and value
    const resolvedRevisionMonth = isEditRevisionCustom ? (editRevisionCustomMonthName || "Autre") : editRevisionIndexMonth;
    const resolvedRevisionValue = isEditRevisionCustom 
      ? (parseFloat(editRevisionCustomIndexVal) || 248.0) 
      : (indexHistoryBAT6.find(h => h.date === editRevisionIndexMonth)?.value || 248.0);

    const updatedDetails: ProjectDetails = {
      ...matchedProject.details,
      title: editProjName.trim(),
      client: editClient.trim(),
      contractor: editContractor.trim(),
      contractNumber: editContractNumber.trim(),
      tvaRate: editTvaRate,
      baseIndexMonth: resolvedBaseMonth,
      baseIndexValue: resolvedBaseValue,
      revisionIndexMonth: resolvedRevisionMonth,
      revisionIndexValue: resolvedRevisionValue
    };

    const updatedProj: Project = {
      ...matchedProject,
      name: editProjName.trim(),
      description: editProjDesc.trim(),
      details: updatedDetails
    };

    onUpdateProject(id, updatedProj);
    setEditingProjId(null);
  };

  // Calculate cumulative stats across all projects
  const globalBudget = projects.reduce((total, proj) => {
    const projBudget = proj.workItems.reduce((acc, item) => {
      const itemLines = (proj.measurementLines || []).filter(l => l.itemId === item.id);
      const qty = itemLines.reduce((sum, line) => sum + line.computedValue, 0);
      return acc + (qty * item.unitPrice);
    }, 0);
    return total + projBudget;
  }, 0);

  const globalWorkers = projects.reduce((total, proj) => total + (proj.workers?.length || 0), 0);
  const globalExpenses = projects.reduce((total, proj) => {
    const expTotal = proj.expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;
    // Add pointage timesheets wages
    let wagesSum = 0;
    (proj.pointages || []).forEach(dp => {
      dp.pointages.forEach(pt => {
        const worker = (proj.workers || []).find(w => w.id === pt.workerId);
        if (worker) {
          if (pt.status === "present") wagesSum += worker.dailyRate;
          else if (pt.status === "demi-journee") wagesSum += (worker.dailyRate / 2);
        }
      });
    });
    return total + expTotal + wagesSum;
  }, 0);

  const formatMAD = (val: number) => {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(val);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Upper Welcome banner */}
      <div className="bg-brand-brown text-white p-6 md:p-8 rounded-2xl border border-brand-brown shadow-md relative overflow-hidden select-none">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10 pointer-events-none">
          <Folder className="h-64 w-64" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#fbd27b] bg-[#fbd27b]/10 border border-[#fbd27b]/20 px-3 py-1 rounded-full font-bold">
              Espace de Travail Moderne • لوحة مشاريع البناء
            </span>
            <h1 className="font-sans font-black text-xl md:text-2xl leading-none text-[#fbd27b]">
              Gestion Globale des Projets de Construction
            </h1>
            <p className="text-stone-300 text-xs md:text-sm max-w-2xl font-light leading-relaxed">
              Planifiez, configurez vos projets publics et suivez l'évolution physique et budgétaire de vos chantiers. Saisissez vos rubriques de prix, organisez l'arborescence des métrés d'exécution, tenez le registre d'appel des équipes et maîtrisez la rentabilité.
            </p>
          </div>

          {/* Combined analytical indicators */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[8px] uppercase font-mono text-stone-400 block font-bold">Volume Budgétaire Total</span>
              <strong className="text-xs md:text-sm font-mono font-black text-[#fbd27b] block mt-1">
                {formatMAD(globalBudget)}
              </strong>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[8px] uppercase font-mono text-stone-400 block font-bold">Chantiers Actifs</span>
              <strong className="text-xs md:text-sm font-mono font-black text-[#fbd27b] block mt-1">
                {projects.length} Projets
              </strong>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[8px] uppercase font-mono text-stone-400 block font-bold">Ouvriers Enrôlés</span>
              <strong className="text-xs md:text-sm font-mono font-black text-[#fbd27b] block mt-1">
                {globalWorkers} Artisans
              </strong>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[8px] uppercase font-mono text-stone-400 block font-bold">Dépenses Totales</span>
              <strong className="text-xs md:text-sm font-mono font-black text-[#fbd27b] block mt-1">
                {formatMAD(globalExpenses)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main projects grid section */}
      <div className="space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4 select-none">
          <div>
            <h2 className="font-sans font-extrabold text-stone-900 text-sm md:text-base flex items-center gap-2">
              <Folder className="h-5 w-5 text-brand-gold" /> Catalogue de vos Chantiers ({projects.length})
            </h2>
            <p className="text-stone-500 text-[10px] md:text-xs">Cliquez sur un projet pour commencer à gérer ses prestations et son exécution.</p>
          </div>

          {!isAddingMode && (
            <button
              onClick={() => setIsAddingMode(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-brown hover:bg-stone-950 text-brand-gold hover:text-white rounded-xl text-xs font-black transition shadow-xs"
            >
              <FolderPlus className="h-4 w-4" /> Ajouter un Projet (إضافة مشروع)
            </button>
          )}
        </div>

        {/* Create inline project drawer */}
        {isAddingMode && (
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-2xl border border-stone-250 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-sans font-black text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-brand-gold" /> Nouveau Chantier / Projet de Construction
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddingMode(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Dénomination du Projet *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Travaux d'extension du Palais de Justice"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Brève Description / Lieu</label>
                <input
                  type="text"
                  placeholder="ex: Marrakech, Aménagement des extérieurs..."
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Numéro de Marché *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Marché N° 25/DPH/MRK/2026"
                  value={contractNumber}
                  onChange={e => setContractNumber(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Maître d'ouvrage (Client) *</label>
                <input
                  type="text"
                  required
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Adjudicataire (Entreprise) *</label>
                <input
                  type="text"
                  required
                  value={contractor}
                  onChange={e => setContractor(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">TVA (%)</label>
                <input
                  type="number"
                  required
                  value={tvaRate}
                  onChange={e => setTvaRate(parseInt(e.target.value) || 20)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              {/* Date d'Ouverture des Plis (I0 Base) Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                  📅 Date d'Ouverture des Plis (Base I₀)
                </label>
                <select
                  value={isBaseCustom ? "custom" : baseIndexMonth}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setIsBaseCustom(true);
                    } else {
                      setIsBaseCustom(false);
                      setBaseIndexMonth(val);
                    }
                  }}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                >
                  {indexHistoryBAT6.map(h => (
                    <option key={h.date} value={h.date}>
                      {h.label} (Index: {h.value})
                    </option>
                  ))}
                  <option value="custom">✍️ Saisie manuelle d'une autre date...</option>
                </select>

                {isBaseCustom && (
                  <div className="grid grid-cols-2 gap-2 mt-1.5 p-2 bg-stone-50 border border-stone-200 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[8px] text-stone-400 uppercase block font-bold">Mois de Base (ex: 2024-09)</label>
                      <input
                        type="text"
                        placeholder="ex: Juillet 2026"
                        required={isBaseCustom}
                        value={baseCustomMonthName}
                        onChange={e => setBaseCustomMonthName(e.target.value)}
                        className="w-full text-xs bg-white border border-stone-250 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-stone-400 uppercase block font-bold">Valeur Index (I₀)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="ex: 131.9"
                        required={isBaseCustom}
                        value={baseCustomIndexVal}
                        onChange={e => setBaseCustomIndexVal(e.target.value)}
                        className="w-full text-xs bg-white border border-stone-250 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Date de Réalisation (I Actuel) Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                  📅 Mois d'Exécution (Index Actuel I)
                </label>
                <select
                  value={isRevisionCustom ? "custom" : revisionIndexMonth}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setIsRevisionCustom(true);
                    } else {
                      setIsRevisionCustom(false);
                      setRevisionIndexMonth(val);
                    }
                  }}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                >
                  {indexHistoryBAT6.map(h => (
                    <option key={h.date} value={h.date}>
                      {h.label} (Index: {h.value})
                    </option>
                  ))}
                  <option value="custom">✍️ Saisie manuelle d'une autre date...</option>
                </select>

                {isRevisionCustom && (
                  <div className="grid grid-cols-2 gap-2 mt-1.5 p-2 bg-stone-50 border border-stone-200 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[8px] text-stone-400 uppercase block font-bold">Mois exécuté (ex: 2026-03)</label>
                      <input
                        type="text"
                        placeholder="ex: Août 2026"
                        required={isRevisionCustom}
                        value={revisionCustomMonthName}
                        onChange={e => setRevisionCustomMonthName(e.target.value)}
                        className="w-full text-xs bg-white border border-stone-250 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-stone-400 uppercase block font-bold">Valeur Index (I)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="ex: 138.8"
                        required={isRevisionCustom}
                        value={revisionCustomIndexVal}
                        onChange={e => setRevisionCustomIndexVal(e.target.value)}
                        className="w-full text-xs bg-white border border-stone-250 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1 md:col-span-2 lg:col-span-1 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useTemplate}
                    onChange={e => setUseTemplate(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-brown focus:ring-brand-gold border-stone-300"
                  />
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-stone-900 block">Seeder avec des données de test</span>
                    <span className="text-[9px] text-stone-500 block">Imports du BPU & métré d'exemples El Bahia</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsAddingMode(false)}
                className="px-4 py-2 border border-stone-300 hover:border-stone-400 bg-white text-stone-700 font-semibold rounded-lg text-xs transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-brown hover:bg-stone-900 text-brand-gold rounded-lg font-black text-xs transition flex items-center gap-1"
              >
                <Check className="h-4 w-4" /> Créer & Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* Existing Projects workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {projects.map((proj) => {
            const isEditingThis = editingProjId === proj.id;
            const bpuItemCount = proj.workItems?.length || 0;
            const calculationsCount = proj.measurementLines?.length || 0;

            const totalProjectAmount = proj.workItems.reduce((acc, item) => {
              const itemLines = proj.measurementLines.filter(l => l.itemId === item.id);
              const qty = itemLines.reduce((sum, line) => sum + line.computedValue, 0);
              return acc + (qty * item.unitPrice);
            }, 0);

            if (isEditingThis) {
              return (
                <form 
                  key={proj.id} 
                  onSubmit={(e) => handleSaveEditSubmit(proj.id, e)}
                  className="bg-white rounded-2xl border border-amber-300 p-5 shadow-md space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-500 uppercase font-black block">Nom du Projet</label>
                    <input
                      type="text"
                      required
                      value={editProjName}
                      onChange={e => setEditProjName(e.target.value)}
                      className="w-full text-xs font-bold bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-500 uppercase font-black block">Lieu / Description</label>
                    <input
                      type="text"
                      value={editProjDesc}
                      onChange={e => setEditProjDesc(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-500 uppercase font-black block">Marché N°</label>
                      <input
                        type="text"
                        required
                        value={editContractNumber}
                        onChange={e => setEditContractNumber(e.target.value)}
                        className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-500 uppercase font-black block">TVA (%)</label>
                      <input
                        type="number"
                        required
                        value={editTvaRate}
                        onChange={e => setEditTvaRate(parseInt(e.target.value) || 20)}
                        className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-500 uppercase font-black block">Maître d'ouvrage (Client)</label>
                    <input
                      type="text"
                      required
                      value={editClient}
                      onChange={e => setEditClient(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-500 uppercase font-black block">Adjudicataire (Entreprise)</label>
                    <input
                      type="text"
                      required
                      value={editContractor}
                      onChange={e => setEditContractor(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Edit Base Month Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-500 uppercase font-bold block">
                        📅 Date ouverture des Plis (I₀ Base)
                      </label>
                      <select
                        value={isEditBaseCustom ? "custom" : editBaseIndexMonth}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setIsEditBaseCustom(true);
                          } else {
                            setIsEditBaseCustom(false);
                            setEditBaseIndexMonth(val);
                          }
                        }}
                        className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 focus:outline-none"
                      >
                        {indexHistoryBAT6.map(h => (
                          <option key={h.date} value={h.date}>
                            {h.label} ({h.value})
                          </option>
                        ))}
                        <option value="custom">✍️ Autre date (Saisie manuelle)...</option>
                      </select>

                      {isEditBaseCustom && (
                        <div className="grid grid-cols-2 gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg mt-1">
                          <div>
                            <label className="text-[8px] text-stone-400 uppercase block font-bold">Mois Base</label>
                            <input
                              type="text"
                              placeholder="ex: 2024-09"
                              required={isEditBaseCustom}
                              value={editBaseCustomMonthName}
                              onChange={e => setEditBaseCustomMonthName(e.target.value)}
                              className="w-full text-xs bg-white border border-stone-250 rounded p-1 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-stone-400 uppercase block font-bold">Valeur Index (I₀)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="ex: 131.9"
                              required={isEditBaseCustom}
                              value={editBaseCustomIndexVal}
                              onChange={e => setEditBaseCustomIndexVal(e.target.value)}
                              className="w-full text-xs bg-white border border-stone-250 rounded p-1 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Edit Revision Month Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-500 uppercase font-bold block">
                        📅 Mois d'Exécution (Index I)
                      </label>
                      <select
                        value={isEditRevisionCustom ? "custom" : editRevisionIndexMonth}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setIsEditRevisionCustom(true);
                          } else {
                            setIsEditRevisionCustom(false);
                            setEditRevisionIndexMonth(val);
                          }
                        }}
                        className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 focus:outline-none"
                      >
                        {indexHistoryBAT6.map(h => (
                          <option key={h.date} value={h.date}>
                            {h.label} ({h.value})
                          </option>
                        ))}
                        <option value="custom">✍️ Autre date (Saisie manuelle)...</option>
                      </select>

                      {isEditRevisionCustom && (
                        <div className="grid grid-cols-2 gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg mt-1">
                          <div>
                            <label className="text-[8px] text-stone-400 uppercase block font-bold">Mois Réel</label>
                            <input
                              type="text"
                              placeholder="ex: 2026-03"
                              required={isEditRevisionCustom}
                              value={editRevisionCustomMonthName}
                              onChange={e => setEditRevisionCustomMonthName(e.target.value)}
                              className="w-full text-xs bg-white border border-stone-250 rounded p-1 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-stone-400 uppercase block font-bold">Valeur Index (I)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="ex: 138.8"
                              required={isEditRevisionCustom}
                              value={editRevisionCustomIndexVal}
                              onChange={e => setEditRevisionCustomIndexVal(e.target.value)}
                              className="w-full text-xs bg-white border border-stone-250 rounded p-1 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setEditingProjId(null)}
                      className="px-3 py-1.5 text-[10px] font-semibold text-stone-500 hover:text-stone-950"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 text-stone-950 font-bold rounded-lg text-[10px] flex items-center gap-0.5"
                    >
                      <Check className="h-3.5 w-3.5" /> Enregistrer
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div 
                key={proj.id}
                className="bg-white rounded-2xl border border-stone-250 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Upper card visual decoration */}
                <div className="p-5 space-y-3 relative flex-1">
                  
                  {/* Floating count indicators */}
                  <div className="flex items-center justify-between select-none">
                    <div className="h-10 w-10 bg-brand-gold/10 text-brand-gold rounded-xl flex items-center justify-center border border-brand-gold/10">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-stone-100 border border-stone-200 text-stone-500 px-2.5 py-0.5 rounded-full uppercase">
                      ID: {proj.id.slice(8, 14)}
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="space-y-1.5">
                    <h3 className="font-sans font-extrabold text-stone-900 text-sm md:text-base leading-none group-hover:text-brand-brown transition">
                      {proj.name}
                    </h3>
                    {proj.description && (
                      <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-2">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  {/* Client and Market labels */}
                  <div className="space-y-2 border-t border-stone-100 pt-3 text-[11px] text-stone-600 block">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="truncate font-medium"><strong className="font-semibold text-stone-800">M.O: </strong> {proj.details.client}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="truncate font-medium"><strong className="font-semibold text-stone-800">Entr: </strong> {proj.details.contractor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="truncate font-mono"><strong className="font-sans font-semibold text-stone-800">Marché: </strong> {proj.details.contractNumber}</span>
                    </div>
                  </div>

                  {/* Calculations & financial badges */}
                  <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 select-none">
                    <div className="bg-stone-50 border border-stone-150 p-2 rounded-xl text-center">
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">Articles BPU</span>
                      <strong className="text-xs font-mono font-black text-stone-900">{bpuItemCount}</strong>
                    </div>
                    <div className="bg-stone-50 border border-stone-150 p-2 rounded-xl text-center">
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">Lignes Métré</span>
                      <strong className="text-xs font-mono font-black text-stone-900">{calculationsCount}</strong>
                    </div>
                  </div>

                  {/* Financial amount info */}
                  <div className="pt-2 flex items-center justify-between border-t border-stone-100 mt-2">
                    <span className="text-[9px] text-stone-500 uppercase font-semibold">Montant HT Estimé :</span>
                    <strong className="text-xs font-mono text-brand-brown font-black">
                      {totalProjectAmount.toFixed(2)} MAD
                    </strong>
                  </div>

                </div>

                {/* Bottom button actions */}
                <div className="bg-stone-50 border-t border-stone-150 p-3 flex items-center justify-between gap-2 select-none">
                  
                  {/* Delete / Edit mini keys */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(proj)}
                      className="p-1.5 bg-white border border-stone-250 hover:border-stone-450 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-900 transition"
                      title="Modifier les détails généraux"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le projet "${proj.name}" ? Toutes ses données BPU et calculs seront perdues.`)) {
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg text-red-500 hover:text-white transition"
                      title="Supprimer le projet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-brand-brown group-hover:bg-brand-brown hover:opacity-90 text-brand-gold rounded-lg text-xs font-black transition shadow-xs"
                  >
                    Ouvrir <ArrowRight className="h-3 w-3" />
                  </button>

                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="col-span-full py-16 p-6 border-2 border-dashed border-stone-200 bg-white rounded-3xl text-center space-y-3 select-none">
              <Folder className="h-10 w-10 text-stone-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-stone-900 text-xs">Aucun Projet Disponible</h3>
                <p className="text-stone-500 text-[11px] max-w-sm mx-auto">
                  Démarrez en ajoutant un nouveau projet de travaux dans le formulaire ci-dessus pour configurer vos pièces de marchés.
                </p>
              </div>
              <button
                onClick={() => setIsAddingMode(true)}
                className="mt-2 inline-flex items-center gap-1 px-4 py-1.5 bg-stone-900 hover:bg-black text-white text-[10px] font-bold rounded-lg transition"
              >
                <Plus className="h-3.5 w-3.5" /> Créer un premier projet
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
