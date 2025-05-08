/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: areasWorld.ts
 * Author: Aevarkan
 */

/**
 * What can happen to a block, and how it happened.
 */
export enum BlockInteractionTypes {
    NULL = "0",
    BlockBroken = "1",
    BlockExploded = "2",
    BlockPlaced = "3",
    BlockInitialise = "4",
}

/**
 * What can happen to an entity, and how it happened.
 */
export enum EntityInteractionTypes {
    EntitySlain = "killed",
    EntityStarve = "starved"
}

/**
 * Different types of entities stored in the Areas database.
 */
export enum DatabaseEntityTypes {
    None = "null",
    NonPlayerEntity = "entity",
    Player = "player"
}

/**
 * Default database values
 */
export enum DatabaseValue {
    NULL = "0",
    True = "1"
}