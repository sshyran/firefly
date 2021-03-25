export enum ImportGroupType {
    Text = 'text',
    File = 'file',
}

export enum ImportType {
    Seed = 'seed',
    Mnemonic = 'mnemonic',
    SeedVault = 'seedvault',
    Stronghold = 'stronghold',
}

export const SEEDVAULT_EXTENSION = 'kdbx'
export const STRONGHOLD_EXTENSION = 'stronghold'

export const isSeedVaultFile = (fileName) => new RegExp(`\.${SEEDVAULT_EXTENSION}$`, "i").test(fileName)
export const isStrongholdFile = (fileName) => new RegExp(`\.${STRONGHOLD_EXTENSION}$`, "i").test(fileName)

export const isSeed = (value) => /^[9A-Z]{81}$/.test(value)