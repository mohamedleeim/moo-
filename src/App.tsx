import React, { useState, useEffect } from "react";
import { WorkItem, MeasurementLine, ProjectDetails, Project, GeneratedDecompte, WorkItemProgress, Expense, Worker, DailyPointage } from "./types";
import { 
  initialWorkItems, 
  initialMeasurementLines, 
  defaultProjectDetails 
} from "./data/initialData";

import Dashboard from "./components/Dashboard";
import BPUList from "./components/BPUList";
import MetreSheet from "./components/MetreSheet";
import DecompteSummary from "./components/DecompteSummary";
import RevisionPrix from "./components/RevisionPrix";
import RapportPrint from "./components/RapportPrint";
import ProjectManager from "./components/ProjectManager";
import SuiviTravaux from "./components/SuiviTravaux";
import GestionDepenses from "./components/GestionDepenses";
import PointageOuvriers from "./components/PointageOuvriers";

import { 
  Home, 
  Compass, 
  Layers, 
  FileSpreadsheet, 
  TrendingUp, 
  Printer, 
  RefreshCcw, 
  Download, 
  Upload,
  Coins,
  MapPin,
  Menu,
  X,
  ArrowLeft,
  FolderDot,
  Users
} from "lucide-react";

export default function App() {
  // Navigation & Project switcher states
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("metre"); // Default tab when project is opened
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Projects database state
  const [projects, setProjects] = useState<Project[]>([]);

  // Active loaded states (for the currently selected project)
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [measurementLines, setMeasurementLines] = useState<MeasurementLine[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(defaultProjectDetails);
  const [suiviTravaux, setSuiviTravaux] = useState<WorkItemProgress[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [pointages, setPointages] = useState<DailyPointage[]>([]);

  const [syncStatus, setSyncStatus] = useState<"connecting" | "local" | "offline">("connecting");
  const [hasHydrated, setHasHydrated] = useState(false);

  // 1. Initial State Hydration with optional Node server database synchronization
  useEffect(() => {
    async function loadInitialDataAndSync() {
      let loadedProjects: Project[] = [];
      let isNodeServerActive = false;

      // Try to fetch projects from local Node Express Server API
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const result = await response.json();
          if (result && result.success) {
            isNodeServerActive = true;
            if (Array.isArray(result.data) && result.data.length > 0) {
              loadedProjects = result.data;
              setSyncStatus("local");
            }
          }
        }
      } catch (err) {
        console.log("Could not establish connection to local storage service. Falling back to localStorage.", err);
      }

      // Fall back to localStorage if Node server didn't provide active data
      if (loadedProjects.length === 0) {
        const cachedProjects = localStorage.getItem("bahia_multi_projects");
        if (cachedProjects) {
          try {
            loadedProjects = JSON.parse(cachedProjects);
          } catch (e) {
            loadedProjects = [];
          }
        }
      }

      // fallback: if no projects in cache or server, seed with the default Palais El Bahia demo project
      if (loadedProjects.length === 0) {
        const defaultProjectRec: Project = {
          id: "project-bahia",
          name: "Projet de Reconstruction de Palier - El Bahia Marrakech",
          description: "Restauration monument historique, Palais El Bahia Marrakech",
          details: defaultProjectDetails,
          workItems: initialWorkItems,
          measurementLines: initialMeasurementLines,
          suiviTravaux: [
            { itemId: "item-1", progressPercentage: 100, lastUpdated: "2026-06-18", remarks: "Fouilles terminées conformément à l'arborescence des calculs." },
            { itemId: "item-2", progressPercentage: 100, lastUpdated: "2026-06-18", remarks: "Démolition de l'ancien palier dégradé achevée." },
            { itemId: "item-3", progressPercentage: 40, lastUpdated: "2026-06-19", remarks: "Coulage des semelles S1 fait. Coffrage des chaînages en cours." }
          ],
          workers: [
            { id: "W1", name: "Hassan Sahouak", role: "Maâlem Tapisseur", dailyRate: 150, phone: "+212 611 123 456" },
            { id: "W2", name: "Ali Elhdili", role: "Maâlem Maçon Traditional", dailyRate: 140, phone: "+212 622 234 567" },
            { id: "W3", name: "Yassine Erraissi", role: "Maâlem Zelligeur", dailyRate: 150, phone: "+212 633 345 678" },
            { id: "W4", name: "Ali Bnichou", role: "Maâlem Plâtrier", dailyRate: 150, phone: "+212 644 456 789" },
            { id: "W5", name: "Mohamed Messaoudi", role: "Maâlem Sculpteur Bois", dailyRate: 200, phone: "+212 655 567 890" },
            { id: "W6", name: "Mohmed Bel Madani", role: "Maâlem Charpentier", dailyRate: 150, phone: "+212 666 678 901" },
            { id: "W7", name: "Mouad Farhane", role: "Maâlem Sculptures Plâtre", dailyRate: 200, phone: "+212 677 789 012" },
            { id: "W8", name: "Khalid Abouaali", role: "Khedam (Aide-Maçon)", dailyRate: 120, phone: "+212 688 890 123" },
            { id: "W9", name: "Mehdi Ferhane", role: "Khedam (Manoeuvre)", dailyRate: 130, phone: "+212 699 901 234" },
            { id: "W10", name: "Abderahmane Ferhan", role: "Khedam (Manoeuvre)", dailyRate: 110, phone: "+212 610 012 345" },
            { id: "W11", name: "Ali Belkassi", role: "Maâlem Staffeur", dailyRate: 150, phone: "+212 620 123 456" },
            { id: "W12", name: "Mustapha El Hachimi", role: "Khedam (Manoeuvre)", dailyRate: 110, phone: "+212 630 234 567" },
            { id: "W13", name: "Abderahman Ait Ali", role: "Khedam (Manoeuvre)", dailyRate: 130, phone: "+212 640 345 678" }
          ],
          pointages: [
            {
              id: "ptg-seed-1",
              date: "2026-06-01",
              pointages: [
                { workerId: "W2", status: "present", advancePaid: 0 },
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W6", status: "present", advancePaid: 0 },
                { workerId: "W7", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "بداية الأوراش الرسمية لشهر يونيو 2026 بقصر الباهية"
            },
            {
              id: "ptg-seed-2",
              date: "2026-06-02",
              pointages: [
                { workerId: "W2", status: "present", advancePaid: 0 },
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 500 },
                { workerId: "W6", status: "present", advancePaid: 0 },
                { workerId: "W7", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "سلفة 500 درهم مدفوعة نقداً للماعلم محمد المسعودي"
            },
            {
              id: "ptg-seed-3",
              date: "2026-06-03",
              pointages: [
                { workerId: "W2", status: "present", advancePaid: 0 },
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W6", status: "present", advancePaid: 0 },
                { workerId: "W7", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W10", status: "present", advancePaid: 500 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "سلفة مدفوعة للعامل عبد الرحمان فرحان بقيمة 500 درهم"
            },
            {
              id: "ptg-seed-4",
              date: "2026-06-04",
              pointages: [
                { workerId: "W2", status: "present", advancePaid: 0 },
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W7", status: "present", advancePaid: 1400 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "تسليم تسبيق للماعلم معاد فرحان بقيمة 1400 درهم"
            },
            {
              id: "ptg-seed-5",
              date: "2026-06-05",
              pointages: [
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W11", status: "present", advancePaid: 1400 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "تسليم تسبيق للماعلم علي بلقاسي بقيمة 1400 درهم"
            },
            {
              id: "ptg-seed-6",
              date: "2026-06-06",
              pointages: [
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W9", status: "present", advancePaid: 600 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "تسليم تسبيق للعامل مهدي فرحان بقيمة 600 درهم"
            },
            {
              id: "ptg-seed-7",
              date: "2026-06-10",
              pointages: [
                { workerId: "W2", status: "demi-journee", advancePaid: 0 },
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 200 },
                { workerId: "W7", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W11", status: "present", advancePaid: 200 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "تسجيل حضور وتوزيع دفعة تسبيقات اليومية"
            },
            {
              id: "ptg-seed-8",
              date: "2026-06-11",
              pointages: [
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 1000 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W9", status: "present", advancePaid: 0 },
                { workerId: "W11", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "حضور كامل للماعلمية واليد العاملة"
            },
            {
              id: "ptg-seed-9",
              date: "2026-06-12",
              pointages: [
                { workerId: "W2", status: "present", advancePaid: 535 },
                { workerId: "W3", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W10", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "تسليم تسبيق للماعلم علي الهديل بقيمة 535 درهم"
            },
            {
              id: "ptg-seed-10",
              date: "2026-06-13",
              pointages: [
                { workerId: "W2", status: "present", advancePaid: 535 },
                { workerId: "W3", status: "demi-journee", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "تسوية الحضور وتسليم الدفعة الثانية للماعلم علي الهديل"
            },
            {
              id: "ptg-seed-11",
              date: "2026-06-14",
              pointages: [
                { workerId: "W1", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 500 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W9", status: "demi-journee", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "حضور الماعلم حسن السهواك وباقي الأطقم"
            },
            {
              id: "ptg-seed-12",
              date: "2026-06-17",
              pointages: [
                { workerId: "W1", status: "present", advancePaid: 0 },
                { workerId: "W3", status: "present", advancePaid: 100 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 0 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "تسليم تسبيق للماعلم ياسين المختار بقيمة 100 درهم"
            },
            {
              id: "ptg-seed-13",
              date: "2026-06-18",
              pointages: [
                { workerId: "W1", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 200 },
                { workerId: "W8", status: "present", advancePaid: 500 },
                { workerId: "W13", status: "present", advancePaid: 0 }
              ],
              note: "أشغال التلبيس والزليج التقليدي لورش قصر الباهية"
            },
            {
              id: "ptg-seed-14",
              date: "2026-06-19",
              pointages: [
                { workerId: "W1", status: "present", advancePaid: 0 },
                { workerId: "W4", status: "present", advancePaid: 0 },
                { workerId: "W5", status: "present", advancePaid: 100 },
                { workerId: "W8", status: "present", advancePaid: 0 },
                { workerId: "W13", status: "demi-journee", advancePaid: 0 }
              ],
              note: "تجهيز الرسوم والفسيفساء تحت إشراف الماعلمية"
            }
          ],
          expenses: [
            { id: "exp-seed-1", date: "2026-06-15", category: "materiaux", label: "5 tonnes de chaux hydraulique", amount: 2500, quantity: 5, unitPrice: 500, remarks: "Fournisseur Chaux Tensift" },
            { id: "exp-seed-2", date: "2026-06-16", category: "materiaux", label: "20 m² de dalles de Bejmat pré-cuit ocre", amount: 1800, quantity: 20, unitPrice: 90, remarks: "Atelier Artisanal Géliz" },
            { id: "exp-seed-3", date: "2026-06-17", category: "chauffeur", label: "Livraison matériaux et trajets chantier", amount: 450, remarks: "Camion Benne Omar" },
            { id: "exp-seed-4", date: "2026-06-18", category: "droguerie", label: "Droguerie : Acides, colles, brosses, clous et fils d'attache", amount: 270, remarks: "Droguerie Bab Doukkala" }
          ]
        };
        loadedProjects = [defaultProjectRec];
      }

      // Ensure reference project-bahia is always updated with latest reference work items and measurement lines
      loadedProjects = loadedProjects.map(p => {
        if (p.id === "project-bahia") {
          return {
            ...p,
            name: "Travaux de Réhabilitation et de Restauration du Palais BAHIA - Marrakech",
            description: "Situation Provisoire n°05 - Inspection Provinciale des Monuments",
            details: defaultProjectDetails,
            workItems: initialWorkItems,
            measurementLines: initialMeasurementLines,
            suiviTravaux: [
              { itemId: "item-1", progressPercentage: 40, lastUpdated: "2026-06-18", remarks: "Installation de chantier complétée à 40%." },
              { itemId: "item-2", progressPercentage: 100, lastUpdated: "2026-06-18", remarks: "Échafaudages et étayages terminés." },
              { itemId: "item-3", progressPercentage: 82, lastUpdated: "2026-06-19", remarks: "Protection du plâtre en cours conformément au métré." },
              { itemId: "item-4", progressPercentage: 90, lastUpdated: "2026-06-19", remarks: "Protection des plafonds en bois en cours." }
            ]
          };
        }
        return p;
      });

      setProjects(loadedProjects);

      // Save immediately to local server if server is active (seeding or initial upload)
      if (isNodeServerActive) {
        setSyncStatus("local");
        try {
          await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loadedProjects)
          });
        } catch (e) {
          console.error("Failed to seed Node server with initial data.", e);
        }
      } else {
        setSyncStatus("offline");
      }

      // Cache to localStorage
      localStorage.setItem("bahia_multi_projects", JSON.stringify(loadedProjects));

      // Restore active project selection
      const cachedActiveId = localStorage.getItem("bahia_selected_project_id");
      if (cachedActiveId && loadedProjects.some(p => p.id === cachedActiveId)) {
        setSelectedProjectId(cachedActiveId);
      } else {
        setSelectedProjectId(null);
      }

      setHasHydrated(true);
    }

    loadInitialDataAndSync();
  }, []);

  // 1b. Auto-synchronization on project change
  useEffect(() => {
    if (!hasHydrated || projects.length === 0) return;

    // Save to localStorage
    localStorage.setItem("bahia_multi_projects", JSON.stringify(projects));

    // Save to server if server is available
    if (syncStatus === "local") {
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projects)
      }).catch(err => {
        console.error("Auto-sync save to computer failed:", err);
      });
    }
  }, [projects, hasHydrated, syncStatus]);

  // 2. Select Project context & populate active states
  useEffect(() => {
    if (selectedProjectId) {
      const activeProj = projects.find(p => p.id === selectedProjectId);
      if (activeProj) {
        setWorkItems(activeProj.workItems || []);
        setMeasurementLines(activeProj.measurementLines || []);
        setProjectDetails(activeProj.details || defaultProjectDetails);
        setSuiviTravaux(activeProj.suiviTravaux || []);
        setExpenses(activeProj.expenses || []);
        setWorkers(activeProj.workers || []);
        setPointages(activeProj.pointages || []);
      }
      localStorage.setItem("bahia_selected_project_id", selectedProjectId);
    } else {
      localStorage.removeItem("bahia_selected_project_id");
    }
  }, [selectedProjectId, projects]);

  // 3. Atomically synchronize states back into master projects list and local storage
  const handleUpdateWorkItems = (newItems: WorkItem[]) => {
    setWorkItems(newItems);
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === selectedProjectId ? { ...p, workItems: newItems } : p);
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleUpdateMeasurementLines = (newLines: MeasurementLine[]) => {
    setMeasurementLines(newLines);
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === selectedProjectId ? { ...p, measurementLines: newLines } : p);
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleUpdateProjectDetails = (newDetails: ProjectDetails) => {
    setProjectDetails(newDetails);
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === selectedProjectId ? { ...p, details: newDetails, name: newDetails.title } : p);
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleUpdateSuivi = (newSuivi: WorkItemProgress[]) => {
    setSuiviTravaux(newSuivi);
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === selectedProjectId ? { ...p, suiviTravaux: newSuivi } : p);
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleUpdateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === selectedProjectId ? { ...p, expenses: newExpenses } : p);
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleUpdateWorkers = (newWorkers: Worker[]) => {
    setWorkers(newWorkers);
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === selectedProjectId ? { ...p, workers: newWorkers } : p);
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleUpdatePointages = (newPointages: DailyPointage[]) => {
    setPointages(newPointages);
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === selectedProjectId ? { ...p, pointages: newPointages } : p);
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleAddProject = (newProj: Project) => {
    const updated = [...projects, newProj];
    setProjects(updated);
    localStorage.setItem("bahia_multi_projects", JSON.stringify(updated));
    setSelectedProjectId(newProj.id);
    setActiveTab("metre"); // automatically jump inside newly created chantiers
  };

  const handleUpdateProjectMeta = (id: string, updatedProj: Project) => {
    const updated = projects.map(p => p.id === id ? updatedProj : p);
    setProjects(updated);
    localStorage.setItem("bahia_multi_projects", JSON.stringify(updated));
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem("bahia_multi_projects", JSON.stringify(updated));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  };

  const handleSaveDecompte = (newDecompte: GeneratedDecompte) => {
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => {
          if (p.id === selectedProjectId) {
            const currentHistory = p.generatedDecomptes || [];
            const filteredHistory = currentHistory.filter(h => h.id !== newDecompte.id);
            return {
              ...p,
              generatedDecomptes: [...filteredHistory, newDecompte]
            };
          }
          return p;
        });
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleDeleteDecompte = (decompteId: string) => {
    if (selectedProjectId) {
      setProjects(prev => {
        const next = prev.map(p => {
          if (p.id === selectedProjectId) {
            const currentHistory = p.generatedDecomptes || [];
            return {
              ...p,
              generatedDecomptes: currentHistory.filter(h => h.id !== decompteId)
            };
          }
          return p;
        });
        localStorage.setItem("bahia_multi_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  // Calculations Helper
  const calcItemTotalQuantity = (itemId: string): number => {
    return measurementLines
      .filter((line) => line.itemId === itemId)
      .reduce((sum, current) => sum + current.computedValue, 0);
  };

  // Restores initial master template list
  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser l'ensemble de votre base de données ? Tous vos projets seront supprimés et remplacés par l'exemple de référence Palais El Bahia Marrakech."
      )
    ) {
      const defaultProj: Project = {
        id: "project-bahia",
        name: "Projet de Reconstruction de Palier - El Bahia Marrakech",
        description: "Restauration monument historique, Palais El Bahia Marrakech",
        details: defaultProjectDetails,
        workItems: initialWorkItems,
        measurementLines: initialMeasurementLines,
        suiviTravaux: [
          { itemId: "item-1", progressPercentage: 100, lastUpdated: "2026-06-18", remarks: "Fouilles terminées conformément à l'arborescence des calculs." },
          { itemId: "item-2", progressPercentage: 100, lastUpdated: "2026-06-18", remarks: "Démolition de l'ancien palier dégradé achevée." },
          { itemId: "item-3", progressPercentage: 40, lastUpdated: "2026-06-19", remarks: "Coulage des semelles S1 fait. Coffrage des chaînages en cours." }
        ],
        workers: [
          { id: "W1", name: "Hassan Sahouak", role: "Maâlem Tapisseur", dailyRate: 150, phone: "+212 611 123 456" },
          { id: "W2", name: "Ali Elhdili", role: "Maâlem Maçon Traditional", dailyRate: 140, phone: "+212 622 234 567" },
          { id: "W3", name: "Yassine Erraissi", role: "Maâlem Zelligeur", dailyRate: 150, phone: "+212 633 345 678" },
          { id: "W4", name: "Ali Bnichou", role: "Maâlem Plâtrier", dailyRate: 150, phone: "+212 644 456 789" },
          { id: "W5", name: "Mohamed Messaoudi", role: "Maâlem Sculpteur Bois", dailyRate: 200, phone: "+212 655 567 890" },
          { id: "W6", name: "Mohmed Bel Madani", role: "Maâlem Charpentier", dailyRate: 150, phone: "+212 666 678 901" },
          { id: "W7", name: "Mouad Farhane", role: "Maâlem Sculptures Plâtre", dailyRate: 200, phone: "+212 677 789 012" },
          { id: "W8", name: "Khalid Abouaali", role: "Khedam (Aide-Maçon)", dailyRate: 120, phone: "+212 688 890 123" },
          { id: "W9", name: "Mehdi Ferhane", role: "Khedam (Manoeuvre)", dailyRate: 130, phone: "+212 699 901 234" },
          { id: "W10", name: "Abderahmane Ferhan", role: "Khedam (Manoeuvre)", dailyRate: 110, phone: "+212 610 012 345" },
          { id: "W11", name: "Ali Belkassi", role: "Maâlem Staffeur", dailyRate: 150, phone: "+212 620 123 456" },
          { id: "W12", name: "Mustapha El Hachimi", role: "Khedam (Manoeuvre)", dailyRate: 110, phone: "+212 630 234 567" },
          { id: "W13", name: "Abderahman Ait Ali", role: "Khedam (Manoeuvre)", dailyRate: 130, phone: "+212 640 345 678" }
        ],
        pointages: [
          {
            id: "ptg-seed-1",
            date: "2026-06-01",
            pointages: [
              { workerId: "W2", status: "present", advancePaid: 0 },
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W6", status: "present", advancePaid: 0 },
              { workerId: "W7", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "بداية الأوراش الرسمية لشهر يونيو 2026 بقصر الباهية"
          },
          {
            id: "ptg-seed-2",
            date: "2026-06-02",
            pointages: [
              { workerId: "W2", status: "present", advancePaid: 0 },
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 500 },
              { workerId: "W6", status: "present", advancePaid: 0 },
              { workerId: "W7", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "سلفة 500 درهم مدفوعة نقداً للماعلم محمد المسعودي"
          },
          {
            id: "ptg-seed-3",
            date: "2026-06-03",
            pointages: [
              { workerId: "W2", status: "present", advancePaid: 0 },
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W6", status: "present", advancePaid: 0 },
              { workerId: "W7", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W10", status: "present", advancePaid: 500 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "سلفة مدفوعة للعامل عبد الرحمان فرحان بقيمة 500 درهم"
          },
          {
            id: "ptg-seed-4",
            date: "2026-06-04",
            pointages: [
              { workerId: "W2", status: "present", advancePaid: 0 },
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W7", status: "present", advancePaid: 1400 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "تسليم تسبيق للماعلم معاد فرحان بقيمة 1400 درهم"
          },
          {
            id: "ptg-seed-5",
            date: "2026-06-05",
            pointages: [
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W11", status: "present", advancePaid: 1400 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "تسليم تسبيق للماعلم علي بلقاسي بقيمة 1400 درهم"
          },
          {
            id: "ptg-seed-6",
            date: "2026-06-06",
            pointages: [
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W9", status: "present", advancePaid: 600 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "تسليم تسبيق للعامل مهدي فرحان بقيمة 600 درهم"
          },
          {
            id: "ptg-seed-7",
            date: "2026-06-10",
            pointages: [
              { workerId: "W2", status: "demi-journee", advancePaid: 0 },
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 200 },
              { workerId: "W7", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W11", status: "present", advancePaid: 200 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "بيانات الحضور اليومي للمشتروات والعمال بقصر الباهية"
          },
          {
            id: "ptg-seed-8",
            date: "2026-06-11",
            pointages: [
              { workerId: "W2", status: "present", advancePaid: 0 },
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W6", status: "present", advancePaid: 0 },
              { workerId: "W7", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 100 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "أشغال تهيئة الجص والجبس"
          },
          {
            id: "ptg-seed-9",
            date: "2026-06-12",
            pointages: [
              { workerId: "W2", status: "present", advancePaid: 535 },
              { workerId: "W3", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W10", status: "present", advancePaid: 0 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "تسليم تسبيق للماعلم علي الهديل بقيمة 535 درهم"
          },
          {
            id: "ptg-seed-10",
            date: "2026-06-13",
            pointages: [
              { workerId: "W2", status: "present", advancePaid: 535 },
              { workerId: "W3", status: "demi-journee", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "تسوية الحضور وتسليم الدفعة الثانية للماعلم علي الهديل"
          },
          {
            id: "ptg-seed-11",
            date: "2026-06-14",
            pointages: [
              { workerId: "W1", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 500 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W9", status: "demi-journee", advancePaid: 0 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "حضور الماعلم حسن السهواك وباقي الأطقم"
          },
          {
            id: "ptg-seed-12",
            date: "2026-06-17",
            pointages: [
              { workerId: "W1", status: "present", advancePaid: 0 },
              { workerId: "W3", status: "present", advancePaid: 100 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 0 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "تسليم تسبيق للماعلم ياسين المختار بقيمة 100 درهم"
          },
          {
            id: "ptg-seed-13",
            date: "2026-06-18",
            pointages: [
              { workerId: "W1", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 200 },
              { workerId: "W8", status: "present", advancePaid: 500 },
              { workerId: "W13", status: "present", advancePaid: 0 }
            ],
            note: "أشغال التلبيس والزليج التقليدي لورش قصر الباهية"
          },
          {
            id: "ptg-seed-14",
            date: "2026-06-19",
            pointages: [
              { workerId: "W1", status: "present", advancePaid: 0 },
              { workerId: "W4", status: "present", advancePaid: 0 },
              { workerId: "W5", status: "present", advancePaid: 100 },
              { workerId: "W8", status: "present", advancePaid: 0 },
              { workerId: "W13", status: "demi-journee", advancePaid: 0 }
            ],
            note: "تجهيز الرسوم والفسيفساء تحت إشراف الماعلمية"
          }
        ],
        expenses: [
          { id: "exp-seed-1", date: "2026-06-15", category: "materiaux", label: "5 tonnes de chaux hydraulique", amount: 2500, quantity: 5, unitPrice: 500, remarks: "Fournisseur Chaux Tensift" },
          { id: "exp-seed-2", date: "2026-06-16", category: "materiaux", label: "20 m² de dalles de Bejmat pré-cuit ocre", amount: 1800, quantity: 20, unitPrice: 90, remarks: "Atelier Artisanal Géliz" },
          { id: "exp-seed-3", date: "2026-06-17", category: "chauffeur", label: "Livraison matériaux et trajets chantier", amount: 450, remarks: "Camion Benne Omar" },
          { id: "exp-seed-4", date: "2026-06-18", category: "droguerie", label: "Droguerie : Acides, colles, brosses, clous et fils d'attache", amount: 270, remarks: "Droguerie Bab Doukkala" }
        ]
      };
      setProjects([defaultProj]);
      setSelectedProjectId("project-bahia");
      setWorkItems(initialWorkItems);
      setMeasurementLines(initialMeasurementLines);
      setProjectDetails(defaultProjectDetails);
      setSuiviTravaux(defaultProj.suiviTravaux || []);
      setExpenses(defaultProj.expenses || []);
      setWorkers(defaultProj.workers || []);
      setPointages(defaultProj.pointages || []);
      setActiveTab("metre");
      localStorage.setItem("bahia_multi_projects", JSON.stringify([defaultProj]));
      localStorage.setItem("bahia_selected_project_id", "project-bahia");
    }
  };

  // Backup exporter for multi-projects portability
  const handleExportBackup = () => {
    const backupObj = {
      version: "2.0_multi_project",
      timestamp: new Date().toISOString(),
      projects
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Sauvegarde_Projets_Metreur_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import fallback loader compatibility
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.projects) {
          setProjects(parsed.projects);
          localStorage.setItem("bahia_multi_projects", JSON.stringify(parsed.projects));
          if (parsed.projects.length > 0) {
            setSelectedProjectId(parsed.projects[0].id);
          }
          alert("Sauvegarde multi-projets chargée avec succès !");
        } else if (parsed.workItems && parsed.measurementLines && parsed.projectDetails) {
          const legacyProject: Project = {
            id: "legacy-project-" + Date.now(),
            name: parsed.projectDetails.title || "Projet Importé",
            description: "Ancienne sauvegarde importée",
            details: parsed.projectDetails,
            workItems: parsed.workItems,
            measurementLines: parsed.measurementLines
          };
          const updated = [...projects, legacyProject];
          setProjects(updated);
          localStorage.setItem("bahia_multi_projects", JSON.stringify(updated));
          setSelectedProjectId(legacyProject.id);
          alert("Sauvegarde convertie et importée comme nouveau projet !");
        } else {
          alert("Le fichier JSON importé ne correspond pas à un format valide de sauvegarde.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier de sauvegarde.");
      }
    };
    fileReader.readAsText(files[0]);
  };

  // Component views selector inside active projects
  const renderContent = () => {
    if (!selectedProjectId) {
      return (
        <ProjectManager
          projects={projects}
          onSelectProject={setSelectedProjectId}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProjectMeta}
          onDeleteProject={handleDeleteProject}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            workItems={workItems} 
            measurementLines={measurementLines}
            projectDetails={projectDetails}
            setProjectDetails={handleUpdateProjectDetails}
            calcItemTotalQuantity={calcItemTotalQuantity}
          />
        );
      case "bpu": // labeled as "Attachement" for the user
        return (
          <BPUList 
            workItems={workItems} 
            setWorkItems={handleUpdateWorkItems} 
            measurementLines={measurementLines}
          />
        );
      case "metre":
        return (
          <MetreSheet 
            workItems={workItems} 
            measurementLines={measurementLines} 
            setMeasurementLines={handleUpdateMeasurementLines}
            calcItemTotalQuantity={calcItemTotalQuantity}
          />
        );
            case "decompte":
        return (
          <DecompteSummary 
            workItems={workItems} 
            setWorkItems={handleUpdateWorkItems}
            measurementLines={measurementLines} 
            projectDetails={projectDetails}
            calcItemTotalQuantity={calcItemTotalQuantity}
            triggerPrintTab={() => setActiveTab("print")}
            generatedDecomptes={selectedProjOriginal?.generatedDecomptes || []}
            onSaveDecompte={handleSaveDecompte}
            onDeleteDecompte={handleDeleteDecompte}
          />
        );
      case "revision":
        return (
          <RevisionPrix 
            workItems={workItems} 
            measurementLines={measurementLines} 
            projectDetails={projectDetails}
            setProjectDetails={handleUpdateProjectDetails}
            calcItemTotalQuantity={calcItemTotalQuantity}
          />
        );
      case "suivi":
        return (
          <SuiviTravaux
            workItems={workItems}
            suiviTravaux={suiviTravaux}
            onUpdateSuivi={handleUpdateSuivi}
            calcItemTotalQuantity={calcItemTotalQuantity}
          />
        );
      case "expenses": {
        const estimatedRev = workItems.reduce((acc, item) => {
          const qty = calcItemTotalQuantity(item.id);
          return acc + (qty * item.unitPrice);
        }, 0);
        return (
          <GestionDepenses
            expenses={expenses}
            onUpdateExpenses={handleUpdateExpenses}
            estimatedRevenue={estimatedRev}
            workers={workers}
            pointages={pointages}
          />
        );
      }
      case "pointage":
        return (
          <PointageOuvriers
            workers={workers}
            pointages={pointages}
            onUpdateWorkers={handleUpdateWorkers}
            onUpdatePointages={handleUpdatePointages}
          />
        );
      case "print":
        return (
          <RapportPrint 
            workItems={workItems} 
            measurementLines={measurementLines} 
            projectDetails={projectDetails}
            calcItemTotalQuantity={calcItemTotalQuantity}
            onBack={() => setActiveTab("decompte")}
          />
        );
      default:
        return null;
    }
  };

  // Nav Links setup
  const navItems = [
    { id: "metre", label: "Métré (المتر)", icon: Compass },
    { id: "bpu", label: "Attachement (المرفقات)", icon: Coins },
    { id: "decompte", label: "Décompte (الحساب)", icon: FileSpreadsheet },
    { id: "revision", label: "Révision (مراجعة الأسعار)", icon: TrendingUp },
    { id: "suivi", label: "Suivi des travaux (الأشغال)", icon: FolderDot },
    { id: "expenses", label: "Dépenses (المصاريف)", icon: Coins },
    { id: "pointage", label: "Pointage (العمال)", icon: Users },
    { id: "dashboard", label: "Aperçu (الأولى)", icon: Home },
  ];

  // If inside print mode, output report instantly
  if (selectedProjectId && activeTab === "print") {
    return (
      <RapportPrint 
        workItems={workItems} 
        measurementLines={measurementLines} 
        projectDetails={projectDetails}
        calcItemTotalQuantity={calcItemTotalQuantity}
        onBack={() => setActiveTab("decompte")}
      />
    );
  }

  const selectedProjOriginal = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col antialiased">
      
      {/* Upper Brand Header */}
      <header className="no-print bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Title & Brand Icon */}
            <div className="flex items-center gap-3">
              <div className="bg-brand-brown h-10 w-10 rounded-xl flex items-center justify-center text-brand-gold shadow-md">
                <FolderDot className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-stone-900 text-sm md:text-base tracking-tight block">
                  El Bahia • Métreur-Vérificateur
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-terracotta font-semibold block">
                  Marrakech • Multi-Projets
                </span>
              </div>
            </div>

            {/* Back button and Active Tab links for Project */}
            {selectedProjectId ? (
              <>
                <div className="hidden lg:flex items-center gap-2">
                  {/* Left Back Arrow trigger */}
                  <button
                    onClick={() => setSelectedProjectId(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-950 font-bold rounded-lg text-xs mr-3 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Revenir aux Projets
                  </button>

                  <nav className="flex items-center gap-1.5">
                    {navItems.map((tab) => {
                      const IconComponent = tab.icon;
                      const isSelected = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
                            isSelected
                              ? "bg-brand-brown text-brand-gold shadow-sm"
                              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </>
            ) : (
              <div className="hidden lg:block text-xs font-semibold text-stone-500 uppercase tracking-wider select-none pr-4">
                Accueil • لوحة إدارة مشاريع البناء
              </div>
            )}

            {/* Global Utility Actions (Exports) */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Node/Computer sync status badge */}
              {syncStatus === "connecting" && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-stone-100 border border-stone-200 text-stone-600 rounded-full text-[11px] font-mono font-bold select-none animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-stone-400" />
                  <span>جاري الاتصال بالنظام...</span>
                </div>
              )}
              {syncStatus === "local" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-mono font-bold select-none" title="Toutes vos modifications sont immédiatement écrites dans le fichier 'projects_db.json' sur votre ordinateur de façon 100% sécurisée.">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px]">💾 حفظ تلقائي في الحاسوب</span>
                </div>
              )}
              {syncStatus === "offline" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-mono font-bold select-none" title="Vos modifications sont stockées localement dans votre navigateur. Lancez le serveur Node local pour enregistrer dans un fichier sur votre disque dur.">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-450" />
                  <span className="text-[10px]">📍 حفظ مؤقت بالمتصفح</span>
                </div>
              )}

              <button
                onClick={handleExportBackup}
                className="p-2 text-stone-500 hover:text-brand-brown hover:bg-stone-100 rounded-lg transition"
                title="Exporter une sauvegarde globale (.json)"
              >
                <Download className="h-4 w-4" />
              </button>

              <label 
                className="p-2 text-stone-500 hover:text-brand-brown hover:bg-stone-100 rounded-lg transition cursor-pointer"
                title="Importer des chantiers (.json)"
              >
                <Upload className="h-4 w-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImportBackup} 
                />
              </label>

              <div className="h-4 w-px bg-stone-200 mx-1"></div>

              <button
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-700 hover:bg-red-50 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 transition"
                title="Restaurer l'usine d'exemples par défaut"
              >
                <RefreshCcw className="h-3 w-3" /> Usine
              </button>
            </div>

            {/* Mobile Actions burger menu */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown navigation menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-200 p-4 space-y-2 shadow-inner select-none animate-fadeIn">
            {/* Back to projects trigger inside mobile view */}
            {selectedProjectId && (
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-stone-105 border border-stone-250 text-stone-900 rounded-lg text-xs font-extrabold uppercase mb-2"
              >
                <ArrowLeft className="h-4 w-4 text-brand-gold animate-bounce" /> ← Page Principale Projets
              </button>
            )}

            <div className="space-y-1">
              {selectedProjectId ? (
                navItems.map((tab) => {
                  const IconComponent = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                        isSelected
                          ? "bg-brand-brown text-brand-gold"
                          : "text-stone-600 hover:bg-stone-150"
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })
              ) : (
                <div className="text-center italic py-2 text-stone-400 text-xs">
                  Veuillez ouvrir un chantiers pour débloquer sa navigation.
                </div>
              )}
            </div>

            <div className="h-px bg-stone-200 my-3"></div>

            <div className="grid grid-cols-3 gap-2 pt-1.5">
              <button
                onClick={() => {
                  handleExportBackup();
                  setIsMobileMenuOpen(false);
                }}
                className="inline-flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50 text-stone-600 hover:bg-stone-100 text-[10px] font-medium"
              >
                <Download className="h-4 w-4 mb-1" /> Export
              </button>

              <label className="inline-flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50 text-stone-600 hover:bg-stone-100 text-[10px] font-medium cursor-pointer">
                <Upload className="h-4 w-4 mb-1" /> Import
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={(e) => {
                    handleImportBackup(e);
                    setIsMobileMenuOpen(false);
                  }} 
                />
              </label>

              <button
                onClick={() => {
                  handleResetToDefault();
                  setIsMobileMenuOpen(false);
                }}
                className="inline-flex flex-col items-center justify-center p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold"
              >
                <RefreshCcw className="h-4 w-4 mb-1" /> Usine
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Selected Workspace Project Context Header bar (Breadcrumb styling) */}
      {selectedProjectId && selectedProjOriginal && (
        <div className="no-print bg-amber-500/10 border-b border-stone-200 py-2.5 select-none animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 truncate text-stone-700">
              <span className="font-extrabold text-stone-900 bg-stone-200 px-2 py-0.5 rounded tracking-wide font-mono text-[10px]">
                CHANTIER ACTIF :
              </span>
              <strong className="text-stone-900 truncate font-semibold">{selectedProjOriginal.name}</strong>
              <span className="text-stone-400 font-light">•</span>
              <span className="text-stone-500 truncate font-mono hidden md:inline">{selectedProjOriginal.details.contractNumber}</span>
            </div>

            <button
              onClick={() => setSelectedProjectId(null)}
              className="px-2 py-1 bg-white text-brand-brown border border-brand-brown/25 rounded hover:bg-stone-100 text-[10px] font-bold transition shrink-0 uppercase"
            >
              Fermer Chantier ✕
            </button>
          </div>
        </div>
      )}

      {/* Main container content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fadeIn">
        {renderContent()}
      </main>

      {/* Elegant minimalist Footer */}
      <footer className="no-print bg-white border-t border-stone-250 py-6 text-center text-xs text-stone-400 select-none font-mono mt-8">
        <p className="font-semibold text-stone-500">MÉTREUR-VÉRIFICATEUR DES TRAVAUX DE CONSOLIDATION • SYSTÈME MULTI-PROJETS</p>
        <p className="mt-1">Application locale autonome conforme au Décret Marocain des Marchés Publics</p>
      </footer>

    </div>
  );
}
