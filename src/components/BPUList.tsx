import React, { useState } from "react";
import { WorkItem, MeasurementLine } from "../types";
import { 
  Plus, 
  Trash2, 
  Search, 
  Edit3, 
  Check, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  FileSpreadsheet, 
  TrendingUp, 
  FileText,
  Percent,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface BPUListProps {
  workItems: WorkItem[];
  setWorkItems: (items: WorkItem[]) => void;
  measurementLines: MeasurementLine[];
}

export default function BPUList({ workItems, setWorkItems, measurementLines }: BPUListProps) {
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  // Expandable state for measurement breakdowns
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // New item state (now includes contractQuantity)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    code: "",
    category: "01 - Terrassements & Démolitions",
    description: "",
    unit: "m³",
    unitPrice: 0,
    contractQuantity: 10
  });

  // Inline editing state (including price & contract qty)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingContractQty, setEditingContractQty] = useState<number>(0);
  const [editingDesc, setEditingDesc] = useState("");

  const categories = ["Tous", ...Array.from(new Set(workItems.map((item) => item.category)))];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.code || !newItem.description || newItem.unitPrice < 0) {
      alert("Veuillez remplir correctement tous les champs obligatoires.");
      return;
    }

    const createdItem: WorkItem = {
      id: "item-" + Date.now(),
      code: newItem.code,
      category: newItem.category,
      description: newItem.description,
      unit: newItem.unit,
      unitPrice: newItem.unitPrice,
      contractQuantity: newItem.contractQuantity > 0 ? newItem.contractQuantity : 1.0
    };

    setWorkItems([...workItems, createdItem]);
    setNewItem({
      code: "",
      category: newItem.category,
      description: "",
      unit: "m³",
      unitPrice: 0,
      contractQuantity: 10
    });
    setShowAddForm(false);
  };

  const handleStartEdit = (item: WorkItem) => {
    setEditingId(item.id);
    setEditingPrice(item.unitPrice);
    setEditingDesc(item.description);
    setEditingContractQty(item.contractQuantity || 0);
  };

  const handleSaveEdit = (id: string) => {
    setWorkItems(
      workItems.map((item) =>
        item.id === id ? { 
          ...item, 
          unitPrice: editingPrice, 
          description: editingDesc,
          contractQuantity: editingContractQty > 0 ? editingContractQty : 1.0
        } : item
      )
    );
    setEditingId(null);
  };

  const handleDeleteItem = (id: string, code: string) => {
    const counts = measurementLines.filter((l) => l.itemId === id).length;
    if (counts > 0) {
      if (
        !window.confirm(
          `Attention ! Cet article (${code}) possède ${counts} ligne(s) de métré associées. Supprimer l'article supprimera également toutes ses lignes de métré associées. Continuer ?`
        )
      ) {
        return;
      }
    }
    setWorkItems(workItems.filter((item) => item.id !== id));
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Helper to calculate total quantity executed from Metre sheet
  const getItemExecutedQty = (itemId: string): number => {
    return measurementLines
      .filter((line) => line.itemId === itemId)
      .reduce((sum, current) => sum + current.computedValue, 0);
  };

  // Filter items
  const filteredItems = workItems.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate General Summary Stats of the Attachement in real-time
  const totalContractHT = workItems.reduce((acc, curr) => acc + ((curr.contractQuantity || 0) * curr.unitPrice), 0);
  const totalExecutedHT = workItems.reduce((acc, curr) => {
    const execQty = getItemExecutedQty(curr.id);
    return acc + (execQty * curr.unitPrice);
  }, 0);
  
  const totalExecutionRatio = totalContractHT > 0 ? (totalExecutedHT / totalContractHT) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Real-time Attachement Financial Summary Header Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Coût Prévu (Bordereau Initial)</span>
            <strong className="text-sm md:text-md font-mono text-stone-900 font-black">
              {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(totalContractHT)}
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Valeur Traitée (Attachement Réel)</span>
            <strong className="text-sm md:text-md font-mono text-emerald-900 font-black">
              {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(totalExecutedHT)}
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Avancement Global du Chantier</span>
            <div className="flex items-center gap-2">
              <strong className="text-sm md:text-md font-mono text-brand-brown font-black leading-none">
                {totalExecutionRatio.toFixed(2)}%
              </strong>
              <span className="text-[9px] text-stone-400 font-medium">calculé / volume total</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${totalExecutionRatio > 100 ? 'bg-amber-500' : 'bg-brand-brown'}`}
                style={{ width: `${Math.min(totalExecutionRatio, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par désignation ou code de prix..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-stone-200 bg-white placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-700 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-brown hover:bg-stone-850 text-brand-gold px-4 py-2 text-xs font-black uppercase transition shadow-xs"
          >
            <Plus className="h-4 w-4" /> Nouveau Prix (BPU)
          </button>
        </div>
      </div>

      {/* Add New Item Form-Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="rounded-xl border border-brand-gold/20 bg-brand-clay/[0.05] p-5 mt-4 space-y-4">
          <h3 className="font-sans font-black text-xs text-brand-brown uppercase tracking-wider">Créer un Nouvel Article de Prix</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase block">Code de l'Article *</label>
              <input
                type="text"
                placeholder="Ex: 2.3 ou A.01"
                required
                value={newItem.code}
                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase block">Catégorie d'Ouvrage</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="01 - Terrassements & Démolitions">01 - Terrassements & Démolitions</option>
                <option value="02 - Gros Œuvre & Structure">02 - Gros Œuvre & Structure</option>
                <option value="03 - Revêtements & Zelliges">03 - Revêtements & Zelliges</option>
                <option value="04 - Enduits de Restauration">04 - Enduits de Restauration</option>
                <option value="05 - Équipement & Ouvrages Bois">05 - Équipement & Ouvrages Bois</option>
                <option value="Autres">Autres catégories</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase block">Unité de mesure</label>
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="m³">Mètre Cube (m³)</option>
                <option value="m²">Mètre Carré (m²)</option>
                <option value="ml">Mètre Linéaire (ml)</option>
                <option value="U">Unité (U)</option>
                <option value="fft">Forfait (fft)</option>
                <option value="kg">Kilogramme (kg)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase block">Quantité Convenue (Marché) *</label>
              <input
                type="number"
                step="any"
                placeholder="Ex: 50.00"
                required
                value={newItem.contractQuantity}
                onChange={(e) => setNewItem({ ...newItem, contractQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase block">Prix Unitaire (DH HT) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 450.00"
                required
                value={newItem.unitPrice || ""}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-500 uppercase block">Désignation complète du prix *</label>
            <textarea
              rows={2}
              placeholder="Saisissez la description technique détaillée de l'intervention ou de la prestation..."
              required
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full rounded-md border border-stone-250 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 rounded-lg border border-stone-250 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-brand-brown hover:bg-stone-900 text-brand-gold text-xs font-black uppercase transition"
            >
              Confirmer l'ajout
            </button>
          </div>
        </form>
      )}

      {/* Main Table combining BPU and execution progress as an Attachement file */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
        <table className="w-full border-collapse text-left text-xs text-stone-600">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/75 text-[10px] font-bold uppercase tracking-wider text-stone-500 select-none">
              <th className="px-4 py-3 w-10 text-center"></th>
              <th className="px-4 py-3 w-16">Code</th>
              <th className="px-4 py-3 w-36">Catégorie</th>
              <th className="px-4 py-3">Désignation des Travaux</th>
              <th className="px-4 py-3 w-12 text-center">Unité</th>
              <th className="px-4 py-3 w-24 text-right">Qte Convenue</th>
              <th className="px-4 py-3 w-24 text-right">Qte Exécutée</th>
              <th className="px-4 py-3 w-28 text-center">Rapport / Écart</th>
              <th className="px-4 py-3 w-28 text-right">P.U HT (MAD)</th>
              <th className="px-4 py-3 w-28 text-right">Montant HT</th>
              <th className="px-4 py-3 w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12 text-stone-400 font-light select-none">
                  Aucun article enregistré pour ce projet ou filtre actif.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isEditingThis = editingId === item.id;
                
                // Real-time calculations: quantity and spent values
                const executedQty = getItemExecutedQty(item.id);
                const contractQty = item.contractQuantity || 0;
                
                // Progress index
                const ratio = contractQty > 0 ? (executedQty / contractQty) * 100 : 0;
                const totalCostHT = executedQty * item.unitPrice;

                // get associated measurement lines
                const itemLines = measurementLines.filter((l) => l.itemId === item.id);
                const isExpanded = !!expandedItems[item.id];

                return (
                  <React.Fragment key={item.id}>
                    {/* Main Row */}
                    <tr className={`hover:bg-stone-50/40 transition-colors ${isExpanded ? 'bg-amber-500/[0.02]' : ''}`}>
                      <td className="px-3 py-3.5 text-center select-none">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="p-1 rounded hover:bg-stone-150 text-stone-400 hover:text-stone-700 transition"
                          title="Afficher les calculs de métré liés"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-brand-brown" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-extrabold text-stone-950 text-xs">
                        {item.code}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] select-none">
                        <span className="inline-flex items-center rounded bg-stone-100 px-2 py-0.5 font-medium text-stone-700 max-w-[130px] truncate" title={item.category}>
                          {item.category.split(" - ").pop()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[12.5px] leading-relaxed">
                        {isEditingThis ? (
                          <textarea
                            value={editingDesc}
                            onChange={(e) => setEditingDesc(e.target.value)}
                            rows={3}
                            className="w-full text-xs rounded-md border border-stone-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-brand-gold text-stone-900 font-sans"
                          />
                        ) : (
                          <p className="text-stone-800 font-medium">
                            {item.description}
                          </p>
                        )}
                        {itemLines.length > 0 && !isExpanded && (
                          <span 
                            onClick={() => toggleExpand(item.id)}
                            className="text-[10px] text-brand-gold hover:text-brand-brown font-semibold uppercase inline-flex items-center gap-1 mt-1 font-mono cursor-pointer transition select-none"
                          >
                            <Eye className="h-3 w-3" /> Contient {itemLines.length} ligne(s) de calcul • Cliquer pour inspecter
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center font-mono text-stone-700 font-bold select-none text-[11px]">
                        {item.unit}
                      </td>

                      {/* Contract Quantity */}
                      <td className="px-4 py-3.5 text-right font-mono text-stone-800 text-xs font-semibold">
                        {isEditingThis ? (
                          <input
                            type="number"
                            step="any"
                            value={editingContractQty}
                            onChange={(e) => setEditingContractQty(parseFloat(e.target.value) || 0)}
                            className="w-20 text-right rounded-md border border-stone-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold text-stone-900 font-bold font-mono"
                          />
                        ) : (
                          new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(contractQty)
                        )}
                      </td>

                      {/* Executed Quantity (Fetched Automatically from Attachment) */}
                      <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-emerald-800">
                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(executedQty)}
                      </td>

                      {/* Ratio Completed vs Agreed */}
                      <td className="px-4 py-3.5 select-none text-center">
                        <div className="space-y-1 max-w-[120px] mx-auto">
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                            <span className={ratio > 100 ? "text-amber-600" : "text-stone-500"}>
                              {ratio.toFixed(1)}%
                            </span>
                            {ratio > 100 ? (
                              <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded flex items-center gap-0.5 leading-none" title="Sur-exécution">
                                <AlertTriangle className="h-2 w-2" /> Dépassement
                              </span>
                            ) : ratio === 100 ? (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded flex items-center gap-0.5 leading-none">
                                <CheckCircle2 className="h-2 w-2" /> Fait
                              </span>
                            ) : null}
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                ratio > 100 ? 'bg-amber-500' : ratio === 100 ? 'bg-emerald-500' : 'bg-brand-brown'
                              }`} 
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-stone-900 font-semibold">
                        {isEditingThis ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(parseFloat(e.target.value) || 0)}
                            className="w-24 text-right rounded-md border border-stone-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold text-stone-900 font-bold font-mono"
                          />
                        ) : (
                          new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(item.unitPrice)
                        )}
                      </td>

                      {/* Cumulative calculated amount */}
                      <td className="px-4 py-3.5 text-right font-mono font-extrabold text-stone-950 text-xs">
                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(totalCostHT)}
                      </td>

                      {/* Row management actions */}
                      <td className="px-4 py-3.5 text-center select-none">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditingThis ? (
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                              title="Sauvegarder"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition"
                              title="Modifier les barèmes de l'article"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem(item.id, item.code)}
                            className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Supprimer cet article"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Measurement lines Sub-table */}
                    {isExpanded && (
                      <tr className="bg-amber-500/[0.01] border-b border-stone-250 select-none">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 shadow-inner">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                              <span className="text-[10px] font-sans font-extrabold tracking-wider text-brand-brown uppercase flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" /> Justification des Quantités : Attachement Exécuté de l'Article [{item.code}]
                              </span>
                              <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-mono font-bold">
                                {itemLines.length} ligne(s) de calcul
                              </span>
                            </div>

                            {itemLines.length === 0 ? (
                              <div className="text-center py-6 text-[11px] text-stone-450 italic">
                                Aucune ligne de métré saisie pour cet article. 
                                <br />
                                <span className="text-[10px] text-brand-brown font-semibold not-italic">
                                  Veuillez vous rendre sur l'onglet "Métré (المتر)" pour ajouter des calculs de dimension.
                                </span>
                              </div>
                            ) : (
                              <table className="w-full text-left text-[11px] text-stone-600">
                                <thead>
                                  <tr className="border-b border-stone-200 text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                                    <th className="py-2 pl-2">Description / Repères</th>
                                    <th className="py-2 text-center w-16">Coeff.</th>
                                    <th className="py-2 text-right w-16">L (m)</th>
                                    <th className="py-2 text-right w-16">l (m)</th>
                                    <th className="py-2 text-right w-16">h (m)</th>
                                    <th className="py-2 text-right w-24 pr-2">Total partiel ({item.unit})</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 font-mono font-medium">
                                  {itemLines.map((line) => (
                                    <tr key={line.id} className="hover:bg-stone-100 py-1.5 transition">
                                      <td className="py-2 pl-2 font-sans font-medium text-stone-700">{line.label}</td>
                                      <td className="py-2 text-center text-stone-500 font-bold">{line.coefficient}</td>
                                      <td className="py-2 text-right text-stone-500">{line.length !== undefined && line.length !== 0 ? line.length : "-"}</td>
                                      <td className="py-2 text-right text-stone-500">{line.width !== undefined && line.width !== 0 ? line.width : "-"}</td>
                                      <td className="py-2 text-right text-stone-500">{line.height !== undefined && line.height !== 0 ? line.height : "-"}</td>
                                      <td className="py-2 text-right font-extrabold text-stone-900 pr-2">
                                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(line.computedValue)}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-stone-100/70 text-stone-800 font-bold font-sans">
                                    <td colSpan={5} className="py-2 pl-2 text-right uppercase tracking-wider text-[9px]">Calcul total cumulé pour l'attachement :</td>
                                    <td className="py-2 text-right font-mono font-black text-emerald-800 pr-2 text-xs">
                                      {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(executedQty)} {item.unit}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
