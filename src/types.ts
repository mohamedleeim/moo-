/**
 * Types pour l'application de révision de prix, métré et décompte
 * Reconstruction d'un palier - El Bahia Marrakech
 */

export interface WorkItem {
  id: string;
  code: string;         // e.g., "1" or "2.3"
  category: string;     // e.g., "Maçonnerie", "Terrassements"
  description: string;
  unit: string;         // "m²", "m³", "U", "fft", "kg"
  unitPrice: number;    // Price in MAD (Dirham Marocain)
  contractQuantity?: number; // Quantité convenue/marché (agreed/contracted quantity)
}

export interface MeasurementLine {
  id: string;
  itemId: string;       // References WorkItem.id
  parentId?: string;    // References parent MeasurementLine.id for nested structures
  type?: 'section' | 'dimension'; // 'section' for folders/headers, 'dimension' for dimension inputs
  label: string;        // Description of this measurement line or group title
  coefficient: number;  // Multiplier (e.g. 2 for two identical walls)
  length?: number;      // L (meters)
  width?: number;       // W (meters)
  height?: number;      // H/D (meters)
  computedValue: number;// Calculated as coefficient * (length || 1) * (width || 1) * (height || 1)
}

export interface ProjectDetails {
  title: string;
  client: string;       // Maître d'ouvrage (e.g., Inspecteur des Monuments Historiques de Marrakech)
  contractor: string;   // Entreprise adjudicataire (e.g., Travaux Traditionnels du Sud)
  contractNumber: string;// Numéro de marché
  tvaRate: number;      // VAT percentage, usually 20%
  baseIndexName: string;// Name of index used (usually BAT6)
  baseIndexMonth: string;// Format "YYYY-MM"
  baseIndexValue: number;
  revisionIndexMonth: string;// Format "YYYY-MM"
  revisionIndexValue: number;
  fixedPart: number;    // Usually 0.15 in Moroccan public laws
  revisedPart: number;  // Usually 0.85
  odscDate?: string;    // Start date YYYY-MM-DD
  workStops?: WorkStop[];
  decomptesRevisions?: DecompteRevision[];
  customMonthlyIndices?: { [month: string]: number };
}

export interface WorkStop {
  id: string;
  stopDate: string; // YYYY-MM-DD
  resumeDate: string; // YYYY-MM-DD
  reason?: string;
}

export interface DecompteRevision {
  id: string;
  name: string; // e.g., "DP1"
  date: string; // YYYY-MM-DD
  amount: number; // payment interval amount (HT)
  isCumulative?: boolean; // whether amount is cumulative or partial
}

export interface IndexHistory {
  date: string;
  value: number;
  label: string;
}

export interface indexHistoryBAT6 {
  date: string;
  value: number;
  label: string;
}

export interface GeneratedDecompteItem {
  id: string;
  code: string;
  category: string;
  description: string;
  unit: string;
  unitPrice: number;
  contractQuantity?: number;
  executedQty: number;
  itemTotalCostHT: number;
}

export interface GeneratedDecompte {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  previousAcomptes: number;
  retenueGarantieRate: number;
  workItems: GeneratedDecompteItem[];
  totalHT: number;
  tvaAmount: number;
  totalTTC: number;
  warrantyAmount: number;
  netBeforePrevs: number;
  netToPayTTC: number;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  details: ProjectDetails;
  workItems: WorkItem[];
  measurementLines: MeasurementLine[];
  generatedDecomptes?: GeneratedDecompte[];
}

