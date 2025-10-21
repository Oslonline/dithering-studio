import React, { useState, useEffect } from 'react';
import { useSettings } from '../../state/SettingsContext';

interface CustomKernelEditorProps {
  inline?: boolean;
  defaultOpen?: boolean;
}

const CustomKernelEditor: React.FC<CustomKernelEditorProps> = ({ inline = true, defaultOpen = true }) => {
  const { customKernel, setCustomKernel, customKernelDivisor, setCustomKernelDivisor } = useSettings();
  const [open, setOpen] = useState(defaultOpen);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrix, setMatrix] = useState<number[][]>(() => 
    customKernel || [[0, 0, 7], [3, 5, 1]]
  );
  const [divisor, setDivisor] = useState(customKernelDivisor || 16);

  useEffect(() => {
    setCustomKernel(matrix);
    setCustomKernelDivisor(divisor);
  }, [matrix, divisor, setCustomKernel, setCustomKernelDivisor]);

  const updateCell = (row: number, col: number, value: string) => {
    const newMatrix = matrix.map((r, i) => 
      i === row ? r.map((c, j) => j === col ? (parseInt(value) || 0) : c) : r
    );
    setMatrix(newMatrix);
  };

  const resizeMatrix = (newRows: number, newCols: number) => {
    const newMatrix: number[][] = [];
    for (let i = 0; i < newRows; i++) {
      newMatrix[i] = [];
      for (let j = 0; j < newCols; j++) {
        newMatrix[i][j] = (matrix[i] && matrix[i][j]) || 0;
      }
    }
    setMatrix(newMatrix);
    setRows(newRows);
    setCols(newCols);
  };

  if (inline) {
    return (
      <div className="space-y-3 border-t border-neutral-700 pt-3 mt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-wide text-gray-300">Custom Kernel</span>
          <span className="text-[10px] text-gray-500">{rows}×{cols}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400">Rows</label>
            <input 
              type="number" 
              min={1} 
              max={5} 
              value={rows} 
              onChange={(e) => resizeMatrix(parseInt(e.target.value) || 1, cols)}
              className="clean-input text-center"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Cols</label>
            <input 
              type="number" 
              min={1} 
              max={7} 
              value={cols} 
              onChange={(e) => resizeMatrix(rows, parseInt(e.target.value) || 1)}
              className="clean-input text-center"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-gray-400">Divisor (sum of weights)</label>
          <input 
            type="number" 
            min={1} 
            value={divisor} 
            onChange={(e) => setDivisor(parseInt(e.target.value) || 1)}
            className="clean-input"
          />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-gray-400">Kernel Matrix</span>
          <div className="rounded border border-neutral-700 bg-neutral-900/50 p-2 overflow-x-auto">
            <div className="space-y-1">
              {matrix.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map((cell, j) => (
                    <input
                      key={`${i}-${j}`}
                      type="number"
                      value={cell}
                      onChange={(e) => updateCell(i, j, e.target.value)}
                      className="w-12 rounded border border-neutral-700 bg-neutral-800 px-1 py-1 text-center text-[11px] text-gray-300 focus:border-blue-600 focus:outline-none flex-shrink-0"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[9px] text-gray-500">Tip: Current pixel is at top row, center</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-panel p-0">
      <button 
        type="button" 
        onClick={() => setOpen(o => !o)} 
        className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" 
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span>{open ? '▾' : '▸'}</span> Custom Kernel
        </span>
        <span className="text-[10px] text-gray-500">{rows}×{cols}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Rows</label>
              <input 
                type="number" 
                min={1} 
                max={5} 
                value={rows} 
                onChange={(e) => resizeMatrix(parseInt(e.target.value) || 1, cols)}
                className="clean-input text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Cols</label>
              <input 
                type="number" 
                min={1} 
                max={7} 
                value={cols} 
                onChange={(e) => resizeMatrix(rows, parseInt(e.target.value) || 1)}
                className="clean-input text-center"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400">Divisor (sum of weights)</label>
            <input 
              type="number" 
              min={1} 
              value={divisor} 
              onChange={(e) => setDivisor(parseInt(e.target.value) || 1)}
              className="clean-input"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-gray-400">Kernel Matrix</span>
            <div className="rounded border border-neutral-700 bg-neutral-900/50 p-2 overflow-x-auto">
              <div className="space-y-1">
                {matrix.map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((cell, j) => (
                      <input
                        key={`${i}-${j}`}
                        type="number"
                        value={cell}
                        onChange={(e) => updateCell(i, j, e.target.value)}
                        className="w-12 rounded border border-neutral-700 bg-neutral-800 px-1 py-1 text-center text-[11px] text-gray-300 focus:border-blue-600 focus:outline-none flex-shrink-0"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[9px] text-gray-500">Tip: Current pixel is at top row, center</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomKernelEditor;
