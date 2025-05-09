/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: TimeUtility.ts
 * Author: Aevarkan
 */

import { CalculationError } from "./Errors"

/**
 * Human readable time intervals.
 */
export enum TimeIntervalUnit {
    Years = "years",
    Months = "months",
    Days = "days",
    Hours = "hours",
    Minutes = "minutes",
    Seconds = "seconds",
}

export interface TimeUnit {
    /**
     * The largest interval of time this unit spans.
     * @remarks Is human readable.
     */
    biggestInterval: TimeIntervalUnit,
    /**
     * The number of intervals of the biggest time unit.
     */
    biggestIntervals: number,
    /**
     * The raw unix time, represented in milliseconds.
     */
    milliseconds: number,
}

const millisecondsYear = 31557600000
const millisecondsMonth = 2629800000
const millisecondsDay = 86400000
const millisecondsHour = 3600000
const millisecondsMinutes = 60000
const millisecondsSeconds = 1000

/**
 * A whole class for parsing time, because it just takes that much time.
 */
export class TimeUtilityFunctions {

    /**
     * Gets the difference between two times, and outputs it in a Time object.
     * @param time1 The first time to compare.
     * @param time2 The second time to compare.
     */
    public difference(time1: number, time2: number): TimeUnit {
        const deltaTime = time1 - time2
        const biggestInterval = this.biggestTimeInterval(deltaTime)
        const intervals = this.countIntervals(deltaTime, biggestInterval)

        const difference: TimeUnit = {
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
    private biggestTimeInterval(time: number): TimeIntervalUnit {

        const absoluteTime = Math.abs(time)
        // We divide by the time it takes for each interval.
        // If the answer is less than 1, then it's less than that interval

        let biggestTimeInterval: TimeIntervalUnit = null // It should never return as null
        if (absoluteTime >= millisecondsYear) {
            biggestTimeInterval = TimeIntervalUnit.Years
        } else if (absoluteTime >= millisecondsMonth) {
            biggestTimeInterval = TimeIntervalUnit.Months
        } else if (absoluteTime >= millisecondsDay) {
            biggestTimeInterval = TimeIntervalUnit.Days
        } else if (absoluteTime >= millisecondsHour) {
            biggestTimeInterval = TimeIntervalUnit.Hours
        } else if (absoluteTime >= millisecondsMinutes) {
            biggestTimeInterval = TimeIntervalUnit.Minutes
        } else {
            biggestTimeInterval = TimeIntervalUnit.Seconds
        }

        return biggestTimeInterval
    }

    /**
     * Gets the number of intervals of a delta time.
     * @param deltaTime Delta time in milliseconds.
     * @param interval The {@link TimeIntervalUnit}.
     * @returns The number of intervals as an integer and with 1 decimal point.
     */
    private countIntervals(deltaTime: number, interval: TimeIntervalUnit) {

        let intervals: number = null
        switch (interval) {
            case TimeIntervalUnit.Years:
                intervals = deltaTime / millisecondsYear
                break
        
            case TimeIntervalUnit.Months:
                intervals = deltaTime / millisecondsMonth
                break

            case TimeIntervalUnit.Days:
                intervals = deltaTime / millisecondsDay
                break

            case TimeIntervalUnit.Hours:
                intervals = deltaTime / millisecondsHour
                break

            case TimeIntervalUnit.Minutes:
                intervals = deltaTime / millisecondsMinutes
                break

            case TimeIntervalUnit.Seconds:
                intervals = deltaTime / millisecondsSeconds
                break

            default:
                throw new CalculationError("Count interval error!")
        }

        // We keep 1 decimal point
        const intervalsRounded = Math.round(intervals * 10) / 10
        const intervalsInt = Math.floor(intervals)
        return { intervalsRounded, intervalsInt }
    }

}