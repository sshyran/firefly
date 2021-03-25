<script lang="typescript">
    import { Button, Illustration, ImportTextfield, OnboardingLayout, Text } from 'shared/components'
    import type { MessageFormatter } from 'shared/lib/i18n'
    import { createEventDispatcher } from 'svelte'
    import { isSeed } from '../import'

    export let locale: MessageFormatter
    export let mobile: boolean

    let input = ''
    let isSeedValue = false

    // TODO: remove this to enable seed support
    $: isSeedValue = isSeed(input)

    const dispatch = createEventDispatcher()

    function handleContinueClick() {
        dispatch('next', { input })
    }
    function handleBackClick() {
        dispatch('previous')
    }
</script>

{#if mobile}
    <div>foo</div>
{:else}
    <OnboardingLayout onBackClick={handleBackClick}>
        <div slot="leftpane__content">
            <Text type="h2" classes="mb-5">{locale('views.importFromText.title')}</Text>
            <Text type="p" secondary classes="mb-4">{locale('views.importFromText.body1')}</Text>
            <Text type="p" secondary classes="mb-8">{locale('views.importFromText.body2')}</Text>
            <Text type="h5" classes="mb-4">{locale('views.importFromText.body3')}</Text>
            <ImportTextfield bind:value={input} {locale} />
            {#if isSeedValue}
                <!-- TODO: remove this when enabling seed support -->
                <Text type="p" error secondary classes="mt-4">Seeds are not currently supported.</Text>
            {/if}
        </div>
        <div slot="leftpane__action" class="flex flex-row flex-wrap justify-between items-center space-x-4">
            <Button classes="flex-1" disabled={input.length === 0 || isSeedValue} onClick={() => handleContinueClick()}>
                {locale('actions.continue')}
            </Button>
        </div>
        <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
            <Illustration illustration="import-from-text-desktop" width="auto" height="100%" />
        </div>
    </OnboardingLayout>
{/if}
