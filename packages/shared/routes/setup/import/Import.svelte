<script lang="typescript">
    import { Transition } from 'shared/components'
    import { mnemonic } from 'shared/lib/app'
    import type { MessageFormatter } from 'shared/lib/i18n'
    import { newProfile } from 'shared/lib/profile'
    import { asyncRestoreBackup } from 'shared/lib/wallet'
    import { createEventDispatcher } from 'svelte'
    import { ImportGroupType, ImportType, isSeed, isSeedVaultFile, isStrongholdFile } from './import'
    import { BackupPassword, FileImport, Import, Success, TextImport } from './views'

    export let locale: MessageFormatter
    export let mobile: boolean

    enum ImportState {
        Init = 'init',
        TextImport = 'textImport',
        FileImport = 'fileImport',
        BackupPassword = 'backupPassword',
        Success = 'Success',
    }

    const dispatch = createEventDispatcher()

    let importType: ImportType
    let importFilePath: string
    let busy = false

    let error = ''

    let state: ImportState = ImportState.Init
    let stateHistory = []

    const _next = async (event: { detail: { [id: string]: string } }) => {
        let nextState: ImportState
        let params = event.detail || {}

        switch (state) {
            case ImportState.Init:
                const { groupType } = params
                if (groupType === ImportGroupType.Text) {
                    nextState = ImportState.TextImport
                } else if (groupType === ImportGroupType.File) {
                    nextState = ImportState.FileImport
                }
                break
            case ImportState.TextImport:
                const { input } = params
                if (isSeed(input)) {
                    importType = ImportType.Seed
                    dispatch('next', { importType })
                } else {
                    importType = ImportType.Mnemonic
                    mnemonic.set(input.split(' '))
                    nextState = ImportState.Success
                }
                break
            case ImportState.FileImport:
                const { fileName, filePath } = params
                importFilePath = filePath

                if (isSeedVaultFile(fileName)) {
                    importType = ImportType.SeedVault
                } else if (isStrongholdFile(fileName)) {
                    importType = ImportType.Stronghold
                }
                nextState = ImportState.BackupPassword
                break

            case ImportState.BackupPassword:
                const { password } = params
                busy = true

                try {
                    await asyncRestoreBackup(importFilePath, password)
                    $newProfile.lastStrongholdBackupTime = new Date()
                    nextState = ImportState.Success
                } catch (err) {
                    error = locale(err.error)
                } finally {
                    busy = false
                }
                break

            case ImportState.Success:
                dispatch('next', { importType })
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

{#if state === ImportState.Init}
    <Transition>
        <Import on:next={_next} on:previous={_previous} {locale} {mobile} />
    </Transition>
{:else if state === ImportState.TextImport}
    <Transition>
        <TextImport on:next={_next} on:previous={_previous} {locale} {mobile} />
    </Transition>
{:else if state === ImportState.FileImport}
    <Transition>
        <FileImport on:next={_next} on:previous={_previous} {locale} {mobile} />
    </Transition>
{:else if state === ImportState.BackupPassword}
    <Transition>
        <BackupPassword on:next={_next} on:previous={_previous} {importType} {error} {locale} {mobile} {busy} />
    </Transition>
{:else if state === ImportState.Success}
    <Transition>
        <Success on:next={_next} on:previous={_previous} {importType} {locale} {mobile} />
    </Transition>
{/if}
