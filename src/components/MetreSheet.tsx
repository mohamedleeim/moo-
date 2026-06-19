import React, { useState, useEffect } from "react";
import { WorkItem, MeasurementLine } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Folder, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Hammer, 
  Hash, 
  PlusCircle, 
  Grid,
  Sparkles,
  Info,
  HelpCircle,
  FilePlus,
  RefreshCw,
  TrendingDown
} from "lucide-react";

interface MetreSheetProps {
  workItems: WorkItem[];
  measurementLines: MeasurementLine[];
  setMeasurementLines: (lines: MeasurementLine[]) => void;
  calcItemTotalQuantity: (itemId: string) => number;
}

interface TreeNode extends MeasurementLine {
  children: TreeNode[];
}

export default function MetreSheet({
  workItems,
  measurementLines,
  setMeasurementLines,
  calcItemTotalQuantity
}: MetreSheetProps) {
  
  // 1. Article Selection & Search States
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    return workItems[0]?.id || "";
  });
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Tree Interaction & UI states
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    // Keep root folders expanded by default
  });
  const [addingUnderId, setAddingUnderId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // 3. Forms States for Adding Node
  const [addLabel, setAddLabel] = useState("");
  const [addType, setAddType] = useState<'section' | 'dimension'>('dimension');
  const [addCoeff, setAddCoeff] = useState("1");
  const [addLength, setAddLength] = useState("");
  const [addWidth, setAddWidth] = useState("");
  const [addHeight, setAddHeight] = useState("");

  // 4. Forms States for Editing Node
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<'section' | 'dimension'>('dimension');
  const [editCoeff, setEditCoeff] = useState("1");
  const [editLength, setEditLength] = useState("");
  const [editWidth, setEditWidth] = useState("");
  const [editHeight, setEditHeight] = useState("");

  // Selected article reference
  const selectedItem = workItems.find(item => item.id === selectedItemId);

  // 5. Automatic structured roots manager
  // Ensures any selected article has the core roots: "a) Additions" and "b) Déductions"
  // and groups existing unparented flat lines into them dynamically
  useEffect(() => {
    if (!selectedItemId) return;

    const itemId = selectedItemId;
    const itemLines = measurementLines.filter(l => l.itemId === itemId);
    const addId = `sec-add-${itemId}`;
    const dedId = `sec-ded-${itemId}`;

    const hasAddNode = itemLines.some(l => l.id === addId || l.label.startsWith("a)"));
    const hasDedNode = itemLines.some(l => l.id === dedId || l.label.startsWith("b)"));

    const actualAddId = itemLines.find(l => l.id === addId || l.label.startsWith("a)"))?.id || addId;
    const actualDedId = itemLines.find(l => l.id === dedId || l.label.startsWith("b)"))?.id || dedId;

    let updated = [...measurementLines];
    let needsUpdate = false;

    if (!hasAddNode) {
      updated.push({
        id: addId,
        itemId,
        label: "a) Additions (الاضافات)",
        coefficient: 0,
        computedValue: 0,
        type: 'section'
      });
      needsUpdate = true;
    }

    if (!hasDedNode) {
      updated.push({
        id: dedId,
        itemId,
        label: "b) Déductions (التنزيلات)",
        coefficient: 0,
        computedValue: 0,
        type: 'section'
      });
      needsUpdate = true;
    }

    // Assign pre-existing flat lines that do not have a parent ID
    updated = updated.map(l => {
      if (l.itemId === itemId && l.id !== actualAddId && l.id !== actualDedId && !l.parentId) {
        const isDed = l.coefficient < 0 || l.computedValue < 0 || l.label.toLowerCase().includes("deduire") || l.label.toLowerCase().includes("déduire");
        needsUpdate = true;
        return {
          ...l,
          parentId: isDed ? actualDedId : actualAddId,
          type: l.type || (l.length || l.width || l.height ? 'dimension' : 'section')
        };
      }
      return l;
    });

    if (needsUpdate) {
      setMeasurementLines(updated);
    }
  }, [selectedItemId]);

  // Set default root folders as expanded when article changes
  useEffect(() => {
    if (selectedItemId) {
      setExpandedNodes(prev => ({
        ...prev,
        [`sec-add-${selectedItemId}`]: true,
        [`sec-ded-${selectedItemId}`]: true,
      }));
    }
    // Close insertion panels on item shift
    setAddingUnderId(null);
    setEditingNodeId(null);
  }, [selectedItemId]);

  // Find if a node has deductions anywhere in its ancestor chain
  const isAncestorDeduction = (parentId: string | undefined): boolean => {
    if (!parentId) return false;
    // Find the parent item
    const parentNode = measurementLines.find(l => l.id === parentId);
    if (!parentNode) return false;

    // Check if it's the ded root or contains deduction label keywords
    if (
      parentNode.id.startsWith("sec-ded-") || 
      parentNode.label.toLowerCase().includes("déduction") || 
      parentNode.label.toLowerCase().includes("deduction") ||
      parentNode.label.toLowerCase().includes("à déduire") ||
      parentNode.label.toLowerCase().includes("a deduire")
    ) {
      return true;
    }

    return isAncestorDeduction(parentNode.parentId);
  };

  // Helper to construct recursively organized tree
  const buildTree = (lines: MeasurementLine[]): TreeNode[] => {
    const map: Record<string, TreeNode> = {};
    const roots: TreeNode[] = [];

    // Filter to selected item only
    const filteredLines = lines.filter(l => l.itemId === selectedItemId);

    filteredLines.forEach(line => {
      map[line.id] = { ...line, children: [] };
    });

    filteredLines.forEach(line => {
      const mappedNode = map[line.id];
      if (line.parentId && map[line.parentId]) {
        map[line.parentId].children.push(mappedNode);
      } else {
        roots.push(mappedNode);
      }
    });

    return roots;
  };

  // Helper to recursively calculate visual values of folder sections for display
  const getNodeVisualValue = (node: TreeNode): number => {
    if (node.type === 'section') {
      let sum = 0;
      node.children.forEach(child => {
        sum += getNodeVisualValue(child);
      });
      return sum;
    } else {
      return node.computedValue;
    }
  };

  // Recursive deletion of a node and all of its nested children
  const performRecursiveDelete = (targetId: string, currentLines: MeasurementLine[]): MeasurementLine[] => {
    // Find direct children
    const directChildren = currentLines.filter(l => l.parentId === targetId);
    let updated = currentLines.filter(l => l.id !== targetId);

    directChildren.forEach(child => {
      updated = performRecursiveDelete(child.id, updated);
    });

    return updated;
  };

  // 6. Tree Actions Submit Handlers
  const handleAddSubmit = (parentId: string) => {
    if (!addLabel.trim()) {
      alert("Veuillez saisir un libellé.");
      return;
    }

    // Build values
    const isDedBranch = isAncestorDeduction(parentId) || parentId.startsWith("sec-ded-");
    const rawCoeff = parseFloat(addCoeff) || 1;
    // For deductions, force negative coefficient to calculate nicely in standard sum aggregation
    const coefficient = isDedBranch ? -Math.abs(rawCoeff) : Math.abs(rawCoeff);

    const lengthVal = addLength !== "" ? parseFloat(addLength) : undefined;
    const widthVal = addWidth !== "" ? parseFloat(addWidth) : undefined;
    const heightVal = addHeight !== "" ? parseFloat(addHeight) : undefined;

    // Direct computed value: coefficient * (length ?? 1) * (width ?? 1) * (height ?? 1)
    const computedValue = addType === 'section' ? 0 : coefficient * (lengthVal ?? 1) * (widthVal ?? 1) * (heightVal ?? 1);

    const newNode: MeasurementLine = {
      id: "node-" + Date.now(),
      itemId: selectedItemId,
      parentId: parentId,
      label: addLabel.trim(),
      type: addType,
      coefficient: addType === 'section' ? 0 : coefficient,
      length: addType === 'dimension' ? lengthVal : undefined,
      width: addType === 'dimension' ? widthVal : undefined,
      height: addType === 'dimension' ? heightVal : undefined,
      computedValue: computedValue
    };

    setMeasurementLines([...measurementLines, newNode]);

    // Reset forms & close
    setAddingUnderId(null);
    setAddLabel("");
    setAddType("dimension");
    setAddCoeff("1");
    setAddLength("");
    setAddWidth("");
    setAddHeight("");

    // Automatically expand the parent folder to show the new child
    setExpandedNodes(prev => ({ ...prev, [parentId]: true }));
  };

  const handleStartEdit = (node: MeasurementLine) => {
    setEditingNodeId(node.id);
    setEditLabel(node.label);
    setEditType(node.type || 'dimension');
    setEditCoeff(Math.abs(node.coefficient).toString() || "1");
    setEditLength(node.length?.toString() || "");
    setEditWidth(node.width?.toString() || "");
    setEditHeight(node.height?.toString() || "");
  };

  const handleSaveEdit = (nodeId: string) => {
    if (!editLabel.trim()) {
      alert("Veuillez saisir un libellé.");
      return;
    }

    const matchedNode = measurementLines.find(l => l.id === nodeId);
    if (!matchedNode) return;

    const isDedBranch = isAncestorDeduction(matchedNode.parentId) || matchedNode.parentId?.startsWith("sec-ded-");
    const rawCoeff = parseFloat(editCoeff) || 1;
    const coefficient = isDedBranch ? -Math.abs(rawCoeff) : Math.abs(rawCoeff);

    const lengthVal = editLength !== "" ? parseFloat(editLength) : undefined;
    const widthVal = editWidth !== "" ? parseFloat(editWidth) : undefined;
    const heightVal = editHeight !== "" ? parseFloat(editHeight) : undefined;

    const computedValue = editType === 'section' ? 0 : coefficient * (lengthVal ?? 1) * (widthVal ?? 1) * (heightVal ?? 1);

    const updated = measurementLines.map(l => {
      if (l.id === nodeId) {
        return {
          ...l,
          label: editLabel.trim(),
          type: editType,
          coefficient: editType === 'section' ? 0 : coefficient,
          length: editType === 'dimension' ? lengthVal : undefined,
          width: editType === 'dimension' ? widthVal : undefined,
          height: editType === 'dimension' ? heightVal : undefined,
          computedValue: computedValue
        };
      }
      return l;
    });

    setMeasurementLines(updated);
    setEditingNodeId(null);
  };

  const handleDeleteClick = (nodeId: string) => {
    const node = measurementLines.find(l => l.id === nodeId);
    if (!node) return;

    const isRoot = node.id.startsWith("sec-add-") || node.id.startsWith("sec-ded-");
    if (isRoot) {
      alert("Les dossiers racines 'Additions' et 'Déductions' ne peuvent pas être supprimés.");
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer '${node.label}' et tous ses éléments enfants ?`)) {
      const updated = performRecursiveDelete(nodeId, measurementLines);
      setMeasurementLines(updated);
    }
  };

  const handleResetItemMetre = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider l'ensemble du métré de cet article ?")) {
      const cleanLines = measurementLines.filter(l => l.itemId !== selectedItemId);
      setMeasurementLines(cleanLines);
      // Let the useEffect rebuild clean standard roots
    }
  };

  const triggerToggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Helper formatting numbers for construction aesthetics
  const formatValue = (num: number) => {
    return Number(num).toFixed(2);
  };

  // Filtering workItems based on lookup query (for lightning-fast catalog selection)
  const filteredWorkItems = workItems.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const activeTreeRoots = buildTree(measurementLines);

  // 7. Recursive Tree Element Renderer (Renders nested hierarchy)
  const renderTreeElement = (node: TreeNode, depth: number = 0) => {
    const isSection = node.type === 'section';
    const isExpanded = !!expandedNodes[node.id];
    const isAddingHere = addingUnderId === node.id;
    const isEditingHere = editingNodeId === node.id;

    const hasChildren = node.children && node.children.length > 0;
    const childSum = getNodeVisualValue(node);
    
    // Check if this node represents a deduction value
    const isNegative = childSum < 0 || (node.type === 'dimension' && node.coefficient < 0);

    return (
      <div key={node.id} className="relative select-all font-sans">
        
        {/* Dynamic Tree line indicator graphics */}
        <div 
          className="hover:bg-amber-500/5 group flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 border-b border-stone-250 py-3 transition"
          style={{ paddingLeft: `${Math.max(8, depth * 24)}px` }}
        >
          {/* Left info label structure */}
          <div className="flex items-center gap-2 max-w-[70%]">
            
            {/* Collapse toggle arrow */}
            {isSection ? (
              <button 
                onClick={() => triggerToggleExpand(node.id)}
                className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-6 flex items-center justify-center">
                <Hash className="h-3.5 w-3.5 text-brand-gold bg-stone-900/40 p-0.5 rounded" />
              </div>
            )}

            {/* Render Node Details (Read or Edit panel) */}
            {isEditingHere ? (
              <div className="flex-1 space-y-2 py-1 select-none">
                <input
                  type="text"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="w-full text-xs font-semibold bg-stone-950 border border-stone-700 rounded px-2.5 py-1 text-white"
                  placeholder="Nom de l'élément..."
                />
                
                {editType === 'dimension' && (
                  <div className="grid grid-cols-4 gap-1.5 max-w-sm select-none">
                    <div className="space-y-0.5">
                      <label className="text-[10px] text-stone-500 uppercase">Nbre/Coeff</label>
                      <input
                        type="number"
                        step="any"
                        value={editCoeff}
                        onChange={e => setEditCoeff(e.target.value)}
                        className="w-full text-xs bg-stone-950 text-white border border-stone-700 rounded p-1 text-center"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] text-stone-500 uppercase">Long (m)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="-"
                        value={editLength}
                        onChange={e => setEditLength(e.target.value)}
                        className="w-full text-xs bg-stone-950 text-white border border-stone-700 rounded p-1 text-center"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] text-stone-500 uppercase">Larg (m)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="-"
                        value={editWidth}
                        onChange={e => setEditWidth(e.target.value)}
                        className="w-full text-xs bg-stone-950 text-white border border-stone-700 rounded p-1 text-center"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] text-stone-500 uppercase">Haut (m)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="-"
                        value={editHeight}
                        onChange={e => setEditHeight(e.target.value)}
                        className="w-full text-xs bg-stone-950 text-white border border-stone-700 rounded p-1 text-center"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveEdit(node.id)}
                    className="px-2 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Confirmer
                  </button>
                  <button
                    onClick={() => setEditingNodeId(null)}
                    className="px-2 py-1 bg-stone-850 text-stone-400 text-[10px] font-semibold rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className={`text-xs md:text-sm tracking-wide ${isSection ? 'font-black text-stone-900 group-hover:text-brand-gold' : 'font-medium text-stone-300'}`}>
                  {node.label}
                </span>

                {/* Dimension Parameters subtitle (For non-folder leaf nodes) */}
                {!isSection && (
                  <span className="text-[10px] text-stone-500 font-mono mt-0.5">
                    Coeff: <strong className="text-stone-300">{Math.abs(node.coefficient)}</strong> 
                    {node.length !== undefined && <> • L: <strong className="text-stone-300">{node.length.toFixed(2)}m</strong></>}
                    {node.width !== undefined && <> • l: <strong className="text-stone-300">{node.width.toFixed(2)}m</strong></>}
                    {node.height !== undefined && <> • h: <strong className="text-stone-300">{node.height.toFixed(2)}m</strong></>}
                  </span>
                )}
              </div>
            )}

          </div>

          {/* Right values & controls structure */}
          {!isEditingHere && (
            <div className="flex items-center justify-end gap-3 font-mono md:text-right ml-7">
              
              {/* Dynamic live computed tag value indicator */}
              <div className="flex flex-col items-end">
                <span className={`text-xs md:text-sm font-bold ${isNegative ? 'text-red-400 bg-red-500/10 border border-red-500/10 px-1.5 py-0.5 rounded' : 'text-stone-900 bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded'}`}>
                  {formatValue(childSum)} m³
                </span>
                {isSection && (
                  <span className="text-[9px] text-stone-500 select-none uppercase font-sans mt-0.5">Sub-Total</span>
                )}
              </div>

              {/* Tree nodes toolkits */}
              <div className="no-print opacity-90 lg:opacity-0 lg:group-hover:opacity-100 flex items-center gap-1 select-none transition-opacity">
                
                {/* Section Add element trigger */}
                {isSection && (
                  <button
                    onClick={() => {
                      setAddingUnderId(node.id);
                      setEditingNodeId(null);
                      setAddLabel("");
                    }}
                    title="Ajouter un sous-élément"
                    className="p-1 bg-stone-50 hover:bg-brand-gold hover:text-stone-900 border border-stone-200 rounded text-stone-900 flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="text-[9px] font-sans font-extrabold px-0.5 uppercase">Sous-Elément</span>
                  </button>
                )}

                {/* Edit details trigger */}
                <button
                  onClick={() => handleStartEdit(node)}
                  title="Modifier l'élément"
                  className="p-1 px-1.5 bg-stone-100 hover:bg-stone-250 border border-stone-200 hover:border-stone-400 text-stone-500 hover:text-stone-900 rounded"
                >
                  <Edit3 className="h-3 w-3" />
                </button>

                {/* Delete details trigger */}
                <button
                  onClick={() => handleDeleteClick(node.id)}
                  title="Supprimer définitivement"
                  className="p-1 px-1.5 bg-red-400/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/15 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>

              </div>
            </div>
          )}
        </div>

        {/* Nested Add child Inline Drawer panel */}
        {isAddingHere && (
          <div 
            className="no-print p-4 bg-stone-50 border-b border-stone-300 space-y-3 shadow-inner rounded-md m-2 select-none"
            style={{ marginLeft: `${Math.max(16, (depth + 1) * 24)}px` }}
          >
            <div className="flex items-center justify-between pb-1 border-b border-stone-200">
              <span className="text-[11px] font-bold text-stone-700 tracking-wider flex items-center gap-1 uppercase">
                <FilePlus className="h-3.5 w-3.5 text-brand-gold" /> Ajouter sous '{node.label}'
              </span>
              <button onClick={() => setAddingUnderId(null)} className="text-stone-400 hover:text-stone-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">Type de l'élément</label>
                <div className="flex rounded-md border border-stone-300 p-0.5 bg-white">
                  <button
                    onClick={() => setAddType('dimension')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition ${
                      addType === 'dimension' ? 'bg-brand-brown text-brand-gold' : 'text-stone-500'
                    }`}
                  >
                    Dimensions de Côte (L, l, H)
                  </button>
                  <button
                    onClick={() => setAddType('section')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition ${
                      addType === 'section' ? 'bg-brand-brown text-brand-gold' : 'text-stone-500'
                    }`}
                  >
                    Groupe / Dossier Parent
                  </button>
                </div>
              </div>

              {/* Element Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">Nom / Libellé de repère</label>
                <input
                  type="text"
                  required
                  placeholder={addType === 'section' ? "ex: Chambre 1, Bande de plâtre..." : "ex: Mur Nord, Façade extérieure..."}
                  value={addLabel}
                  onChange={e => setAddLabel(e.target.value)}
                  className="w-full text-xs bg-white text-stone-950 border border-stone-300 rounded px-2 py-1.5"
                />
              </div>
            </div>

            {/* Calculations Fields Inputs */}
            {addType === 'dimension' && (
              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-stone-200">
                <div className="space-y-0.5">
                  <label className="text-[10px] text-stone-500 font-semibold block">Nbre / Coeff</label>
                  <input
                    type="number"
                    step="any"
                    value={addCoeff}
                    onChange={e => setAddCoeff(e.target.value)}
                    className="w-full text-xs text-stone-950 bg-white border border-stone-300 rounded p-1 text-center"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] text-stone-500 font-semibold block">Longueur (m)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Facultatif"
                    value={addLength}
                    onChange={e => setAddLength(e.target.value)}
                    className="w-full text-xs text-stone-950 bg-white border border-stone-300 rounded p-1 text-center"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] text-stone-500 font-semibold block">Largeur (l)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Facultatif"
                    value={addWidth}
                    onChange={e => setAddWidth(e.target.value)}
                    className="w-full text-xs text-stone-950 bg-white border border-stone-300 rounded p-1 text-center"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] text-stone-500 font-semibold block">Hauteur (h)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Facultatif"
                    value={addHeight}
                    onChange={e => setAddHeight(e.target.value)}
                    className="w-full text-xs text-stone-950 bg-white border border-stone-300 rounded p-1 text-center"
                  />
                </div>
              </div>
            )}

            {/* Action Triggers */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setAddingUnderId(null)}
                className="px-3 py-1 text-[10px] font-semibold border border-stone-300 hover:border-stone-400 bg-white text-stone-600 rounded"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAddSubmit(node.id)}
                className="px-4 py-1 text-[10px] font-black bg-brand-brown hover:bg-stone-900 text-brand-gold rounded flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Valider & Insérer
              </button>
            </div>
          </div>
        )}

        {/* Recursive Children rendering */}
        {isSection && isExpanded && hasChildren && (
          <div className="relative">
            {/* Visual connecting branch structure left line */}
            <div 
              className="absolute top-0 bottom-0 border-l border-brand-gold/15 pointer-events-none select-none"
              style={{ left: `${(depth * 24) + 18}px` }}
            />
            {node.children.map(child => renderTreeElement(child, depth + 1))}
          </div>
        )}

        {/* Empty Section message placeholder */}
        {isSection && isExpanded && !hasChildren && !isAddingHere && (
          <div 
            className="text-[11px] text-stone-500 font-sans italic py-3 select-none flex items-center gap-1"
            style={{ paddingLeft: `${Math.max(16, (depth + 1) * 24) + 12}px` }}
          >
            <Info className="h-3 w-3 text-brand-gold" /> Aucun élément sous '{node.label}'. Cliquez sur "+" à droite pour en ajouter un.
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN PANEL: ARTICLES EXPLORER */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Lookup Catalog header card */}
        <div className="p-4 rounded-xl border border-stone-250 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3 select-none">
            <h3 className="font-display font-black text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-brand-gold" /> Catalogue du Marché BPU
            </h3>
            <span className="text-[10px] font-mono bg-stone-100 border border-stone-200 font-bold px-2 py-0.5 rounded-full text-stone-600">
              {filteredWorkItems.length} Articles
            </span>
          </div>

          {/* Quick Lookup catalog input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400 select-none" />
            <input
              type="text"
              placeholder="Rechercher par n° d'article, mot-clé..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-stone-50 border border-stone-250 text-stone-900 placeholder-stone-500 font-sans focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>

        {/* Dynamic scroll list of articles */}
        <div className="space-y-2 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredWorkItems.map((item) => {
            const isSelected = item.id === selectedItemId;
            const itemQty = calcItemTotalQuantity(item.id);
            const calculationsCount = measurementLines.filter(l => l.itemId === item.id && l.type !== 'section').length;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-2 relative ${
                  isSelected
                    ? "bg-brand-brown text-white border-brand-brown shadow-md"
                    : "bg-white text-stone-800 border-stone-250 hover:border-stone-350 hover:bg-stone-50"
                }`}
              >
                {/* Article Code / Unit header metadata */}
                <div className="flex items-center justify-between select-none">
                  <span className={`font-mono text-xs font-black px-2 py-0.5 rounded ${isSelected ? 'bg-brand-gold text-stone-950 shadow-xs' : 'bg-stone-150 text-stone-900'}`}>
                    Art. {item.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      Unité: {item.unit}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                      {calculationsCount} calculs
                    </span>
                  </div>
                </div>

                {/* Article short description */}
                <p className={`text-xs leading-snug line-clamp-2 ${isSelected ? 'text-stone-150 font-normal' : 'text-stone-600'}`}>
                  {item.description}
                </p>

                {/* Dynamic live aggregation count badges */}
                <div className="border-t pt-2 border-stone-200/10 flex items-center justify-between mt-1">
                  <span className={`text-[10px] font-sans font-bold uppercase tracking-wider ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                    Quantité Totale :
                  </span>
                  <span className={`font-mono text-xs font-bold ${
                    isSelected 
                      ? 'text-brand-gold' 
                      : itemQty > 0 ? 'text-brand-brown font-black' : 'text-stone-400'
                  }`}>
                    {formatValue(itemQty)} {item.unit}
                  </span>
                </div>
              </button>
            );
          })}

          {filteredWorkItems.length === 0 && (
            <div className="text-center py-12 p-4 border border-dashed border-stone-250 rounded-xl bg-white select-none text-stone-400 text-xs">
              Aucun article ne correspond à votre recherche.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN PANEL: CHOSEN ARTICLE HIERARCHICAL WORKSPACE */}
      <div className="lg:col-span-8">
        {selectedItem ? (
          <div className="bg-white rounded-2xl border border-stone-250 p-6 shadow-sm space-y-6">
            
            {/* Header: Selected article detailed visual board */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row justify-between gap-4 items-start relative select-all">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 select-none">
                  <span className="font-mono text-xs font-black bg-brand-brown text-brand-gold px-2.5 py-0.5 rounded shadow-sm">
                    ARTICLE {selectedItem.code}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase font-semibold">
                    Unité de Mesure : {selectedItem.unit}
                  </span>
                </div>
                <h2 className="font-sans font-bold text-stone-900 text-sm md:text-md leading-normal">
                  {selectedItem.description}
                </h2>
              </div>

              {/* Grand Total display badge for this article */}
              <div className="p-3 bg-[#fffbe6] border-2 border-[#fef08a] rounded-xl text-center md:text-right min-w-[140px] shadow-xs select-none">
                <span className="text-[10px] font-sans text-stone-500 uppercase font-bold block mb-0.5">Quantité Net (QT)</span>
                <span className="font-mono text-base font-black text-black block tracking-tight">
                  {formatValue(calcItemTotalQuantity(selectedItem.id))} <strong className="text-xs font-sans font-semibold text-stone-600">{selectedItem.unit}</strong>
                </span>
              </div>
            </div>

            {/* Tree Workspace workspace description & general controls */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 select-none">
              <div className="flex items-center gap-1.5 text-stone-900">
                <FolderOpen className="h-4 shadow-xs w-4 text-brand-gold" />
                <h3 className="text-xs font-display font-black uppercase tracking-wider">Plan de calcul du Métré d'Exécution</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetItemMetre}
                  className="px-2.5 py-1 text-[10px] font-semibold border border-stone-200 text-stone-500 hover:text-red-700 hover:bg-stone-50 rounded-lg flex items-center gap-1 transition"
                  title="Wipe calculations of this article and start clean"
                >
                  <RefreshCw className="h-3 w-3" /> Réinitialiser
                </button>
              </div>
            </div>

            {/* NESTED TREE ELEMENT RENDER CONTAINER */}
            <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-inner">
              
              {/* Header inside tree columns for clarity */}
              <div className="bg-stone-50 border-b border-stone-200 p-2.5 px-4 text-[10px] font-black text-stone-500 uppercase tracking-widest flex justify-between select-none">
                <span>Désignation des Prestations & Localisations</span>
                <span className="text-right pr-4">Calculateurs / Total</span>
              </div>

              <div className="divide-y divide-stone-200 bg-white">
                {activeTreeRoots.map(root => renderTreeElement(root, 0))}

                {activeTreeRoots.length === 0 && (
                  <div className="text-center py-16 p-4 select-none text-stone-400 font-sans italic text-xs">
                    Initialisation du plan hiérarchique...
                  </div>
                )}
              </div>

            </div>

            {/* Arabic / French Construction helper footer */}
            <div className="p-3 bg-brand-gold/5 border border-brand-gold/20 rounded-xl space-y-1 text-xs text-stone-600">
              <span className="font-display font-bold text-stone-900 tracking-wide flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-brand-gold animate-bounce" /> Aide méthodologique :
              </span>
              <p className="leading-relaxed">
                Conformément aux directives de passation des marchés de l'administration publique, chaque article est subdivisé en deux sections principales : 
                <strong> a) Additions (الاضافات)</strong> pour ajouter les cubages d'ouvrages construits, et 
                <strong> b) Déductions (التنزيلات)</strong> pour soustraire automatiquement les vides (comme les portes, ouvertures ou fenêtres). 
                Vous pouvez ajouter des sous-dossiers (comme Chambre 1, Couloir) à l'infini pour structurer vos calculs.
              </p>
            </div>

          </div>
        ) : (
          /* Empty Selector board helper */
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-4 select-none">
            <div className="h-16 w-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 border border-stone-200 shadow-sm mb-2">
              <Hammer className="h-7 w-7 animate-pulse text-brand-gold" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-display font-bold text-stone-900 text-sm">Aucun Article Sélectionné</h3>
              <p className="text-xs text-stone-500 font-light">
                Sélectionnez l'un des articles dans le catalogue BPU à gauche pour afficher son plan de calcul, insérer manuellement des dimensions, et organiser vos sous-éléments.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
