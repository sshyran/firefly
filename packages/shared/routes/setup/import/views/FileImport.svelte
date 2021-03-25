<script lang="typescript">
    import { Button, Dropzone, Illustration, OnboardingLayout, Text } from 'shared/components'
    import type { MessageFormatter } from 'shared/lib/i18n'
    import { createEventDispatcher } from 'svelte'
    import { isSeedVaultFile, SEEDVAULT_EXTENSION, STRONGHOLD_EXTENSION } from '../import'

    export let locale: MessageFormatter
    export let mobile: boolean
    let file: ArrayBuffer | undefined
    let fileName: string | undefined
    let filePath: string | undefined

    // TODO: remove this to enable seed support
    $: isSeedVault = isSeedVaultFile(fileName)

    const dispatch = createEventDispatcher()

    function handleContinueClick() {
        dispatch('next', { file, fileName, filePath })
    }
    function handleBackClick() {
        dispatch('previous')
    }

    const onDrop = (buffer: ArrayBuffer, name: string, path: string) => {
        if (!buffer) {
            file = null
            fileName = null
            filePath = null
            return
        }

        file = buffer
        fileName = name
        filePath = path
    }
</script>

{#if mobile}
    <div>foo</div>
{:else}
    <OnboardingLayout onBackClick={handleBackClick}>
        <div slot="leftpane__content">
            <Text type="h2" classes="mb-5">{locale('views.importFromFile.title')}</Text>
            <Text type="p" secondary classes="mb-8">{locale('views.importFromFile.body')}</Text>
            <Dropzone
                {onDrop}
                {locale}
                extentionsLabel={locale('actions.importExtentions')}
                allowedExtensions={[SEEDVAULT_EXTENSION, STRONGHOLD_EXTENSION]}
            />
            {#if isSeedVault}
                <!-- TODO: remove this when enabling seed support -->
                <Text type="p" error secondary classes="mt-4">Seed Vaults are not currently supported.</Text>
            {/if}
        </div>
        <div slot="leftpane__action" class="flex flex-row flex-wrap justify-between items-center space-x-4">
            <Button classes="flex-1" disabled={!file || isSeedVault} onClick={() => handleContinueClick()}>
                {locale('actions.continue')}
            </Button>
        </div>
        <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
            <Illustration illustration="import-from-file-desktop" width="100%" height="auto" />
        </div>
    </OnboardingLayout>
{/if}
