import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DitherPreset, loadPresets, savePresets, createPreset, serializePreset, deserializePreset, DitherParams } from "../utils/presets";

interface PresetPanelProps {
  current: { params: DitherParams; workingResolution: number; paletteId?: string | null; activePaletteColors?: [number, number, number][] | null };
  apply: (p: DitherPreset) => void;
}

const PresetPanel: React.FC<PresetPanelProps> = ({ current, apply }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState<DitherPreset[]>(() => loadPresets());
  const [newName, setNewName] = useState("");
  const [importStr, setImportStr] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const saveCurrent = () => {
    const p = createPreset(newName.trim() || `Preset ${presets.length + 1}`, { ...current.params, workingResolution: current.workingResolution, paletteId: current.paletteId || null, activePaletteColors: current.activePaletteColors || null });
    const next = [p, ...presets].slice(0, 200);
    setPresets(next);
    savePresets(next);
    setNewName("");
  };

  const remove = (id: string) => {
    const next = presets.filter((p: DitherPreset) => p.id !== id);
    setPresets(next);
    savePresets(next);
  };
  const startRename = (p: DitherPreset) => { setRenameId(p.id); setRenameValue(p.name); };
  const commitRename = () => {
    if (!renameId) return;
    setPresets(prev => {
      const next = prev.map(p => p.id === renameId ? { ...p, name: renameValue.trim() || p.name, updatedAt: Date.now() } : p);
      savePresets(next);
      return [...next];
    });
    setRenameId(null);
    setRenameValue("");
  };
  const cancelRename = () => { setRenameId(null); setRenameValue(""); };

  const doImport = () => {
    const token = importStr.trim();
    if (!token) return;
    const preset = deserializePreset(token);
    if (!preset) return;
    if (presets.some(p => p.id === preset.id)) preset.id = preset.id + '-im';
    const next = [preset, ...presets].slice(0, 300);
    setPresets(next);
    savePresets(next);
    setImportStr("");
  };

  const filtered = useMemo(() => [...presets].sort((a,b)=> (b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt)), [presets]);

  const exportSingle = (p: DitherPreset) => {
    const token = serializePreset(p);
    navigator.clipboard?.writeText(token).then(()=> setCopiedId(p.id)).catch(()=>{});
  };

  useEffect(()=>{ if(!copiedId) return; const t=setTimeout(()=> setCopiedId(null), 1400); return ()=> clearTimeout(t); },[copiedId]);

  const Icon: React.FC<{ name: 'edit' | 'export' | 'delete' | 'check'; className?: string }> = ({ name, className }) => {
    switch(name){
      case 'edit': return (<svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>);
      case 'export': return (<svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13" /><path d="M8 7l4-4 4 4" /><path d="M5 21h14a2 2 0 0 0 2-2v-4" /></svg>);
      case 'delete': return (<svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" /></svg>);
      case 'check': return (<svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>);
    }
  };

  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]">
        <span className="flex items-center gap-2">
          <span>{open ? "▾" : "▸"}</span> {t('tool.presetPanel.title')}
        </span>
        <span className="text-[10px] text-gray-500">{presets.length}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('tool.presetPanel.nameHint')} className="clean-input flex-1" aria-label={t('tool.presetPanel.presetName')} />
            <button onClick={saveCurrent} className="clean-btn !px-3 text-[10px]" title={t('tool.presetPanel.saveHint')}>
              {t('tool.presetPanel.save')}
            </button>
          </div>
          <div className="flex gap-2">
            <input value={importStr} onChange={(e) => setImportStr(e.target.value)} placeholder={t('tool.presetPanel.importHint')} className="clean-input flex-1" aria-label={t('tool.presetPanel.importToken')} />
            <button onClick={doImport} className="clean-btn !px-3 text-[10px]" title={t('tool.presetPanel.importTokenHint')}>
              {t('tool.presetPanel.import')}
            </button>
          </div>
          {filtered.length === 0 && <p className="text-[10px] text-gray-500">{t('tool.presetPanel.noPresets')}</p>}
          {filtered.length > 0 && (
            <ul className="max-h-48 space-y-1 overflow-auto pr-1">
              {filtered.map(p => {
                const editing = renameId === p.id;
                return (
                  <li key={p.id} className="group rounded border border-neutral-800 bg-neutral-900/40 px-2 py-1 transition-colors hover:border-neutral-700">
                    <div className="flex items-center gap-2">
                      {editing ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={e => { if (e.key === 'Enter') commitRename(); else if (e.key === 'Escape') cancelRename(); }}
                          className="clean-input flex-1 h-6 px-2 text-[11px]"
                        />
                      ) : (
                        <button type="button" onClick={() => apply(p)} className="flex-1 h-6 truncate text-left font-mono text-[11px] text-gray-200 focus-visible:shadow-[var(--focus-ring)]" title={t('tool.presetPanel.applyPreset')}>{p.name}</button>
                      )}
                      <button onClick={() => !editing && startRename(p)} disabled={editing} className="preset-icon-btn h-6 w-6" aria-label={t('tool.presetPanel.rename')} title={editing? t('tool.presetPanel.finishEditing'):t('tool.presetPanel.rename')}>
                        <Icon name="edit" className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => !editing && exportSingle(p)} disabled={editing} className={`preset-icon-btn h-6 w-6 ${copiedId === p.id ? 'copied' : ''}`} aria-label={t('tool.presetPanel.export')} title={editing? t('tool.presetPanel.finishEditing'): (copiedId===p.id? t('tool.presetPanel.copied'):t('tool.presetPanel.copyToken'))}>
                        {copiedId === p.id ? <Icon name='check' className='h-3.5 w-3.5' /> : <Icon name='export' className='h-3.5 w-3.5' />}
                      </button>
                      <button onClick={() => !editing && remove(p.id)} disabled={editing} className="preset-icon-btn danger h-6 w-6" aria-label={t('tool.presetPanel.delete')} title={editing? t('tool.presetPanel.finishEditing'):t('tool.presetPanel.deletePreset')}>
                        <Icon name="delete" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PresetPanel;
