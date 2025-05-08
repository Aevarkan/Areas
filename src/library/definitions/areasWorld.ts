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
    BlockBroken = "broken",
    BlockExploded = "exploded",
    BlockPlaced = "placed",
    BlockInitialise = "init",
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
export enum AreasEntityTypes {
    None = "null",
    NonPlayerEntity = "entity",
    Player = "player"
}