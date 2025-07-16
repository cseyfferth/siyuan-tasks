<!--
 Copyright (c) 2023 by frostime All Rights Reserved.
 Author       : frostime
 Date         : 2023-07-01 19:23:50
 LastEditTime : 2024-08-09 21:41:07
 Description  : 
-->
<script lang="ts">
    import FormWrap from './form-wrap.svelte';
    import FormInput from './form-input.svelte';
    import type { ISettingItem } from '@/libs/index.d.ts';

    export let group: string;
    export let settingItems: ISettingItem[];
    export let display: boolean = true;
    export let onSettingChange: (group: string, key: string, value: unknown) => void = () => {};

    $: fn__none = display ? "" : "fn__none";

    const handleValueChange = (key: string, value: unknown) => {
        onSettingChange(group, key, value);
    };
</script>

<div class="config__tab-container {fn__none}" data-name={group}>
    <slot />
    {#each settingItems as item (item.key)}
        <FormWrap
            title={item.title}
            description={item.description}
            direction={item?.direction}
        > 
            <FormInput
                type={item.type}
                key={item.key}
                bind:value={item.value}
                placeholder={item?.placeholder}
                options={item?.options}
                slider={item?.slider}
                button={item?.button}
                onValueChange={handleValueChange}
            />
        </FormWrap>
    {/each}
</div>