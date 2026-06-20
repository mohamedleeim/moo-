import { WorkItem, MeasurementLine, ProjectDetails, IndexHistory } from "../types";

export const initialWorkItems: WorkItem[] = [
  {
    id: "item-1",
    code: "1.01",
    category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE",
    description: "Installation du chantier, matériel, bureau de chantier et toutes sujétions de mise en place.",
    unit: "Ens",
    unitPrice: 25000.00,
    contractQuantity: 1.0
  },
  {
    id: "item-2",
    code: "1.02",
    category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE",
    description: "Etayage et renforcement de l'étayement existant pour sécurité des plafonds, murs et arcades historiques.",
    unit: "M2",
    unitPrice: 180.00,
    contractQuantity: 500.00
  },
  {
    id: "item-3",
    code: "1.03",
    category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE",
    description: "Protection des éléments décoratifs existants en plâtre sculpté par des plaques d'éponge de 1 cm d'épaisseur et des lames en plastique y compris fixation et Entretien jusqu'à achèvement des travaux.",
    unit: "M2",
    unitPrice: 280.00,
    contractQuantity: 250.00
  },
  {
    id: "item-4",
    code: "1.04",
    category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE",
    description: "Protection des éléments décoratifs existants en bois sculpté et/ou peint de structure, de menuiserie ou de décor par des plaques d'éponge de 1 cm d'épaisseur et des lames en plastique y compris fixation et Entretien.",
    unit: "M2",
    unitPrice: 350.00,
    contractQuantity: 1200.00
  },
  {
    id: "item-5",
    code: "1.05",
    category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE",
    description: "Protection des éléments décoratifs existants en Zellij sur mur et poteaux par des plaques d'éponge de 1 cm d'épaisseur et des lames en plastique y compris fixation et Entretien jusqu'à achèvement des travaux.",
    unit: "M2",
    unitPrice: 220.00,
    contractQuantity: 300.00
  },
  {
    id: "item-6",
    code: "1.06",
    category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE",
    description: "Protection des éléments décoratifs existants en zellij ou marbre sur sol, marches et contre marches par des lames en plastique y compris fixation par un revêtement en plâtre et Entretien jusqu'à achèvement des travaux.",
    unit: "M2",
    unitPrice: 150.00,
    contractQuantity: 1500.00
  },
  {
    id: "item-7",
    code: "2.01",
    category: "02 - DEMOLITION & DEPOSE",
    description: "Murs en maçonnerie de briques pleines, Moellons, Pisé ou mixtes de toutes épaisseurs y compris évacuation.",
    unit: "M3",
    unitPrice: 350.00,
    contractQuantity: 30.00
  },
  {
    id: "item-8",
    code: "2.02",
    category: "02 - DEMOLITION & DEPOSE",
    description: "Murs en agglos ou brique creuse, de cloisons non-structurelles pour réaménagement.",
    unit: "M2",
    unitPrice: 90.00,
    contractQuantity: 100.00
  },
  {
    id: "item-9",
    code: "2.04",
    category: "02 - DEMOLITION & DEPOSE",
    description: "Décapage de revêtement Sol défectueux existant de toute nature y/c forme de pente, chape d’accrochage et plinthe.",
    unit: "M2",
    unitPrice: 110.00,
    contractQuantity: 500.00
  },
  {
    id: "item-10",
    code: "2.07",
    category: "02 - DEMOLITION & DEPOSE",
    description: "Dépose tuiles vertes détériorées existantes y/c chape d'accrochage pour remplacement à l'identique.",
    unit: "M2",
    unitPrice: 140.00,
    contractQuantity: 600.00
  }
];

export const initialMeasurementLines: MeasurementLine[] = [
  // 1.01 Installation du chantier
  {
    id: "m-1-1",
    itemId: "item-1",
    label: "Installation générale de base",
    coefficient: 1,
    length: 0.4,
    computedValue: 0.40
  },

  // 1.02 Etayage (Total 495.69)
  {
    id: "m-2-1",
    itemId: "item-2",
    label: "Qoba Entrée principale droite",
    coefficient: 1,
    length: 10.7,
    height: 2.88,
    computedValue: 30.82
  },
  {
    id: "m-2-2",
    itemId: "item-2",
    label: "chambre 1",
    coefficient: 1,
    length: 2.5,
    height: 2.77,
    computedValue: 6.93
  },
  {
    id: "m-2-3",
    itemId: "item-2",
    label: "chambre 2",
    coefficient: 1,
    length: 2.49,
    height: 2.71,
    computedValue: 6.75
  },
  {
    id: "m-2-4",
    itemId: "item-2",
    label: "Grand qoba droite",
    coefficient: 1,
    length: 15.1,
    height: 4.8,
    computedValue: 72.48
  },
  {
    id: "m-2-5",
    itemId: "item-2",
    label: "Facade Exterieur du qoba Entrée principale droite",
    coefficient: 1,
    length: 4.07,
    height: 3.9,
    computedValue: 15.87
  },
  {
    id: "m-2-6",
    itemId: "item-2",
    label: "Couloire cote grand qoba droite",
    coefficient: 1,
    length: 5.8,
    height: 1.78,
    computedValue: 10.32
  },
  {
    id: "m-2-7",
    itemId: "item-2",
    label: "Petite qoba droite",
    coefficient: 1,
    length: 2.32,
    height: 2.77,
    computedValue: 6.43
  },
  {
    id: "m-2-8",
    itemId: "item-2",
    label: "La grande cour en Marbre - Mur 1",
    coefficient: 1,
    length: 36,
    height: 3.4,
    computedValue: 122.40
  },
  {
    id: "m-2-9",
    itemId: "item-2",
    label: "Qoba a cote du hemame",
    coefficient: 1,
    length: 9.4,
    height: 3.9,
    computedValue: 36.66
  },
  {
    id: "m-2-10",
    itemId: "item-2",
    label: "Mur exterieur du Couloir cote grand qoba droite",
    coefficient: 1,
    length: 1.1,
    height: 4,
    computedValue: 4.40
  },
  {
    id: "m-2-11",
    itemId: "item-2",
    label: "Sous sol Salle de favorite - partie 1",
    coefficient: 1,
    length: 5,
    height: 2.45,
    computedValue: 12.25
  },
  {
    id: "m-2-12",
    itemId: "item-2",
    label: "Sous sol Salle de favorite - partie 2",
    coefficient: 1,
    length: 2.5,
    height: 2.95,
    computedValue: 7.38
  },
  {
    id: "m-2-13",
    itemId: "item-2",
    label: "Salle d'honneur",
    coefficient: 1,
    length: 21.7,
    height: 6.9,
    computedValue: 149.73
  },
  {
    id: "m-2-14",
    itemId: "item-2",
    label: "Cuisine du maison de voisin",
    coefficient: 1,
    length: 3.4,
    height: 2.54,
    computedValue: 8.64
  },
  {
    id: "m-2-15",
    itemId: "item-2",
    label: "Entrée maison du voisin",
    coefficient: 1,
    length: 1.83,
    height: 2.54,
    computedValue: 4.65
  },

  // 1.03 Protection Plâtre sculpté (Total 204.91)
  {
    id: "m-3-1",
    itemId: "item-3",
    label: "Qoba Droite Entrée principale, Bande platre inf - Mur 1",
    coefficient: 1,
    length: 2.78,
    width: 0.20,
    computedValue: 0.56
  },
  {
    id: "m-3-2",
    itemId: "item-3",
    label: "Mur 2",
    coefficient: 1,
    length: 0.7,
    width: 0.20,
    computedValue: 0.14
  },
  {
    id: "m-3-3",
    itemId: "item-3",
    label: "Mur 2 bails",
    coefficient: 1,
    length: 0.83,
    width: 0.20,
    computedValue: 0.17
  },
  {
    id: "m-3-4",
    itemId: "item-3",
    label: "Mur 3",
    coefficient: 1,
    length: 2.72,
    width: 1.20,
    computedValue: 3.26
  },
  {
    id: "m-3-5",
    itemId: "item-3",
    label: "Mur 4",
    coefficient: 1,
    length: 10.6,
    width: 0.20,
    computedValue: 2.12
  },
  {
    id: "m-3-6",
    itemId: "item-3",
    label: "Cadre superieur du porte",
    coefficient: 1,
    length: 1.75,
    width: 0.77,
    computedValue: 1.35
  },
  {
    id: "m-3-7",
    itemId: "item-3",
    label: "Cadre superieur du porte 2",
    coefficient: 1,
    length: 2.63,
    width: 2.36,
    computedValue: 6.21
  },
  {
    id: "m-3-8",
    itemId: "item-3",
    label: "Bande de platre Superieur - Mur 1",
    coefficient: 1,
    length: 2.78,
    width: 0.40,
    computedValue: 1.11
  },
  {
    id: "m-3-9",
    itemId: "item-3",
    label: "Bande de platre Superieur - Mur 2",
    coefficient: 1,
    length: 10.6,
    width: 0.40,
    computedValue: 4.24
  },
  {
    id: "m-3-10",
    itemId: "item-3",
    label: "Bande de platre Superieur - Mur 3",
    coefficient: 1,
    length: 2.72,
    width: 0.40,
    computedValue: 1.09
  },
  {
    id: "m-3-11",
    itemId: "item-3",
    label: "Bande de platre Superieur - Mur 4",
    coefficient: 1,
    length: 10.6,
    width: 0.40,
    computedValue: 4.24
  },
  {
    id: "m-3-12",
    itemId: "item-3",
    label: "Bails exterieur 1",
    coefficient: 1,
    length: 0.82,
    width: 0.20,
    computedValue: 0.16
  },
  {
    id: "m-3-13",
    itemId: "item-3",
    label: "Bails exterieur 2",
    coefficient: 1,
    length: 0.74,
    width: 1.20,
    computedValue: 0.89
  },
  {
    id: "m-3-14",
    itemId: "item-3",
    label: "Bails exterieur 3",
    coefficient: 1,
    length: 0.77,
    width: 2.20,
    computedValue: 1.69
  },
  {
    id: "m-3-15",
    itemId: "item-3",
    label: "Bails exterieur 4",
    coefficient: 1,
    length: 0.73,
    width: 3.20,
    computedValue: 2.34
  },
  {
    id: "m-3-16",
    itemId: "item-3",
    label: "Grand QOBA DROITE, Bande platre inf - Mur 1",
    coefficient: 1,
    length: 4.8,
    width: 0.22,
    computedValue: 1.06
  },
  {
    id: "m-3-17",
    itemId: "item-3",
    label: "Grand QOBA DROITE, Bande platre inf - Mur 2",
    coefficient: 1,
    length: 4.74,
    width: 0.22,
    computedValue: 1.04
  },
  {
    id: "m-3-18",
    itemId: "item-3",
    label: "Grand QOBA DROITE, Bande platre inf - Mur 3",
    coefficient: 1,
    length: 15.1,
    width: 0.22,
    computedValue: 3.32
  },
  {
    id: "m-3-19",
    itemId: "item-3",
    label: "Complément de protection du plâtre (Qoba gauche, salons)",
    coefficient: 1,
    length: 1,
    width: 178.45,
    computedValue: 178.45
  },
  {
    id: "m-3-20",
    itemId: "item-3",
    label: "Déduction - Qoba Droite - déduire porte",
    coefficient: -1,
    length: 1.2,
    width: 0.20,
    computedValue: -0.24
  },
  {
    id: "m-3-21",
    itemId: "item-3",
    label: "Déduction - Qoba Droite - déduire porte 2",
    coefficient: -1,
    length: 1.3,
    width: 0.20,
    computedValue: -0.26
  },
  {
    id: "m-3-22",
    itemId: "item-3",
    label: "Déduction - Qoba Droite - déduire fenetre",
    coefficient: -2,
    length: 2.1,
    width: 0.22,
    computedValue: -0.92
  },
  {
    id: "m-3-23",
    itemId: "item-3",
    label: "Déduction - Qoba Droite - déduire porte 3",
    coefficient: -1,
    length: 2.19,
    width: 0.22,
    computedValue: -0.48
  },
  {
    id: "m-3-24",
    itemId: "item-3",
    label: "Déduction - Qoba Droite - déduire vide arc",
    coefficient: -0.5,
    length: 3.44,
    width: 1.99,
    computedValue: -3.42
  },

  // 1.04 Protection Bois sculpté (Total 1076.35)
  {
    id: "m-4-1",
    itemId: "item-4",
    label: "Qoba Droite, Bande du bois Superieur - Mur 1",
    coefficient: 1,
    length: 2.78,
    width: 0.70,
    computedValue: 1.95
  },
  {
    id: "m-4-2",
    itemId: "item-4",
    label: "Qoba Droite, Bande du bois Superieur - Mur 2",
    coefficient: 1,
    length: 10.60,
    width: 0.70,
    computedValue: 7.42
  },
  {
    id: "m-4-3",
    itemId: "item-4",
    label: "Porte de chambre 1",
    coefficient: 2,
    length: 2.50,
    width: 4.57,
    computedValue: 22.85
  },
  {
    id: "m-4-4",
    itemId: "item-4",
    label: "Porte principale",
    coefficient: 2,
    length: 3.23,
    width: 4.90,
    computedValue: 31.65
  },
  {
    id: "m-4-5",
    itemId: "item-4",
    label: "Porte orientale 3",
    coefficient: 2,
    length: 2.52,
    width: 4.57,
    computedValue: 23.03
  },
  {
    id: "m-4-6",
    itemId: "item-4",
    label: "Qoba Droite, Bande du bois Superieur - Mur 3",
    coefficient: 1,
    length: 2.72,
    width: 0.70,
    computedValue: 1.90
  },
  {
    id: "m-4-7",
    itemId: "item-4",
    label: "Qoba Droite, Bande du bois Superieur - Mur 4",
    coefficient: 1,
    length: 10.60,
    width: 0.70,
    computedValue: 7.42
  },
  {
    id: "m-4-8",
    itemId: "item-4",
    label: "Fenetres Qoba Droite",
    coefficient: 4,
    length: 1.30,
    width: 1.78,
    computedValue: 9.26
  },
  {
    id: "m-4-9",
    itemId: "item-4",
    label: "Complément de protection du bois (Grandes qobas, salons, portes)",
    coefficient: 1,
    length: 1,
    width: 970.87,
    computedValue: 970.87
  },

  // 1.05 Protection Zellij mural (Total 234.78)
  {
    id: "m-5-1",
    itemId: "item-5",
    label: "Qoba Droite, Mur 1",
    coefficient: 1,
    length: 2.78,
    width: 1.64,
    computedValue: 4.56
  },
  {
    id: "m-5-2",
    itemId: "item-5",
    label: "Mur 2, bails",
    coefficient: 1,
    length: 0.70,
    width: 1.64,
    computedValue: 1.15
  },
  {
    id: "m-5-3",
    itemId: "item-5",
    label: "Mur 2, bails 2",
    coefficient: 1,
    length: 0.83,
    width: 1.64,
    computedValue: 1.36
  },
  {
    id: "m-5-4",
    itemId: "item-5",
    label: "Mur 2, bails 3",
    coefficient: 1,
    length: 0.78,
    width: 1.64,
    computedValue: 1.28
  },
  {
    id: "m-5-5",
    itemId: "item-5",
    label: "Mur 2, bails 4",
    coefficient: 1,
    length: 0.80,
    width: 1.64,
    computedValue: 1.31
  },
  {
    id: "m-5-6",
    itemId: "item-5",
    label: "Mur 3",
    coefficient: 1,
    length: 2.72,
    width: 1.64,
    computedValue: 4.46
  },
  {
    id: "m-5-7",
    itemId: "item-5",
    label: "Bail de porte",
    coefficient: 2,
    length: 0.94,
    width: 1.64,
    computedValue: 3.08
  },
  {
    id: "m-5-8",
    itemId: "item-5",
    label: "Complément de protection du zellij mural (Autres salons)",
    coefficient: 1,
    length: 1,
    width: 231.53,
    computedValue: 231.53
  },
  {
    id: "m-5-9",
    itemId: "item-5",
    label: "Déduction - Qoba Droite - déduire porte 1",
    coefficient: -1,
    length: 1.14,
    width: 2.44,
    computedValue: -2.78
  },
  {
    id: "m-5-10",
    itemId: "item-5",
    label: "Déduction - Qoba Droite - déduire porte 2",
    coefficient: -1,
    length: 1.20,
    width: 2.43,
    computedValue: -2.92
  },
  {
    id: "m-5-11",
    itemId: "item-5",
    label: "Déduction - Qoba Droite - déduire fenetre",
    coefficient: -2,
    length: 1.30,
    width: 1.78,
    computedValue: -4.63
  },
  {
    id: "m-5-12",
    itemId: "item-5",
    label: "Déduction - Qoba Droite - déduire porte 3",
    coefficient: -1,
    length: 1.19,
    width: 2.20,
    computedValue: -2.62
  },

  // 1.06 Protection Zellij/marbre au sol (Total 1391.11)
  {
    id: "m-6-1",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 1",
    coefficient: 1,
    length: 2.46,
    width: 17.30,
    computedValue: 42.56
  },
  {
    id: "m-6-2",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 2",
    coefficient: 1,
    length: 2.38,
    width: 8.96,
    computedValue: 21.32
  },
  {
    id: "m-6-3",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 3",
    coefficient: 1,
    length: 11.37,
    width: 3.72,
    computedValue: 42.30
  },
  {
    id: "m-6-4",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 4",
    coefficient: 1,
    length: 10.20,
    width: 2.42,
    computedValue: 24.68
  },
  {
    id: "m-6-5",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 5",
    coefficient: 1,
    length: 34.90,
    width: 2.52,
    computedValue: 87.95
  },
  {
    id: "m-6-6",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 6",
    coefficient: 1,
    length: 7.50,
    width: 2.50,
    computedValue: 18.75
  },
  {
    id: "m-6-7",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 7",
    coefficient: 1,
    length: 10.95,
    width: 3.73,
    computedValue: 40.84
  },
  {
    id: "m-6-8",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 8",
    coefficient: 1,
    length: 4.83,
    width: 2.50,
    computedValue: 12.08
  },
  {
    id: "m-6-9",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 9",
    coefficient: 1,
    length: 6.00,
    width: 2.22,
    computedValue: 13.20
  },
  {
    id: "m-6-10",
    itemId: "item-6",
    label: "RIAD SI MOUSSA, Couloirs Exterieurs - Partie 10",
    coefficient: 1,
    length: 4.90,
    width: 2.20,
    computedValue: 10.78
  },
  {
    id: "m-6-11",
    itemId: "item-6",
    label: "Complément de protection du sol (Marbre, zellij, cours et vestibules)",
    coefficient: 1,
    length: 1,
    width: 1076.65,
    computedValue: 1076.65
  },

  // 2.01 Démolition murs briques (Total 22.24)
  {
    id: "m-7-1",
    itemId: "item-7",
    label: "Murs de séparation de deux chambres",
    coefficient: 1,
    length: 3.25,
    width: 2.25,
    height: 0.15,
    computedValue: 1.10
  },
  {
    id: "m-7-2",
    itemId: "item-7",
    label: "Entrée cuisine - Poteau de séparation",
    coefficient: 1,
    length: 2.65,
    width: 0.80,
    height: 0.30,
    computedValue: 0.64
  },
  {
    id: "m-7-3",
    itemId: "item-7",
    label: "Cheminée",
    coefficient: 1,
    length: 0.60,
    width: 0.35,
    height: 3.25,
    computedValue: 0.68
  },
  {
    id: "m-7-4",
    itemId: "item-7",
    label: "Murs dégradés - Complément forfaitaire",
    coefficient: 1,
    length: 1,
    width: 1,
    height: 19.82,
    computedValue: 19.82
  },

  // 2.02 Démolition murs agglos (Total 73.89)
  {
    id: "m-8-1",
    itemId: "item-8",
    label: "Murs cuisine - Mur 1",
    coefficient: 1,
    length: 5.30,
    width: 3.06,
    computedValue: 16.20
  },
  {
    id: "m-8-2",
    itemId: "item-8",
    label: "Porte cote Cour du bloc A",
    coefficient: 1,
    length: 1.27,
    width: 2.18,
    computedValue: 2.77
  },
  {
    id: "m-8-3",
    itemId: "item-8",
    label: "Mur cloison du toilette",
    coefficient: 1,
    length: 1.68,
    width: 2.22,
    computedValue: 3.73
  },
  {
    id: "m-8-4",
    itemId: "item-8",
    label: "Murs cuisine évènement - Mur 1",
    coefficient: 1,
    length: 10.04,
    width: 3.40,
    computedValue: 34.14
  },
  {
    id: "m-8-5",
    itemId: "item-8",
    label: "Murs cuisine évènement - Mur 2",
    coefficient: 1,
    length: 5.54,
    width: 3.40,
    computedValue: 18.84
  },
  {
    id: "m-8-6",
    itemId: "item-8",
    label: "Déduction - déduire porte",
    coefficient: -1,
    length: 1,
    width: 1.80,
    computedValue: -1.79
  },

  // 2.04 Décapage sol défectueux (Total 416.00)
  {
    id: "m-9-1",
    itemId: "item-9",
    label: "Les toilettes près de la direction WC F",
    coefficient: 1,
    length: 4.80,
    width: 3.40,
    computedValue: 16.32
  },
  {
    id: "m-9-2",
    itemId: "item-9",
    label: "Toilette WC 2",
    coefficient: 1,
    length: 4.95,
    width: 3.80,
    computedValue: 18.81
  },
  {
    id: "m-9-3",
    itemId: "item-9",
    label: "Placard adjacent",
    coefficient: 1,
    length: 2.20,
    width: 0.60,
    computedValue: 1.32
  },
  {
    id: "m-9-4",
    itemId: "item-9",
    label: "Palier du porte",
    coefficient: 1,
    length: 1.33,
    width: 0.60,
    computedValue: 0.80
  },
  {
    id: "m-9-5",
    itemId: "item-9",
    label: "Complément de décapage sol sur divers patios",
    coefficient: 1,
    length: 1,
    width: 378.75,
    computedValue: 378.75
  },

  // 2.07 Dépose tuiles vertes (Total 548.96)
  {
    id: "m-10-1",
    itemId: "item-10",
    label: "Toit Grande cour en marbre - Mur 1",
    coefficient: 1,
    length: 47.20,
    width: 4.15,
    computedValue: 195.88
  },
  {
    id: "m-10-2",
    itemId: "item-10",
    label: "Toit Grande cour en marbre - Mur 2",
    coefficient: 1,
    length: 27.30,
    width: 4.15,
    computedValue: 113.30
  },
  {
    id: "m-10-3",
    itemId: "item-10",
    label: "Murs exterieur Si moussa - Mur 1",
    coefficient: 1,
    length: 13.75,
    width: 0.70,
    computedValue: 9.63
  },
  {
    id: "m-10-4",
    itemId: "item-10",
    label: "Murs exterieur Si moussa - Mur 2",
    coefficient: 1,
    length: 17.30,
    width: 0.70,
    computedValue: 12.11
  },
  {
    id: "m-10-5",
    itemId: "item-10",
    label: "Complément de dépose tuiles vertes sur autres qobas",
    coefficient: 1,
    length: 1,
    width: 218.04,
    computedValue: 218.04
  }
];

export const defaultProjectDetails: ProjectDetails = {
  title: "Travaux de Réhabilitation et de Restauration du Palais BAHIA - Marrakech- Médina",
  client: "Inspection Régionale des Monuments Historiques de Marrakech - Royaume du Maroc",
  contractor: "Entreprise GTRM (Restauration Traditionnelle du Maroc)",
  contractNumber: "Marché N° 10 /DRCRMS/ 2024",
  tvaRate: 20, // 20% standard VAT in Morocco
  baseIndexName: "BAT6 (Gros Œuvre & Restauration)",
  baseIndexMonth: "2024-07", // Month of Reference
  baseIndexValue: 243.8,
  revisionIndexMonth: "2026-06", // Current situation execution
  revisionIndexValue: 249.0,
  fixedPart: 0.15,
  revisedPart: 0.85,
  odscDate: "2024-09-30",
  workStops: [
    {
      id: "stop-1",
      stopDate: "2025-01-11",
      resumeDate: "2025-01-27",
      reason: "Arrêt des Travaux réglementaire N°1"
    },
    {
      id: "stop-2",
      stopDate: "2025-02-03",
      resumeDate: "2025-02-20",
      reason: "Arrêt des Travaux réglementaire N°2"
    },
    {
      id: "stop-3",
      stopDate: "2025-04-04",
      resumeDate: "2025-04-19",
      reason: "Arrêt des Travaux réglementaire N°3"
    },
    {
      id: "stop-4",
      stopDate: "2025-05-22",
      resumeDate: "2025-06-21",
      reason: "Arrêt des Travaux réglementaire N°4"
    }
  ],
  decomptesRevisions: [
    {
      id: "dp-1",
      name: "DP1",
      date: "2024-12-19",
      amount: 569983.40,
      isCumulative: true
    },
    {
      id: "dp-2",
      name: "DP2",
      date: "2025-01-10",
      amount: 1359020.00,
      isCumulative: true
    },
    {
      id: "dp-3",
      name: "DP3",
      date: "2025-03-19",
      amount: 3234048.95,
      isCumulative: true
    },
    {
      id: "dp-4",
      name: "DP4",
      date: "2025-04-30",
      amount: 4378487.35,
      isCumulative: true
    },
    {
      id: "dp-5",
      name: "DP5",
      date: "2025-06-25",
      amount: 5062827.20,
      isCumulative: true
    }
  ]
};

export const indexHistoryBAT6: IndexHistory[] = [
  { date: "2024-07", value: 243.8, label: "Juillet 2024 (I₀ Base)" },
  { date: "2024-08", value: 243.6, label: "Août 2024" },
  { date: "2024-09", value: 243.7, label: "Septembre 2024" },
  { date: "2024-10", value: 243.8, label: "Octobre 2024" },
  { date: "2024-11", value: 243.5, label: "Novembre 2024" },
  { date: "2024-12", value: 243.4, label: "Décembre 2024" },
  { date: "2025-01", value: 244.7, label: "Janvier 2025" },
  { date: "2025-02", value: 245.1, label: "Février 2025" },
  { date: "2025-03", value: 245.8, label: "Mars 2025" },
  { date: "2025-04", value: 246.0, label: "Avril 2025" },
  { date: "2025-05", value: 246.5, label: "Mai 2025" },
  { date: "2025-06", value: 247.0, label: "Juin 2025" },
  { date: "2025-07", value: 247.2, label: "Juillet 2025" },
  { date: "2025-08", value: 247.5, label: "Août 2025" },
  { date: "2025-09", value: 247.8, label: "Septembre 2025" },
  { date: "2025-10", value: 248.1, label: "Octobre 2025" },
  { date: "2025-11", value: 248.4, label: "Novembre 2025" },
  { date: "2025-12", value: 248.7, label: "Décembre 2025" },
  { date: "2026-01", value: 248.9, label: "Janvier 2026" },
  { date: "2026-02", value: 249.0, label: "Février 2026" },
  { date: "2026-03", value: 249.0, label: "Mars 2026" },
  { date: "2026-04", value: 249.1, label: "Avril 2026" },
  { date: "2026-05", value: 249.5, label: "Mai 2026" },
  { date: "2026-06", value: 249.0, label: "Juin 2026 (I Actuel)" }
];
