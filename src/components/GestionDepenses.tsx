import React, { useState } from "react";
import { Expense, ExpenseCategory, Worker, DailyPointage } from "../types";
import { 
  Coins, 
  Plus, 
  Trash2, 
  Tag, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Truck,
  Wrench,
  Paintbrush,
  Hammer,
  Layers,
  ArrowRight,
  Pencil,
  Save,
  X
} from "lucide-react";

interface GestionDepensesProps {
  expenses: Expense[];
  onUpdateExpenses: (updated: Expense[]) => void;
  estimatedRevenue: number;
  workers: Worker[];
  pointages: DailyPointage[];
}

export default function GestionDepenses({
  expenses,
  onUpdateExpenses,
  estimatedRevenue,
  workers,
  pointages
}: GestionDepensesProps) {
  // Expense Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>("materiaux");
  const [label, setLabel] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [unitPriceInput, setUnitPriceInput] = useState("");
  const [remarks, setRemarks] = useState("");
  const [bonLivraison, setBonLivraison] = useState("");

  const [filterCategory, setFilterCategory] = useState<string>("Tous");

  // Editing Expense state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState<ExpenseCategory>("materiaux");
  const [editLabel, setEditLabel] = useState("");
  const [editAmountInput, setEditAmountInput] = useState("");
  const [editQuantityInput, setEditQuantityInput] = useState("");
  const [editUnitPriceInput, setEditUnitPriceInput] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editBonLivraison, setEditBonLivraison] = useState("");

  const handleOpenEditExpenseModal = (exp: Expense) => {
    setEditingExpense(exp);
    setEditDate(exp.date);
    setEditCategory(exp.category);
    setEditLabel(exp.label);
    setEditAmountInput(exp.amount !== undefined ? String(exp.amount) : "");
    setEditQuantityInput(exp.quantity !== undefined ? String(exp.quantity) : "");
    setEditUnitPriceInput(exp.unitPrice !== undefined ? String(exp.unitPrice) : "");
    setEditRemarks(exp.remarks || "");
    setEditBonLivraison(exp.bonLivraison || "");
  };

  const handleSaveEditedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    if (!editLabel.trim()) {
      alert("Veuillez saisir une désignation.");
      return;
    }

    let calculatedAmount = parseFloat(editAmountInput);
    const qty = parseFloat(editQuantityInput);
    const price = parseFloat(editUnitPriceInput);

    if (isNaN(calculatedAmount)) {
      if (!isNaN(qty) && !isNaN(price)) {
        calculatedAmount = qty * price;
      } else {
        alert("Veuillez saisir un montant valide ou une quantité et prix unitaire.");
        return;
      }
    }

    const updated = expenses.map(exp => {
      if (exp.id === editingExpense.id) {
        return {
          ...exp,
          date: editDate,
          category: editCategory,
          label: editLabel.trim(),
          amount: calculatedAmount,
          quantity: isNaN(qty) ? undefined : qty,
          unitPrice: isNaN(price) ? undefined : price,
          remarks: editRemarks.trim() || undefined,
          bonLivraison: editBonLivraison.trim() || undefined
        };
      }
      return exp;
    });

    onUpdateExpenses(updated);
    setEditingExpense(null);
  };

  // Dynamic custom expense categories
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const standardCategories = ["materiaux", "materiel", "chauffeur", "droguerie", "pieces", "autre"];
    const uniqueInExpenses = Array.from(new Set(expenses.map(e => e.category)))
      .filter(cat => cat && !standardCategories.includes(cat));
    return uniqueInExpenses;
  });

  const [newCatName, setNewCatName] = useState("");

  const handleAddCustomCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    const standardCategories = ["materiaux", "materiel", "chauffeur", "droguerie", "pieces", "autre"];
    if (standardCategories.includes(trimmed.toLowerCase())) {
      setCategory(trimmed.toLowerCase() as ExpenseCategory);
      setNewCatName("");
      return;
    }

    if (customCategories.includes(trimmed)) {
      setCategory(trimmed);
      setNewCatName("");
      return;
    }

    const updatedCustoms = [...customCategories, trimmed];
    setCustomCategories(updatedCustoms);
    setCategory(trimmed);
    setNewCatName("");
  };

  // Worker timesheet wages calculation
  const calculateTotalWages = (): number => {
    let wagesSum = 0;
    pointages.forEach(dp => {
      dp.pointages.forEach(pt => {
        const worker = workers.find(w => w.id === pt.workerId);
        if (worker) {
          if (pt.status === "present") wagesSum += worker.dailyRate;
          else if (pt.status === "demi-journee") wagesSum += (worker.dailyRate / 2);
        }
      });
    });
    return wagesSum;
  };

  const timesheetWages = calculateTotalWages();

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert("Veuillez saisir une désignation.");
      return;
    }

    let calculatedAmount = parseFloat(amountInput);
    const qty = parseFloat(quantityInput);
    const price = parseFloat(unitPriceInput);

    if (isNaN(calculatedAmount)) {
      if (!isNaN(qty) && !isNaN(price)) {
        calculatedAmount = qty * price;
      } else {
        alert("Veuillez saisir un montant valide ou une quantité et prix unitaire.");
        return;
      }
    }

    const newExpense: Expense = {
      id: "exp-" + Date.now(),
      date,
      category,
      label: label.trim(),
      amount: calculatedAmount,
      quantity: isNaN(qty) ? undefined : qty,
      unitPrice: isNaN(price) ? undefined : price,
      remarks: remarks.trim() || undefined,
      bonLivraison: bonLivraison.trim() || undefined
    };

    onUpdateExpenses([...expenses, newExpense]);

    // Reset inputs
    setLabel("");
    setAmountInput("");
    setQuantityInput("");
    setUnitPriceInput("");
    setRemarks("");
    setBonLivraison("");
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette ligne de dépense ?")) {
      onUpdateExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  // Calculations for total expenses
  const expenseSummary = () => {
    const categoriesSum: { [key: string]: number } = {
      materiel: 0,
      materiaux: 0,
      chauffeur: 0,
      droguerie: 0,
      pieces: 0,
      autre: 0,
      main_doeuvre: timesheetWages
    };

    // Initialize loaded custom categories to 0
    customCategories.forEach(cat => {
      categoriesSum[cat] = 0;
    });

    expenses.forEach(exp => {
      let catKey = exp.category;
      if (catKey === "matériels" || catKey === "materiel") catKey = "materiel";
      if (catKey === "matériaux" || catKey === "materiaux") catKey = "materiaux";
      if (catKey === "pièces" || catKey === "pieces") catKey = "pieces";
      
      if (categoriesSum[catKey] !== undefined) {
        categoriesSum[catKey] += exp.amount;
      } else {
        categoriesSum[catKey] = exp.amount;
      }
    });

    const totalExpenseIncurred = Object.values(categoriesSum).reduce((a, b) => a + b, 0);
    const balance = estimatedRevenue - totalExpenseIncurred;
    const profitMarginPercent = estimatedRevenue > 0 ? (balance / estimatedRevenue) * 100 : 0;

    return {
      categoriesSum,
      totalExpenseIncurred,
      balance,
      profitMarginPercent
    };
  };

  const financial = expenseSummary();

  // Helper formatting Moroccan Dirhams
  const formatMAD = (val: number) => {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(val);
  };

  // Map category code to human labels
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case "materiel":
      case "matériel":
        return { label: "Engins & Matériel", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Hammer };
      case "materiaux":
      case "matériaux":
        return { label: "Matériaux (Zellige, Sable, Bejmat...)", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Coins };
      case "chauffeur":
        return { label: "Chauffeur & Transport", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Truck };
      case "droguerie":
        return { label: "Droguerie & Outillage", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Paintbrush };
      case "pieces":
      case "pièces":
        return { label: "Pièces de Rechange", color: "bg-rose-50 text-rose-700 border-rose-200", icon: Wrench };
      case "main_doeuvre":
        return { label: "M.O (Pointage Ouvriers)", color: "bg-emerald-50 text-emerald-700 border-emerald-250", icon: Hammer };
      case "autre":
        return { label: "Autres charges", color: "bg-stone-50 text-stone-700 border-stone-200", icon: Tag };
      default:
        return { label: cat, color: "bg-teal-50 text-teal-850 border-teal-200", icon: Tag };
    }
  };

  const filteredExpenses = filterCategory === "Tous" 
    ? expenses 
    : expenses.filter(exp => {
        const cat = exp.category;
        if (filterCategory === "materiel" && (cat === "materiel" || cat === "matériel")) return true;
        if (filterCategory === "materiaux" && (cat === "materiaux" || cat === "matériaux")) return true;
        return cat === filterCategory;
      });

  return (
    <div className="space-y-8 select-none font-sans">
      {/* Arabic and French Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-250 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-terracotta bg-brand-clay/30 border border-brand-clay/50 px-3 py-1 rounded-full font-bold">
            Gestion Financière • إدارة المصاريف والنفقات
          </span>
          <h2 className="text-xl font-extrabold text-stone-900 mt-2">
            Situation Générale des Dépenses de Chantier
          </h2>
          <p className="text-stone-500 text-xs mt-1">
            Enregistrez les débourserels pour le matériel, les matériaux, le transport, la droguerie et comparez-les aux pointages de la main-d'œuvre.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-right">
          <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Bénéfice Restant Estimé (MAD)</span>
          <div className="flex items-center gap-1.5 mt-1 justify-end">
            <span className={`text-xl font-mono font-black ${financial.balance >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {formatMAD(financial.balance)}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5">
            Marge opérationnelle: <strong className={financial.balance >= 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{financial.profitMarginPercent.toFixed(1)}%</strong>
          </p>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Recettes Projet Estimées (HT)</span>
            <span className="text-stone-400 bg-stone-100 p-2 rounded-lg">
              <TrendingUp className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-xl font-black text-stone-900">
              {formatMAD(estimatedRevenue)}
            </h3>
            <span className="text-[10px] text-stone-400 font-medium block mt-1">Calculée selon le cumul de métré actuel</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-terracotta">Total Dépenses Cumulé</span>
            <span className="text-rose-500 bg-rose-50 p-2 rounded-lg">
              <TrendingDown className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-xl font-black text-rose-700">
              {formatMAD(financial.totalExpenseIncurred)}
            </h3>
            <span className="text-[10px] text-stone-400 font-medium block mt-1">
              Main d'œuvre inclus: <strong>{formatMAD(timesheetWages)}</strong>
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Rentabilité nette</span>
            <span className="text-emerald-600 bg-emerald-50 p-2 rounded-lg">
              <Coins className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`font-mono text-xl font-black ${financial.balance >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {formatMAD(financial.balance)}
            </h3>
            <span className="text-[10px] text-stone-400 font-medium block mt-1">Situation comptable saine</span>
          </div>
        </div>
      </div>

      {/* Main split grid: Add Form & Situation graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form to insert new expense */}
        <div className="bg-white rounded-2xl border border-stone-250 p-6 shadow-xs lg:col-span-1 space-y-4">
          <h3 className="font-sans font-extrabold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-3">
            <Plus className="h-4 w-4 text-brand-gold" /> Enregistrer un Débours / Achat
          </h3>

          <form onSubmit={handleAddExpense} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold block">Date de dépense</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold block">Catégorie Dépense</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none font-medium"
              >
                <option value="materiaux">🧱 Matériaux (Ciment, Sable, Bejmat, Zellij...)</option>
                <option value="materiel">⚙️ Engins & Matériel (Bétonnières, Échafaudage...)</option>
                <option value="chauffeur">🚗 Chauffeur & Transports (Gazole, Trajet, Driver...)</option>
                <option value="droguerie">🎨 Droguerie (Vis, Clous, Peinture, Droguerie...)</option>
                <option value="pieces">🔧 Pièces détachées & Maintenance mécanique</option>
                <option value="autre">📦 Autre charge de chantier</option>
                {customCategories.map(cat => (
                  <option key={cat} value={cat}>📁 {cat}</option>
                ))}
              </select>
            </div>

            {/* Custom category input field / حقل إضافة فئة مخصصة */}
            <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl space-y-2.5">
              <label className="text-[9.5px] text-stone-500 uppercase tracking-wider font-extrabold block">
                ➕ إضافة فئة مصاريف مخصصة (Insérer Catégorie)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: مطبوعات، تأمينات، وجبات..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="flex-1 p-2 bg-white border border-stone-250 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-3 py-2 bg-brand-gold hover:bg-stone-900 hover:text-white text-brand-brown rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>إضافة</span>
                </button>
              </div>
              <p className="text-[9.5px] text-stone-400 font-light leading-snug">
                ستضاف هذه الفئة فوراً في قائمة الاختبار والفرع السريع أعلاه.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold block">Libellé / Désignation de l'achat</label>
              <input
                type="text"
                required
                placeholder="ex: 10 tonnes Sable de Marrakech"
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none placeholder-stone-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-stone-500 uppercase tracking-wider font-semibold block">Quantité (Opt)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="ex: 10"
                  value={quantityInput}
                  onChange={e => setQuantityInput(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-stone-500 uppercase tracking-wider font-semibold block">P.U (Opt)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="ex: 340"
                  value={unitPriceInput}
                  onChange={e => setUnitPriceInput(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Montant Brut Direct (MAD)</label>
                {!quantityInput || !unitPriceInput ? (
                  <span className="text-[9px] text-stone-400">(Saisie manuelle ou calculée)</span>
                ) : (
                  <span className="text-[9px] text-emerald-600 font-bold">Auto: {((parseFloat(quantityInput) || 0) * (parseFloat(unitPriceInput) || 0)).toFixed(2)}</span>
                )}
              </div>
              <input
                type="number"
                step="any"
                placeholder={quantityInput && unitPriceInput ? String((parseFloat(quantityInput) || 0) * (parseFloat(unitPriceInput) || 0)) : "ex: 3400"}
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-stone-500 uppercase tracking-wider font-bold block">N° Bon Livraison (Opt)</label>
                <input
                  type="text"
                  placeholder="ex: BL-1049"
                  value={bonLivraison}
                  onChange={e => setBonLivraison(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none text-[11px] font-mono font-black placeholder-stone-300 uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-stone-500 uppercase tracking-wider font-bold block">Remarques / Fournisseur</label>
                <input
                  type="text"
                  placeholder="Optionnel..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-250 rounded-lg text-stone-900 focus:outline-none text-[11px] placeholder-stone-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-brown hover:bg-stone-900 text-brand-gold hover:text-white rounded-xl font-bold font-sans transition mt-2 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Ajouter la Dépense
            </button>
          </form>
        </div>

        {/* Categories graph list situation */}
        <div className="bg-white rounded-2xl border border-stone-250 p-6 shadow-xs lg:col-span-2 space-y-5">
          <h3 className="font-sans font-extrabold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-100 pb-3">
             Ventilation Budgétaire par Type de Dépense (Situation de Dépense)
          </h3>

          <div className="space-y-4">
            {Object.entries(financial.categoriesSum).map(([categoryName, val]) => {
              const details = getCategoryDetails(categoryName);
              const percentageOfRevenue = estimatedRevenue > 0 ? (val / estimatedRevenue) * 100 : 0;
              const IconComp = details.icon;

              return (
                <div key={categoryName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg border ${details.color} shrink-0`}>
                        <IconComp className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-bold text-stone-700">{details.label}</span>
                    </div>
                    <div className="text-right">
                      <strong className="font-mono text-stone-900 block">{formatMAD(val)}</strong>
                      <span className="text-[9.5px] text-stone-400 block font-light">
                        Ratio dépenses s/recettes: <strong>{percentageOfRevenue.toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        percentageOfRevenue > 30 ? "bg-red-500" : percentageOfRevenue > 15 ? "bg-amber-500" : "bg-brand-gold"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, percentageOfRevenue))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-xl text-xs text-stone-600 block mt-2 leading-relaxed space-y-1">
            <strong className="text-brand-brown font-semibold flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-brand-gold" /> Légende de dérive budgétaire
            </strong>
            <p>
              Les barres d'indicateurs représentent les dépenses d'exécution comparées aux recettes contractuelles estimées actuelles. Si un poste dépasse 30% des profits théoriques estimatifs, la couleur vire au rouge pour alerter sur des surcoûts potentiels.
            </p>
          </div>
        </div>

      </div>

      {/* Expenses list History section */}
      <div className="bg-white border border-stone-250 rounded-2xl overflow-hidden shadow-xs space-y-4">
        
        {/* Table Filters menu */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="font-sans font-extrabold text-stone-900 text-xs uppercase tracking-wider">Historial des Dépenses ({expenses.length})</h4>
            <p className="text-stone-500 text-[10px]">Liste chronologique de vos débours matériels, fournitures & services.</p>
          </div>

          <div className="flex gap-1 flex-wrap font-sans">
            {["Tous", "materiaux", "materiel", "chauffeur", "droguerie", "pieces", "autre", ...customCategories].map(cat => {
              let label = cat;
              if (cat === "Tous") label = "Tous";
              else if (cat === "materiaux") label = "Matériaux";
              else if (cat === "materiel") label = "Matériel";
              else if (cat === "chauffeur") label = "Chauffeur";
              else if (cat === "droguerie") label = "Droguerie";
              else if (cat === "pieces") label = "Pièces";
              else if (cat === "autre") label = "Autres";

              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition truncate max-w-[150px] ${
                    filterCategory === cat
                      ? "bg-brand-brown text-white"
                      : "text-stone-500 hover:bg-stone-200"
                  }`}
                  title={label}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expenses Grid / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-stone-600 border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[9px] select-none text-center">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Catégorie</th>
                <th className="px-4 py-3 text-left">Désignation</th>
                <th className="px-4 py-3">Quantité & P.U</th>
                <th className="px-4 py-3 text-right">Montant Budgété</th>
                <th className="px-4 py-3 text-left">Explications / Notes</th>
                <th className="px-4 py-3 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150">
              {filteredExpenses.map(exp => {
                const details = getCategoryDetails(exp.category);
                return (
                  <tr key={exp.id} className="hover:bg-stone-50/25 transition">
                    <td className="px-5 py-3 font-mono text-stone-900 border-r border-stone-100 text-center font-semibold">
                      {exp.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${details.color}`}>
                        {details.label.split(" (")[0]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-850">
                      <div className="font-bold">{exp.label}</div>
                      {exp.bonLivraison && (
                        <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-[9px] font-black uppercase tracking-wider select-none">
                          📄 BL: {exp.bonLivraison}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-500 text-center">
                      {exp.quantity !== undefined && exp.unitPrice !== undefined ? (
                        <>
                          {exp.quantity} × <span className="font-mono">{formatMAD(exp.unitPrice)}</span>
                        </>
                      ) : (
                        <span className="text-stone-400 italic text-[10px]">Non spécifié</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-black text-stone-950 text-right text-xs">
                      {formatMAD(exp.amount)}
                    </td>
                    <td className="px-4 py-3 text-stone-500 font-light truncate max-w-xs capitalize">
                      {exp.remarks || <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center border-l border-stone-100 select-none">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditExpenseModal(exp)}
                          className="p-1 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                          title="Modifier cette dépense"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded transition"
                          title="Détruire cette ligne"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400 italic font-light text-xs">
                    Aucune ligne de dépense enregistrée pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== EXPENSE EDIT MODAL ==================== */}
      {editingExpense && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingExpense(null);
            }
          }}
          className="fixed inset-0 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-2xl border border-stone-250 w-full max-w-md p-5 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-stone-150 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-brand-gold shrink-0" />
                <div>
                  <h3 className="font-sans font-black text-xs uppercase text-stone-900 tracking-wider">تعديل تفاصيل المصروف / الشراء</h3>
                  <p className="text-stone-400 text-[10px]">Modifier la ligne de dépense</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingExpense(null)}
                className="p-1 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition animate-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedExpense} className="space-y-4 text-xs font-sans text-right">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold text-left">Date / التاريخ *</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 text-left focus:ring-1 focus:ring-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold text-left">Catégorie / الفئة *</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 focus:ring-1 focus:ring-brand-gold focus:outline-none text-left"
                >
                  <option value="materiaux">🧱 Matériaux (Ciment, Sable, Bejmat, Zellij...)</option>
                  <option value="materiel">⚙️ Engins & Matériel (Bétonnières, Échafaudage...)</option>
                  <option value="chauffeur">🚗 Chauffeur & Transports (Gazole, Trajet, Driver...)</option>
                  <option value="droguerie">🎨 Droguerie (Vis, Clous, Peinture, Droguerie...)</option>
                  <option value="pieces">🔧 Pièces détachées & Maintenance mécanique</option>
                  <option value="autre">📦 Autre charge de chantier</option>
                  {customCategories.map(cat => (
                    <option key={cat} value={cat}>📁 {cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold text-left">Désignation de l'achat / البيان المالي *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Ciment de Marrakech"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 text-stone-900 text-left focus:ring-1 focus:ring-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold text-left">Quantité / الكمية</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="ex: 10"
                    value={editQuantityInput}
                    onChange={e => setEditQuantityInput(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 text-left focus:ring-1 focus:ring-brand-gold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold text-left">Price Unitaire / ثمن الوحدة</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="ex: 70"
                    value={editUnitPriceInput}
                    onChange={e => setEditUnitPriceInput(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 text-left focus:ring-1 focus:ring-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-left">
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Montant Brut Total / المبلغ الإجمالي (MAD)</label>
                  {editQuantityInput && editUnitPriceInput && (
                    <span className="text-[9px] text-emerald-600 font-bold font-mono">Auto: {((parseFloat(editQuantityInput) || 0) * (parseFloat(editUnitPriceInput) || 0)).toFixed(2)}</span>
                  )}
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder={editQuantityInput && editUnitPriceInput ? String((parseFloat(editQuantityInput) || 0) * (parseFloat(editUnitPriceInput) || 0)) : "ex: 700"}
                  value={editAmountInput}
                  onChange={e => setEditAmountInput(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2.5 font-bold text-stone-900 text-left focus:ring-1 focus:ring-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold text-left">N° Bon Livraison / رقم وصل التسليم</label>
                  <input
                    type="text"
                    placeholder="ex: BL-150-A"
                    value={editBonLivraison}
                    onChange={e => setEditBonLivraison(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 font-mono font-bold uppercase text-left focus:ring-1 focus:ring-brand-gold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold text-left">Notes / المورد والملاحظات</label>
                  <input
                    type="text"
                    placeholder="Optionnel..."
                    value={editRemarks}
                    onChange={e => setEditRemarks(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-250 rounded-lg p-2 text-stone-900 text-left focus:ring-1 focus:ring-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-stone-150 select-none">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg font-bold transition text-[11px]"
                >
                  إلغاء (Annuler)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-brown hover:bg-stone-950 text-brand-gold hover:text-white rounded-lg font-bold transition text-[11px] flex items-center gap-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  حفظ التعديلات (Enregistrer)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
