<script lang="typescript">
    import { Transition } from 'shared/components'
    import { createEventDispatcher } from 'svelte'
    import type { MessageFormatter } from 'shared/lib/i18n'
    import { EnterPin, SelectProfile } from './views'

    export let locale: MessageFormatter
    export let mobile: boolean

    enum LoginState {
        Init = 'init',
        EnterPin = 'enterPin',
    }

    const dispatch = createEventDispatcher()

    let state: LoginState = LoginState.Init
    let stateHistory = []

    const _next = (event: { detail: { [id: string]: string } }) => {
        let nextState: LoginState
        let params = event.detail || {}
        switch (state) {
            case LoginState.Init:
                const { shouldAddProfile } = params

                if (shouldAddProfile) {
                    dispatch('next', { shouldAddProfile })
                } else {
                    nextState = LoginState.EnterPin
                }
                break
            case LoginState.EnterPin:
                dispatch('next')
                break
        }
        if (nextState) {
            stateHistory.push(state)
            stateHistory = stateHistory
            state = nextState
        }
    }
    const _previous = () => {
        let prevState = stateHistory.pop()
        if (prevState) {
            state = prevState
        } else {
            dispatch('previous')
        }
    }
</script>

{#if state === LoginState.Init}
    <Transition>
        <SelectProfile on:next={_next} on:previous={_previous} {locale} {mobile} />
    </Transition>
{:else if state === LoginState.EnterPin}
    <Transition>
        <EnterPin on:next={_next} on:previous={_previous} {locale} {mobile} />
    </Transition>
{/if}
