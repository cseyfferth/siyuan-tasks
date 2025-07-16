<script lang="ts">
    import { showMessage } from "siyuan";
    import SettingPanel from "./ui/setting-panel.svelte";
    import { PluginSetting, MIN_REFRESH_INTERVAL } from "@/stores/config.store";
    import { type I18N } from "@/types/i18n";
    import { configStore } from "@/stores/config.store";
    import { Plugin } from "siyuan";
    import { TaskDisplayMode } from "@/types/tasks";
    import { STORAGE_NAME } from "@/libs/const";
    
    let groups: string[] = ["General", "Layout"];
    let focusGroup = $state(groups[0]);
  
    interface Props {
        i18n: I18N;
        plugin: Plugin;
    }

    let { i18n, plugin }: Props = $props();

    const group1Items = $derived([
        {
            key: PluginSetting.AutoRefresh,
            value: $configStore.autoRefresh,
            type: "checkbox" as const,
            title: i18n.setting.autoRefresh,
            description: i18n.setting.autoRefreshDesc,
        },
        {
            key: PluginSetting.RefreshInterval,
            value: $configStore.refreshInterval,
            type: "number" as const,
            title: i18n.setting.refreshInterval,
            description: i18n.setting.refreshIntervalDesc,
        },
        {
            key: PluginSetting.MaxTasks,
            value: $configStore.maxTasks,
            type: "number" as const,
            title: i18n.setting.maxTasks,
            description: i18n.setting.maxTasksDesc,
        },
        {
            key: PluginSetting.ShowCompleted,
            value: $configStore.showCompleted,
            type: "checkbox" as const,
            title: i18n.setting.showCompleted,
            description: i18n.setting.showCompletedDesc,
        },
        {
            key: PluginSetting.SortBy,
            value: $configStore.sortBy,
            type: "select" as const,
            title: i18n.setting.sortBy,
            description: i18n.setting.sortByDesc,
            options: {
                created: i18n.setting.sortOptions.created,
                updated: i18n.setting.sortOptions.updated,
                content: i18n.setting.sortOptions.content,
                priority: i18n.setting.sortOptions.priority,
            },
        }
    ]);

    const group2Items = $derived([
        {
            key: PluginSetting.DisplayMode,
            value: $configStore.displayMode,
            type: "select" as const,
            title: i18n.setting.displayMode,
            description: i18n.setting.displayModeDesc,  
            options: {
                [TaskDisplayMode.ONLY_TASKS]: i18n.setting.displayOptions.onlyTasks,
                [TaskDisplayMode.NOTEBOOK_DOCUMENT_TASKS]: i18n.setting.displayOptions.notebookDocumentTasks,
                [TaskDisplayMode.NOTEBOOK_TASKS]: i18n.setting.displayOptions.notebookTasks,
            },
        }
    ]);

    /********** Callbacks **********/
    const onSettingChange = async (group: string, key: string, value: unknown) => {
        console.log("onSettingChange", { group, key, value });
        
        if (group === groups[0] || group === groups[1]) {
            try {
                // Handle special validation for refresh interval
                let finalValue = value;
                if (key === PluginSetting.RefreshInterval) {
                    finalValue = Math.max(value as number, MIN_REFRESH_INTERVAL);
                    if (finalValue !== value) {
                        showMessage(`Refresh interval set to minimum: ${finalValue} seconds`);
                    }
                }
                
                // Update config store using dynamic setter
                configStore.setSetting(key as PluginSetting, finalValue);
                
                // Save settings to storage using plugin's saveData method
                await plugin.saveData(STORAGE_NAME, configStore.getSettingsObject());
                console.log("Settings saved successfully");
            } catch (error) {
                console.error("Failed to save settings:", error);
                showMessage("Failed to save settings");
            }
        }
    };
</script>

<div class="fn__flex-1 fn__flex config__panel">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each groups as group}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                data-name="editor"
                class:b3-list-item--focus={group === focusGroup}
                class="b3-list-item"
                onclick={() => {
                    focusGroup = group;
                }}
                onkeydown={(e) => {
                    if (e.key === "Enter") {
                        focusGroup = group;
                    }
                }}
            >
                <span class="b3-list-item__text">{group}</span>
            </li>
        {/each}
    </ul>
    <div class="config__tab-wrap">
        <SettingPanel
            group={groups[0]}
            settingItems={group1Items}
            display={focusGroup === groups[0]}
            onSettingChange={onSettingChange}
        >
        </SettingPanel>
        <SettingPanel
            group={groups[1]}
            settingItems={group2Items}
            display={focusGroup === groups[1]}
            onSettingChange={onSettingChange}
        >
        </SettingPanel>
    </div>
</div>

<style lang="scss">
    .config__panel {
        height: 100%;
    }
    .config__panel > ul > li {
        padding-left: 1rem;
    }
</style>
