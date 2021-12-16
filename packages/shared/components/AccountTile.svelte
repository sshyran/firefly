<script lang="typescript">
    import { Icon, Text } from 'shared/components'
    import { AccountPatterns } from 'shared/lib/wallet'
    import { isBright } from 'shared/lib/helpers'

    export let name = ''
    export let balance = ''
    export let balanceEquiv = ''
    export let ledger = false
    export let color = ''
    export let size = 'm' // m, l
    export let hidden = false
    export let disabled = false
    export let classes = ''

    export let onClick = (): void | string => ''
    export let disabledHover = false
    export let pattern = AccountPatterns.Default

    $: textColor = isBright(color) ? 'gray-800' : 'white'
</script>

<style type="text/scss">
    button {
        height: auto;
        min-height: 100px;
        max-height: 100%;
        &.size-l {
            min-height: 140px;
        }
        &:disabled {
            @apply pointer-events-none;
            @apply opacity-50;
        }

        &.disabled-hover {
            background-color: var(--account-color);

            &.bg-blend-exclusion {
                background-blend-mode: exclusion;
            }
        }

        &:not(.disabled-hover):hover {
            background-color: var(--account-color);

            &.bg-blend-exclusion {
                background-blend-mode: exclusion;
            }
        }
    }
</style>

<button
    on:click={onClick}
    class="{classes} size-{size} group rounded-xl {disabledHover ? 'disabled-hover' : 'bg-gray-100 dark:bg-gray-900'}
    font-400 flex flex-col justify-between text-left text-{textColor} p-{size === 's' ? '3' : '6'} {hidden ? 'opacity-50' : ''}
    bg-no-repeat bg-right-top bg-auto" class:bg-blend-exclusion={isBright(color)}
    style="--account-color: {color}; {pattern ? `background-image: url("assets/patterns/${pattern}-gradient.svg")` : null}"
    {disabled}>
    <div class="mb-2 w-full flex flex-row justify-between items-start space-x-1.5">
        <Text
            bold
            smaller={size === 's'}
            overrideColor
            classes="mb-2 {disabledHover ? `text-${textColor}` : `text-gray-800 dark:text-white group-hover:text-${textColor}`} overflow-hidden overflow-ellipsis">
            {name}
        </Text>
        {#if ledger}
            <Icon
                icon="ledger"
                classes="text-{textColor}"
                width={size === 's' ? 13 : 21}
                height={size === 's' ? 13 : 21} />
        {/if}
    </div>
    <div
        class="flex {size === 'l' ? 'flex-row space-x-4' : 'flex-col space-y-1'} justify-between w-full flex-{size === 'l' ? 'nowrap' : 'wrap'}">
        <Text smaller overrideColor classes="block {disabledHover ? `text-${textColor}` : `text-gray-800 dark:text-white group-hover:text-${textColor}`}">{balance}</Text>
        <Text smaller overrideColor classes="block {disabledHover ? `text-${textColor}` : `text-blue-500 dark:text-gray-600 group-hover:text-${textColor}`}">{balanceEquiv}</Text>
    </div>
</button>
