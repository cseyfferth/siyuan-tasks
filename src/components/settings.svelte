<script lang="ts">
    import { showMessage } from "siyuan";
    import SettingPanel from "./ui/setting-panel.svelte";
    import { PluginSetting } from "@/stores/config.store";
    import { type I18N } from "@/types/i18n";
    
    let groups: string[] = ["General", "✨ Group 2"];
    let focusGroup = $state(groups[0]);
  
    interface Props {
    i18n: I18N;
    }

    let { i18n }: Props = $props();

    const group1Items: ISettingItem[] = [
        {
            key: PluginSetting.AutoRefresh,
            value: true,
            type: "checkbox",
            title: i18n.setting.autoRefresh,
            description: i18n.setting.autoRefreshDesc,
        },
        {
            key: PluginSetting.RefreshInterval,
            value: 30,
            type: "number",
            title: i18n.setting.refreshInterval,
            description: i18n.setting.refreshIntervalDesc,
            // callback: () => {
            //     // Enforce minimum refresh interval when user changes the setting
            //     const currentValue = this.settingUtils.get(
            //         PluginSetting.RefreshInterval
            //     ) as number;
            //     if (currentValue < MIN_REFRESH_INTERVAL) {
            //         this.settingUtils.set(
            //         PluginSetting.RefreshInterval,
            //         MIN_REFRESH_INTERVAL
            //         );
            //     }
            // },
        },
        {
            key: PluginSetting.ShowCompleted,
            value: true,
            type: "checkbox",
            title: i18n.setting.showCompleted,
            description: i18n.setting.showCompletedDesc,
        },
        {
            key: PluginSetting.SortBy,
            value: "created",
            type: "select",
            title: i18n.setting.sortBy,
            description: i18n.setting.sortByDesc,
            options: {
                created: i18n.setting.sortOptions.created,
                updated: i18n.setting.sortOptions.updated,
                content: i18n.setting.sortOptions.content,
                priority: i18n.setting.sortOptions.priority,
            },
        }
    ];

    const group2Items: ISettingItem[] = [
        {
            type: 'button',
            title: 'button',
            description: 'This is a button',
            key: 'e',
            value: 'Click Button',
            button: {
                label: 'Click Me',
                callback: () => {
                    showMessage('Hello, world!');
                }
            }
        },
    ];

    /********** Events **********/
    interface ChangeEvent {
        group: string;
        key: string;
        value: any;
    }

    const onChanged = ({ detail }: CustomEvent<ChangeEvent>) => {
        if (detail.group === groups[0]) {
            // setting.set(detail.key, detail.value);
            //Please add your code here
            //Udpate the plugins setting data, don't forget to call plugin.save() for data persistence
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
            on:changed={onChanged}
            on:click={({ detail }) => { console.debug("Click:", detail.key); }}
        >
        </SettingPanel>
        <SettingPanel
            group={groups[1]}
            settingItems={group2Items}
            display={focusGroup === groups[1]}
            on:changed={onChanged}
            on:click={({ detail }) => { console.debug("Click:", detail.key); }}
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
