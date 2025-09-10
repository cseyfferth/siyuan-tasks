import { writable } from "svelte/store";
import type { I18N } from "@/types/i18n";

// No default import needed - will be set immediately by Siyuan host
export const i18nStore = writable<I18N>({} as I18N);
