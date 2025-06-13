/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: UnitConverter.ts
 * Author: Aevarkan
 */

import { BYTES_GIGABYTE, BYTES_KILOBYTE, BYTES_MEGABYTE, BYTES_TERABYTE, MILLISECONDS_DAY, MILLISECONDS_HOUR, MILLISECONDS_MINUTE, MILLISECONDS_MONTH, MILLISECONDS_SECOND, MILLISECONDS_YEAR } from "constants"
import { CalculationError } from "../Errors"

/**
 * Human readable time intervals.
 */
export enum TimeUnit {
    Years = "years",
    Months = "months",
    Days = "days",
    Hours = "hours",
    Minutes = "minutes",
    Seconds = "seconds",
}

export interface TimeInfo {
    /**
     * The largest interval of time this unit spans.
     * @remarks Is human readable.
     */
    biggestInterval: TimeUnit,
    /**
     * The number of intervals of the biggest time unit.
     * @remarks Rounded to one decimal point.
     */
    biggestIntervals: number,
    /**
     * The raw unix time, represented in milliseconds.
     */
    milliseconds: number,
}

export enum StorageUnit {
    Byte,
    Kilobyte,
    Megabyte,
    Gigabyte,
    Terabyte // You are screwed if this shows up
}

export interface StorageInfo {
    /**
     * The largest storage unit.
     * @remarks Is human readable.
     */
    largestUnit: StorageUnit,
    /**
     * The quantity of the largest storage unit.
     * @remarks Rounded to one decimal point.
     */
    largestUnitAmount: number,
    /**
     * The raw storage size in bytes.
     */
    bytes: number,
}

/**
 * A whole class for parsing time, because it just takes that much time.
 */
export class UnitConverter {

    /**
     * Gets the difference between two times.
     * @param time1 The first time to compare.
     * @param time2 The second time to compare.
     * @returns a {@link TimeUnit} object.
     * @remarks This will output the absolute difference, disregarding sign.
     */
    public static timeDifference(time1: number, time2: number): TimeInfo {
        const deltaTime = Math.abs(time1 - time2)
        const biggestInterval = UnitConverter.biggestTimeInterval(deltaTime)
        const intervals = UnitConverter.countIntervals(deltaTime, biggestInterval)

        const difference: TimeInfo = {
            biggestInterval: biggestInterval,
            biggestIntervals: intervals.intervalsRounded,
            milliseconds: deltaTime
        }
        return difference
    }

    /**
     * Gets the biggest time interval of a delta time.
     * @param time The delta time.
     * @returns A time interval unit: {@link SignificantTimeFigures}
     */
    private static biggestTimeInterval(time: number): TimeUnit {

        const absoluteTime = Math.abs(time)
        // We divide by the time it takes for each interval.
        // If the answer is less than 1, then it's less than that interval

        let biggestTimeInterval: TimeUnit = null // It should never return as null
        if (absoluteTime >= MILLISECONDS_YEAR) {
            biggestTimeInterval = TimeUnit.Years
        } else if (absoluteTime >= MILLISECONDS_MONTH) {
            biggestTimeInterval = TimeUnit.Months
        } else if (absoluteTime >= MILLISECONDS_DAY) {
            biggestTimeInterval = TimeUnit.Days
        } else if (absoluteTime >= MILLISECONDS_HOUR) {
            biggestTimeInterval = TimeUnit.Hours
        } else if (absoluteTime >= MILLISECONDS_MINUTE) {
            biggestTimeInterval = TimeUnit.Minutes
        } else {
            biggestTimeInterval = TimeUnit.Seconds
        }

        return biggestTimeInterval
    }

    /**
     * Gets the number of intervals of a delta time.
     * @param deltaTime Delta time in milliseconds.
     * @param interval The {@link TimeUnit}.
     * @returns The number of intervals as an integer and with 1 decimal point.
     */
    private static countIntervals(deltaTime: number, interval: TimeUnit) {

        let intervals: number = null
        switch (interval) {
            case TimeUnit.Years:
                intervals = deltaTime / MILLISECONDS_YEAR
                break
        
            case TimeUnit.Months:
                intervals = deltaTime / MILLISECONDS_MONTH
                break

            case TimeUnit.Days:
                intervals = deltaTime / MILLISECONDS_DAY
                break

            case TimeUnit.Hours:
                intervals = deltaTime / MILLISECONDS_HOUR
                break

            case TimeUnit.Minutes:
                intervals = deltaTime / MILLISECONDS_MINUTE
                break

            case TimeUnit.Seconds:
                intervals = deltaTime / MILLISECONDS_SECOND
                break

            default:
                throw new CalculationError("Count interval error!")
        }

        // We keep 1 decimal point
        const intervalsRounded = Math.round(intervals * 10) / 10
        const intervalsInt = Math.floor(intervals)
        return { intervalsRounded, intervalsInt }
    }



    /**
     * 
     * Storage Units
     * 
     */

    /**
     * Calculates extra info from a raw byte quantity.
     * @param bytes The number of bytes.
     * @returns A {@link StorageInfo} object.
     */
    public static calculateStorage(bytes: number): StorageInfo {

        // Don't know why you'd put a negative number in, but it'd still work
        bytes = Math.abs(bytes)

        let biggestUnit: StorageUnit = null // It should never return as null
        if (bytes >= BYTES_TERABYTE) {
            biggestUnit = StorageUnit.Terabyte
        } else if (bytes >= BYTES_GIGABYTE) {
            biggestUnit = StorageUnit.Gigabyte
        } else if (bytes >= BYTES_MEGABYTE) {
            biggestUnit = StorageUnit.Megabyte
        } else if (bytes >= BYTES_KILOBYTE) {
            biggestUnit = StorageUnit.Kilobyte
        } else {
            biggestUnit = StorageUnit.Byte
        }

        let biggestUnitQuantity: StorageUnit = null
        switch (biggestUnit) {
            case StorageUnit.Byte:
                biggestUnitQuantity = bytes
                break

            case StorageUnit.Kilobyte:
                biggestUnitQuantity = bytes / BYTES_KILOBYTE
                break

            case StorageUnit.Megabyte:
                biggestUnitQuantity = bytes / BYTES_MEGABYTE
                break

            case StorageUnit.Gigabyte:
                biggestUnitQuantity = bytes / BYTES_GIGABYTE
                break

            case StorageUnit.Terabyte:
                biggestUnitQuantity = bytes / BYTES_TERABYTE
                break

            default:
                throw new CalculationError("Storage calculation error.")
        }

        // 1 decimal point
        const roundedBiggestUnitQuantity = Math.round(biggestUnitQuantity * 10) / 10
        const storageInfo: StorageInfo = {
            bytes: bytes,
            largestUnit: biggestUnit,
            largestUnitAmount: roundedBiggestUnitQuantity
        }

        return storageInfo
    }

}