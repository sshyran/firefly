import { derived, get, Readable, writable } from 'svelte/store'
import {
    ParticipateResponsePayload,
    Participation,
    ParticipationEvent,
    ParticipationOverview,
    ParticipationOverviewResponse,
    StakingAirdrop, StakingEventStatus,
} from './typings/participation'
import type { WalletAccount } from './typings/wallet'
import type { Event, } from './typings/events'
import { persistent } from './helpers'
import { api } from './wallet'
import { showAppNotification } from './notifications'
import { MILLISECONDS_PER_SECOND } from './time'

/** Assembly event ID */
const ASSEMBLY_EVENT_ID = 'c4f23236b3ce22f9fe22583176813618b304bbfcfd24da68cbddf66196b0d8fd';

/** Shimmer event ID. */
const SHIMMER_EVENT_ID = '415267d375c85531aec13e6471c04a01622dfcc9b285a009629dd2c9231da517';

const STAKING_EVENT_IDS: string[] = [ASSEMBLY_EVENT_ID, SHIMMER_EVENT_ID]

const STAKING_PARTICIPATIONS: Participation[] = [{
    eventId: SHIMMER_EVENT_ID,
    answers: []
}, {
    eventId: ASSEMBLY_EVENT_ID,
    answers: []
}];

//==============================================================================

/**
 * The overview / statistics about participation. See #AccountParticipationOverview for more details.
 */
export const participationOverview = writable<ParticipationOverview>([])

/**
 * The specific participation events available.
 */
export const participationEvents = writable<ParticipationEvent[]>([])

// TODO: Derive this value later / make this better
export const stakingEventStatus = writable<StakingEventStatus>(StakingEventStatus.PreStake)

/**
 * The amount of funds that are currently staked.
 */
export const stakedAmount: Readable<number> = derived(
    participationOverview,
    (overview) =>
        overview.reduce((total, accountOverview) => total + accountOverview?.shimmerStakedFunds, 0)
)

/**
 * The amount of funds that are currently unstaked.
 */
export const unstakedAmount: Readable<number> = derived(
    participationOverview,
    (overview) =>
        overview.reduce((total, accountOverview) => total + accountOverview?.shimmerUnstakedFunds, 0)
)

/** Total shimmer rewards for all accounts */
export const shimmerRewards = derived(participationOverview, (overview) => overview.reduce((acc, accountOverview) => acc += accountOverview.shimmerRewards, 0))

/** Total assembly rewards for all accounts */
export const assemblyRewards = derived(participationOverview, (overview) => overview.reduce((acc, accountOverview) => acc += accountOverview.assemblyRewards, 0))

// TODO: Write functions for calculating / formatting remaining these times.
// TODO: Change time from days to milliseconds (more exact and flexible).
/**
 * The remaining time for Shimmer staking.
 */
export const shimmerStakingRemainingDays = writable<number>(0)

/**
 * The remaining time for Assembly staking.
 */
export const assemblyStakingRemainingDays = writable<number>(0)

/**
 * The store for accounts that are currently staked. This is NOT to hold accounts
 * that have been selected for staking / unstaking. In other words, if an account is
 * in this array, then it is currently being staked. This is updated regularly by the polling
 * in `wallet.rs`.
 */
export const stakedAccounts = persistent<WalletAccount[]>('stakedAccounts', [])

export const STAKING_AIRDROP_TOKENS: { [key in StakingAirdrop]: string } = {
    [StakingAirdrop.Assembly]: 'ASM',
    [StakingAirdrop.Shimmer]: 'SMR',
}

let pollInterval

export async function pollParticipationOverview(): Promise<void> {
    await getParticipationOverview()
    /* eslint-disable @typescript-eslint/no-misused-promises */
    pollInterval = setInterval(
        async () => await getParticipationOverview(),
        MILLISECONDS_PER_SECOND * 10
    )
}

/**
 * Determines whether an account is currently being staked or not.
 *
 * @method isAccountStaked
 *
 * @param {string} accountId
 *
 * @returns {boolean}
 */
export const isAccountStaked = (accountId: string): boolean =>
    get(stakedAccounts).find((sa) => sa.id === accountId) !== undefined

const estimateAssemblyReward = (amount: number, currentMilestone: number, endMilestone: number): number => {
    const multiplier = 1.0
    const amountMiotas = amount / 1_000_000
    const numMilestones = endMilestone - currentMilestone

    return multiplier * amountMiotas * numMilestones + 1
}

const estimateShimmerReward = (amount: number, currentMilestone: number, endMilestone: number): number => {
    const multiplier = 1.0
    const amountMiotas = amount / 1_000_000
    const numMilestones = endMilestone - currentMilestone

    return multiplier * amountMiotas * numMilestones
}

const getStakingEventFromAirdrop = (airdrop: StakingAirdrop): ParticipationEvent => {
    let stakingEventId
    switch (airdrop) {
        case StakingAirdrop.Assembly:
            stakingEventId = ASSEMBLY_EVENT_ID
            break
        case StakingAirdrop.Shimmer:
            stakingEventId = SHIMMER_EVENT_ID
            break
        default:
            break
    }

    return get(participationEvents).find((pe) => pe.eventId === stakingEventId)
}

export const estimateStakingAirdropReward = (airdrop: StakingAirdrop, amountToStake: number): number => {
    const stakingEvent = getStakingEventFromAirdrop(airdrop)
    if (!stakingEvent) {
        showAppNotification({
            type: 'error',
            message: 'Unable to find staking event.',
        })
    }

    switch (airdrop) {
        case StakingAirdrop.Assembly:
            return estimateAssemblyReward(
                amountToStake, stakingEvent?.status?.milestoneIndex, stakingEvent?.information?.milestoneIndexEnd
            )
        case StakingAirdrop.Shimmer:
            return estimateShimmerReward(
                amountToStake, stakingEvent?.status?.milestoneIndex, stakingEvent?.information?.milestoneIndexEnd
            )
        default:
            return 0
    }
}

/**
 * Gets participation overview.
 *
 * @method getParticipationOverview
 *
 * @returns {Promise<void>}
 */
export function getParticipationOverview(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        api.getParticipationOverview({
            onSuccess(overview: Event<ParticipationOverviewResponse>) {
                participationOverview.set(overview?.payload.accounts)

                resolve()
            },
            onError(error) {
                // TODO: What to do in case of error? Probably throw a notification here.
                console.error(error)

                reject(error)
            }
        })
    })
}

/**
 * Gets participation event details.
 *
 * @method getParticipationEvents
 *
 * @returns {Promise<ParticipationEvent[]>}
 */
export function getParticipationEvents(): Promise<ParticipationEvent[]> {
    return new Promise<ParticipationEvent[]>((resolve, reject) => {
        api.getParticipationEvents({
            onSuccess(response: Event<ParticipationEvent[]>) {
                participationEvents.set(response?.payload)

                resolve(response?.payload)
            },
            onError(error) {
                // TODO: What to do in case of error?
                console.error(error)

                reject(error)
            }
        })
    })
}

/**
 * Participate in events.
 *
 * @method participate
 *
 * @param {WalletAccount} account
 *
 * @returns {Promise<void>}
 */
export function participate(account: WalletAccount): Promise<void> {
    if (!account) {
        showAppNotification({
            type: 'error',
            message: 'Unable to use this account data.'
        })

        return
    }

    return new Promise<void>((resolve, reject) => {
        api.participate(
            account?.id,
            STAKING_PARTICIPATIONS,
            {
                onSuccess(response: Event<ParticipateResponsePayload>) {
                    stakedAccounts.update((_stakedAccounts) =>
                        [..._stakedAccounts, account]
                    )

                    resolve()
                },
                onError(error) {
                    // TODO: What to do in case of error?
                    console.error(error)

                    reject(error)
                }
            })
    })
}

/**
 * Stop paticipating in events.
 *
 * @method stopParticipating
 *
 * @param {WalletAccount} account
 *
 * @returns {Promise<void>}
 */
 export function stopParticipating(account: WalletAccount): Promise<void> {
     if (!account) {
         showAppNotification({
             type: 'error',
             message: 'Unable to use this account data.'
         })

         return
     }

    return new Promise<void>((resolve, reject) => {
        api.stopParticipating(
            account?.id,
            STAKING_EVENT_IDS,
            {
                onSuccess(response: Event<ParticipateResponsePayload>) {
                    stakedAccounts.update((_stakedAccounts) =>
                        _stakedAccounts.filter((sa) => sa.id !== account?.id)
                    )

                    resolve()
                },
                onError(error) {
                    // TODO: What to do in case of error?
                    console.error(error)

                    reject(error)

                }
            })
    })
}

/**
 * Participate with remaining funds in events.
 *
 * @method participateWithRemainingFunds
 *
 * @param {string} accountId
 *
 * @returns {Promise<void>}
 */
 export function participateWithRemainingFunds(accountId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        api.participateWithRemainingFunds(
            accountId,
            STAKING_PARTICIPATIONS,
            {
                onSuccess(response: Event<ParticipateResponsePayload>) {
                    resolve()
                },
                onError(error) {
                    // TODO: What to do in case of error?
                    console.error(error);
                    reject(error);
                }
            })
    })
}
