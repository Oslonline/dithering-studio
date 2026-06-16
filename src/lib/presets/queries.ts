import { getSupabaseBrowserClient } from "../supabase/client";
import type { PresetSettingsV2, PresetFolderRow, UserPresetRow } from "./types";

export async function fetchUserPresetLibrary(userId: string): Promise<{
  folders: PresetFolderRow[];
  presets: UserPresetRow[];
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  const [foldersRes, presetsRes] = await Promise.all([
    supabase
      .from("preset_folders")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("user_presets")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (foldersRes.error) throw foldersRes.error;
  if (presetsRes.error) throw presetsRes.error;

  return {
    folders: (foldersRes.data ?? []) as PresetFolderRow[],
    presets: (presetsRes.data ?? []) as UserPresetRow[],
  };
}

export async function createPresetFolder(userId: string, name: string, sortOrder: number): Promise<PresetFolderRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  const { data, error } = await supabase
    .from("preset_folders")
    .insert({ user_id: userId, name: name.trim(), sort_order: sortOrder })
    .select("*")
    .single();

  if (error) throw error;
  return data as PresetFolderRow;
}

export async function renamePresetFolder(folderId: string, name: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  const { error } = await supabase.from("preset_folders").update({ name: name.trim() }).eq("id", folderId);
  if (error) throw error;
}

export async function deletePresetFolder(folderId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  const { error } = await supabase.from("preset_folders").delete().eq("id", folderId);
  if (error) throw error;
}

export async function reorderPresetFolders(updates: { id: string; sort_order: number }[]): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from("preset_folders").update({ sort_order }).eq("id", id),
    ),
  );
}

export async function createUserPreset(input: {
  userId: string;
  name: string;
  settings: PresetSettingsV2;
  folderId: string | null;
  sortOrder: number;
}): Promise<UserPresetRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  const { data, error } = await supabase
    .from("user_presets")
    .insert({
      user_id: input.userId,
      name: input.name.trim(),
      settings: input.settings,
      settings_version: input.settings.version,
      folder_id: input.folderId,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as UserPresetRow;
}

export async function updateUserPreset(
  presetId: string,
  patch: Partial<Pick<UserPresetRow, "name" | "folder_id" | "sort_order" | "settings">>,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  const { error } = await supabase.from("user_presets").update(patch).eq("id", presetId);
  if (error) throw error;
}

export async function deleteUserPreset(presetId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  const { error } = await supabase.from("user_presets").delete().eq("id", presetId);
  if (error) throw error;
}

export async function reorderUserPresets(
  updates: { id: string; sort_order: number; folder_id?: string | null }[],
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");

  await Promise.all(
    updates.map(({ id, sort_order, folder_id }) => {
      const patch: { sort_order: number; folder_id?: string | null } = { sort_order };
      if (folder_id !== undefined) patch.folder_id = folder_id;
      return supabase.from("user_presets").update(patch).eq("id", id);
    }),
  );
}

export async function bulkCreateUserPresets(
  userId: string,
  items: { name: string; settings: PresetSettingsV2; folderId: string | null; sortOrder: number }[],
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Not configured.");
  if (!items.length) return;

  const { error } = await supabase.from("user_presets").insert(
    items.map((item) => ({
      user_id: userId,
      name: item.name,
      settings: item.settings,
      settings_version: item.settings.version,
      folder_id: item.folderId,
      sort_order: item.sortOrder,
    })),
  );

  if (error) throw error;
}
