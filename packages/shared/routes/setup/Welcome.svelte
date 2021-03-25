<script lang="typescript">
    import { Button, Dropdown, Illustration, Logo, OnboardingLayout, Text } from 'shared/components'
    import { appSettings } from 'shared/lib/appSettings'
    import { locales, setLanguage, _ } from 'shared/lib/i18n'
    import { createEventDispatcher } from 'svelte'
    import type { MessageFormatter } from 'shared/lib/i18n'

    export let locale: MessageFormatter
    export let mobile: boolean

    const dispatch = createEventDispatcher()

    const handleContinueClick = () => {
        dispatch('next')
    }

    const handleLanguage = (item: { value: string; label: string }) => {
        setLanguage(item)
        locale = $_
    }
</script>

{#if mobile}
    <div>foo</div>
{:else}
    <OnboardingLayout allowBack={false}>
        <div slot="leftpane__content">
            <Logo width="64px" logo="logo-firefly" classes="mb-10" />
            <Text type="h1" classes="mb-4">{locale('views.onboarding1.title')}</Text>
            <Text type="p" secondary classes="mb-10">{locale('views.onboarding1.body')}</Text>
            <Dropdown
                sortItems={true}
                onSelect={handleLanguage}
                value={locales[$appSettings.language]}
                items={Object.values(locales).map((locale) => ({ value: locale, label: locale }))}
            />
        </div>
        <div slot="leftpane__action">
            <Button onClick={() => handleContinueClick()} classes="w-full">{locale('actions.continue')}</Button>
        </div>
        <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
            <Illustration illustration="welcome-desktop" width="100%" height="auto" />
        </div>
    </OnboardingLayout>
{/if}
