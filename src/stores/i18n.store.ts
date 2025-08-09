import { writable } from "svelte/store";
import type { I18N } from "@/types/i18n";
import enUs from "../../public/i18n/en_US.json" assert { type: "json" };

export const i18nStore = writable<I18N>(enUs as I18N);
