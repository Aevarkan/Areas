/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: Utility.ts
 * Author: Aevarkan
 */

import { Block, BlockComponent, BlockComponentTypes, DimensionLocation, RawMessage } from "@minecraft/server";
import { BlockEventRecord } from "library/definitions/record";
import { BlockSnapshot } from "./BlockSnapshot";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
import { TimeUtilityFunctions } from "./TimeUtility";
import { MessageParser } from "./MessageParser";

const blocksWithNBT = [
    MinecraftBlockTypes.Chest,

    // Furnaces
    MinecraftBlockTypes.Furnace,
    MinecraftBlockTypes.LitFurnace,
    MinecraftBlockTypes.BlastFurnace,
    MinecraftBlockTypes.LitBlastFurnace,

    // Shulker Boxes
    MinecraftBlockTypes.BlackShulkerBox,
    MinecraftBlockTypes.BlueShulkerBox,
    MinecraftBlockTypes.BrownShulkerBox,
    MinecraftBlockTypes.CyanShulkerBox,
    MinecraftBlockTypes.GrayShulkerBox,
    MinecraftBlockTypes.GreenShulkerBox,
    MinecraftBlockTypes.LightBlueShulkerBox,
    MinecraftBlockTypes.LightGrayShulkerBox,
    MinecraftBlockTypes.LimeShulkerBox,
    MinecraftBlockTypes.MagentaShulkerBox,
    MinecraftBlockTypes.OrangeShulkerBox,
    MinecraftBlockTypes.PinkShulkerBox,
    MinecraftBlockTypes.PurpleShulkerBox,
    MinecraftBlockTypes.RedShulkerBox,
    MinecraftBlockTypes.UndyedShulkerBox,
    MinecraftBlockTypes.WhiteShulkerBox,
    MinecraftBlockTypes.YellowShulkerBox
] as string[]

class UtilityFunctions {
    
    Time: TimeUtilityFunctions
    Message: MessageParser

    constructor() {
        this.Time = new TimeUtilityFunctions()
        this.Message = new MessageParser()
    }

    /**
     * Checks if a dimension location matches another one.
     */
    public isMatchingLocation(location1: DimensionLocation, location2: DimensionLocation) {
        let isMatching = false

        if (
            location1.x === location2.x &&
            location1.y === location2.y &&
            location1.z === location2.z &&
            location1.dimension.id === location2.dimension.id
        ) {
            isMatching = true
        }

        return isMatching
    }

    /**
     * Checks if a string is a type id or entity id.
     * @param string The id to check.
     * @returns true if an entity id, otherwise false
     * @remarks Type ids are typically stored as namespace:id, entity ids are purely numbers.
     * @remarks Areas stores entities with type ids and players with numeric ids.
     */
    public isId(string: string): boolean {
        const regex = /^-?\d+$/
        return regex.test(string)
    }

    /**
     * Checks if a block has NBT data.
     * @param block The block to check.
     * @returns true if the block has NBT data, otherwise false
     */
    public hasNBT(block: Block) {
        const blockTypeId = block.typeId
        let hasNBT = false

        // Predefined list of blocks with NBT
        if (blocksWithNBT.includes(blockTypeId)) {
            hasNBT = true
        }

        // We can check dynamically too
        if (
            block.getComponent(BlockComponentTypes.FluidContainer) ||
            block.getComponent(BlockComponentTypes.Inventory) ||
            block.getComponent(BlockComponentTypes.RecordPlayer) ||
            block.getComponent(BlockComponentTypes.Sign)
        ) {

        }

        return  hasNBT
    }

    /**
     * Parses a block event into a readable string.
     * @param record The block event record.
     * @param includeLocation Whether the string should contain the block location.
     */
    public parseBlockRecord(record: BlockEventRecord, includeLocation: boolean) {
        // Records should be something like
        // At time, player broke block:type
        const date = new Date(record.time)
        const year = date.getFullYear()
        const month = date.getMonth()
        const day =  date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        
        const timeMessage: RawMessage = {translate: "a"}
    }

}

/**
 * A bunch of utility functions.
 */
export const Utility = new UtilityFunctions()