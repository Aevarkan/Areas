/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: itemData.ts
 * Author: Aevarkan
 */

import { MinecraftItemTypes } from "@minecraft/vanilla-data";

/**
 * Items that place blocks via block interaction.
 */
export const placeInteractItems = [
    MinecraftItemTypes.Bucket,
    MinecraftItemTypes.CodBucket,
    MinecraftItemTypes.LavaBucket,
    MinecraftItemTypes.MilkBucket,
    MinecraftItemTypes.WaterBucket,
    MinecraftItemTypes.SalmonBucket,
    MinecraftItemTypes.AxolotlBucket,
    MinecraftItemTypes.TadpoleBucket,
    MinecraftItemTypes.PowderSnowBucket,
    MinecraftItemTypes.PufferfishBucket,
    MinecraftItemTypes.TropicalFishBucket
] as string[]