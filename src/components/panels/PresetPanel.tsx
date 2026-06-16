"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "../../lib/nextRouterCompat";
import { features } from "../../lib/features";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import {
  bulkCreateUserPresets,
  createPresetFolder,
  createUserPreset,
  deletePresetFolder,
  deleteUserPreset,
  fetchUserPresetLibrary,
  renamePresetFolder,
  reorderPresetFolders,
  reorderUserPresets,
  updateUserPreset,
} from "../../lib/presets/queries";
import type { PresetSettingsV2, PresetFolderRow, UserPresetRow } from "../../lib/presets/types";
import type { ToolPresetSnapshot } from "../../lib/presets/settings";
import { snapshotFromTool } from "../../lib/presets/settings";
import {
  createLocalPreset,
  deserializeLocalPreset,
  loadLocalPresets,
  saveLocalPresets,
  serializeLocalPreset,
  type LocalPresetV2,
} from "../../utils/presets";
import { findAlgorithm } from "../../utils/algorithms";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface PresetPanelProps {
  current: ToolPresetSnapshot;
  applySettings: (settings: PresetSettingsV2) => void;
  lang: string;
}

const MIGRATED_FLAG = "ds_presets_cloud_migrated";

function presetMeta(settings: PresetSettingsV2): string {
  const algo = findAlgorithm(settings.pattern);
  return `${algo?.name ?? `#${settings.pattern}`} · ${settings.workingResolution}px`;
}

function nextSortOrder(items: { sort_order: number }[]): number {
  if (!items.length) return 0;
  return Math.max(...items.map((i) => i.sort_order)) + 1;
}

const PresetIcon: React.FC<{
  name: "edit" | "export" | "delete" | "check" | "up" | "down" | "folder";
  className?: string;
}> = ({ name, className }) => {
  switch (name) {
    case "edit":
      return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case "export":
      return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v13" />
          <path d="M8 7l4-4 4 4" />
          <path d="M5 21h14a2 2 0 0 0 2-2v-4" />
        </svg>
      );
    case "delete":
      return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "up":
      return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 14 6-6 6 6" />
        </svg>
      );
    case "down":
      return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 10 6 6 6-6" />
        </svg>
      );
    case "folder":
      return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
      );
  }
};

const PresetPanel: React.FC<PresetPanelProps> = ({ current, applySettings, lang }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const normalizedLang = normalizeLang(lang);

  const [open, setOpen] = useState(false);
  const [localPresets, setLocalPresets] = useState<LocalPresetV2[]>(() => loadLocalPresets());
  const [folders, setFolders] = useState<PresetFolderRow[]>([]);
  const [cloudPresets, setCloudPresets] = useState<UserPresetRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newName, setNewName] = useState("");
  const [saveFolderId, setSaveFolderId] = useState<string>("");
  const [showImport, setShowImport] = useState(false);
  const [importStr, setImportStr] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameScope, setRenameScope] = useState<"local" | "cloud" | "folder">("local");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [view, setView] = useState<"cloud" | "device">("cloud");

  const signedIn = !!userId && features.accounts;

  const refreshCloud = useCallback(async (uid: string) => {
    setCloudLoading(true);
    setCloudError(null);
    try {
      const lib = await fetchUserPresetLibrary(uid);
      setFolders(lib.folders);
      setCloudPresets(lib.presets);
    } catch {
      setCloudError(t("tool.presetPanel.cloudLoadError"));
    } finally {
      setCloudLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!features.accounts) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      if (user) await refreshCloud(user.id);
      else {
        setFolders([]);
        setCloudPresets([]);
      }
    };

    void sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void sync();
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshCloud]);

  useEffect(() => {
    if (!copiedId) return;
    const timer = setTimeout(() => setCopiedId(null), 1400);
    return () => clearTimeout(timer);
  }, [copiedId]);

  useEffect(() => {
    if (signedIn) setView("cloud");
  }, [signedIn]);

  const sortedLocal = useMemo(
    () => [...localPresets].sort((a, b) => b.updatedAt - a.updatedAt),
    [localPresets],
  );

  const groupedCloud = useMemo(() => {
    const byFolder = new Map<string | null, UserPresetRow[]>();
    for (const p of cloudPresets) {
      const key = p.folder_id;
      if (!byFolder.has(key)) byFolder.set(key, []);
      byFolder.get(key)!.push(p);
    }
    for (const list of byFolder.values()) {
      list.sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
    }
    return {
      uncategorized: byFolder.get(null) ?? [],
      folders: [...folders]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((folder) => ({ folder, presets: byFolder.get(folder.id) ?? [] })),
    };
  }, [cloudPresets, folders]);

  const totalCount = signedIn ? cloudPresets.length : localPresets.length;

  const persistLocal = (next: LocalPresetV2[]) => {
    setLocalPresets(next);
    saveLocalPresets(next);
  };

  const saveToDevice = () => {
    const name = newName.trim() || t("tool.presetPanel.unnamedPreset", { n: localPresets.length + 1 });
    const preset = createLocalPreset(name, snapshotFromTool(current));
    persistLocal([preset, ...localPresets]);
    setNewName("");
  };

  const saveToCloud = async () => {
    if (!userId) return;
    setBusy(true);
    setCloudError(null);
    try {
      const folderId = saveFolderId || null;
      const siblings = cloudPresets.filter((p) => p.folder_id === folderId);
      const created = await createUserPreset({
        userId,
        name: newName.trim() || t("tool.presetPanel.unnamedPreset", { n: cloudPresets.length + 1 }),
        settings: snapshotFromTool(current),
        folderId,
        sortOrder: nextSortOrder(siblings),
      });
      setCloudPresets((prev) => [...prev, created]);
      setNewName("");
    } catch {
      setCloudError(t("tool.presetPanel.cloudSaveError"));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    if (signedIn && view === "cloud") void saveToCloud();
    else saveToDevice();
  };

  const removeLocal = (id: string) => persistLocal(localPresets.filter((p) => p.id !== id));

  const removeCloud = async (id: string) => {
    setBusy(true);
    try {
      await deleteUserPreset(id);
      setCloudPresets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setCloudError(t("tool.presetPanel.cloudDeleteError"));
    } finally {
      setBusy(false);
    }
  };

  const commitRename = async () => {
    if (!renameId) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameId(null);
      return;
    }

    if (renameScope === "local") {
      persistLocal(
        localPresets.map((p) => (p.id === renameId ? { ...p, name: trimmed, updatedAt: Date.now() } : p)),
      );
    } else if (renameScope === "cloud") {
      setBusy(true);
      try {
        await updateUserPreset(renameId, { name: trimmed });
        setCloudPresets((prev) => prev.map((p) => (p.id === renameId ? { ...p, name: trimmed } : p)));
      } catch {
        setCloudError(t("tool.presetPanel.cloudSaveError"));
      } finally {
        setBusy(false);
      }
    } else if (renameScope === "folder") {
      setBusy(true);
      try {
        await renamePresetFolder(renameId, trimmed);
        setFolders((prev) => prev.map((f) => (f.id === renameId ? { ...f, name: trimmed } : f)));
      } catch {
        setCloudError(t("tool.presetPanel.cloudSaveError"));
      } finally {
        setBusy(false);
      }
    }

    setRenameId(null);
    setRenameValue("");
  };

  const startRename = (id: string, name: string, scope: typeof renameScope) => {
    setRenameId(id);
    setRenameValue(name);
    setRenameScope(scope);
  };

  const doImport = () => {
    const preset = deserializeLocalPreset(importStr);
    if (!preset) return;
    if (localPresets.some((p) => p.id === preset.id)) preset.id = `${preset.id}-im`;
    persistLocal([preset, ...localPresets]);
    setImportStr("");
    setShowImport(false);
  };

  const exportToken = (preset: LocalPresetV2) => {
    navigator.clipboard?.writeText(serializeLocalPreset(preset)).then(() => setCopiedId(preset.id)).catch(() => {});
  };

  const createFolder = async () => {
    if (!userId || !newFolderName.trim()) return;
    setBusy(true);
    try {
      const folder = await createPresetFolder(userId, newFolderName.trim(), nextSortOrder(folders));
      setFolders((prev) => [...prev, folder]);
      setNewFolderName("");
      setShowNewFolder(false);
    } catch {
      setCloudError(t("tool.presetPanel.cloudSaveError"));
    } finally {
      setBusy(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    setBusy(true);
    try {
      await deletePresetFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setCloudPresets((prev) =>
        prev.map((p) => (p.folder_id === folderId ? { ...p, folder_id: null } : p)),
      );
    } catch {
      setCloudError(t("tool.presetPanel.cloudDeleteError"));
    } finally {
      setBusy(false);
    }
  };

  const moveCloudPreset = async (preset: UserPresetRow, folderId: string | null) => {
    const siblings = cloudPresets.filter((p) => p.folder_id === folderId && p.id !== preset.id);
    setBusy(true);
    try {
      await updateUserPreset(preset.id, { folder_id: folderId, sort_order: nextSortOrder(siblings) });
      setCloudPresets((prev) =>
        prev.map((p) =>
          p.id === preset.id ? { ...p, folder_id: folderId, sort_order: nextSortOrder(siblings) } : p,
        ),
      );
    } catch {
      setCloudError(t("tool.presetPanel.cloudSaveError"));
    } finally {
      setBusy(false);
    }
  };

  const shiftCloudPreset = async (preset: UserPresetRow, direction: -1 | 1) => {
    const siblings = cloudPresets
      .filter((p) => p.folder_id === preset.folder_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = siblings.findIndex((p) => p.id === preset.id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= siblings.length) return;

    const a = siblings[idx];
    const b = siblings[swapIdx];
    setBusy(true);
    try {
      await reorderUserPresets([
        { id: a.id, sort_order: b.sort_order },
        { id: b.id, sort_order: a.sort_order },
      ]);
      setCloudPresets((prev) =>
        prev.map((p) => {
          if (p.id === a.id) return { ...p, sort_order: b.sort_order };
          if (p.id === b.id) return { ...p, sort_order: a.sort_order };
          return p;
        }),
      );
    } catch {
      setCloudError(t("tool.presetPanel.cloudSaveError"));
    } finally {
      setBusy(false);
    }
  };

  const shiftFolder = async (folder: PresetFolderRow, direction: -1 | 1) => {
    const sorted = [...folders].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((f) => f.id === folder.id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    setBusy(true);
    try {
      await reorderPresetFolders([
        { id: a.id, sort_order: b.sort_order },
        { id: b.id, sort_order: a.sort_order },
      ]);
      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === a.id) return { ...f, sort_order: b.sort_order };
          if (f.id === b.id) return { ...f, sort_order: a.sort_order };
          return f;
        }),
      );
    } catch {
      setCloudError(t("tool.presetPanel.cloudSaveError"));
    } finally {
      setBusy(false);
    }
  };

  const migrateLocalToCloud = async () => {
    if (!userId || !localPresets.length) return;
    setBusy(true);
    setCloudError(null);
    try {
      let importFolder: PresetFolderRow | null = null;
      try {
        importFolder = await createPresetFolder(userId, t("tool.presetPanel.importedFolder"), nextSortOrder(folders));
        setFolders((prev) => [...prev, importFolder!]);
      } catch {
        importFolder = null;
      }

      const folderId = importFolder?.id ?? null;
      let order = nextSortOrder(cloudPresets.filter((p) => p.folder_id === folderId));
      await bulkCreateUserPresets(
        userId,
        localPresets.map((p) => ({
          name: p.name,
          settings: p.settings,
          folderId,
          sortOrder: order++,
        })),
      );
      localStorage.setItem(MIGRATED_FLAG, "1");
      await refreshCloud(userId);
    } catch {
      setCloudError(t("tool.presetPanel.migrateError"));
    } finally {
      setBusy(false);
    }
  };

  const showMigrate =
    signedIn && localPresets.length > 0 && localStorage.getItem(MIGRATED_FLAG) !== "1";

  const renderLocalRow = (p: LocalPresetV2) => {
    const editing = renameId === p.id && renameScope === "local";
    return (
      <li key={p.id} className="group rounded border border-neutral-800 bg-neutral-900/40 px-2 py-1.5 transition-colors hover:border-neutral-700">
        <div className="flex items-center gap-1.5">
          {editing ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => void commitRename()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commitRename();
                else if (e.key === "Escape") setRenameId(null);
              }}
              className="clean-input h-7 flex-1 px-2 text-[11px]"
              autoComplete="off"
            />
          ) : (
            <button
              type="button"
              onClick={() => applySettings(p.settings)}
              className="min-w-0 flex-1 text-left focus-visible:shadow-[var(--focus-ring)]"
              title={t("tool.presetPanel.applyPreset")}
            >
              <span className="block truncate font-mono text-[11px] text-gray-200">{p.name}</span>
              <span className="block truncate text-[9px] text-gray-500">{presetMeta(p.settings)}</span>
            </button>
          )}
          <button type="button" onClick={() => !editing && startRename(p.id, p.name, "local")} disabled={editing} className="preset-icon-btn h-6 w-6" aria-label={t("tool.presetPanel.rename")}>
            <PresetIcon name="edit" className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => !editing && exportToken(p)} disabled={editing} className={`preset-icon-btn h-6 w-6 ${copiedId === p.id ? "copied" : ""}`} aria-label={t("tool.presetPanel.export")}>
            {copiedId === p.id ? <PresetIcon name="check" className="h-3.5 w-3.5" /> : <PresetIcon name="export" className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={() => !editing && removeLocal(p.id)} disabled={editing} className="preset-icon-btn danger h-6 w-6" aria-label={t("tool.presetPanel.delete")}>
            <PresetIcon name="delete" className="h-3.5 w-3.5" />
          </button>
        </div>
      </li>
    );
  };

  const renderCloudRow = (p: UserPresetRow, siblings: UserPresetRow[]) => {
    const editing = renameId === p.id && renameScope === "cloud";
    const idx = siblings.findIndex((s) => s.id === p.id);
    return (
      <li key={p.id} className="group rounded border border-neutral-800 bg-neutral-900/40 px-2 py-1.5 transition-colors hover:border-neutral-700">
        <div className="flex items-center gap-1.5">
          {editing ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => void commitRename()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commitRename();
                else if (e.key === "Escape") setRenameId(null);
              }}
              className="clean-input h-7 flex-1 px-2 text-[11px]"
              autoComplete="off"
            />
          ) : (
            <button
              type="button"
              onClick={() => applySettings(p.settings)}
              className="min-w-0 flex-1 text-left focus-visible:shadow-[var(--focus-ring)]"
              title={t("tool.presetPanel.applyPreset")}
            >
              <span className="block truncate font-mono text-[11px] text-gray-200">{p.name}</span>
              <span className="block truncate text-[9px] text-gray-500">{presetMeta(p.settings)}</span>
            </button>
          )}
          <select
            value={p.folder_id ?? ""}
            onChange={(e) => void moveCloudPreset(p, e.target.value || null)}
            className="clean-input !h-6 !max-w-[4.5rem] !px-1 text-[9px] text-gray-400"
            aria-label={t("tool.presetPanel.moveToFolder")}
            disabled={editing || busy}
          >
            <option value="">{t("tool.presetPanel.uncategorized")}</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => void shiftCloudPreset(p, -1)} disabled={editing || busy || idx <= 0} className="preset-icon-btn h-6 w-6" aria-label={t("tool.presetPanel.moveUp")}>
            <PresetIcon name="up" className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => void shiftCloudPreset(p, 1)} disabled={editing || busy || idx >= siblings.length - 1} className="preset-icon-btn h-6 w-6" aria-label={t("tool.presetPanel.moveDown")}>
            <PresetIcon name="down" className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => !editing && startRename(p.id, p.name, "cloud")} disabled={editing} className="preset-icon-btn h-6 w-6" aria-label={t("tool.presetPanel.rename")}>
            <PresetIcon name="edit" className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => !editing && void removeCloud(p.id)} disabled={editing || busy} className="preset-icon-btn danger h-6 w-6" aria-label={t("tool.presetPanel.delete")}>
            <PresetIcon name="delete" className="h-3.5 w-3.5" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="min-panel p-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]"
      >
        <span className="flex items-center gap-2">
          <span>{open ? "▾" : "▸"}</span> {t("tool.presetPanel.title")}
          {signedIn && <span className="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[9px] text-emerald-300">{t("tool.presetPanel.synced")}</span>}
        </span>
        <span className="text-[10px] text-gray-500">{totalCount}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          {features.accounts && !signedIn && (
            <div className="rounded border border-neutral-700/80 bg-neutral-900/60 px-3 py-2 text-[10px] leading-snug text-gray-400">
              {t("tool.presetPanel.signInHint")}{" "}
              <button
                type="button"
                className="text-blue-400 underline-offset-2 hover:underline"
                onClick={() => navigate(withLangPrefix("/Account", normalizedLang))}
              >
                {t("tool.presetPanel.signInLink")}
              </button>
            </div>
          )}

          {signedIn && (
            <div className="flex gap-1 rounded border border-neutral-800 bg-neutral-950/50 p-0.5">
              <button
                type="button"
                onClick={() => setView("cloud")}
                className={`flex-1 rounded px-2 py-1 font-mono text-[10px] ${view === "cloud" ? "bg-neutral-800 text-gray-200" : "text-gray-500 hover:text-gray-300"}`}
              >
                {t("tool.presetPanel.cloudTab")}
              </button>
              <button
                type="button"
                onClick={() => setView("device")}
                className={`flex-1 rounded px-2 py-1 font-mono text-[10px] ${view === "device" ? "bg-neutral-800 text-gray-200" : "text-gray-500 hover:text-gray-300"}`}
              >
                {t("tool.presetPanel.deviceTab")} ({localPresets.length})
              </button>
            </div>
          )}

          <div className="rounded border border-neutral-800 bg-neutral-950/40 p-2.5 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">{t("tool.presetPanel.saveCurrent")}</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("tool.presetPanel.nameHint")}
              className="clean-input w-full"
              aria-label={t("tool.presetPanel.presetName")}
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            {signedIn && view === "cloud" && (
              <select
                value={saveFolderId}
                onChange={(e) => setSaveFolderId(e.target.value)}
                className="clean-input w-full text-[11px]"
                aria-label={t("tool.presetPanel.saveToFolder")}
              >
                <option value="">{t("tool.presetPanel.uncategorized")}</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
            <button type="button" onClick={handleSave} disabled={busy} className="clean-btn w-full text-[10px]">
              {signedIn && view === "cloud" ? t("tool.presetPanel.saveToCloud") : t("tool.presetPanel.saveToDevice")}
            </button>
          </div>

          {cloudError && <p className="text-[10px] text-red-400">{cloudError}</p>}

          {showMigrate && (
            <button type="button" onClick={() => void migrateLocalToCloud()} disabled={busy} className="clean-btn w-full text-[10px]">
              {t("tool.presetPanel.migrateLocal", { count: localPresets.length })}
            </button>
          )}

          {(!signedIn || view === "device") && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gray-500">{t("tool.presetPanel.devicePresets")}</span>
                <button type="button" onClick={() => setShowImport((v) => !v)} className="text-[10px] text-gray-400 hover:text-gray-200">
                  {showImport ? t("tool.presetPanel.hideImport") : t("tool.presetPanel.importTokenAction")}
                </button>
              </div>
              {showImport && (
                <div className="flex gap-2">
                  <input
                    value={importStr}
                    onChange={(e) => setImportStr(e.target.value)}
                    placeholder={t("tool.presetPanel.importHint")}
                    className="clean-input flex-1 text-[11px]"
                    aria-label={t("tool.presetPanel.importToken")}
                    autoComplete="off"
                  />
                  <button type="button" onClick={doImport} className="clean-btn !px-3 text-[10px]">
                    {t("tool.presetPanel.import")}
                  </button>
                </div>
              )}
              {sortedLocal.length === 0 ? (
                <p className="text-[10px] text-gray-500">{t("tool.presetPanel.noPresets")}</p>
              ) : (
                <ul className="max-h-52 space-y-1 overflow-auto pr-1">{sortedLocal.map(renderLocalRow)}</ul>
              )}
            </>
          )}

          {signedIn && view === "cloud" && (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-gray-500">{t("tool.presetPanel.folders")}</span>
                <button type="button" onClick={() => setShowNewFolder((v) => !v)} className="clean-btn !px-2 !py-0.5 text-[10px]">
                  <span className="inline-flex items-center gap-1">
                    <PresetIcon name="folder" className="h-3 w-3" />
                    {t("tool.presetPanel.newFolder")}
                  </span>
                </button>
              </div>

              {showNewFolder && (
                <div className="flex gap-2">
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder={t("tool.presetPanel.folderName")}
                    className="clean-input flex-1 text-[11px]"
                    autoComplete="off"
                    onKeyDown={(e) => e.key === "Enter" && void createFolder()}
                  />
                  <button type="button" onClick={() => void createFolder()} disabled={busy || !newFolderName.trim()} className="clean-btn !px-3 text-[10px]">
                    {t("tool.presetPanel.add")}
                  </button>
                </div>
              )}

              {cloudLoading ? (
                <p className="text-[10px] text-gray-500">{t("tool.presetPanel.loading")}</p>
              ) : (
                <div className="max-h-64 space-y-3 overflow-auto pr-1">
                  {(groupedCloud.uncategorized.length > 0 || groupedCloud.folders.every((g) => !g.presets.length)) && (
                    <div>
                      <p className="mb-1 font-mono text-[10px] text-gray-500">{t("tool.presetPanel.uncategorized")}</p>
                      {groupedCloud.uncategorized.length === 0 ? (
                        <p className="text-[10px] text-gray-600">{t("tool.presetPanel.noPresets")}</p>
                      ) : (
                        <ul className="space-y-1">{groupedCloud.uncategorized.map((p) => renderCloudRow(p, groupedCloud.uncategorized))}</ul>
                      )}
                    </div>
                  )}

                  {groupedCloud.folders.map(({ folder, presets }) => {
                    const sortedFolders = [...folders].sort((a, b) => a.sort_order - b.sort_order);
                    const folderIndex = sortedFolders.findIndex((f) => f.id === folder.id);
                    const editingFolder = renameId === folder.id && renameScope === "folder";
                    return (
                      <div key={folder.id}>
                        <div className="mb-1 flex items-center gap-1">
                          {editingFolder ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => void commitRename()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void commitRename();
                                else if (e.key === "Escape") setRenameId(null);
                              }}
                              className="clean-input h-6 flex-1 px-2 text-[10px]"
                              autoComplete="off"
                            />
                          ) : (
                            <p className="flex-1 truncate font-mono text-[10px] text-gray-400">{folder.name}</p>
                          )}
                          <button type="button" onClick={() => void shiftFolder(folder, -1)} disabled={busy || folderIndex <= 0} className="preset-icon-btn h-5 w-5" aria-label={t("tool.presetPanel.moveUp")}>
                            <PresetIcon name="up" className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => void shiftFolder(folder, 1)} disabled={busy || folderIndex >= sortedFolders.length - 1} className="preset-icon-btn h-5 w-5" aria-label={t("tool.presetPanel.moveDown")}>
                            <PresetIcon name="down" className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => startRename(folder.id, folder.name, "folder")} className="preset-icon-btn h-5 w-5" aria-label={t("tool.presetPanel.renameFolder")}>
                            <PresetIcon name="edit" className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => void deleteFolder(folder.id)} disabled={busy} className="preset-icon-btn danger h-5 w-5" aria-label={t("tool.presetPanel.deleteFolder")}>
                            <PresetIcon name="delete" className="h-3 w-3" />
                          </button>
                        </div>
                        {presets.length === 0 ? (
                          <p className="text-[10px] text-gray-600">{t("tool.presetPanel.emptyFolder")}</p>
                        ) : (
                          <ul className="space-y-1">{presets.map((p) => renderCloudRow(p, presets))}</ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PresetPanel;
