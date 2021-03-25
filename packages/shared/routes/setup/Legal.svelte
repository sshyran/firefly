<script lang="typescript">
    import { Button, Checkbox, OnboardingLayout, Text } from 'shared/components'
    import { createEventDispatcher } from 'svelte'
    import type { MessageFormatter } from 'shared/lib/i18n'

    export let locale: MessageFormatter
    export let mobile: boolean

    let termsAccepted = false

    const dispatch = createEventDispatcher()

    function handleContinueClick() {
        dispatch('next')
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
            <Text type="h2" classes="mb-5">{locale('views.legal.title')}</Text>
            <Text type="p" secondary classes="mb-8">{locale('views.legal.body')}</Text>
        </div>
        <div slot="leftpane__action">
            <Checkbox label={locale('views.legal.checkbox')} checked={termsAccepted} classes="mb-8" />
            <Button classes="w-full" disabled={!termsAccepted} onClick={() => handleContinueClick()}>
                {locale('actions.continue')}
            </Button>
        </div>
        <div slot="rightpane" class="w-full h-full flex items-center px-40 py-20">
            <div class="w-full text-justify py-12 pr-10 overflow-y-auto">
                <section class="mb-12">
                    <Text type="h1" classes="mb-5">{locale('views.legal.privacyPolicy.title')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.privacyPolicy.body1')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.privacyPolicy.body2')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.privacyPolicy.body3')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.privacyPolicy.body4')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.privacyPolicy.body5')}</Text>
                    <Text type="p" secondary classes="mb-10">{locale('views.legal.privacyPolicy.body6')}</Text>
                </section>
                <section>
                    <Text type="h1" classes="mb-5">{locale('views.legal.termsOfService.title')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.termsOfService.body1')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.termsOfService.body2')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.termsOfService.body3')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.termsOfService.body4')}</Text>
                    <Text type="p" secondary classes="mb-5">{locale('views.legal.termsOfService.body5')}</Text>
                    <Text type="p" secondary classes="mb-10">{locale('views.legal.termsOfService.body6')}</Text>
                </section>
            </div>
        </div>
    </OnboardingLayout>
{/if}

<style type="text/scss">
    [slot='rightpane'] section {
        scroll-margin: 3rem;
    }
</style>
