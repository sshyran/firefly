<script lang="typescript">
    import { Button, Illustration, OnboardingLayout, Text } from 'shared/components'
    import type { MessageFormatter } from 'shared/lib/i18n'
    import { createEventDispatcher } from 'svelte'
    import { ImportGroupType } from '../import'

    export let locale: MessageFormatter
    export let mobile: boolean

    const dispatch = createEventDispatcher()

    function handleContinueClick(groupType: ImportGroupType) {
        dispatch('next', { groupType })
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
            <Text type="h2" classes="mb-5">{locale('views.import.title')}</Text>
            <Text type="p" secondary classes="mb-8">{locale('views.import.body')}</Text>
        </div>
        <div slot="leftpane__action">
            <Button icon="language" classes="w-full mb-5" secondary onClick={() => handleContinueClick(ImportGroupType.Text)}>
                {locale('general.haveTextBackup')}
                <Text type="p" secondary smaller>{locale('general.enterSeedOrPhrase')}</Text>
            </Button>
            <Button icon="doc" classes="w-full mb-8" secondary onClick={() => handleContinueClick(ImportGroupType.File)}>
                {locale('general.haveFileBackup')}
                <Text type="p" secondary smaller>{locale('general.uploadSeedvaultOrStronghold')}</Text>
            </Button>
        </div>
        <div slot="rightpane" class="w-full h-full flex justify-end items-center bg-purple-green dark:bg-gray-900">
            <Illustration width="100%" height="auto" illustration="import-desktop" />
        </div>
    </OnboardingLayout>
{/if}
