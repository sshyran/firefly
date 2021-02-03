import { readable, writable, get, derived } from 'svelte/store'
import { logged, notification, walletPin, strongholdPassword, profiles } from 'shared/lib/app'

/**
 * Sets next route
 *
 * @method setRoute
 *
 * @param {string} path
 *
 * @returns {void}
 */
export const setRoute = (path: string): void => {
    view.set(path)
}

/**
 * Application path based on location hash
 */
export const path = readable<string>(null, (set) => {
    const updatePath = (): void => {
        const pathName = window.location.hash.substr(1)
        set(pathName)
        notification.set(null)
    }

    window.addEventListener('hashchange', updatePath)
    updatePath()

    return (): void => {
        window.removeEventListener('hashchange', updatePath)
    }
})

/*
 * Current view
 */
export const view = writable<string>(null)

/**
 * Application Routes
 */
export enum AppRoute {
    Welcome = 'welcome',
    Legal = 'legal',
    Language = 'language',
    Setup = 'setup',
    Create = 'create',
    Password = 'password',
    LedgerSetup = 'ledgerSetup',
    Protect = 'protect',
    Backup = 'backup',
    Import = 'import',
    Migrate = 'migrate',
    Balance = 'balance',
    Congratulations = 'congratulations',
    Dashboard = 'dashboard',
    Login = 'login',
}

export enum SetupType {
    New = 'new',
    Import = 'import',
    Mnemonic = 'mnemonic',
    Seed = 'seed',
    Stronghold = 'stronghold',
    Seedvault = 'seedvault',
}

export enum AccountType {
    Software = 'Software',
    Ledger = 'Ledger'
}

/**
 * Application route history
 */
const history = writable<Array<string>>([])

/**
 * Onboarding/setup type
 */
let walletSetupType = writable<SetupType>(null)

/**
 * Onboarding/setup account type
 */
let walletSetupAccountType = writable<AccountType>(null)

/**
 * Navigate to initial route
 */
export const initRouter = () => {
    let hasCompletedSetup: boolean = get(profiles).length > 0;

    if (hasCompletedSetup) {
        setRoute(AppRoute.Login)
    } else {
        setRoute(AppRoute.Welcome)
    }
}

// TODO: only handle route changes, not app variables
export const routerNext = (event) => {
    let params = event.detail || {}
    const currentRoute: string = get(view)
    let nextRoute: AppRoute

    switch (currentRoute) {
        case AppRoute.Login:
            const { shouldAddProfile } = params;

            nextRoute = shouldAddProfile ? AppRoute.Setup : AppRoute.Dashboard
            break
        case AppRoute.Dashboard:
            const { reset } = params

            if (reset) {
                nextRoute = AppRoute.Login
            }
            break

        case AppRoute.Welcome:
            nextRoute = AppRoute.Legal
            break
        case AppRoute.Legal:
            nextRoute = AppRoute.Language
            break
        case AppRoute.Language:
            nextRoute = AppRoute.Setup
            break
        case AppRoute.Setup:
            const { setupType } = params
            if (setupType) {
                walletSetupType.set(setupType)
                if (setupType === SetupType.New) {
                    nextRoute = AppRoute.Create
                } else if (setupType === SetupType.Import) {
                    nextRoute = AppRoute.Import
                }
            }
            break
        case AppRoute.Create:
            const { accountType } = params
            walletSetupAccountType.set(accountType)
            if (accountType === AccountType.Software) {
                nextRoute = AppRoute.Password
            } else if (accountType === AccountType.Ledger) {
                nextRoute = AppRoute.LedgerSetup
            }
            break
        case AppRoute.LedgerSetup:
            nextRoute = AppRoute.Protect
            break
        case AppRoute.Password:
            const { password } = params
            if (password) {
                strongholdPassword.set(password)
                nextRoute = AppRoute.Protect
            }
            break
        case AppRoute.Protect:
            const { pin } = params
            if (pin) {
                walletPin.set(pin)
                const walletSetupType_ = get(walletSetupType)
                if ((walletSetupType_ === SetupType.Mnemonic || walletSetupType_ === SetupType.Stronghold) || get(walletSetupAccountType) === AccountType.Ledger) {
                    nextRoute = AppRoute.Congratulations
                } else {
                    nextRoute = AppRoute.Backup
                }
            }
            break
        case AppRoute.Backup:
            if (get(walletSetupType) === SetupType.Seed || get(walletSetupType) === SetupType.Seedvault) {
                nextRoute = AppRoute.Migrate
            } else {
                nextRoute = AppRoute.Congratulations
            }
            break
        case AppRoute.Import:
            nextRoute = AppRoute.Congratulations
            const { importType } = params
            walletSetupType.set(importType)
            if (importType === SetupType.Mnemonic) {
                nextRoute = AppRoute.Password
            } else if (importType === SetupType.Seed || importType === SetupType.Seedvault) {
                nextRoute = AppRoute.Balance
            } else if (importType === SetupType.Stronghold) {
                nextRoute = AppRoute.Protect
            }
            break
        case AppRoute.Balance:
            nextRoute = AppRoute.Password
            break
        case AppRoute.Migrate:
            nextRoute = AppRoute.Congratulations
            break
        case AppRoute.Congratulations:
            logged.set(true)
            nextRoute = AppRoute.Dashboard
            break
    }

    // Update history and navigate to new route
    if (nextRoute) {
        history.update((_history) => {
            _history.push(currentRoute)
            return _history
        })
        setRoute(nextRoute)
    } else {
        console.error('Routing Error: Could not find next route')
    }
}

// TODO: only handle route changes, not app variables
export const routerPrevious = () => {
    let previousRoute: AppRoute

    history.update((_history) => {
        previousRoute = _history.pop() as AppRoute
        return _history
    })

    if (previousRoute) {
        setRoute(previousRoute)
    }
}
