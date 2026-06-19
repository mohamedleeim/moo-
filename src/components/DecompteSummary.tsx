import React, { useState, useRef } from "react";
import { WorkItem, MeasurementLine, ProjectDetails, GeneratedDecompte, GeneratedDecompteItem } from "../types";
import { 
  FileSpreadsheet, 
  Coins, 
  Sparkles, 
  Printer, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Plus,
  ArrowUpRight,
  Info,
  History,
  GitCompare,
  Eye,
  Trash2,
  Calendar,
  Save,
  Check,
  X,
  FileText,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion } from "motion/react";

interface DecompteSummaryProps {
  workItems: WorkItem[];
  setWorkItems: (items: WorkItem[]) => void;
  measurementLines: MeasurementLine[];
  projectDetails: ProjectDetails;
  calcItemTotalQuantity: (itemId: string) => number;
  triggerPrintTab: () => void;
  generatedDecomptes: GeneratedDecompte[];
  onSaveDecompte: (decompte: GeneratedDecompte) => void;
  onDeleteDecompte: (id: string) => void;
}

export default function DecompteSummary({
  workItems,
  setWorkItems,
  measurementLines,
  projectDetails,
  calcItemTotalQuantity,
  triggerPrintTab,
  generatedDecomptes,
  onSaveDecompte,
  onDeleteDecompte
}: DecompteSummaryProps) {
  // Financial parameters specific to intermediate payment statement calculations
  const [previousAcomptes, setPreviousAcomptes] = useState<number>(15000.00); // previous payments
  const [retenueGarantieRate, setRetenueGarantieRate] = useState<number>(5);     // warranty deduction rate (typically 5%)

  // Excel Upload states
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Sub-Tab for Saved monthly statements
  const [activeSubTab, setActiveSubTab] = useState<"live" | "history" | "compare">("live");

  // State for recording current statement
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDate, setSaveDate] = useState(new Date().toISOString().slice(0, 10));
  const [saveNotes, setSaveNotes] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // State for single-history record viewer
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // States for comparisons
  const [compareLeftId, setCompareLeftId] = useState<string>("live");
  const [compareRightId, setCompareRightId] = useState<string>(
    generatedDecomptes.length > 0 ? generatedDecomptes[0].id : ""
  );

  // Auto-fill comparison dropdown when list changes
  React.useEffect(() => {
    if (generatedDecomptes.length > 0 && !compareRightId) {
      setCompareRightId(generatedDecomptes[0].id);
    }
  }, [generatedDecomptes, compareRightId]);

  // Helper: Guess work categories based on keywords in imported descriptions
  const guessCategoryByKeywords = (desc: string, code: string): string => {
    const text = (desc + " " + code).toLowerCase();
    if (text.includes("fouille") || text.includes("demol") || text.includes("terrassem") || text.includes("blindage") || text.includes("deblai") || text.includes("remblai")) {
      return "01 - Terrassements & Démolitions";
    }
    if (text.includes("beton") || text.includes("ba") || text.includes("arm") || text.includes("longrine") || text.includes("chaînage") || text.includes("brique") || text.includes("fondation")) {
      return "02 - Gros Œuvre & Structure";
    }
    if (text.includes("zellig") || text.includes("carrea") || text.includes("revet") || text.includes("bejmat") || text.includes("marbre") || text.includes("chape")) {
      return "03 - Revêtements & Zelliges";
    }
    if (text.includes("enduit") || text.includes("tadelakt") || text.includes("chaux") || text.includes("peint")) {
      return "04 - Enduits de Restauration";
    }
    if (text.includes("cedre") || text.includes("bois") || text.includes("garde-corps") || text.includes("fer") || text.includes("sculpt") || text.includes("porte")) {
      return "05 - Équipement & Ouvrages Bois";
    }
    return "Autres";
  };

  // Excel File uploader handler
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: "info", message: "Lecture et traitement du fichier Excel..." });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to array of rows
        const rawJson = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rawJson.length === 0) {
          throw new Error("Le document Excel semble vide.");
        }

        // Detect columns indices from headers
        let headerRowIdx = -1;
        let colCodeIdx = 0;
        let colDescIdx = 1;
        let colUnitIdx = 2;
        let colQteIdx = 3;
        let colPriceIdx = 4;

        // Scan first 12 rows for headings
        for (let idx = 0; idx < Math.min(rawJson.length, 12); idx++) {
          const row = rawJson[idx];
          if (!Array.isArray(row)) continue;
          const textLine = row.map(cell => String(cell).toLowerCase()).join(" ");
          
          const hasCode = textLine.includes("code") || textLine.includes("n°") || textLine.includes("prix") || textLine.includes("art");
          const hasDesc = textLine.includes("designa") || textLine.includes("trav") || textLine.includes("desc") || textLine.includes("ouvrage") || textLine.includes("libelle");
          const hasPrice = textLine.includes("unit") || textLine.includes("p.u") || textLine.includes("pu") || textLine.includes("tarif") || textLine.includes("prix");

          if (hasCode && hasDesc && hasPrice) {
            headerRowIdx = idx;
            row.forEach((cell, cellIdx) => {
              const cellStr = String(cell).toLowerCase();
              if (cellStr.includes("code") || cellStr.includes("n°") || cellStr.includes("art") || (cellStr.includes("num") && !cellStr.includes("prix"))) {
                colCodeIdx = cellIdx;
              } else if (cellStr.includes("design") || cellStr.includes("trav") || cellStr.includes("desc") || cellStr.includes("lib")) {
                colDescIdx = cellIdx;
              } else if (cellStr.includes("unit") && !cellStr.includes("prix") && !cellStr.includes("p.u")) {
                colUnitIdx = cellIdx;
              } else if (cellStr.includes("qte") || cellStr.includes("quant") || cellStr.includes("vol") || cellStr.includes("convenu")) {
                colQteIdx = cellIdx;
              } else if (cellStr.includes("prix") || cellStr.includes("p.u") || cellStr.includes("pu") || cellStr.includes("unitaire") || cellStr.includes("tarif")) {
                colPriceIdx = cellIdx;
              }
            });
            break;
          }
        }

        const dataStartIdx = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
        const parsedItems: WorkItem[] = [];

        for (let i = dataStartIdx; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          const rawCode = row[colCodeIdx];
          const rawDesc = row[colDescIdx];
          if (!rawCode || String(rawCode).trim() === "" || !rawDesc || String(rawDesc).trim() === "") continue;

          const codeStr = String(rawCode).trim();
          const descStr = String(rawDesc).trim();
          const unitStr = row[colUnitIdx] ? String(row[colUnitIdx]).trim().toLowerCase() : "U";

          // Safely parse numbers
          const rawQteVal = row[colQteIdx];
          const rawPriceVal = row[colPriceIdx];

          const conQty = rawQteVal !== undefined && rawQteVal !== null 
            ? parseFloat(String(rawQteVal).replace(/[^0-9.-]/g, "")) || 0 
            : 10.0; // Default fallback if absent
            
          const uPrice = rawPriceVal !== undefined && rawPriceVal !== null 
            ? parseFloat(String(rawPriceVal).replace(/[^0-9.-]/g, "")) || 0 
            : 0.0;

          // Normalize human units
          let formattedUnit = "U";
          if (unitStr.includes("m3") || unitStr.includes("³")) formattedUnit = "m³";
          else if (unitStr.includes("m2") || unitStr.includes("²")) formattedUnit = "m²";
          else if (unitStr.includes("ml") || unitStr.includes("l")) formattedUnit = "ml";
          else if (unitStr.includes("fft") || unitStr.includes("f")) formattedUnit = "fft";
          else if (unitStr.includes("kg")) formattedUnit = "kg";

          // Reuse existing stable IDs if available to preserve current measurements bindings
          const existingItem = workItems.find(item => item.code === codeStr);
          const uuid = existingItem ? existingItem.id : "item-" + Date.now() + "-" + i;

          parsedItems.push({
            id: uuid,
            code: codeStr,
            category: existingItem ? existingItem.category : guessCategoryByKeywords(descStr, codeStr),
            description: descStr,
            unit: formattedUnit,
            contractQuantity: conQty > 0 ? conQty : 1.0,
            unitPrice: uPrice >= 0 ? uPrice : 0,
          });
        }

        if (parsedItems.length === 0) {
          throw new Error("Aucune ligne d'article valide n'a pu être extraite. Vérifiez le format des colonnes.");
        }

        // Overwrite/merge list
        setWorkItems(parsedItems);
        setImportStatus({
          type: "success",
          message: `Import réussi ! ${parsedItems.length} articles chargés avec succès et affectés au décompte.`
        });
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err: any) {
        setImportStatus({
          type: "error",
          message: `Erreur d'importation : ${err.message || "Vérifiez que le fichier correspond aux colonnes types."}`
        });
      }
    };

    reader.onerror = () => {
      setImportStatus({ type: "error", message: "Échec de lecture physique du fichier." });
    };

    reader.readAsBinaryString(file);
  };

  // Generate and Download Reference Excel Template for users to fill out
  const downloadBPUReferenceTemplate = () => {
    const defaultData = [
      {
        "N° Prix": "1.1",
        "Désignation des Travaux": "Fouille en excavation terrassée pour fondation de l'appui d'escaliers.",
        "Unité": "m³",
        "Quantité de Marché": 12.5,
        "Prix de Marché (MAD)": 140.00
      },
      {
        "N° Prix": "1.2",
        "Désignation des Travaux": "Démolition sélective des enduits et maçonneries anciennes fissurées.",
        "Unité": "m³",
        "Quantité de Marché": 5.0,
        "Prix de Marché (MAD)": 200.00
      },
      {
        "N° Prix": "2.1",
        "Désignation des Travaux": "Béton armé dosé pour les dalles d'escaliers et chaînages de soutien.",
        "Unité": "m³",
        "Quantité de Marché": 8.0,
        "Prix de Marché (MAD)": 1600.00
      },
      {
        "N° Prix": "3.1",
        "Désignation des Travaux": "Revêtement en Bejmat de Marrakech cuit au sable fin de l'Oued Tensift.",
        "Unité": "m²",
        "Quantité de Marché": 30.0,
        "Prix de Marché (MAD)": 390.00
      }
    ];

    const ws = XLSX.utils.json_to_sheet(defaultData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modèle de Bordereau");
    
    // Set explicit columns widths
    ws["!cols"] = [
      { wch: 12 }, // Code
      { wch: 60 }, // Desc
      { wch: 10 }, // Unit
      { wch: 22 }, // Contract Qty
      { wch: 22 }  // Market Price
    ];

    XLSX.writeFile(wb, "Modele_Bordereau_Prix-Marché.xlsx");
  };

  // Calculations: Group items, fetch attachment quantity, multiply with market price
  const activeItemsWithCosts = workItems.map((item) => {
    const executedQty = calcItemTotalQuantity(item.id);
    const contractQty = item.contractQuantity || 0;
    const itemTotalCostHT = executedQty * item.unitPrice; // auto calculation quantity from attachment * unit price
    const progressProgress = contractQty > 0 ? (executedQty / contractQty) * 100 : 0;

    return {
      ...item,
      executedQty,
      contractQty,
      itemTotalCostHT,
      progressProgress
    };
  });

  const totalHT = activeItemsWithCosts.reduce((acc, curr) => acc + curr.itemTotalCostHT, 0);
  const tvaAmount = (totalHT * projectDetails.tvaRate) / 100;
  const totalTTC = totalHT + tvaAmount;

  // Final statement balance rules (Morocco public frameworks: deducts 5% security guarantee and previous bills)
  const warrantyAmount = (totalTTC * retenueGarantieRate) / 100;
  const netBeforePrevs = totalTTC - warrantyAmount;
  const netToPayTTC = netBeforePrevs - previousAcomptes;

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v);
  };

  // Click to trigger "Figer & Sauvegarder"
  const startRecordingDecompte = () => {
    setSaveName(`Situation N° ${generatedDecomptes.length + 1}`);
    setSaveDate(new Date().toISOString().slice(0, 10));
    setSaveNotes("");
    setIsSaving(true);
  };

  // Save implementation
  const handleConfirmSave = () => {
    const finalName = saveName.trim() || `Situation N° ${generatedDecomptes.length + 1}`;
    
    // Snapshot work items with computed values
    const snapItems: GeneratedDecompteItem[] = activeItemsWithCosts.map(item => ({
      id: item.id,
      code: item.code,
      category: item.category,
      description: item.description,
      unit: item.unit,
      unitPrice: item.unitPrice,
      contractQuantity: item.contractQty,
      executedQty: item.executedQty,
      itemTotalCostHT: item.itemTotalCostHT
    }));

    const snapshot: GeneratedDecompte = {
      id: "dec-" + Date.now(),
      name: finalName,
      date: saveDate,
      previousAcomptes,
      retenueGarantieRate,
      workItems: snapItems,
      totalHT,
      tvaAmount,
      totalTTC,
      warrantyAmount,
      netBeforePrevs,
      netToPayTTC,
      notes: saveNotes.trim() || undefined
    };

    onSaveDecompte(snapshot);
    setIsSaving(false);
    
    // Show success banner
    setSaveSuccessMessage(`La situation "${finalName}" a bien été enregistrée dans l'historique de ce chantier.`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 5000);
  };

  // Helper inside comparison to resolve Left and Right datasets
  const getCompareObject = (id: string) => {
    if (id === "live") {
      return {
        name: "Situation Actuelle (En cours)",
        date: new Date().toLocaleDateString("fr-FR"),
        previousAcomptes,
        retenueGarantieRate,
        totalHT,
        tvaAmount,
        totalTTC,
        warrantyAmount,
        netBeforePrevs,
        netToPayTTC,
        workItems: activeItemsWithCosts.map(item => ({
          id: item.id,
          code: item.code,
          category: item.category,
          description: item.description,
          unit: item.unit,
          unitPrice: item.unitPrice,
          contractQuantity: item.contractQty,
          executedQty: item.executedQty,
          itemTotalCostHT: item.itemTotalCostHT
        }))
      };
    }
    return generatedDecomptes.find(d => d.id === id);
  };

  const compA = getCompareObject(compareLeftId);
  const compB = getCompareObject(compareRightId);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Sub-tab navigation to toggle between Live Statement and Saved History */}
      <div className="no-print bg-white p-1 rounded-xl shadow-xs border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-full">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <button
            id="tab-live-decompte"
            onClick={() => { setActiveSubTab("live"); setSelectedHistoryId(null); }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              activeSubTab === "live"
                ? "bg-brand-brown text-brand-gold shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Situation en cours
          </button>
          
          <button
            id="tab-history-decompte"
            onClick={() => setActiveSubTab("history")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition relative ${
              activeSubTab === "history"
                ? "bg-brand-brown text-brand-gold shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <History className="h-4 w-4" />
            Historique ({generatedDecomptes.length})
            {generatedDecomptes.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {generatedDecomptes.length}
              </span>
            )}
          </button>

          <button
            id="tab-compare-decompte"
            onClick={() => setActiveSubTab("compare")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              activeSubTab === "compare"
                ? "bg-brand-brown text-brand-gold shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <GitCompare className="h-4 w-4" />
            Comparateur
          </button>
        </div>

        <div className="text-[11px] font-mono font-semibold text-stone-400 px-3 select-none">
          MARCHÉ : {projectDetails.contractNumber || "Non défini"}
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl p-4 flex items-start gap-3 text-xs animate-fadeIn shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-900">Enregistrement Réussi</p>
            <p className="font-semibold text-[11px] mt-0.5">{saveSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* RENDER VIEW ACCORDING TO SELECTED SUB-TAB */}
      {activeSubTab === "live" && (
        <>
          {/* Introduction note & Excel Bordereau Upload Area */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between justify-between">
              <div className="space-y-1">
                <h3 className="font-sans font-black text-xs text-brand-brown uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-brand-gold" /> Décompte Détaillé Général
                </h3>
                <p className="text-stone-600 font-light text-xs max-w-2xl select-none leading-relaxed">
                  Valorise automatiquement la <strong>Quantité d'Attachement</strong> calculée de chaque article par son <strong>Prix de Marché</strong>. Les prix d'estimation et quantités initiales prévues peuvent être importés à tout moment en téléchargeant votre fichier Bordereau ou en utilisant le modèle ci-dessous.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadBPUReferenceTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-250 bg-white hover:bg-stone-100 px-3.5 py-1.8 text-xs font-black text-stone-700 transition"
                  title="Télécharger le squelette Excel par défaut"
                >
                  <Download className="h-4 w-4 text-stone-500" /> Modèle Excel.xlsx
                </button>

                <button
                  onClick={triggerPrintTab}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-250 bg-white hover:bg-stone-100 px-3.5 py-1.8 text-xs font-black text-stone-700 transition"
                >
                  <Printer className="h-4 w-4 text-stone-500" /> Version Imprimable (PDF)
                </button>
              </div>
            </div>

            {/* File drop zone & Status notification */}
            <div className="border border-dashed border-stone-300 rounded-xl bg-white p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between transition-all hover:border-brand-gold/60 border-stone-250">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/[0.08] text-brand-brown flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-850 block">Charger le Bordereau de Prix (BPU)</span>
                  <span className="text-[10px] text-stone-500 font-medium block">Glissez ou sélectionnez un fichier formaté Excel (.xlsx, .xls)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  ref={fileInputRef}
                  onChange={handleExcelUpload}
                  className="hidden" 
                  id="excel-file-uploader"
                />
                <label 
                  htmlFor="excel-file-uploader"
                  className="px-4 py-2 bg-brand-brown hover:bg-stone-850 text-brand-gold text-xs font-black uppercase rounded-lg cursor-pointer transition flex items-center gap-1 leading-none shadow-xs"
                >
                  Parcourir mon PC
                </label>
              </div>
            </div>

            {/* Notifications of Excel imports */}
            {importStatus && (
              <div className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs select-none ${
                importStatus.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : importStatus.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}>
                {importStatus.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                ) : importStatus.type === "error" ? (
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" />
                ) : (
                  <RefreshCw className="h-4 w-4 mt-0.5 text-blue-600 animate-spin shrink-0" />
                )}
                <div className="space-y-0.5">
                  <span className="font-bold uppercase tracking-wider block text-[10px]">Information Système</span>
                  <p className="font-medium text-[11px] leading-relaxed">{importStatus.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Quantitative & Financial Statement Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full border-collapse text-left text-xs text-stone-600">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-55/60 text-[10px] font-bold uppercase tracking-wider text-stone-500 select-none">
                  <th className="px-5 py-3.5 w-16">Prix N°</th>
                  <th className="px-5 py-3.5">Désignation de l'Ouvrage (Bordereau)</th>
                  <th className="px-5 py-3.5 w-16 text-center">Unité</th>
                  <th className="px-5 py-3.5 w-28 text-right bg-stone-50/50">P.U Marché (MAD)</th>
                  <th className="px-5 py-3.5 w-28 text-right">Qte Convenu (Marché)</th>
                  <th className="px-5 py-3.5 w-28 text-right text-emerald-900 font-extrabold bg-emerald-50/[0.1]">Qte Exécutée (Attachement)</th>
                  <th className="px-5 py-3.5 w-24 text-center">Écart %</th>
                  <th className="px-5 py-3.5 w-32 text-right bg-stone-50/50 font-black text-stone-800 font-sans">Montant HT (MAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 font-mono">
                {activeItemsWithCosts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-stone-400 font-light font-sans">
                      Aucun article disponible pour le décompte. Importez un bordereau ou créez des articles dans l'onglet "Attachements".
                    </td>
                  </tr>
                ) : (
                  activeItemsWithCosts.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-extrabold text-stone-900 text-left">{item.code}</td>
                      <td className="px-5 py-3.5 font-sans font-medium text-stone-700 text-xs leading-relaxed">{item.description}</td>
                      <td className="px-5 py-3.5 text-center text-stone-500 font-extrabold">{item.unit}</td>
                      
                      {/* Market Unit Price from Bordereau */}
                      <td className="px-5 py-3.5 text-right text-stone-850 font-bold bg-stone-50/30 text-xs">
                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(item.unitPrice)}
                      </td>

                      {/* Agreed/Contracted quantity from Bordereau */}
                      <td className="px-5 py-3.5 text-right text-stone-600 font-medium text-xs">
                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(item.contractQty)}
                      </td>

                      {/* Executed quantity fetched automatically from attachment measurements */}
                      <td className="px-5 py-3.5 text-right text-emerald-800 font-black bg-emerald-50/[0.15] text-xs">
                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(item.executedQty)}
                      </td>

                      {/* Executed vs Agreed ratio percentage */}
                      <td className="px-5 py-3.5 text-center font-sans">
                        <span className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[10px] font-bold ${
                          item.progressProgress > 100 
                            ? 'bg-amber-100 text-amber-800 font-extrabold'
                            : item.progressProgress === 100
                            ? 'bg-emerald-100 text-emerald-850'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {item.progressProgress.toFixed(1)}%
                        </span>
                      </td>

                      {/* Auto calculated total amount = qty from attachment * unitPrice */}
                      <td className="px-5 py-3.5 text-right font-extrabold text-stone-950 text-xs bg-stone-50/30">
                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(item.itemTotalCostHT)}
                      </td>
                    </tr>
                  ))
                )}

                {activeItemsWithCosts.length > 0 && (
                  <>
                    {/* Calculations Summary Blocks */}
                    <tr className="bg-stone-50/70 font-sans text-xs">
                      <td colSpan={7} className="px-5 py-3 text-right font-bold text-stone-500 uppercase tracking-wider">
                        Total Ouvrages Cumulé Hors Taxes (HT) :
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-black text-stone-950 text-[13px] border-l border-stone-200">
                        {formatCurrency(totalHT)}
                      </td>
                    </tr>
                    <tr className="bg-stone-50/70 font-sans text-xs">
                      <td colSpan={7} className="px-5 py-3 text-right font-bold text-stone-500 uppercase tracking-wider">
                        TVA Légale applicable de {projectDetails.tvaRate}% :
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-stone-700 text-xs border-l border-stone-200">
                        {formatCurrency(tvaAmount)}
                      </td>
                    </tr>
                    <tr className="bg-stone-100/70 font-sans text-xs border-t border-stone-250 animate-fadeIn">
                      <td colSpan={7} className="px-5 py-3.5 text-right font-black text-brand-brown uppercase tracking-wider text-xs">
                        Total Général Toutes Taxes Comprises (TTC) :
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-black text-brand-brown text-sm border-l border-stone-200">
                        {formatCurrency(totalTTC)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Advance Payments & Warranty deductions */}
          {activeItemsWithCosts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Adjustment inputs details */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="font-sans font-black text-xs text-stone-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2 pb-2">
                  <Coins className="h-4.5 w-4.5 text-brand-gold animate-bounce" /> Proratas & Amortissements Réglementaires
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 select-none">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Situation Antérieure Cumulée (MAD TTC)</span>
                    <input
                      id="input-previous-acomptes"
                      type="number"
                      step="0.01"
                      value={previousAcomptes}
                      onChange={(e) => setPreviousAcomptes(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border border-stone-250 bg-white px-3 py-2 font-mono text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Retenue de Garantie (%)</span>
                    <input
                      id="input-retenue-garantie"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={retenueGarantieRate}
                      onChange={(e) => setRetenueGarantieRate(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border border-stone-250 bg-white px-3 py-2 font-mono text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>
                </div>

                <div className="bg-stone-50 rounded border border-stone-100 p-3 text-xs text-stone-650 space-y-2 font-sans select-none border-stone-200">
                  <div className="flex justify-between font-mono">
                    <span className="font-semibold text-stone-500 h-[14px]">Retenue retenue ({retenueGarantieRate}%) :</span>
                    <span className="font-extrabold text-stone-800">{formatCurrency(totalTTC * retenueGarantieRate / 100)}</span>
                  </div>
                  <div className="flex justify-between font-mono border-t border-stone-200/60 pt-1.5">
                    <span className="font-semibold text-stone-500 h-[14px]">Situation Exclue Garantie (TTC - G.) :</span>
                    <span className="font-extrabold text-stone-900">{formatCurrency(totalTTC - (totalTTC * retenueGarantieRate / 100))}</span>
                  </div>
                </div>
              </div>

              {/* Amount to be issued & Snapshots controls */}
              <div className="rounded-xl border border-brand-gold/25 bg-brand-clay/[0.05] p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2 select-none">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-black text-xs text-brand-brown uppercase tracking-wider">Montant Net à Payer de l'Acompte</h4>
                    <span className="inline-flex items-center gap-1 rounded bg-brand-gold/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase text-brand-brown tracking-wider">
                      <Sparkles className="h-3 w-3 animate-pulse" /> ACOMPTE COURANT
                    </span>
                  </div>
                  <p className="text-stone-600 font-light text-[11px] leading-relaxed">
                    Représente le montant net liquide calculé du palier d'exécution actuel dû à l'entrepreneur, déduit de la retenue réglementaire de garantie de <strong>{retenueGarantieRate}%</strong> réinvestie à la trésorerie et déduit des acomptes intermédiaires de règlement cumulés antérieurement (<strong>{formatCurrency(previousAcomptes)}</strong>).
                  </p>
                </div>

                <div className="border-t border-brand-gold/20 pt-4 font-mono">
                  <div className="flex items-end justify-between mb-4">
                    <span className="text-[11px] font-black text-stone-500 font-sans uppercase">NET À DIRE (MAD TTC) :</span>
                    <span className={`text-[21px] font-black font-mono leading-none ${netToPayTTC < 0 ? 'text-red-600' : 'text-brand-brown'}`}>
                      {formatCurrency(netToPayTTC)}
                    </span>
                  </div>

                  {/* SAVE DECOMPTE TO HISTORIC VIEWPORT TRIGGER */}
                  {!isSaving ? (
                    <button
                      id="btn-save-current-decompte"
                      onClick={startRecordingDecompte}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-brown hover:bg-stone-850 text-white hover:text-brand-gold text-xs font-black uppercase rounded-lg transition"
                    >
                      <Save className="h-4 w-4" />
                      Figer & Sauvegarder dans l'historique
                    </button>
                  ) : (
                    <div className="bg-white border border-stone-250 rounded-lg p-3 space-y-3 font-sans mt-2 animate-fadeIn shadow-xs p-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                        <span className="text-[10px] font-bold text-stone-700 uppercase">Paramètres de la Situation Historique</span>
                        <button onClick={() => setIsSaving(false)} className="text-stone-400 hover:text-stone-650">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-black text-stone-450 uppercase block mb-1">Nom ou Désignation</label>
                          <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            className="w-full text-xs border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400"
                            placeholder="Ex: Situation mensuelle N° 2"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-stone-450 uppercase block mb-1">Date d'Arrêt</label>
                          <input
                            type="date"
                            value={saveDate}
                            onChange={(e) => setSaveDate(e.target.value)}
                            className="w-full text-xs border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-stone-450 uppercase block mb-1">Notes / Observations</label>
                          <textarea
                            value={saveNotes}
                            onChange={(e) => setSaveNotes(e.target.value)}
                            rows={2}
                            maxLength={250}
                            className="w-full text-xs border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 font-sans"
                            placeholder="Observations, anomalies, météo (Facultatif)..."
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1.5">
                        <button
                          onClick={handleConfirmSave}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded transition"
                        >
                          <Check className="h-3.5 w-3.5" /> Enregistrer Situation
                        </button>
                        <button
                          onClick={() => setIsSaving(false)}
                          className="px-3 py-1.8 bg-stone-150 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-[10px] font-semibold uppercase rounded transition"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Quick guide helper */}
          <div className="rounded-xl border border-stone-150 bg-stone-50/50 p-4 shrink-0 flex items-start gap-3 select-none">
            <Info className="h-5 w-5 text-stone-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-500 leading-normal font-medium">
              <strong>Richesses d'automatisation des liens</strong> : Tout changement ou ajout de coefficient, longueur, largeur ou hauteur dans l'onglet principal <strong>Métré (المتر)</strong> sera recalculé en arrière-plan et affectera instantanément la <strong>Quantité Exécutée</strong> ainsi que le montant net facturé de ce décompte, éliminant les risques de saisies manuelles discordantes.
            </p>
          </div>
        </>
      )}

      {/* HISTORICAL REVIEWS GALLERY SUBTAB */}
      {activeSubTab === "history" && (
        <div className="space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 md:p-6 space-y-1">
            <h3 className="font-sans font-black text-xs text-brand-brown uppercase tracking-wider flex items-center gap-2">
              <History className="h-5 w-5 text-brand-gold animate-spin-slow" /> Historique des Situations Mensuelles Enregistrées
            </h3>
            <p className="text-stone-600 font-light text-xs max-w-2xl select-none leading-relaxed">
              Consultez l'historique figé des décomptes précédents pour ce chantier. Les décomptes ainsi archivés mémorisent fidèlement les attachements, acomptes, et calculs arrêtés au jour de l'enregistrement, assurant un journal de bord de facturation infalsifiable.
            </p>
          </div>

          {generatedDecomptes.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4 max-w-full">
              <History className="h-12 w-12 text-stone-300 mx-auto" />
              <div className="space-y-1">
                <span className="font-bold text-stone-850 block text-sm">Aucun décompte sauvegardé</span>
                <p className="text-stone-500 font-light text-xs max-w-md mx-auto">
                  Pour archiver un décompte, configurez vos attachements de travaux, rendez-vous sur l'onglet <strong>Situation en cours</strong> puis cliquez sur le bouton <strong>Figer & Sauvegarder dans l'historique</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main table list of histories */}
              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
                <table className="w-full border-collapse text-left text-xs text-stone-600">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-55/60 text-[10px] font-bold uppercase tracking-wider text-stone-500 select-none">
                      <th className="px-5 py-3.5">Nom de la situation</th>
                      <th className="px-5 py-3.5 w-28">Date d'Arrêt</th>
                      <th className="px-5 py-3.5 text-right w-28">Montant HT</th>
                      <th className="px-5 py-3.5 text-right w-28">Retenue de G.</th>
                      <th className="px-5 py-3.5 text-right w-28">Acomptes Préc.</th>
                      <th className="px-5 py-3.5 text-right w-32 font-black text-stone-800 bg-stone-50/20">Net à Payer (TTC)</th>
                      <th className="px-5 py-3.5 text-center w-28">Nb-Articles</th>
                      <th className="px-5 py-3.5 text-center w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 font-mono">
                    {generatedDecomptes.map((dec) => {
                      const isSelected = selectedHistoryId === dec.id;
                      return (
                        <tr key={dec.id} className={`hover:bg-stone-50/40 transition-colors ${isSelected ? "bg-amber-500/[0.04]" : ""}`}>
                          <td className="px-5 py-3.5 font-bold font-sans text-stone-900 border-l-2 border-transparent hover:border-brand-gold">
                            <span className="block truncate font-extrabold">{dec.name}</span>
                            {dec.notes && (
                              <span className="text-[10px] text-stone-450 font-normal font-sans line-clamp-1 block mt-0.5">{dec.notes}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-stone-500">{new Date(dec.date).toLocaleDateString("fr-FR")}</td>
                          <td className="px-5 py-3.5 text-right text-stone-850 font-semibold">{new Intl.NumberFormat("fr-MA").format(dec.totalHT)} MAD</td>
                          <td className="px-5 py-3.5 text-right text-stone-600 text-[11px]">{dec.retenueGarantieRate}%</td>
                          <td className="px-5 py-3.5 text-right text-stone-600">{new Intl.NumberFormat("fr-MA").format(dec.previousAcomptes)} MAD</td>
                          <td className="px-5 py-3.5 text-right text-brand-brown font-black bg-stone-50/[0.08]">
                            {formatCurrency(dec.netToPayTTC)}
                          </td>
                          <td className="px-5 py-3.5 text-center text-stone-500 text-[11.5px] font-sans h-[14px] font-semibold">{dec.workItems.length}</td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedHistoryId(isSelected ? null : dec.id)}
                                className={`p-1.5 rounded text-xs leading-none transition ${
                                  isSelected ? "bg-stone-200 text-stone-800" : "bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900"
                                }`}
                                title="Consulter les détails physiques figés"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setCompareLeftId("live");
                                  setCompareRightId(dec.id);
                                  setActiveSubTab("compare");
                                }}
                                className="p-1.5 rounded bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-brown hover:text-stone-950 transition"
                                title="Comparer à la situation en cours"
                              >
                                <GitCompare className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le décompte archivé "${dec.name}" ?`)) {
                                    onDeleteDecompte(dec.id);
                                    if (selectedHistoryId === dec.id) setSelectedHistoryId(null);
                                  }
                                }}
                                className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 transition"
                                title="Supprimer de l'historique"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* DETAILS PANEL FOR A SELECTED ARCHIVED RECORD */}
              {selectedHistoryId && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-stone-250 p-5 md:p-6 space-y-6 shadow-md"
                >
                  {(() => {
                    const matchedDec = generatedDecomptes.find(d => d.id === selectedHistoryId);
                    if (!matchedDec) return null;
                    return (
                      <>
                        {/* Detail layout Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-150 pb-4 select-none">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-brand-brown text-brand-gold text-[10px] font-black uppercase rounded tracking-wide font-mono">Archive Active</span>
                              <h4 className="font-sans font-black text-stone-900 text-base">{matchedDec.name}</h4>
                            </div>
                            <span className="text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-stone-400" /> Date d'arrêt compté au {new Date(matchedDec.date).toLocaleDateString("fr-FR")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedHistoryId(null)}
                              className="px-3.5 py-1.8 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-xs font-black uppercase rounded transition flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Fermer Fiche
                            </button>
                          </div>
                        </div>

                        {/* Financial summary blocks */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 select-none">
                          <div className="bg-stone-50 border border-stone-150 rounded-lg p-3.5 font-mono text-right border-stone-200">
                            <span className="text-[9px] font-bold text-stone-450 uppercase block text-left mb-1 font-sans leading-none">TOTAL HORS TAXES</span>
                            <span className="text-sm font-black text-stone-900">{new Intl.NumberFormat("fr-MA").format(matchedDec.totalHT)} MAD</span>
                          </div>
                          
                          <div className="bg-stone-50 border border-stone-150 rounded-lg p-3.5 font-mono text-right border-stone-200">
                            <span className="text-[9px] font-bold text-stone-450 uppercase block text-left mb-1 font-sans leading-none">TVA DU DOSSIER</span>
                            <span className="text-sm font-semibold text-stone-650">{new Intl.NumberFormat("fr-MA").format(matchedDec.tvaAmount)} MAD</span>
                          </div>

                          <div className="bg-stone-50 border border-stone-150 rounded-lg p-3.5 font-mono text-right border-stone-200">
                            <span className="text-[9px] font-bold text-stone-450 uppercase block text-left mb-1 font-sans leading-none">SITUATION TTC</span>
                            <span className="text-sm font-extrabold text-stone-900">{new Intl.NumberFormat("fr-MA").format(matchedDec.totalTTC)} MAD</span>
                          </div>

                          <div className="bg-stone-50 border border-stone-150 rounded-lg p-3.5 font-mono text-right border-stone-200">
                            <span className="text-[9px] font-bold text-stone-450 uppercase block text-left mb-1 font-sans leading-none">RETENUE GARANTIE ({matchedDec.retenueGarantieRate}%)</span>
                            <span className="text-sm font-semibold text-stone-650 text-red-700">-{new Intl.NumberFormat("fr-MA").format(matchedDec.warrantyAmount)} MAD</span>
                          </div>

                          <div className="col-span-2 lg:col-span-1 bg-brand-brown/[0.04] border border-brand-brown/20 rounded-lg p-3.5 font-mono text-right">
                            <span className="text-[9px] font-black text-brand-brown uppercase block text-left mb-1 font-sans leading-none">NET À PAYER COMPTABILISÉ</span>
                            <span className="text-sm font-black text-brand-brown">{formatCurrency(matchedDec.netToPayTTC)}</span>
                          </div>
                        </div>

                        {/* Optional notes */}
                        {matchedDec.notes && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 font-sans select-none border-stone-200">
                            <span className="font-extrabold block uppercase tracking-wider text-[9px] text-amber-950 mb-0.5">Observations / Journal de situation :</span>
                            <p className="font-medium text-stone-700 leading-relaxed italic">"{matchedDec.notes}"</p>
                          </div>
                        )}

                        {/* Snapshot WorkItems Table */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-stone-450 uppercase tracking-wider block select-none">Bordereau Devis Quantitatif Figé</span>
                          <div className="overflow-x-auto rounded-lg border border-stone-150 bg-white">
                            <table className="w-full border-collapse text-left text-xs text-stone-600">
                              <thead>
                                <tr className="border-b border-stone-150 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 select-none">
                                  <th className="px-4 py-2.5 w-16">N°</th>
                                  <th className="px-4 py-2.5">Ouvrage</th>
                                  <th className="px-4 py-2.5 w-16 text-center">Unité</th>
                                  <th className="px-4 py-2.5 w-24 text-right">P.U Marché</th>
                                  <th className="px-4 py-2.5 w-28 text-right text-emerald-900 font-bold">Qty Exécutée (Figée)</th>
                                  <th className="px-4 py-2.5 w-28 text-right bg-stone-50 text-stone-850 font-black">Montant HT</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-150 font-mono">
                                {matchedDec.workItems.map((item) => (
                                  <tr key={item.id} className="hover:bg-stone-50/20">
                                    <td className="px-4 py-2.5 font-extrabold text-stone-900">{item.code}</td>
                                    <td className="px-4 py-2.5 font-sans font-medium text-stone-700 text-xs truncate max-w-sm" title={item.description}>{item.description}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-500 font-black">{item.unit}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold text-stone-800">{new Intl.NumberFormat("fr-MA").format(item.unitPrice)}</td>
                                    <td className="px-4 py-2.5 text-right font-black text-emerald-800 bg-emerald-50/[0.08]">{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(item.executedQty)}</td>
                                    <td className="px-4 py-2.5 text-right font-bold text-stone-900 bg-stone-50/[0.1]">{new Intl.NumberFormat("fr-MA").format(item.itemTotalCostHT)} MAD</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMPARATIVE METRIC VIEWS SUBTAB */}
      {activeSubTab === "compare" && (
        <div className="space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 md:p-6 space-y-1">
            <h3 className="font-sans font-black text-xs text-brand-brown uppercase tracking-wider flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-brand-gold" /> Outil d'Analyse Comparative de l'Avancement
            </h3>
            <p className="text-stone-600 font-light text-xs max-w-2xl select-none leading-relaxed">
              Sélectionnez deux jalons ou décomptes différents sous le même chantier pour comparer l'état d'avancement des ouvrages, identifier les hausses d'attachements et évaluer la progression mensuelle globale du budget.
            </p>
          </div>

          {generatedDecomptes.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4 max-w-full">
              <GitCompare className="h-12 w-12 text-stone-300 mx-auto" />
              <div className="space-y-1">
                <span className="font-bold text-stone-850 block text-sm">Action Impossible</span>
                <p className="text-stone-500 font-light text-xs max-w-md mx-auto">
                  Vous devez enregistrer au moins une situation mensuelle dans l'historique du chantier pour pouvoir utiliser le comparateur. Une situation en cours (Live) peut ensuite être comparée à cette archive historique.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Select dropdown fields to pair comparing situations */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 select-none">
                <div className="w-full md:flex-1 space-y-1">
                  <label htmlFor="select-compare-left" className="text-[9px] font-black text-stone-450 uppercase block">Situation de référence A</label>
                  <select
                    id="select-compare-left"
                    value={compareLeftId}
                    onChange={(e) => setCompareLeftId(e.target.value)}
                    className="w-full rounded-md border border-stone-250 bg-white px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value="live">Situation Actuelle (Live en cours)</option>
                    {generatedDecomptes.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({new Date(d.date).toLocaleDateString("fr-FR")})</option>
                    ))}
                  </select>
                </div>

                <div className="text-stone-350 font-sans text-sm font-semibold select-none hidden md:block mt-[12px]">➔</div>

                <div className="w-full md:flex-1 space-y-1">
                  <label htmlFor="select-compare-right" className="text-[9px] font-black text-stone-450 uppercase block">Situation de comparaison B</label>
                  <select
                    id="select-compare-right"
                    value={compareRightId}
                    onChange={(e) => setCompareRightId(e.target.value)}
                    className="w-full rounded-md border border-stone-250 bg-white px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    {generatedDecomptes.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({new Date(d.date).toLocaleDateString("fr-FR")})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RENDER COMPARISON ENGINE DATA */}
              {compA && compB ? (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Financial synthetic table comparing indicators */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-stone-450 uppercase tracking-widest block select-none">1. Synthèse Générale Budgétaire Comparative</span>
                    
                    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
                      <table className="w-full border-collapse text-left text-xs text-stone-600">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 select-none">
                            <th className="px-5 py-3">Indicateur Financier</th>
                            <th className="px-5 py-3 text-right bg-stone-100/10 font-bold">{compA.name} [A]</th>
                            <th className="px-5 py-3 text-right bg-stone-100/20 font-bold">{compB.name} [B]</th>
                            <th className="px-5 py-3 text-right font-black">Écart Nominal (B - A)</th>
                            <th className="px-5 py-3 text-center">Tendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-150 font-mono text-xs select-none">
                          {/* HT line */}
                          <tr>
                            <td className="px-5 py-3 font-semibold text-stone-850 font-sans">Total Cumulé Travaux Hors Taxes (HT)</td>
                            <td className="px-5 py-3 text-right text-stone-700">{new Intl.NumberFormat("fr-MA").format(compA.totalHT)} MAD</td>
                            <td className="px-5 py-3 text-right text-stone-900 font-extrabold">{new Intl.NumberFormat("fr-MA").format(compB.totalHT)} MAD</td>
                            {(() => {
                              const diff = compB.totalHT - compA.totalHT;
                              return (
                                <>
                                  <td className={`px-5 py-3 text-right font-black ${diff > 0 ? "text-emerald-700" : diff < 0 ? "text-rose-700" : "text-stone-500"}`}>
                                    {diff > 0 ? "+" : ""}{new Intl.NumberFormat("fr-MA").format(diff)} MAD
                                  </td>
                                  <td className="px-5 py-3 text-center font-sans font-bold">
                                    {diff > 0 ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-extrabold">
                                        <TrendingUp className="h-3 w-3" /> Progression
                                      </span>
                                    ) : diff < 0 ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-extrabold">
                                        <TrendingDown className="h-3 w-3" /> Baisse
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-stone-400 font-normal">Identique</span>
                                    )}
                                  </td>
                                </>
                              );
                            })()}
                          </tr>

                          {/* TTC line */}
                          <tr>
                            <td className="px-5 py-3 font-semibold text-stone-850 font-sans">Avenant TTC Général</td>
                            <td className="px-5 py-3 text-right text-stone-700">{new Intl.NumberFormat("fr-MA").format(compA.totalTTC)} MAD</td>
                            <td className="px-5 py-3 text-right text-stone-905 font-bold">{new Intl.NumberFormat("fr-MA").format(compB.totalTTC)} MAD</td>
                            {(() => {
                              const diff = compB.totalTTC - compA.totalTTC;
                              return (
                                <>
                                  <td className={`px-5 py-3 text-right font-black ${diff > 0 ? "text-emerald-700" : diff < 0 ? "text-rose-700" : "text-stone-500"}`}>
                                    {diff > 0 ? "+" : ""}{new Intl.NumberFormat("fr-MA").format(diff)} MAD
                                  </td>
                                  <td className="px-5 py-3 text-center font-sans font-bold">
                                    {diff > 0 ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                                        +{((diff / (compA.totalTTC || 1)) * 100).toFixed(1)}%
                                      </span>
                                    ) : diff < 0 ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold">
                                        {((diff / (compA.totalTTC || 1)) * 100).toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-stone-400 font-normal">0%</span>
                                    )}
                                  </td>
                                </>
                              );
                            })()}
                          </tr>

                          {/* Garantie line */}
                          <tr>
                            <td className="px-5 py-3 font-medium text-stone-500 font-sans">Retenue de Garantie ({compB.retenueGarantieRate}%)</td>
                            <td className="px-5 py-3 text-right text-stone-500">-{new Intl.NumberFormat("fr-MA").format(compA.warrantyAmount)} MAD</td>
                            <td className="px-5 py-3 text-right text-stone-600">-{new Intl.NumberFormat("fr-MA").format(compB.warrantyAmount)} MAD</td>
                            {(() => {
                              const diff = compB.warrantyAmount - compA.warrantyAmount;
                              return (
                                <>
                                  <td className={`px-5 py-3 text-right font-bold ${diff > 0 ? "text-red-600" : diff < 0 ? "text-emerald-700" : "text-stone-500"}`}>
                                    {diff > 0 ? "+" : ""}{new Intl.NumberFormat("fr-MA").format(diff)} MAD
                                  </td>
                                  <td className="px-4 py-3 text-center text-stone-400 font-sans text-[10px]">Garantie Diff</td>
                                </>
                              );
                            })()}
                          </tr>

                          {/* Net a payer line */}
                          <tr className="bg-brand-brown/[0.03] border-t border-brand-brown/10">
                            <td className="px-5 py-3.5 font-bold text-brand-brown font-sans uppercase">Acompte Net Liquide à Payer (TTC - G - AC)</td>
                            <td className="px-5 py-3.5 text-right font-bold text-stone-700">{new Intl.NumberFormat("fr-MA").format(compA.netToPayTTC)} MAD</td>
                            <td className="px-5 py-3.5 text-right font-black text-brand-brown text-[13px]">{new Intl.NumberFormat("fr-MA").format(compB.netToPayTTC)} MAD</td>
                            {(() => {
                              const diff = compB.netToPayTTC - compA.netToPayTTC;
                              return (
                                <>
                                  <td className={`px-5 py-3.5 text-right font-black text-xs ${diff > 0 ? "text-emerald-800 bg-emerald-500/[0.02]" : diff < 0 ? "text-rose-800" : "text-stone-500"}`}>
                                    {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                                  </td>
                                  <td className="px-5 py-3.5 text-center font-sans font-black flex items-center justify-center pt-4">
                                    {diff > 0 ? (
                                      <span className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[9px] bg-emerald-600 text-white font-extrabold uppercase tracking-wide">
                                        SOLDE +
                                      </span>
                                    ) : diff < 0 ? (
                                      <span className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[9px] bg-red-600 text-white font-extrabold uppercase tracking-wide">
                                        SOLDE -
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-stone-400 font-normal">0.00</span>
                                    )}
                                  </td>
                                </>
                              );
                            })()}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Itemized Comparative Table */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-stone-450 uppercase tracking-widest block select-none">2. Comparatif Détaillé Article par Article (Ouvrages)</span>
                    
                    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                      <table className="w-full border-collapse text-left text-xs text-stone-600">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50/80 text-[10px] font-bold uppercase tracking-wider text-stone-500 select-none">
                            <th className="px-4 py-3 w-16">Prix N°</th>
                            <th className="px-4 py-3">Désignation</th>
                            <th className="px-4 py-3 w-16 text-center">Unité</th>
                            <th className="px-4 py-3 w-20 text-right">P.U (MAD)</th>
                            <th className="px-4 py-3 text-right bg-stone-50 w-28">Qte [A]</th>
                            <th className="px-4 py-3 text-right bg-stone-100/20 w-28 text-stone-900 font-extrabold">Qte [B]</th>
                            <th className="px-4 py-3 text-right w-24 font-bold text-stone-800">Écart Qte</th>
                            <th className="px-4 py-3 text-right w-28 bg-stone-50">HT [A]</th>
                            <th className="px-4 py-3 text-right bg-stone-100/20 w-28 text-stone-900 font-bold">HT [B]</th>
                            <th className="px-4 py-3 text-right w-32 font-black text-stone-950">Diff HT (MAD)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-150 font-mono">
                          {/* Map all unique items from compA and compB union */}
                          {(() => {
                            // build union of codes
                            const codesUnion = Array.from(new Set([
                              ...compA.workItems.map(x => x.code),
                              ...compB.workItems.map(x => x.code)
                            ])).sort((a, b) => {
                              // basic natural sort for hierarchy codes e.g. "1.1", "2.1"
                              return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
                            });

                            return codesUnion.map((code) => {
                              const itemA = compA.workItems.find(x => x.code === code);
                              const itemB = compB.workItems.find(x => x.code === code);

                              // Resolve properties
                              const descStr = itemB?.description || itemA?.description || "Inconnu";
                              const unitStr = itemB?.unit || itemA?.unit || "U";
                              const uPrice = itemB?.unitPrice ?? itemA?.unitPrice ?? 0;

                              const qA = itemA?.executedQty ?? 0;
                              const qB = itemB?.executedQty ?? 0;
                              const qDiff = qB - qA;

                              const costA = itemA?.itemTotalCostHT ?? 0;
                              const costB = itemB?.itemTotalCostHT ?? 0;
                              const costDiff = costB - costA;

                              return (
                                <tr key={code} className="hover:bg-stone-50/20 font-mono">
                                  <td className="px-4 py-2.5 font-extrabold text-stone-900">{code}</td>
                                  <td className="px-4 py-2.5 font-sans font-medium text-stone-700 text-xs truncate max-w-[200px]" title={descStr}>
                                    {descStr}
                                  </td>
                                  <td className="px-4 py-2.5 text-center text-stone-500 font-bold">{unitStr}</td>
                                  <td className="px-4 py-2.5 text-right text-stone-700">{new Intl.NumberFormat("fr-MA").format(uPrice)}</td>
                                  
                                  <td className="px-4 py-2.5 text-right bg-stone-50 text-stone-605">{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(qA)}</td>
                                  <td className="px-4 py-2.5 text-right bg-stone-100/10 text-stone-900 font-extrabold">{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(qB)}</td>
                                  
                                  <td className={`px-4 py-2.5 text-right font-black text-xs ${qDiff > 0 ? "text-emerald-700" : qDiff < 0 ? "text-rose-700" : "text-stone-400"}`}>
                                    {qDiff > 0 ? "+" : ""}{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 3 }).format(qDiff)}
                                  </td>

                                  <td className="px-4 py-2.5 text-right bg-stone-50 text-stone-600">{new Intl.NumberFormat("fr-MA").format(costA)}</td>
                                  <td className="px-4 py-2.5 text-right bg-stone-100/10 text-stone-900 font-bold">{new Intl.NumberFormat("fr-MA").format(costB)}</td>
                                  
                                  <td className={`px-4 py-2.5 text-right font-black ${costDiff > 0 ? "text-emerald-800 bg-emerald-500/[0.02]" : costDiff < 0 ? "text-rose-800" : "text-stone-400"}`}>
                                    {costDiff > 0 ? "+" : ""}{new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(costDiff)}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center italic text-stone-450 text-xs select-none">
                  Veuillez spécifier des situations valides à comparer de part et d'autre.
                </div>
              )}

            </div>
          )}
        </div>
      )}

    </div>
  );
}
