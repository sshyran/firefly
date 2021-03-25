<script lang="typescript">
    import { Button, Input, Text } from 'shared/components'
    import { hasOnlyWhitespaces } from 'shared/lib/helpers'
    import type { MessageFormatter } from 'shared/lib/i18n'
    import { accountRoute, walletRoute } from 'shared/lib/router'
    import { AccountRoutes, WalletRoutes } from 'shared/lib/typings/routes'
    import { MAX_ACCOUNT_NAME_LENGTH, selectedAccountId, setAliasAsync, wallet, WalletAccount } from 'shared/lib/wallet'

    export let locale: MessageFormatter
    export let alias: string
    export let error = ''

    const { accounts } = $wallet

    let accountAlias = alias
    let isBusy = false
    $: isAliasValid = accountAlias && !hasOnlyWhitespaces(accountAlias)

    const handleSaveClick = async () => {
        if (accountAlias) {
            error = ''
            if (accountAlias.length > MAX_ACCOUNT_NAME_LENGTH) {
                return (error = locale('error.account.length', {
                    values: {
                        length: MAX_ACCOUNT_NAME_LENGTH,
                    },
                }))
            }
            if ($accounts.find((a) => a.alias === accountAlias)) {
                return (error = locale('error.account.duplicate'))
            }
            try {
                isBusy = true

                await setAliasAsync($selectedAccountId, accountAlias)

                accounts.update((_accounts) => {
                    return _accounts.map((account) => {
                        if (account.id === $selectedAccountId) {
                            return Object.assign<WalletAccount, WalletAccount, Partial<WalletAccount>>(
                                {} as WalletAccount,
                                account,
                                {
                                    alias: accountAlias,
                                }
                            )
                        }

                        return account
                    })
                })

                selectedAccountId.set(null)
                walletRoute.set(WalletRoutes.Init)
            } catch (err) {
                error = locale(err.error)
            } finally {
                isBusy = false
            }
        }
    }
    const handleCancelClick = () => {
        error = ''
        accountRoute.set(AccountRoutes.Init)
    }
</script>

<div class="w-full h-full flex flex-col justify-between p-8">
    <div>
        <div class="flex flex-row mb-6">
            <Text type="h5">{locale('general.manageAccount')}</Text>
        </div>
        <div class="w-full h-full flex flex-col justify-between">
            <Input
                {error}
                bind:value={accountAlias}
                placeholder={locale('general.accountName')}
                autofocus
                submitHandler={handleSaveClick}
                disabled={isBusy}
            />
        </div>
    </div>
    <!-- Action -->
    {#if isBusy && !error}
        <Text secondary classes="mb-3">{locale('general.updatingAccount')}</Text>
    {/if}
    {#if !isBusy}
        <div class="flex flex-row justify-between px-2">
            <Button secondary classes="-mx-2 w-1/2" onClick={() => handleCancelClick()} disabled={isBusy}>
                {locale('actions.cancel')}
            </Button>
            <Button classes="-mx-2 w-1/2" onClick={() => handleSaveClick()} disabled={!isAliasValid || isBusy}>
                {locale('actions.save')}
            </Button>
        </div>
    {/if}
</div>
