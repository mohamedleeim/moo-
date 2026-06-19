import React from "react";
import { WorkItem, MeasurementLine, ProjectDetails } from "../types";
import { Printer, ArrowLeft, Percent, Compass, MapPin } from "lucide-react";

interface RapportPrintProps {
  workItems: WorkItem[];
  measurementLines: MeasurementLine[];
  projectDetails: ProjectDetails;
  calcItemTotalQuantity: (itemId: string) => number;
  onBack: () => void;
}

export default function RapportPrint({
  workItems,
  measurementLines,
  projectDetails,
  calcItemTotalQuantity,
  onBack
}: RapportPrintProps) {
  
  // Calculate price escalation coefficient K
  const K = projectDetails.fixedPart + projectDetails.revisedPart * (projectDetails.revisionIndexValue / projectDetails.baseIndexValue);
  
  let totalBaseHT = 0;
  let totalRevisedHT = 0;
  
  const itemsBreakdown = workItems.map((item) => {
    const executedQty = calcItemTotalQuantity(item.id);
    const contractQty = item.contractQuantity || 0;
    const progress = contractQty > 0 ? (executedQty / contractQty) * 105 : 0; // standard index percentage
    const baseHT = executedQty * item.unitPrice;
    const revisedPrice = item.unitPrice * K;
    const revisedHT = executedQty * revisedPrice;

    return {
      ...item,
      executedQty,
      contractQty,
      progress: contractQty > 0 ? (executedQty / contractQty) * 100 : 0,
      baseHT,
      revisedPrice,
      revisedHT
    };
  });
  
  totalBaseHT = itemsBreakdown.reduce((acc, curr) => acc + curr.baseHT, 0);
  totalRevisedHT = itemsBreakdown.reduce((acc, curr) => acc + curr.revisedHT, 0);
  
  const baseTva = (totalBaseHT * projectDetails.tvaRate) / 100;
  const baseTtc = totalBaseHT + baseTva;
  
  const revisedTva = (totalRevisedHT * projectDetails.tvaRate) / 100;
  const revisedTtc = totalRevisedHT + revisedTva;
  
  const gapHT = totalRevisedHT - totalBaseHT;
  const gapTTC = revisedTtc - baseTtc;

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      
      {/* Control bar - Hidden during print */}
      <div className="no-print flex items-center justify-between gap-4 bg-stone-100 p-4 rounded-xl border border-stone-200 select-none">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg bg-white border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'application
        </button>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium h-[16px]">
          <span>💡 Conseil d'Impression : Cochez "Imprimer les arrière-plans" pour conserver les couleurs des rapports visuels.</span>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-brown hover:bg-stone-850 text-brand-gold px-5 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Imprimer le Rapport Officiel
        </button>
      </div>

      {/* Actual Print Template Sheet */}
      <div className="print-card bg-white p-2 sm:p-10 border border-stone-200 rounded-2xl shadow-xs space-y-8 font-sans text-stone-900 leading-normal">
        
        {/* Moroccan Ministry Format Header */}
        <div className="grid grid-cols-2 text-[10px] font-mono border-b border-stone-400 pb-6 items-start gap-4">
          <div className="space-y-1">
            <h4 className="font-black tracking-wide">ROYAUME DU MAROC</h4>
            <p className="text-stone-600 font-medium">Ministère de la Jeunesse, de la Culture et de la Communication</p>
            <p className="text-stone-600 font-medium">Secrétariat Général - Direction du Patrimoine Culturel</p>
            <p className="text-stone-700 font-black">Conservation Régionale du Palais El Bahia - Marrakech</p>
          </div>
          
          <div className="text-right space-y-1">
            <p className="font-extrabold text-stone-950 uppercase">SITUATION DU TRAVAUX N°2 (DÉFINITIVE)</p>
            <p className="text-stone-600">Date d'édition : {formatDate()}</p>
            <p className="text-stone-600">Lieu d'exécution : Marrakech, Médina (Palais El Bahia)</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 pb-2">
          <h1 className="font-display text-xl font-bold text-stone-900 uppercase tracking-tight">
            PROJET DE RECONSTRUCTION DU PALIER EL BAHIA
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-stone-550 uppercase font-bold">
            Bordereau Compartimenté avec Avancements d'Attaches d'Ouvrages et Révisions
          </p>
        </div>

        {/* Contract Info Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 text-xs gap-x-8 gap-y-4 rounded-xl bg-stone-50 p-5 border border-stone-200">
          <div className="space-y-2">
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-555">Marché Référence :</span>
              <span className="font-bold text-stone-800 font-mono">{projectDetails.contractNumber}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-555">Maître d'Ouvrage (M.O.) :</span>
              <span className="font-bold text-stone-850">{projectDetails.client}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-555">Entrepreneur Adjudicataire :</span>
              <span className="font-bold text-stone-850">{projectDetails.contractor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-555">Indice de Base (I₀) :</span>
              <span className="font-bold text-stone-800 font-mono">{projectDetails.baseIndexValue} ({projectDetails.baseIndexMonth})</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-555">Coefficient de révision K :</span>
              <span className="font-black text-brand-brown font-mono">{K.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-555">Indices de révision (I) :</span>
              <span className="font-bold text-stone-800 font-mono">{projectDetails.revisionIndexValue} ({projectDetails.revisionIndexMonth})</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-555">Formule révisée :</span>
              <span className="font-bold text-stone-700 font-mono">0.15 + 0.85 × (I/I₀)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-555">Taux de TVA fiscale :</span>
              <span className="font-bold text-stone-800 font-mono">{projectDetails.tvaRate}%</span>
            </div>
          </div>
        </div>

        {/* Central quantitative sheet table */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
            I. Décompte quantitatif d'attachement et valorisation révisée des travaux
          </h3>

          <table className="w-full text-[10px] border-collapse border border-stone-400">
            <thead>
              <tr className="bg-stone-100 text-stone-850 font-black border-b border-stone-400">
                <th className="border border-stone-400 p-2 w-12 text-center">N° Prix</th>
                <th className="border border-stone-400 p-2">Désignation abrégée des ouvrages exécutés</th>
                <th className="border border-stone-400 p-2 w-12 text-center">Unité</th>
                <th className="border border-stone-400 p-2 text-right w-16">P.U Init (HT)</th>
                <th className="border border-stone-400 p-2 text-right w-16">P.U Rév (HT)</th>
                <th className="border border-stone-400 p-2 text-right w-18">Qte Marché</th>
                <th className="border border-stone-400 p-2 text-right w-18">Qte Réelle</th>
                <th className="border border-stone-400 p-2 text-center w-14">% Exec</th>
                <th className="border border-stone-400 p-2 text-right w-22">Base HT (MAD)</th>
                <th className="border border-stone-400 p-2 text-right w-22">Révisé HT (MAD)</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {itemsBreakdown.map((item) => (
                <tr key={item.id} className="border-b border-stone-300">
                  <td className="border border-stone-300 p-2 font-bold text-center">{item.code}</td>
                  <td className="border border-stone-300 p-2 font-sans text-stone-700 leading-normal font-medium">{item.description}</td>
                  <td className="border border-stone-300 p-2 text-center font-bold">{item.unit}</td>
                  <td className="border border-stone-300 p-2 text-right">{item.unitPrice.toFixed(2)}</td>
                  <td className="border border-stone-300 p-2 text-right">{item.revisedPrice.toFixed(2)}</td>
                  
                  {/* Quantity Marché convenue */}
                  <td className="border border-stone-300 p-2 text-right text-stone-600">{item.contractQty.toFixed(2)}</td>
                  
                  {/* Quantity Réelle Executée */}
                  <td className="border border-stone-300 p-2 text-right font-bold text-emerald-800">{item.executedQty.toFixed(3)}</td>
                  
                  {/* Ratio % */}
                  <td className="border border-stone-300 p-2 text-center text-stone-700 font-bold">{item.progress.toFixed(1)}%</td>
                  
                  <td className="border border-stone-300 p-2 text-right">{item.baseHT.toFixed(2)}</td>
                  <td className="border border-stone-300 p-2 text-right font-bold text-stone-950">{item.revisedHT.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial recapitulation block */}
        <div className="space-y-3 pt-4 print-page-break">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
            II. Tableau Récapitulatif Général de Règlement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Base figures column */}
            <table className="w-full text-xs border border-stone-300">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-300 font-bold text-stone-700">
                  <th colSpan={2} className="px-3 py-1.5 text-left uppercase">A. Base Contractuelle Initiale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr className="font-mono">
                  <td className="px-3 py-2 text-stone-600 font-medium">Montant Général HT :</td>
                  <td className="px-3 py-2 text-right font-bold text-stone-900">{totalBaseHT.toFixed(2)} DH</td>
                </tr>
                <tr className="font-mono">
                  <td className="px-3 py-2 text-stone-600 font-medium">Montant TVA ({projectDetails.tvaRate}%) :</td>
                  <td className="px-3 py-2 text-right text-stone-750">{baseTva.toFixed(2)} DH</td>
                </tr>
                <tr className="font-mono bg-stone-50 font-bold">
                  <td className="px-3 py-2 text-brand-brown">Total Général TTC :</td>
                  <td className="px-3 py-2 text-right text-brand-brown">{baseTtc.toFixed(2)} DH</td>
                </tr>
              </tbody>
            </table>

            {/* Revised figures column */}
            <table className="w-full text-xs border border-stone-300">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-300 font-bold text-stone-700">
                  <th colSpan={2} className="px-3 py-1.5 text-left uppercase">B. Résultats Après Révision de Prix (K)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr className="font-mono">
                  <td className="px-3 py-2 text-stone-600 font-medium">Montant Révisé HT :</td>
                  <td className="px-3 py-2 text-right font-bold text-stone-900">{totalRevisedHT.toFixed(2)} DH</td>
                </tr>
                <tr className="font-mono">
                  <td className="px-3 py-2 text-stone-600 font-medium">Montant TVA ({projectDetails.tvaRate}%) :</td>
                  <td className="px-3 py-2 text-right text-stone-750">{revisedTva.toFixed(2)} DH</td>
                </tr>
                <tr className="font-mono bg-stone-50 font-bold">
                  <td className="px-3 py-2 text-brand-brown">Total Révisé TTC :</td>
                  <td className="px-3 py-2 text-right text-brand-brown">{revisedTtc.toFixed(2)} DH</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plus value comparison bottom panel in prints */}
          <div className="rounded-xl border border-stone-400 p-4 font-mono text-center bg-stone-50 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-450 block">Écart d'actualisation dû par l'administration (Plus-value nette)</span>
            <div className="text-[15px] font-bold text-amber-850">
              + {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(gapTTC)} TTC
            </div>
            <p className="text-[9px] text-stone-450 font-sans leading-normal">
              Cet écart correspond à la revalorisation contractuelle par le Ministre de l'escalation financière pour un amortissement compensatoire lié à la révision de prix de <strong>+{((K-1)*100).toFixed(3)}%</strong> suite à l'application rigoureuse du coefficient K.
            </p>
          </div>
        </div>

        {/* Signature Box Block */}
        <div className="pt-10 grid grid-cols-3 gap-4 text-center text-[10px] leading-relaxed select-none">
          <div className="space-y-16 border border-stone-300 rounded-lg p-4 bg-stone-55/60">
            <span className="font-extrabold underline uppercase block">L'Entreprise Adjudicataire</span>
            <p className="text-stone-405 font-mono">(Signature & Cachet précédés de la mention manuscrite « Lu et Approuvé »)</p>
          </div>

          <div className="space-y-16 border border-stone-300 rounded-lg p-4 bg-stone-55/60">
            <span className="font-extrabold underline uppercase block">L'Architecte Inspecteur</span>
            <p className="text-stone-405 font-mono">(Visa d'approbation et conformité historique de restitution structurelle)</p>
          </div>

          <div className="space-y-16 border border-stone-300 rounded-lg p-4 bg-stone-55/60">
            <span className="font-extrabold underline uppercase block">Le Représentant M.O</span>
            <p className="text-stone-405 font-mono">(Visa d'ordonnancement pour virement au Trésor Régional de Marrakech)</p>
          </div>
        </div>

      </div>
    </div>
  );
}
