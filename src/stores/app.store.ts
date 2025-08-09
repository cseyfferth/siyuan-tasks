import { writable } from "svelte/store";
import type { App } from "siyuan";

export const appStore = writable<App | null>(null);
