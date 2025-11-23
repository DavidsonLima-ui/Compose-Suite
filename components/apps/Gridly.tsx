import React, { useState } from 'react';
import { GlassPane, GlassButton } from '../GlassPane';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Save, ChevronLeft, Cloud, Monitor, X, ChevronDown, Palette, Image as ImageIcon
} from 'lucide-react';

interface GridlyProps {
    onBack: () => void;
    onSave: (name: string, content: string) => void;
    initialContent?: string;
    initialName?: string;
}

interface CellData {
    value: string;
    style: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        align?: 'left' | 'center' | 'right';
        fontFamily?: string;
        color?: string;
        backgroundImage?: string;
    };
}

// 30 rows, 10 columns for prototype
const ROWS = 30;
const COLS = 10;
const COL_HEADERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...

export const Gridly: React.FC<GridlyProps> = ({ onBack, onSave, initialContent, initialName }) => {
  // Initialize grid
  const initialGrid = () => {
    if (initialContent) {
        try {
            return JSON.parse(initialContent);
        } catch (e) {
            console.error("Failed to parse sheet content", e);
        }
    }
    const grid: CellData[][] = [];
    for (let r = 0; r < ROWS; r++) {
        const row: CellData[] = [];
        for (let c = 0; c < COLS; c++) {
            row.push({ value: '', style: {} });
        }
        grid.push(row);
    }
    return grid;
  };

  const [gridData, setGridData] = useState<CellData[][]>(initialGrid);
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [saveTarget, setSaveTarget] = useState<'cloud' | 'pc' | null>(null);
  const [fileName, setFileName] = useState(initialName || 'Untitled Spreadsheet');

  // Helper to update a specific cell
  const updateCell = (r: number, c: number, updates: Partial<CellData> | Partial<CellData['style']>, isStyle = false) => {
    setGridData(prev => {
        const newGrid = [...prev];
        const newRow = [...newGrid[r]];
        if (isStyle) {
             newRow[c] = { ...newRow[c], style: { ...newRow[c].style, ...updates } };
        } else {
             newRow[c] = { ...newRow[c], ...updates };
        }
        newGrid[r] = newRow;
        return newGrid;
    });
  };

  const handleCellChange = (r: number, c: number, value: string) => {
    updateCell(r, c, { value }, false);
  };

  const handleFormat = (type: string, value?: string) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const currentStyle = gridData[r][c].style;

    let newStyle = {};
    switch (type) {
        case 'bold': newStyle = { bold: !currentStyle.bold }; break;
        case 'italic': newStyle = { italic: !currentStyle.italic }; break;
        case 'underline': newStyle = { underline: !currentStyle.underline }; break;
        case 'justifyLeft': newStyle = { align: 'left' }; break;
        case 'justifyCenter': newStyle = { align: 'center' }; break;
        case 'justifyRight': newStyle = { align: 'right' }; break;
        case 'fontFamily': newStyle = { fontFamily: value }; break;
        case 'color': newStyle = { color: value }; break;
    }
    updateCell(r, c, newStyle, true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target?.result) {
            updateCell(selectedCell.r, selectedCell.c, { backgroundImage: event.target.result as string }, true);
        }
    };
    reader.readAsDataURL(file);
  };

  const initiateSave = (target: 'cloud' | 'pc') => {
    setSaveTarget(target);
    setShowSaveMenu(false);
    setShowNameModal(true);
  };

  const performSave = () => {
    if (saveTarget === 'cloud') {
        // Save as JSON string
        onSave(fileName, JSON.stringify(gridData));
        alert(`Saved "${fileName}" to CloudBox!`);
    } else if (saveTarget === 'pc') {
        // Generate CSV
        const csvRows = [];
        // Header
        csvRows.push(',' + COL_HEADERS.join(','));
        // Rows
        gridData.forEach((row, idx) => {
            const rowValues = row.map(cell => `"${cell.value.replace(/"/g, '""')}"`);
            csvRows.push(`${idx + 1},${rowValues.join(',')}`);
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    setShowNameModal(false);
    if (saveTarget === 'cloud') {
        onBack();
    }
  };

  const getCellStyle = (style: CellData['style']) => {
    return {
        fontWeight: style.bold ? 'bold' : 'normal',
        fontStyle: style.italic ? 'italic' : 'normal',
        textDecoration: style.underline ? 'underline' : 'none',
        textAlign: style.align || 'left',
        fontFamily: style.fontFamily || 'inherit',
        fontSize: '14px', 
        color: style.color || '#000000', // Default to black
        backgroundImage: style.backgroundImage ? `url(${style.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } as React.CSSProperties;
  };

  return (
    <div className="h-full flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Name Input Modal */}
      {showNameModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <GlassPane className="w-full max-w-md p-6 !bg-white dark:!bg-gray-900 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Name your spreadsheet</h3>
                    <button onClick={() => setShowNameModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <input 
                    type="text" 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-ios-blue mb-6 text-gray-900 dark:text-white"
                    placeholder="Enter file name..."
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <GlassButton variant="ghost" onClick={() => setShowNameModal(false)}>Cancel</GlassButton>
                    <GlassButton variant="primary" onClick={performSave}>Save</GlassButton>
                </div>
            </GlassPane>
        </div>
      )}

      {/* Toolbar */}
      <div className="mx-4 mt-4 mb-2 p-0 flex items-center justify-between shrink-0 z-20 relative">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-lg md:hidden">
                <ChevronLeft size={20} />
            </button>
            <button onClick={onBack} className="hidden md:flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors px-2 font-medium">
               <ChevronLeft size={18} /> Back
            </button>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-transparent p-0 overflow-x-auto">
           <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-xl border border-white/50">
               {/* Font Family Selector */}
               <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1">
                   <select 
                      onChange={(e) => handleFormat('fontFamily', e.target.value)}
                      className="bg-transparent text-sm font-medium text-gray-900 outline-none w-32 cursor-pointer"
                      value={selectedCell ? gridData[selectedCell.r][selectedCell.c].style.fontFamily || 'Inter' : 'Inter'}
                      disabled={!selectedCell}
                   >
                       <option value="Inter" style={{fontFamily: 'Inter'}}>Inter</option>
                       <option value="Times New Roman" style={{fontFamily: 'Times New Roman'}}>Times New Roman</option>
                       <option value="Arial" style={{fontFamily: 'Arial'}}>Arial</option>
                       <option value="Courier New" style={{fontFamily: 'Courier New'}}>Courier New</option>
                       <option value="Georgia" style={{fontFamily: 'Georgia'}}>Georgia</option>
                       <option value="Verdana" style={{fontFamily: 'Verdana'}}>Verdana</option>
                   </select>
               </div>

               <div className="w-px h-4 bg-gray-300 mx-1"></div>

               <button onClick={() => handleFormat('bold')} className={`p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700 active:scale-95 ${selectedCell && gridData[selectedCell.r][selectedCell.c].style.bold ? 'bg-gray-100 shadow-sm' : ''}`}><Bold size={18} /></button>
               <button onClick={() => handleFormat('italic')} className={`p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700 active:scale-95 ${selectedCell && gridData[selectedCell.r][selectedCell.c].style.italic ? 'bg-gray-100 shadow-sm' : ''}`}><Italic size={18} /></button>
               <button onClick={() => handleFormat('underline')} className={`p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700 active:scale-95 ${selectedCell && gridData[selectedCell.r][selectedCell.c].style.underline ? 'bg-gray-100 shadow-sm' : ''}`}><Underline size={18} /></button>
               
               <div className="w-px h-4 bg-gray-300 mx-1"></div>

                {/* Text Color Picker */}
               <div className="flex items-center justify-center relative w-8 h-8 hover:bg-gray-50 rounded-full transition-colors cursor-pointer group" title="Text Color">
                    <div className="absolute pointer-events-none">
                        <Palette size={18} className="text-gray-700" />
                    </div>
                    <input
                        type="color"
                        onChange={(e) => handleFormat('color', e.target.value)}
                        value={selectedCell ? gridData[selectedCell.r][selectedCell.c].style.color || '#000000' : '#000000'}
                        className="w-8 h-8 opacity-0 cursor-pointer"
                    />
                </div>

                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                 {/* Image Upload */}
                 <div className="flex items-center justify-center relative w-8 h-8 hover:bg-gray-50 rounded-full transition-colors cursor-pointer group" title="Insert Image">
                    <div className="absolute pointer-events-none">
                        <ImageIcon size={18} className="text-gray-700" />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={!selectedCell}
                        className="w-8 h-8 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                </div>

               <div className="w-px h-4 bg-gray-300 mx-1"></div>

               <button onClick={() => handleFormat('justifyLeft')} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700 active:scale-95"><AlignLeft size={18} /></button>
               <button onClick={() => handleFormat('justifyCenter')} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700 active:scale-95"><AlignCenter size={18} /></button>
               <button onClick={() => handleFormat('justifyRight')} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700 active:scale-95"><AlignRight size={18} /></button>
            </div>
        </div>

        <div className="flex items-center gap-2 relative">
            <GlassButton 
                variant="primary" 
                className="!px-3 !py-1.5 text-sm !rounded-full" 
                onClick={() => setShowSaveMenu(!showSaveMenu)}
            >
                <Save size={16} className="mr-1" /> Save
            </GlassButton>

            {showSaveMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-1 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => initiateSave('cloud')}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-colors text-left"
                    >
                        <Cloud size={16} className="text-ios-blue"/>
                        <span>To CloudBox</span>
                    </button>
                    <button 
                        onClick={() => initiateSave('pc')}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-colors text-left"
                    >
                        <Monitor size={16} className="text-ios-green"/>
                        <span>To PC (.csv)</span>
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-hidden px-0 pb-0 z-0 flex flex-col">
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
             {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 sticky top-0 z-20 shadow-sm">
                            {/* Empty corner header for row numbers */}
                            <th className="w-10 bg-gray-50 border-r border-b border-gray-200 sticky left-0 z-30"></th>
                            {COL_HEADERS.map((header) => (
                                <th key={header} className="border-r border-b border-gray-200 p-2 min-w-[100px] text-center bg-gray-50">
                                    {header} <ChevronDown size={10} className="inline ml-1 opacity-50"/>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gridData.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {/* Row Number Column */}
                                <td className="w-10 bg-gray-50 border-r border-b border-gray-200 text-center text-xs text-gray-500 font-semibold sticky left-0 z-10 select-none">
                                    {rIdx + 1}
                                </td>
                                {row.map((cell, cIdx) => (
                                    <td 
                                        key={`${rIdx}-${cIdx}`}
                                        onClick={() => setSelectedCell({r: rIdx, c: cIdx})}
                                        className={`border-r border-b border-gray-200 p-0 relative min-w-[100px] h-8
                                            ${selectedCell?.r === rIdx && selectedCell?.c === cIdx ? 'ring-2 ring-ios-blue z-10' : ''}
                                        `}
                                    >
                                        <input 
                                            type="text"
                                            value={cell.value}
                                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                            style={getCellStyle(cell.style)}
                                            className="w-full h-full px-2 bg-transparent outline-none text-black"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};