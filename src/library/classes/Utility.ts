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
import { BASE64 } from "constants";

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
    RawText: MessageParser

    constructor() {
        this.Time = new TimeUtilityFunctions()
        this.RawText = new MessageParser()
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

    /**
     * Checks if a block is a fluid (e.g. air, water)
     * @param block The block to check
     * @return `true` if the block is a fluid, otherwise `false`.
     */
    public isFluidBlock(block: BlockSnapshot) {
        const typeId = block.typeId
        
        let isFluid = false

        if (
            typeId === MinecraftBlockTypes.Air ||
            typeId === MinecraftBlockTypes.Water ||
            typeId === MinecraftBlockTypes.FlowingWater ||
            typeId === MinecraftBlockTypes.Lava ||
            typeId === MinecraftBlockTypes.FlowingLava
        ) {
            isFluid = true
        }

        return isFluid
    }

    /**
     * Compresses a number into base64.
     * @param number The number to compress.
     * @returns The compressed number as a string.
     */
    public compressNumber(number: number): string {
        let compressedNumber: string = ""

        const isNegativeNumber = number < 0 // This caused so many problems before I found out
        number = Math.abs(number)

        while (number > 0) {
            compressedNumber = BASE64[number % 64] + compressedNumber
            number = Math.floor( number / 64)
        }

        const stringNumber = (isNegativeNumber ? "-" : "") + compressedNumber || BASE64[0]
        return stringNumber
    }

    /**
     * Uncompresses a base64 number.
     * @param stringNumber The compressed number as a string.
     * @returns The uncompressed number.
     */
    public uncompressNumber(stringNumber: string): number {
        let number = 0
        const isNegative = stringNumber.startsWith("-");
        const base64Digits = isNegative ? stringNumber.slice(1) : stringNumber

        for (const char of base64Digits) {
            number = number * 64 + BASE64.indexOf(char)
        }

        return isNegative ? -number : number
    }

// function toBase62(num) {
//   let encoded = '';
//   while (num > 0) {
//     encoded = base62Chars[num % 62] + encoded;
//     num = Math.floor(num / 62);
//   }
//   return encoded || base62Chars[0];
// }

// function fromBase62(encoded) {
//   let num = 0;
//   for (let i = 0; i < encoded.length; i++) {
//     num = num * 62 + base62Chars.indexOf(encoded[i]);
//   }
//   return num;
// }

}

/**
 * A bunch of utility functions.
 */
export const Utility = new UtilityFunctions()