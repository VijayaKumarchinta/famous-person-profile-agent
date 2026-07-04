import type { ProfileData } from "../types";

const STORAGE_KEY = "ai_profile_builder_profiles";
const MAX_PROFILES = 10;

export interface StoredProfile {
  id: string;
  name: string;
  context: string;
  profile: ProfileData;
  savedAt: string;
}

/**
 * Load all saved profiles from localStorage
 */
export function loadProfiles(): StoredProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Save a profile to localStorage (prepends; trims to MAX)
 */
export function saveProfile(name: string, context: string, profile: ProfileData): void {
  try {
    const existing = loadProfiles();

    // Remove duplicate if same name already saved
    const filtered = existing.filter(
      (p) => p.name.toLowerCase() !== name.toLowerCase()
    );

    const entry: StoredProfile = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      context,
      profile,
      savedAt: new Date().toISOString(),
    };

    const updated = [entry, ...filtered].slice(0, MAX_PROFILES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save profile to localStorage:", e);
  }
}

/**
 * Delete a single profile by id
 */
export function deleteProfile(id: string): void {
  try {
    const existing = loadProfiles();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not delete profile from localStorage:", e);
  }
}

/**
 * Clear all saved profiles
 */
export function clearAllProfiles(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear localStorage:", e);
  }
}
