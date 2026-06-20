import { WorkItem, MeasurementLine, ProjectDetails, IndexHistory, Worker } from "../types";

export const initialWorkItems: WorkItem[] = [
  { id: "item-1", code: "1.01", category: "I - GROS OEUVRE - ETANCHEITE", description: "Installation du chantier", unit: "Ens", unitPrice: 25000.00, contractQuantity: 1.0 },
  { id: "item-2", code: "1.02", category: "I - GROS OEUVRE - ETANCHEITE", description: "Etayage et renforcement de l'étayement existant", unit: "M2", unitPrice: 180.00, contractQuantity: 500.00 },
  { id: "item-3", code: "1.03", category: "I - GROS OEUVRE - ETANCHEITE", description: "Protection de plâtre sculpté", unit: "M2", unitPrice: 280.00, contractQuantity: 500.00 },
  { id: "item-4", code: "1.04", category: "I - GROS OEUVRE - ETANCHEITE", description: "Protection de bois sculpté/peint", unit: "M2", unitPrice: 350.00, contractQuantity: 1200.00 },
  { id: "item-5", code: "1.05", category: "I - GROS OEUVRE - ETANCHEITE", description: "Protection de Zellij sur mur & poteaux", unit: "M2", unitPrice: 220.00, contractQuantity: 300.00 },
  { id: "item-6", code: "1.06", category: "I - GROS OEUVRE - ETANCHEITE", description: "Protection de zellij/marbre sur sol", unit: "M2", unitPrice: 150.00, contractQuantity: 1500.00 },
  
  { id: "item-7", code: "2.01", category: "II - DEMOLITIONS & DEPOSES", description: "Démolition de murs en maçonnerie brique/pisé/pierre", unit: "M3", unitPrice: 350.00, contractQuantity: 30.00 },
  { id: "item-8", code: "2.02", category: "II - DEMOLITIONS & DEPOSES", description: "Démolition de murs en agglos ou brique creuse", unit: "M2", unitPrice: 90.00, contractQuantity: 100.00 },
  { id: "item-9", code: "2.04", category: "II - DEMOLITIONS & DEPOSES", description: "Décapage de revêtement Sol défectueux existant", unit: "M2", unitPrice: 110.00, contractQuantity: 500.00 },
  { id: "item-10", code: "2.05", category: "II - DEMOLITIONS & DEPOSES", description: "Décapage de revêtement du plancher haut", unit: "M2", unitPrice: 140.00, contractQuantity: 900.00 },
  { id: "item-11", code: "2.07", category: "II - DEMOLITIONS & DEPOSES", description: "Dépose tuiles vertes détériorées", unit: "M2", unitPrice: 130.00, contractQuantity: 600.00 },
  { id: "item-12", code: "2.08", category: "II - DEMOLITIONS & DEPOSES", description: "Dépose de descente d'eau pluviale/usées", unit: "ML", unitPrice: 70.00, contractQuantity: 100.00 },
  { id: "item-13", code: "2.09", category: "II - DEMOLITIONS & DEPOSES", description: "Dépose de planchers en bois de cèdre défectueux", unit: "M2", unitPrice: 150.00, contractQuantity: 500.00 },
  { id: "item-14", code: "2.10", category: "II - DEMOLITIONS & DEPOSES", description: "Dépose de poutres en madriers raboutées", unit: "ML", unitPrice: 220.00, contractQuantity: 20.00 },
  { id: "item-15", code: "2.12", category: "II - DEMOLITIONS & DEPOSES", description: "Dépose revêtement mural lizar déteriroré de bois cèdre", unit: "M2", unitPrice: 120.00, contractQuantity: 100.00 },
  { id: "item-16", code: "2.23", category: "II - DEMOLITIONS & DEPOSES", description: "Dépose de profilés métallique de toutes natures", unit: "ML", unitPrice: 90.00, contractQuantity: 50.00 },
  
  { id: "item-17", code: "3.01", category: "III - INFASTRUCTURES & FONDATIONS", description: "Fouilles en tranchées/rigoles en tous terrains", unit: "M3", unitPrice: 120.00, contractQuantity: 900.00 },
  { id: "item-18", code: "3.02", category: "III - INFASTRUCTURES & FONDATIONS", description: "Mise en remblai ou évacuation des déblais", unit: "M3", unitPrice: 60.00, contractQuantity: 400.00 },
  { id: "item-19", code: "3.03", category: "III - INFASTRUCTURES & FONDATIONS", description: "Gros béton de fondation et reprise sous-œuvre", unit: "M3", unitPrice: 850.00, contractQuantity: 300.00 },
  { id: "item-20", code: "3.04", category: "III - INFASTRUCTURES & FONDATIONS", description: "Béton de propreté dosé sous semelle", unit: "M3", unitPrice: 750.00, contractQuantity: 10.00 },
  { id: "item-21", code: "3.05", category: "III - INFASTRUCTURES & FONDATIONS", description: "Béton armé en fondation d'infrastructure", unit: "M3", unitPrice: 4200.00, contractQuantity: 50.00 },
  { id: "item-22", code: "3.06", category: "III - INFASTRUCTURES & FONDATIONS", description: "Maçonnerie de moellons en fondation", unit: "M3", unitPrice: 700.00, contractQuantity: 40.00 },
  { id: "item-23", code: "3.07", category: "III - INFASTRUCTURES & FONDATIONS", description: "Réfection maçonnée brique pleine traditionnelle", unit: "M3", unitPrice: 1600.00, contractQuantity: 5.00 },
  
  { id: "item-24", code: "5.04", category: "IV - SECTIONS ASSAINISSEMENTS", description: "Regards de visite 40x40 cm", unit: "U", unitPrice: 450.00, contractQuantity: 15.00 },
  { id: "item-25", code: "5.05", category: "IV - SECTIONS ASSAINISSEMENTS", description: "Regards de visite 60x60 cm", unit: "U", unitPrice: 650.00, contractQuantity: 30.00 },
  { id: "item-26", code: "5.06", category: "IV - SECTIONS ASSAINISSEMENTS", description: "Regards de visite 80x80 cm", unit: "U", unitPrice: 950.00, contractQuantity: 10.00 },
  { id: "item-27", code: "5.07", category: "IV - SECTIONS ASSAINISSEMENTS", description: "Regards de visite 100x100 cm", unit: "U", unitPrice: 1400.00, contractQuantity: 5.00 },
  { id: "item-28", code: "5.09", category: "IV - SECTIONS ASSAINISSEMENTS", description: "Caniveau en béton armé de 0,30 x 0,30 m", unit: "ML", unitPrice: 380.00, contractQuantity: 20.00 },
  { id: "item-29", code: "5.10", category: "IV - SECTIONS ASSAINISSEMENTS", description: "Canalisation d'évacuation en PVC Ø 200", unit: "ML", unitPrice: 220.00, contractQuantity: 300.00 },
  { id: "item-30", code: "5.11", category: "IV - SECTIONS ASSAINISSEMENTS", description: "Canalisation d'évacuation en PVC Ø 300", unit: "ML", unitPrice: 320.00, contractQuantity: 200.00 },
  
  { id: "item-31", code: "6.01", category: "V - MACONNERIE & COUPOLES", description: "Béton d'élévation pour superstructure", unit: "M3", unitPrice: 4500.00, contractQuantity: 5.00 },
  { id: "item-32", code: "6.02a", category: "V - MACONNERIE & COUPOLES", description: "Fourniture de tige métallique C35", unit: "KG", unitPrice: 45.00, contractQuantity: 150.00 },
  { id: "item-33", code: "6.02b", category: "V - MACONNERIE & COUPOLES", description: "Boulonnerie d'éléments de structures profilés", unit: "KG", unitPrice: 38.00, contractQuantity: 2000.00 },
  { id: "item-34", code: "6.03", category: "V - MACONNERIE & COUPOLES", description: "Traitement support béton armé", unit: "M2", unitPrice: 220.00, contractQuantity: 50.00 },
  { id: "item-35", code: "6.04a", category: "V - MACONNERIE & COUPOLES", description: "Réfection consolidation en maçonnerie de briques", unit: "M3", unitPrice: 1900.00, contractQuantity: 250.00 },
  { id: "item-36", code: "6.04b", category: "V - MACONNERIE & COUPOLES", description: "Fourniture/pose briques pleines traditionnelles", unit: "M3", unitPrice: 2100.00, contractQuantity: 30.00 },
  { id: "item-37", code: "6.05", category: "V - MACONNERIE & COUPOLES", description: "Consolidation murs en maçonnerie en pisé", unit: "M3", unitPrice: 1200.00, contractQuantity: 100.00 },
  { id: "item-38", code: "6.06a", category: "V - MACONNERIE & COUPOLES", description: "Préparation des faces d'élévation murailles", unit: "M2", unitPrice: 35.00, contractQuantity: 8000.00 },
  { id: "item-39", code: "6.06b", category: "V - MACONNERIE & COUPOLES", description: "Restauration rejointoiement faces des murailles", unit: "M2", unitPrice: 65.00, contractQuantity: 3000.00 },
  
  { id: "item-40", code: "7.01", category: "VI - ENDUITS & REVETEMENTS", description: "Remblai de terre tamisée sous plate-forme", unit: "M3", unitPrice: 150.00, contractQuantity: 50.00 },
  { id: "item-41", code: "7.04", category: "VI - ENDUITS & REVETEMENTS", description: "Forme en béton 14 cm sous zellij avec grillage", unit: "M2", unitPrice: 130.00, contractQuantity: 100.00 },
  { id: "item-42", code: "7.05a", category: "VI - ENDUITS & REVETEMENTS", description: "Application d'enduit de dressage traditionnel", unit: "M2", unitPrice: 75.00, contractQuantity: 1500.00 },
  { id: "item-43", code: "7.05b", category: "VI - ENDUITS & REVETEMENTS", description: "Couche d'enduit traditionnel de finition mural", unit: "M2", unitPrice: 90.00, contractQuantity: 100.00 },
  { id: "item-44", code: "7.06a", category: "VI - ENDUITS & REVETEMENTS", description: "Restauration Tadallakt naturel", unit: "M2", unitPrice: 350.00, contractQuantity: 10.00 },
  { id: "item-45", code: "7.06d", category: "VI - ENDUITS & REVETEMENTS", description: "Enduit décoratif Tadallakt jointé de couleur", unit: "M2", unitPrice: 420.00, contractQuantity: 10.00 },
  { id: "item-46", code: "7.09", category: "VI - ENDUITS & REVETEMENTS", description: "Enduit en plâtre lisse sur mur traditionnel", unit: "M2", unitPrice: 110.00, contractQuantity: 300.00 },
  { id: "item-47", code: "7.11", category: "VI - ENDUITS & REVETEMENTS", description: "Socles en Carrare pour pivots", unit: "U", unitPrice: 850.00, contractQuantity: 5.00 },
  { id: "item-48", code: "7.12a", category: "VI - ENDUITS & REVETEMENTS", description: "Siphon cour perforé en marbre Carrare", unit: "U", unitPrice: 600.00, contractQuantity: 5.00 },
  { id: "item-49", code: "7.14a", category: "VI - ENDUITS & REVETEMENTS", description: "Réfection / pose tuiles vertes vernissées", unit: "M2", unitPrice: 450.00, contractQuantity: 20.00 },
  { id: "item-50", code: "7.16", category: "VI - ENDUITS & REVETEMENTS", description: "Restauration sol marbre & zellige Baznaki", unit: "M2", unitPrice: 600.00, contractQuantity: 80.00 },
  { id: "item-51", code: "7.17d", category: "VI - ENDUITS & REVETEMENTS", description: "Restauration sol Mjadaj blaktib walkhatam", unit: "M2", unitPrice: 680.00, contractQuantity: 10.00 },
  { id: "item-52", code: "7.17j", category: "VI - ENDUITS & REVETEMENTS", description: "Restauration sol Mrabe Blaktib Walbouchoune", unit: "M2", unitPrice: 720.00, contractQuantity: 10.00 },
  { id: "item-53", code: "7.20a", category: "VI - ENDUITS & REVETEMENTS", description: "Reprise ou F,P sol en Mdoudab traditionnel", unit: "M2", unitPrice: 580.00, contractQuantity: 120.00 },
  { id: "item-54", code: "7.20e", category: "VI - ENDUITS & REVETEMENTS", description: "Restauration sol Kora Balbouchoune", unit: "M2", unitPrice: 640.00, contractQuantity: 20.00 },
  { id: "item-55", code: "7.20j", category: "VI - ENDUITS & REVETEMENTS", description: "Restauration sol Mrabe Blaktib", unit: "M2", unitPrice: 590.00, contractQuantity: 10.00 },
  { id: "item-56", code: "7.22b", category: "VI - ENDUITS & REVETEMENTS", description: "Marches/contre marches en zellij Mdoudab", unit: "ML", unitPrice: 400.00, contractQuantity: 100.00 },
  { id: "item-57", code: "7.23a", category: "VI - ENDUITS & REVETEMENTS", description: "Restauration complète de cheminée traditionnelle", unit: "Ens", unitPrice: 15000.00, contractQuantity: 2.0 },
  { id: "m-7-25a", code: "7.25a", category: "VI - ENDUITS, PEINTURES & DECORS", description: "Nettoyage du plâtre sculpté traditionnel", unit: "M2", unitPrice: 120.00, contractQuantity: 50.0 },
  { id: "m-7-25b", code: "7.25b", category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE", description: "Restauration plâtre sculptes en floral ou géométrique", unit: "M2", unitPrice: 380.00, contractQuantity: 30.0 },
  { id: "item-11", code: "8.04", category: "01 - GROS OEUVRE-REVETEMENT-ETANCHEITE", description: "Fourniture et pose de gargouille plomb et crapaudine.", unit: "U", unitPrice: 1500.00, contractQuantity: 10.0 },
  { id: "item-12", code: "9.03", category: "09 - MENUISERIE & RESTAURATION BOIS", description: "Restauration des portes d'entrées traditionnelles à panneaux.", unit: "M2", unitPrice: 1200.00, contractQuantity: 20.0 },
  { id: "item-13", code: "9.07", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Fourniture et pose porte panneaux en bois de cèdre massif.", unit: "M2", unitPrice: 2200.00, contractQuantity: 30.0 },
  { id: "item-14b", code: "9.13a", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Nettoyage fenêtres ouvrants coulissants cèdre", unit: "M2", unitPrice: 350.00, contractQuantity: 15.0 },
  { id: "item-14c", code: "9.13b", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Restauration fenêtres ouvrants coulissants cèdre", unit: "M2", unitPrice: 1400.00, contractQuantity: 15.0 },
  { id: "item-15b", code: "9.21", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Restauration peinte décorative dégradée coupole", unit: "M2", unitPrice: 2500.00, contractQuantity: 12.0 },
  { id: "item-16b", code: "9.22a", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Coupole principale : Dépose et F,P plancher", unit: "M2", unitPrice: 1600.00, contractQuantity: 200.0 },
  { id: "item-16c", code: "9.22c", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Coupole principale : Restauration de lizar", unit: "M2", unitPrice: 2800.00, contractQuantity: 50.0 },
  { id: "item-17b", code: "9.23a", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Coupole Si Moussa : Dépose et F,P plancher/étanchéité", unit: "M2", unitPrice: 1600.00, contractQuantity: 30.0 },
  { id: "item-17c", code: "9.23b", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Coupole Si Moussa : Restauration structures bois peints", unit: "M2", unitPrice: 3200.00, contractQuantity: 35.0 },
  { id: "item-17d", code: "9.23c", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Coupole Si Moussa : Fourniture Lizar peint dégradé", unit: "M2", unitPrice: 2800.00, contractQuantity: 35.0 },
  { id: "item-18b", code: "9.25", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Reprise plafond peint traditionnel à caisson bois de cèdre", unit: "M2", unitPrice: 4500.00, contractQuantity: 50.0 },
  { id: "item-19b", code: "9.26", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Restauration structures de poutres consoles et madriers", unit: "M3", unitPrice: 18000.00, contractQuantity: 10.0 },
  { id: "item-20b", code: "9.30", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Restauration cadre cèdre et ferronnerie fer forgé", unit: "M2", unitPrice: 1200.00, contractQuantity: 5.0 },
  { id: "item-20c", code: "9.31", category: "09 - MENUISERIE WOOD & FERRONNERIE", description: "Fourniture cadre cèdre et grilles fer forgé", unit: "M2", unitPrice: 2200.00, contractQuantity: 5.0 },
  
  { id: "item-21b", code: "10.01", category: "10 - PLOMBERIE ET FONDATIONS", description: "Conduite alimentation en PPR diam 25 encastrée", unit: "ML", unitPrice: 150.00, contractQuantity: 50.0 },
  { id: "item-21c", code: "10.03", category: "10 - PLOMBERIE ET SANITAIRES", description: "Collecteur en PPR DIAM 32 à 4 départs", unit: "U", unitPrice: 850.00, contractQuantity: 5.0 },
  { id: "item-22b", code: "10.1", category: "10 - PLOMBERIE ET SANITAIRES", description: "Vanne d'arrêt laiton filetée diam 40/49", unit: "U", unitPrice: 450.00, contractQuantity: 10.0 },
  { id: "item-22c", code: "10.11", category: "10 - PLOMBERIE ET SANITAIRES", description: "Conduite PEHD évacuation diam 50", unit: "ML", unitPrice: 140.00, contractQuantity: 50.0 },
  { id: "item-23b", code: "10.18", category: "10 - PLOMBERIE ET SANITAIRES", description: "WC complet à l'anglaise porcelaine blanche silencieux", unit: "U", unitPrice: 2200.00, contractQuantity: 10.0 },
  { id: "item-24b", code: "10.22b", category: "10 - PLOMBERIE ET SANITAIRES", description: "Descente EP/EU en CPVC diam 125", unit: "ML", unitPrice: 180.00, contractQuantity: 15.0 },
  { id: "item-24c", code: "10.22c", category: "10 - PLOMBERIE ET SANITAIRES", description: "Descente EP/EU en CPVC diam 160", unit: "ML", unitPrice: 220.00, contractQuantity: 30.0 },
  { id: "item-24d", code: "10.22d", category: "10 - PLOMBERIE ET SANITAIRES", description: "Descente EP/EU en CPVC diam 200", unit: "ML", unitPrice: 290.00, contractQuantity: 20.0 },
  
  { id: "item-25b", code: "11.03", category: "11 - ELECTRICITE", description: "Pose fourreaux conduit tirage PVC D110", unit: "ML", unitPrice: 120.00, contractQuantity: 700.0 },
  { id: "item-26b", code: "11.12", category: "11 - ELECTRICITE", description: "Lustrerie style traditionnel en bronze 25 kg", unit: "U", unitPrice: 12000.00, contractQuantity: 5.0 },
  
  { id: "item-27b", code: "12.01", category: "12 - AMENAGEMENT PAYSAGER", description: "Espaces verts et préparation des terres", unit: "M2", unitPrice: 90.00, contractQuantity: 1000.0 },
  
  { id: "item-28b", code: "13.06a", category: "13 - DIVERS & FINITIONS", description: "Peinture vinylique sur murs", unit: "M2", unitPrice: 40.00, contractQuantity: 3000.0 },
  { id: "item-28c", code: "13.06b", category: "13 - DIVERS & FINITIONS", description: "Peinture glycérophtalique sur métaux/bois", unit: "M2", unitPrice: 60.00, contractQuantity: 400.0 },
  { id: "item-28d", code: "13.06c", category: "13 - DIVERS & FINITIONS", description: "Vernis lizar bois de cèdre", unit: "M2", unitPrice: 65.00, contractQuantity: 400.0 }
];

export const initialMeasurementLines: MeasurementLine[] = [
  // 1.01 Installation du chantier
  { id: "m-1-1", itemId: "item-1", label: "Installation générale de base", coefficient: 1, length: 0.4, computedValue: 0.4 },

  // 1.02 Etayage (Sum: 495.69)
  { id: "m-2-1", itemId: "item-2", label: "Plafond d'entrée principale", coefficient: 1, length: 10.70, height: 2.88, computedValue: 30.82 },
  { id: "m-2-2", itemId: "item-2", label: "Chambres latérales", coefficient: 2, length: 2.50, height: 2.74, computedValue: 13.68 },
  { id: "m-2-3", itemId: "item-2", label: "Grand qoba droite", coefficient: 1, length: 15.10, height: 4.80, computedValue: 72.48 },
  { id: "m-2-4", itemId: "item-2", label: "Salle d'honneur principale", coefficient: 1, length: 21.70, height: 6.90, computedValue: 149.73 },
  { id: "m-2-5", itemId: "item-2", label: "Grande cour en marbre", coefficient: 1, length: 36.00, height: 3.40, computedValue: 122.40 },
  { id: "m-2-6", itemId: "item-2", label: "Autres structures historiques", coefficient: 1, length: 1, height: 106.58, computedValue: 106.58 },

  // 1.03 Plâtre sculpté (Sum: 204.91)
  { id: "m-3-1", itemId: "item-3", label: "Qoba droite entrée principale", coefficient: 1, length: 2.78, width: 0.20, computedValue: 0.56 },
  { id: "m-3-2", itemId: "item-3", label: "Murs et cadres décoratifs", coefficient: 1, length: 10.60, width: 0.20, computedValue: 2.12 },
  { id: "m-3-3", itemId: "item-3", label: "Plâtres sculptés floraux", coefficient: 1, length: 1, width: 202.23, computedValue: 202.23 },

  // 1.04 Protection de bois sculpté (Sum: 1076.35)
  { id: "m-4-1", itemId: "item-4", label: "Porte d'entrée cèdre massif", coefficient: 2, length: 3.23, width: 4.90, computedValue: 31.65 },
  { id: "m-4-2", itemId: "item-4", label: "Plafonniers et poutres cèdre", coefficient: 1, length: 1, width: 1044.70, computedValue: 1044.70 },

  // 1.05 Protection de Zellij sur mur (Sum: 234.78)
  { id: "m-5-1", itemId: "item-5", label: "Grand Qoba droite - zellij mural", coefficient: 1, length: 15.10, width: 1.64, computedValue: 24.76 },
  { id: "m-5-2", itemId: "item-5", label: "Autres zellij muraux et poteaux", coefficient: 1, length: 1, width: 210.02, computedValue: 210.02 },

  // 1.06 Protection zellij/marbre sur sol (Sum: 1391.11)
  { id: "m-6-1", itemId: "item-6", label: "Sol Grande cour marbre", coefficient: 1, length: 7.42, width: 23.45, computedValue: 174.00 },
  { id: "m-6-2", itemId: "item-6", label: "Patios et galeries traditionnels", coefficient: 1, length: 1, width: 1217.11, computedValue: 1217.11 },

  // 2.01 Démolition briques (Sum: 22.24)
  { id: "m-7-1", itemId: "item-7", label: "Travaux généraux démolition", coefficient: 1, length: 1, width: 22.24, computedValue: 22.24 },

  // 2.02 Démolition agglos (Sum: 73.89)
  { id: "m-8-1", itemId: "item-8", label: "Agglos et cloisons divers", coefficient: 1, length: 1, width: 73.89, computedValue: 73.89 },

  // 2.04 Décapage sol (Sum: 416.00)
  { id: "m-9-1", itemId: "item-9", label: "Décapage sol WC direction", coefficient: 1, length: 4.80, width: 3.40, computedValue: 16.32 },
  { id: "m-9-2", itemId: "item-9", label: "Décapage divers patios", coefficient: 1, length: 1, width: 399.68, computedValue: 399.68 },

  // 2.05 Décapage plancher haut (Sum: 821.84)
  { id: "m-10-1", itemId: "item-10", label: "Charpente supérieure salle d'honneur", coefficient: 2, length: 19.60, width: 6.80, computedValue: 266.56 },
  { id: "m-10-2", itemId: "item-10", label: "Autres toits et planchers", coefficient: 1, length: 1, width: 555.28, computedValue: 555.28 },

  // 2.07 Dépose tuiles (Sum: 548.96)
  { id: "m-11-1", itemId: "item-11", label: "Toit Grande cour marbre", coefficient: 1, length: 47.20, width: 4.15, computedValue: 195.88 },
  { id: "m-11-2", itemId: "item-11", label: "Autres qobas et couloirs", coefficient: 1, length: 1, width: 353.08, computedValue: 353.08 },

  // 2.08 Dépose descentes d'eau (Sum: 87.70)
  { id: "m-12-1", itemId: "item-12", label: "Canalisation grand jardin", coefficient: 1, length: 54.60, computedValue: 54.60 },
  { id: "m-12-2", itemId: "item-12", label: "Autres descentes EP/EU", coefficient: 1, length: 33.10, computedValue: 33.10 },

  // 2.09 Dépose planchers bois cèdre (Sum: 442.86)
  { id: "m-13-1", itemId: "item-13", label: "Planchers cèdre défectueux", coefficient: 1, length: 442.86, computedValue: 442.86 },

  // 2.10 Dépose poutres madriers (Sum: 15.70)
  { id: "m-14-1", itemId: "item-14", label: "Linteaux fenêtres Riad", coefficient: 3, length: 3.14, computedValue: 9.42 },
  { id: "m-14-2", itemId: "item-14", label: "Poutres diverses", coefficient: 2, length: 3.14, computedValue: 6.28 },

  // 2.12 Dépose lizar bois cèdre (Sum: 91.92)
  { id: "m-15-1", itemId: "item-15", label: "Dépose lizar cèdre", coefficient: 1, length: 91.92, computedValue: 91.92 },

  // 2.23 Dépose de profilés (Sum: 40.25)
  { id: "m-16-1", itemId: "item-16", label: "Profilés métalliques", coefficient: 1, length: 40.25, computedValue: 40.25 },

  // 3.01 Fouilles en tranchées (Sum: 860.32)
  { id: "m-17-1", itemId: "item-17", label: "Fouilles terrassements", coefficient: 1, length: 860.32, computedValue: 860.32 },

  // 3.02 Mise en remblai (Sum: 391.22)
  { id: "m-18-1", itemId: "item-18", label: "Remblaiement", coefficient: 1, length: 391.22, computedValue: 391.22 },

  // 3.03 Gros béton (Sum: 265.13)
  { id: "m-19-1", itemId: "item-19", label: "Gros béton", coefficient: 1, length: 265.13, computedValue: 265.13 },

  // 3.04 Béton de propreté (Sum: 7.83)
  { id: "m-20-1", itemId: "item-20", label: "Béton de propreté", coefficient: 1, length: 7.83, computedValue: 7.83 },

  // 3.05 Béton armé infrastructure (Sum: 47.92)
  { id: "m-21-1", itemId: "item-21", label: "Béton armé d'infrastructure", coefficient: 1, length: 47.92, computedValue: 47.92 },

  // 3.06 Maçonnerie moellons (Sum: 36.54)
  { id: "m-22-1", itemId: "item-22", label: "Maçonnerie moellons", coefficient: 1, length: 36.54, computedValue: 36.54 },

  // 3.07 Maçonnerie brique pleine (Sum: 4.68)
  { id: "m-23-1", itemId: "item-23", label: "Maçonnerie briques pleines", coefficient: 1, length: 4.68, computedValue: 4.68 },

  // Regards de visite
  { id: "m-24-1", itemId: "item-24", label: "Regards 40x40 cm", coefficient: 1, length: 12.00, computedValue: 12.00 },
  { id: "m-25-1", itemId: "item-25", label: "Regards 60x60 cm", coefficient: 1, length: 26.00, computedValue: 26.00 },
  { id: "m-26-1", itemId: "item-26", label: "Regards 80x80 cm", coefficient: 1, length: 5.00, computedValue: 5.00 },
  { id: "m-27-1", itemId: "item-27", label: "Regards 100x100 cm", coefficient: 1, length: 3.00, computedValue: 3.00 },
  { id: "m-28-1", itemId: "item-28", label: "Caniveau béton armé 30x30", coefficient: 1, length: 16.79, computedValue: 16.79 },
  { id: "m-29-1", itemId: "item-29", label: "Canalisation PVC Ø 200", coefficient: 1, length: 254.90, computedValue: 254.90 },
  { id: "m-30-1", itemId: "item-30", label: "Canalisation PVC Ø 300", coefficient: 1, length: 175.90, computedValue: 175.90 },

  // Structure et consolidation
  { id: "m-31-1", itemId: "item-31", label: "Béton armé élévation", coefficient: 1, length: 0.28, computedValue: 0.28 },
  { id: "m-32-1", itemId: "item-32", label: "Tiges d'ancrage XC38", coefficient: 1, length: 107.79, computedValue: 107.79 },
  { id: "m-33-1", itemId: "item-33", label: "Profilés métalliques", coefficient: 1, length: 1629.63, computedValue: 1629.63 },
  { id: "m-34-1", itemId: "item-34", label: "Traitement support béton", coefficient: 1, length: 17.35, computedValue: 17.35 },
  { id: "m-35-1", itemId: "item-35", label: "Réfection briques", coefficient: 1, length: 196.80, computedValue: 196.80 },
  { id: "m-36-1", itemId: "item-36", label: "F,P de briques pleines", coefficient: 1, length: 12.78, computedValue: 12.78 },
  { id: "m-37-1", itemId: "item-37", label: "Consolidation maçonnerie pisé", coefficient: 1, length: 72.74, computedValue: 72.74 },
  { id: "m-38-1", itemId: "item-38", label: "Préparation des murailles", coefficient: 1, length: 7215.21, computedValue: 7215.21 },
  { id: "m-39-1", itemId: "item-39", label: "Finition des murailles", coefficient: 1, length: 2764.64, computedValue: 2764.64 },

  // Revetement et finitions
  { id: "m-40-1", itemId: "item-40", label: "Remblai tamisé compacté", coefficient: 1, length: 30.05, computedValue: 30.05 },
  { id: "m-41-1", itemId: "item-41", label: "Forme béton 14 cm", coefficient: 1, length: 76.02, computedValue: 76.02 },
  { id: "m-42-1", itemId: "item-42", label: "Enduit de dressage", coefficient: 1, length: 1109.53, computedValue: 1109.53 },
  { id: "m-43-1", itemId: "item-43", label: "Finis d'enduits de couche de finition", coefficient: 1, length: 66.93, computedValue: 66.93 },
  { id: "m-44-1", itemId: "item-44", label: "Tadallakt naturel", coefficient: 1, length: 0.36, computedValue: 0.36 },
  { id: "m-45-1", itemId: "item-45", label: "Tadallakt jointé de couleur", coefficient: 1, length: 3.52, computedValue: 3.52 },
  { id: "m-46-1", itemId: "item-46", label: "Enduit plâtre lisse y/c peinture", coefficient: 1, length: 235.60, computedValue: 235.60 },
  { id: "m-47-1", itemId: "item-47", label: "Socles pivot bas portails", coefficient: 1, length: 2.00, computedValue: 2.00 },
  { id: "m-48-1", itemId: "item-48", label: "Siphon cour marbre Carrare", coefficient: 1, length: 3.00, computedValue: 3.00 },
  { id: "m-49-1", itemId: "item-49", label: "Remplacement tuiles vernissées", coefficient: 1, length: 9.40, computedValue: 9.40 },
  { id: "m-50-1", itemId: "item-50", label: "Restauration sol marbre", coefficient: 1, length: 35.10, computedValue: 35.10 },
  { id: "m-51-1", itemId: "item-51", label: "Restauration Mjadaj blaktib", coefficient: 1, length: 2.05, computedValue: 2.05 },
  { id: "m-52-1", itemId: "item-52", label: "Restauration Mrabe Blaktib", coefficient: 1, length: 1.93, computedValue: 1.93 },
  { id: "m-53-1", itemId: "item-53", label: "Reprise sol zellige Mdoudab", coefficient: 1, length: 94.93, computedValue: 94.93 },
  { id: "m-54-1", itemId: "item-54", label: "Restauration sol Kora", coefficient: 1, length: 15.19, computedValue: 15.19 },
  { id: "m-55-1", itemId: "item-55", label: "Restauration sol Mrabe", coefficient: 1, length: 1.41, computedValue: 1.41 },
  { id: "m-56-1", itemId: "item-56", label: "Marches/contre marches Mdoudab", coefficient: 1, length: 73.35, computedValue: 73.35 },
  { id: "m-57-1", itemId: "item-57", label: "Cheminée traditionnelle", coefficient: 1, length: 1.00, computedValue: 1.00 },
  
  // Plâtre et peintures
  { id: "m-7-25-1", itemId: "m-7-25a", label: "Nettoyage plâtre sculpté", coefficient: 1, length: 23.19, computedValue: 23.19 },
  { id: "m-7-25-2", itemId: "m-7-25b", label: "Restauration plâtre sculpté floral", coefficient: 1, length: 2.56, computedValue: 2.56 },
  { id: "m-8-04", itemId: "item-11", label: "Gargouille en plomb", coefficient: 1, length: 5.00, computedValue: 5.00 },
  
  // Menuiseries
  { id: "m-9-3", itemId: "item-15", label: "Dépose revêtement lizar cèdre", coefficient: 1, length: 91.92, computedValue: 91.92 },
  { id: "m-9-30", itemId: "item-73", label: "Restauration de cadre cèdre", coefficient: 1, length: 0.64, computedValue: 0.64 },
  { id: "m-9-31", itemId: "item-74", label: "Frame et grille de protection fer", coefficient: 1, length: 0.90, computedValue: 0.90 },
  { id: "m-9-13a", itemId: "item-63", label: "Nettoyage fenêtres coulissantes cèdre", coefficient: 1, length: 3.29, computedValue: 3.29 },
  { id: "m-9-13b", itemId: "item-64", label: "Restauration fenêtres coulissantes cèdre", coefficient: 1, length: 3.29, computedValue: 3.29 },
  { id: "m-9-21D", itemId: "item-65", label: "Restauration lizar peint décoratif", coefficient: 1, length: 12.50, computedValue: 12.50 },
  { id: "m-9-22a", itemId: "item-66", label: "Dépose et F,P coupole", coefficient: 1, length: 154.00, computedValue: 154.00 },
  { id: "m-9-22c", itemId: "item-67", label: "Restauration de lizar", coefficient: 1, length: 33.00, computedValue: 33.00 },
  { id: "m-9-23a", itemId: "item-68", label: "Coupole Si Moussa : Dépose", coefficient: 1, length: 11.69, computedValue: 11.69 },
  { id: "m-9-23b", itemId: "item-69", label: "Coupole Si Moussa : Restauration bois", coefficient: 1, length: 21.66, computedValue: 21.66 },
  { id: "m-9-23c", itemId: "item-70", label: "Coupole Si Moussa : pose Lizar", coefficient: 1, length: 22.65, computedValue: 22.65 },
  { id: "m-9-25", itemId: "item-71", label: "Plancher en cèdre peint", coefficient: 1, length: 29.96, computedValue: 29.96 },
  { id: "m-9-26", itemId: "item-72", label: "Restauration de poutres consoles", coefficient: 1, length: 6.76, computedValue: 6.76 },
  
  // Plomberies
  { id: "m-10-01a", itemId: "item-21b", label: "Conduite PPR diam 25", coefficient: 1, length: 38.60, computedValue: 38.60 },
  { id: "m-10-03", itemId: "item-21c", label: "Collecteur d'alimentation", coefficient: 1, length: 2.00, computedValue: 2.00 },
  { id: "m-10-1", itemId: "item-22b", label: "Vanne d'arrêt diam 40/49", coefficient: 1, length: 2.00, computedValue: 2.00 },
  { id: "m-10-11d", itemId: "item-22c", label: "Conduite PEHD diam 50", coefficient: 1, length: 20.80, computedValue: 20.80 },
  { id: "m-10-18", itemId: "item-23b", label: "WC porcelaine blanc anglais", coefficient: 1, length: 6.00, computedValue: 6.00 },
  { id: "m-10-22b", itemId: "item-24b", label: "Descente EP/EU CPVC diam 125", coefficient: 1, length: 2.90, computedValue: 2.90 },
  { id: "m-10-22c", itemId: "item-24c", label: "Descente EP/EU CPVC diam 160", coefficient: 1, length: 22.30, computedValue: 22.30 },
  { id: "m-10-22d", itemId: "item-24d", label: "Descente EP/EU CPVC diam 200", coefficient: 1, length: 17.10, computedValue: 17.10 },
  
  // Tirage & Paysage
  { id: "m-11-03", itemId: "item-25b", label: "Conduit tirage PVC D110", coefficient: 1, length: 624.50, computedValue: 624.50 },
  { id: "m-11-12", itemId: "item-26b", label: "Lustres bronze 25 kg", coefficient: 1, length: 3.00, computedValue: 3.00 },
  { id: "m-12-01", itemId: "item-27b", label: "Aménagement d'espaces verts", coefficient: 1, length: 663.72, computedValue: 663.72 },
  
  // Finitions
  { id: "m-13-06a", itemId: "item-28b", label: "Ravalement de peinture vinylique", coefficient: 1, length: 0.00, computedValue: 0.00 },
  { id: "m-13-06b", itemId: "item-28c", label: "Peinture glycérophtalique", coefficient: 1, length: 0.00, computedValue: 0.00 },
  { id: "m-13-06c", itemId: "item-28d", label: "Vernis de protection cèdre", coefficient: 1, length: 19.95, computedValue: 19.95 }
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

export const initialWorkers: Worker[] = [
  { id: "W1", name: "HASSAN SAHOUAK", cin: "E572138", role: "Maâlem Tapisseur", dailyRate: 150, phone: "+212 611 123 456" },
  { id: "W2", name: "ALI ELHDILI", cin: "PB51721", role: "Maçon traditionnel", dailyRate: 140, phone: "+212 622 234 567" },
  { id: "W3", name: "YASSINE ERRAISSI", cin: "", role: "Maçon Zelligeur", dailyRate: 150, phone: "+212 633 345 678" },
  { id: "W4", name: "MOHMAD TADGHOUT", cin: "IC67853", role: "Maçon traditionnel", dailyRate: 140, phone: "+212 612 345 678" },
  { id: "W5", name: "ALI BNICHOU", cin: "PB101378", role: "Maçon Plâtrier", dailyRate: 150, phone: "+212 644 456 789" },
  { id: "W6", name: "MOHAMED MESSAOUDI", cin: "P156816", role: "Charpentier", dailyRate: 200, phone: "+212 655 567 890" },
  { id: "W7", name: "Mohmed bel madani", cin: "PA13900", role: "Charpentier", dailyRate: 150, phone: "+212 666 678 901" },
  { id: "W8", name: "MOUAD FARHANE", cin: "E621606", role: "Maçon Plâtrier", dailyRate: 200, phone: "+212 677 789 012" },
  { id: "W9", name: "ABDELKABIR JIDOUR", cin: "N299469", role: "Ouvrier qualifié", dailyRate: 135, phone: "+212 671 234 567" },
  { id: "W10", name: "ISMAIL HEBLAOUI", cin: "PA214421", role: "Maçon traditionnel", dailyRate: 140, phone: "+212 672 345 678" },
  { id: "W11", name: "ANAS CHAHBOUN", cin: "VA134042", role: "Ouvrier qualifié", dailyRate: 135, phone: "+212 673 456 789" },
  { id: "W12", name: "HARCHAOUI MOHMED", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W13", name: "KHALID ABOUAALI", cin: "E773689", role: "Ouvrier qualifié", dailyRate: 120, phone: "+212 688 890 123" },
  { id: "W14", name: "ALI OUHMAD", cin: "IB223133", role: "Ouvrier qualifié", dailyRate: 135, phone: "+212 674 567 890" },
  { id: "W15", name: "MEHDI FERHANE", cin: "", role: "Manœuvre", dailyRate: 130, phone: "+212 699 901 234" },
  { id: "W16", name: "ABDERAHMANE FERHAN", cin: "", role: "Manœuvre", dailyRate: 110, phone: "+212 610 012 345" },
  { id: "W17", name: "ALI BELKASSI", cin: "", role: "Maçon Plâtrier", dailyRate: 150, phone: "+212 620 123 456" },
  { id: "W18", name: "LEHCEN EL BAZE", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W19", name: "ABDERRAHMANE OULKHIR", cin: "IC211468", role: "Ouvrier qualifié", dailyRate: 135, phone: "" },
  { id: "W20", name: "LEHCEN LKHER", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W21", name: "OUHTOUSS ABDERAHMAN", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W22", name: "BASSOU OUSSOU", cin: "PA129630", role: "Ouvrier qualifié", dailyRate: 135, phone: "" },
  { id: "W23", name: "MUSTAPHA EL HACHIMI", cin: "PA80631", role: "Manœuvre", dailyRate: 110, phone: "+212 630 234 567" },
  { id: "W24", name: "ABDERAHMMAN AIT ALI", cin: "PA109362", role: "Manœuvre", dailyRate: 130, phone: "+212 640 345 678" },
  { id: "W25", name: "ABDENBI HIMMI", cin: "I592603", role: "Ouvrier qualifié", dailyRate: 135, phone: "" },
  { id: "W26", name: "HASSAN ZAAZAA", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W27", name: "MOHMED FASKA", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W28", name: "HATIM MUSTAPHA", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W29", name: "MUSTAPHA DIHA", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W30", name: "SAID OUKBIB", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W31", name: "MOHAMED OUABID", cin: "PB130661", role: "Ouvrier qualifié", dailyRate: 135, phone: "" },
  { id: "W32", name: "ZAID EL FELLAH", cin: "K149570", role: "Ouvrier qualifié", dailyRate: 135, phone: "" },
  { id: "W33", name: "HOUSSIENE EL JABAR", cin: "IC 160611", role: "Ouvrier qualifié", dailyRate: 135, phone: "" },
  { id: "W34", name: "SAID OUHAMCHA", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W35", name: "KHALID ATAZARIN", cin: "PB304072", role: "Ouvrier qualifié", dailyRate: 135, phone: "" },
  { id: "W36", name: "MOHAMED OUMIDO", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W37", name: "SAID OUABID", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W38", name: "SLIMAN SABIR", cin: "", role: "Manœuvre", dailyRate: 120, phone: "" },
  { id: "W39", name: "MOHAMED OUAHTTOUS", cin: "IC179232", role: "Ouvrier qualifié", dailyRate: 135, phone: "" }
];
