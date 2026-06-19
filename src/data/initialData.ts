import { WorkItem, MeasurementLine, ProjectDetails, IndexHistory } from "../types";

export const initialWorkItems: WorkItem[] = [
  {
    id: "item-1",
    code: "1.1",
    category: "01 - Terrassements & Démolitions",
    description: "Fouilles en excavation ou en tranchées de largeur < 2m dans un terrain de consistance moyenne pour les fondations du palier.",
    unit: "m³",
    unitPrice: 120.00,
    contractQuantity: 10.0
  },
  {
    id: "item-2",
    code: "1.2",
    category: "01 - Terrassements & Démolitions",
    description: "Démolition délicate de la maçonnerie de briques dégradées constituant l'ancien palier fissuré, y compris tri des matériaux réutilisables.",
    unit: "m³",
    unitPrice: 180.00,
    contractQuantity: 5.0
  },
  {
    id: "item-3",
    code: "2.1",
    category: "02 - Gros Œuvre & Structure",
    description: "Béton armé dosé à 350 kg/m³ pour semelle de fondation, longrines et chaînages de soutien du palier.",
    unit: "m³",
    unitPrice: 1600.00,
    contractQuantity: 12.0
  },
  {
    id: "item-4",
    code: "2.2",
    category: "02 - Gros Œuvre & Structure",
    description: "Maçonnerie traditionnelle de briques cuites locales (briques pleines de Marrakech) hourdées au mortier de chaux hydraulique pour murs d'appui.",
    unit: "m³",
    unitPrice: 550.00,
    contractQuantity: 15.0
  },
  {
    id: "item-5",
    code: "3.1",
    category: "03 - Revêtements & Zelliges",
    description: "Fourniture et pose de revêtement de sol en Bejmat traditionnel de Marrakech (carreaux de terre cuite naturelle), posés sur lit de mortier.",
    unit: "m²",
    unitPrice: 380.00,
    contractQuantity: 25.0
  },
  {
    id: "item-6",
    code: "3.2",
    category: "03 - Revêtements & Zelliges",
    description: "Zellij traditionnel ciselé à la main, assemblé suivant calepinage historique pour la contremarche et la décoration de bordure du palier.",
    unit: "m²",
    unitPrice: 1100.00,
    contractQuantity: 10.0
  },
  {
    id: "item-7",
    code: "4.1",
    category: "04 - Enduits de Restauration",
    description: "Enduit traditionnel à base de chaux aérienne éteinte en 3 couches (gobetis, corps d'enduit et couche de finition lissée).",
    unit: "m²",
    unitPrice: 160.00,
    contractQuantity: 30.0
  },
  {
    id: "item-8",
    code: "4.2",
    category: "04 - Enduits de Restauration",
    description: "Enduit de finition de type Tadelakt Marrakech traditionnel, serré au galet de rivière et traité au savon noir de façon artisanale.",
    unit: "m²",
    unitPrice: 280.00,
    contractQuantity: 20.0
  },
  {
    id: "item-9",
    code: "5.1",
    category: "05 - Équipement & Ouvrages Bois",
    description: "Garde-corps de protection en fer forgé traditionnel clouté à la main, peint à l'oxyde noir satiné suivant dessin historique approuvé.",
    unit: "ml",
    unitPrice: 2200.00,
    contractQuantity: 5.0
  },
  {
    id: "item-10",
    code: "5.2",
    category: "05 - Équipement & Ouvrages Bois",
    description: "Restauration ou remplacement d'éléments structuraux secondaires de calage en bois de Cèdre de l'Atlas sculpté et traité thermiquement.",
    unit: "U",
    unitPrice: 3500.00,
    contractQuantity: 4.0
  }
];

export const initialMeasurementLines: MeasurementLine[] = [
  // Excavation
  {
    id: "m-1",
    itemId: "item-1",
    label: "Fouille pour semelle isolée Axe Nord (S1)",
    coefficient: 2,
    length: 1.20,
    width: 1.20,
    height: 1.50,
    computedValue: 4.32
  },
  {
    id: "m-2",
    itemId: "item-1",
    label: "Fouille en tranchée pour mur de soutènement",
    coefficient: 1,
    length: 5.60,
    width: 0.60,
    height: 1.20,
    computedValue: 4.032
  },
  // Demolition
  {
    id: "m-3",
    itemId: "item-2",
    label: "Démolition de la chape et du revêtement ancien",
    coefficient: 1,
    length: 5.60,
    width: 2.20,
    height: 0.25,
    computedValue: 3.08
  },
  {
    id: "m-4",
    itemId: "item-2",
    label: "Murs fissurés à abattre",
    coefficient: 2,
    length: 2.10,
    width: 0.40,
    height: 1.80,
    computedValue: 3.024
  },
  // Concrete
  {
    id: "m-5",
    itemId: "item-3",
    label: "Semelles S1",
    coefficient: 2,
    length: 1.00,
    width: 1.00,
    height: 0.40,
    computedValue: 0.80
  },
  {
    id: "m-6",
    itemId: "item-3",
    label: "Chaînage horizontal bas",
    coefficient: 1,
    length: 5.60,
    width: 0.30,
    height: 0.25,
    computedValue: 0.42
  },
  {
    id: "m-7",
    itemId: "item-3",
    label: "Dalle de palier renforcée",
    coefficient: 1,
    length: 5.60,
    width: 2.20,
    height: 0.15,
    computedValue: 1.848
  },
  // Masonry
  {
    id: "m-8",
    itemId: "item-4",
    label: "Mur de soubassement",
    coefficient: 1,
    length: 5.60,
    width: 0.40,
    height: 1.10,
    computedValue: 2.464
  },
  // Bejmat
  {
    id: "m-9",
    itemId: "item-5",
    label: "Revêtement de sol de la plateforme principale",
    coefficient: 1,
    length: 5.40,
    width: 2.10,
    height: undefined,
    computedValue: 11.34
  },
  // Zellij
  {
    id: "m-10",
    itemId: "item-6",
    label: "Contremarches des trois marches d'accès",
    coefficient: 3,
    length: 2.20,
    width: 0.15,
    height: undefined,
    computedValue: 0.99
  },
  {
    id: "m-11",
    itemId: "item-6",
    label: "Bandeau mural décoratif sous le cèdre",
    coefficient: 1,
    length: 5.40,
    width: 0.40,
    height: undefined,
    computedValue: 2.16
  },
  // Plaster Gobetis
  {
    id: "m-12",
    itemId: "item-7",
    label: "Murs extérieurs d'appui (côtés extérieurs)",
    coefficient: 1,
    length: 12.40,
    width: 2.20,
    height: undefined,
    computedValue: 27.28
  },
  // Tadelakt
  {
    id: "m-13",
    itemId: "item-8",
    label: "Parois intérieures de la loggia du palier",
    coefficient: 1,
    length: 5.40,
    width: 1.80,
    height: undefined,
    computedValue: 9.72
  },
  {
    id: "m-14",
    itemId: "item-8",
    label: "Habillage piliers d'angles",
    coefficient: 2,
    length: 0.40,
    width: 1.80,
    height: undefined,
    computedValue: 1.44
  },
  // Handrail
  {
    id: "m-15",
    itemId: "item-9",
    label: "Protection frontale du palier",
    coefficient: 1,
    length: 5.60,
    width: undefined,
    height: undefined,
    computedValue: 5.60
  },
  {
    id: "m-16",
    itemId: "item-9",
    label: "Retours latéraux de sécurité",
    coefficient: 2,
    length: 1.10,
    width: undefined,
    height: undefined,
    computedValue: 2.20
  },
  // Wood items
  {
    id: "m-17",
    itemId: "item-10",
    label: "Poutres d'assise restaurées",
    coefficient: 2,
    length: undefined,
    width: undefined,
    height: undefined,
    computedValue: 2.00
  }
];

export const defaultProjectDetails: ProjectDetails = {
  title: "Reconstruction et consolidation du Palier El Bahia - Marrakech",
  client: "Région Marrakech-Safi - Division du Patrimoine Historique",
  contractor: "TRADITION & PATRIMOINE DU SUD S.A.R.L.",
  contractNumber: "Marché N° 124/DPH/MRK/2024",
  tvaRate: 20, // 20% standard VAT in Morocco
  baseIndexName: "BAT6 (Gros Œuvre & Bâtiment)",
  baseIndexMonth: "2024-07", // Month of Tender Bid Opening / Reference
  baseIndexValue: 243.8,
  revisionIndexMonth: "2025-04", // Month of execution/statement (Mois de réalisation)
  revisionIndexValue: 248.0,
  fixedPart: 0.15,
  revisedPart: 0.85,
  odscDate: "2024-09-30",
  decomptesRevisions: [
    { id: "dr-1", name: "DP1", date: "2024-12-19", amount: 569983.40, isCumulative: true },
    { id: "dr-2", name: "DP2", date: "2025-01-10", amount: 1359020.00, isCumulative: true },
    { id: "dr-3", name: "DP3", date: "2025-03-19", amount: 3234048.95, isCumulative: true },
    { id: "dr-4", name: "DP4", date: "2025-04-30", amount: 4378487.35, isCumulative: true }
  ],
  workStops: [
    { id: "ws-1", stopDate: "2025-01-11", resumeDate: "2025-01-26", reason: "Arrêt des Travaux 1" },
    { id: "ws-2", stopDate: "2025-02-12", resumeDate: "2025-02-27", reason: "Arrêt des Travaux 2" }
  ]
};

export const indexHistoryBAT6: IndexHistory[] = [
  // Moroccan BAT6 actual index values (July 2024 - mid 2025)
  { date: "2024-07", value: 243.8, label: "Juillet 2024 (I₀ Base)" },
  { date: "2024-08", value: 243.6, label: "Août 2024" },
  { date: "2024-09", value: 243.7, label: "Septembre 2024" },
  { date: "2024-10", value: 243.8, label: "Octobre 2024" },
  { date: "2024-11", value: 243.5, label: "Novembre 2024" },
  { date: "2024-12", value: 243.4, label: "Décembre 2024" },
  { date: "2025-01", value: 246.7, label: "Janvier 2025" },
  { date: "2025-02", value: 248.1, label: "Février 2025" },
  { date: "2025-03", value: 247.8, label: "Mars 2025" },
  { date: "2025-04", value: 248.0, label: "Avril 2025" },
  { date: "2025-05", value: 248.5, label: "Mai 2025" },
  { date: "2025-06", value: 249.0, label: "Juin 2025" },

  // Standard index values (Legacy or alternative base years)
  { date: "2023-01", value: 125.1, label: "Janvier 2023" },
  { date: "2023-02", value: 125.4, label: "Février 2023" },
  { date: "2023-03", value: 125.8, label: "Mars 2023" },
  { date: "2023-04", value: 126.1, label: "Avril 2023" },
  { date: "2023-05", value: 126.4, label: "Mai 2023" },
  { date: "2023-06", value: 126.9, label: "Juin 2023" },
  { date: "2023-07", value: 127.2, label: "Juillet 2023" },
  { date: "2023-08", value: 127.5, label: "Août 2023" },
  { date: "2023-09", value: 127.8, label: "Septembre 2023" },
  { date: "2023-10", value: 128.1, label: "Octobre 2023" },
  { date: "2023-11", value: 128.4, label: "Novembre 2023" },
  { date: "2023-12", value: 128.7, label: "Décembre 2023" },
  { date: "2024-01", value: 129.1, label: "Janvier 2024" },
  { date: "2024-02", value: 129.4, label: "Février 2024" },
  { date: "2024-03", value: 129.8, label: "Mars 2024" },
  { date: "2024-04", value: 130.1, label: "Avril 2024" },
  { date: "2024-05", value: 130.4, label: "Mai 2024" },
  { date: "2024-06", value: 130.8, label: "Juin 2024" },
  { date: "2024-09-LEGACY", value: 131.9, label: "Septembre 2024 (I₀ Legacy)" },
  { date: "2026-03-LEGACY", value: 138.8, label: "Mars 2026 (I Legacy)" },
  { date: "2025-01", value: 133.4, label: "Janvier 2025" },
  { date: "2025-02", value: 133.8, label: "Février 2025" },
  { date: "2025-03", value: 134.2, label: "Mars 2025" },
  { date: "2025-04", value: 134.5, label: "Avril 2025" },
  { date: "2025-05", value: 134.9, label: "Mai 2025" },
  { date: "2025-06", value: 135.3, label: "Juin 2025" },
  { date: "2025-07", value: 135.6, label: "Juillet 2025" },
  { date: "2025-08", value: 136.0, label: "Août 2025" },
  { date: "2025-09", value: 136.4, label: "Septembre 2025" },
  { date: "2025-10", value: 136.8, label: "Octobre 2025" },
  { date: "2025-11", value: 137.2, label: "Novembre 2025" },
  { date: "2025-12", value: 137.6, label: "Décembre 2025" },
  { date: "2026-01", value: 138.0, label: "Janvier 2026" },
  { date: "2026-02", value: 138.4, label: "Février 2026" },
  { date: "2026-03", value: 138.8, label: "Mars 2026 (I Actuel)" },
  { date: "2026-04", value: 139.1, label: "Avril 2026" },
  { date: "2026-05", value: 139.5, label: "Mai 2026" },
  { date: "2026-06", value: 139.9, label: "Juin 2026" }
];
