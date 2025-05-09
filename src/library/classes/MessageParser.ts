/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: MessageParser.ts
 * Author: Aevarkan
 * Expected INPUTS: BlockEventRecord | EntityEventRecord
 * Expected OUTPUTS: RawMessage
 */

import { BlockEventRecord } from "library/definitions/record";
import { Utility } from "./Utility";
import { TimeIntervalUnit, TimeUnit } from "./TimeUtility";
import { RawMessageParseError } from "./Errors";
import { Dimension, DimensionLocation, DimensionTypes, RawMessage } from "@minecraft/server";
import { BlockInteractionTypes, DatabaseEntityTypes } from "library/definitions/areasWorld";
import { Database } from "./AreasDatabase";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";
import config from "config";

export class MessageParser {

    /**
     * Parses a {@link blockEventRecord} into a RawMessage.
     * @param record The block event record.
     * @returns A rawmessage.
     * @remarks Example: 5 seconds ago, Herobrine placed minecraft:tnt at 100 32 100 in nether.
     */
    public blockEventRecord(record: BlockEventRecord, currentTime: number, includeLocation: boolean): RawMessage {
        const timeDiference = Utility.Time.difference(currentTime, record.time)
        
        // Parse the time into human readable string
        const timeMessagePart = this.parseTime(timeDiference)

        // Parse the entity cause
        const causeEntityMessagePart = this.parseEntityCause(record.causeEntityType, record.causeEntityTypeId, record.causePlayerId)
        
        // Parse action
        const interactionPart = this.parseBlockInteraction(record.interaction)

        // Parse the block
        const blockPart = this.parseBlock(record.typeId)

        // Parse the location
        const locationMessagePart = this.parseLocation(record.location)

        // Now combine them
        let combinedMessage: RawMessage
        if (includeLocation) {
            combinedMessage = {
                translate: "inspector.recordWithLocation",
                with: { rawtext: [
                    timeMessagePart,
                    causeEntityMessagePart,
                    interactionPart,
                    blockPart,
                    locationMessagePart
                ]}
            }

        } else {
            combinedMessage = {
                translate: "inspector.recordNoLocation",
                with: { rawtext: [
                    timeMessagePart,
                    causeEntityMessagePart,
                    interactionPart,
                    blockPart
                ]}
            }

        }

        // We check if it's rolled back now and apply the colour codes from the config
        let formattedMessage: RawMessage
        if (!(record.isRolledBack)) {
            formattedMessage = {
                translate: "areas.combine2",
                with: { rawtext: [
                    { text: config.recordFormatCode },
                    combinedMessage
                ]}
            }
        } else {
            formattedMessage = {
                translate: "areas.combine2",
                with: { rawtext: [
                    { text: config.rolledBackRecordFormatCode },
                    combinedMessage
                ]}
            }
        }

        return formattedMessage
    }

    /**
     * Parses a time unit into a rawmessage string.
     * @param time The time unit.
     * @returns A raw message string.
     */
    private parseTime(time: TimeUnit): RawMessage {
        const intervalUnit = time.biggestInterval
        const intervals = time.biggestIntervals.toString()

        let parsedTimeMessage: RawMessage
        switch (intervalUnit) {
            case TimeIntervalUnit.Years:
                parsedTimeMessage = { translate: "date.yearsPlural", with: [intervals] } // translation string not in vanilla
                break

            case TimeIntervalUnit.Months:
                parsedTimeMessage = { translate: "date.monthsPlural", with: [intervals] } // translation string not in vanilla
                break

            case TimeIntervalUnit.Days:
                parsedTimeMessage = { translate: "date.daysPlural", with: [intervals] }
                break

            case TimeIntervalUnit.Hours:
                parsedTimeMessage = { translate: "date.hoursPlural", with: [intervals] }
                break

            case TimeIntervalUnit.Minutes:
                parsedTimeMessage = { translate: "date.minutesPlural", with: [intervals] }
                break

            case TimeIntervalUnit.Seconds:
                parsedTimeMessage = { translate: "date.secondsPlural", with: [intervals] }
                break

            default:
                throw new RawMessageParseError("Block event record parsed incorrectly!")
        }
        
        return parsedTimeMessage
    }

    /**
     * Parses the entity cause into a rawmessage string.
     * @param causeEntityType The type of entity that caused this.
     * @param entityTypeId The optional type id of the entity that caused the record.
     * @param playerId The optional id of the player that caused the record.
     */
    private parseEntityCause(causeEntityType: DatabaseEntityTypes, entityTypeId?: string, playerId?: number): RawMessage {
        // Entity names are stored in the vanilla resource pack as example below:
        // entity.armadillo.name

        // This selects "armadillo" from "minecraft:armadillo"
        const entityTypeIdNoNamespace = entityTypeId.split(":")[1]

        let parsedEntityCause: RawMessage
        switch (causeEntityType) {
            case DatabaseEntityTypes.None:
                parsedEntityCause = { translate: "inspector.recordNoEntityCause" }
                break

            case DatabaseEntityTypes.NonPlayerEntity:
                parsedEntityCause = { translate: `entity.${entityTypeIdNoNamespace}.name` }
                break

            case DatabaseEntityTypes.Player:
                const playerName = Database.Names.getPlayerName(playerId)
                parsedEntityCause = { text: playerName }
                break

            default:
                throw new RawMessageParseError("Entity cause parsed incorrectly.")
        }

        return parsedEntityCause
    }

    /**
     * Parses the location into a rawmessage string.
     * @param location The dimension location.
     * @returns A rawmessage string.
     */
    private parseLocation(location: DimensionLocation): RawMessage {
        const xString = location.x.toString()
        const yString = location.y.toString()
        const zString = location.z.toString()

        // Dimensions are separate in the files and not very organised
        // Example: dimension.dimensionName0=Overworld
        let dimension: RawMessage
        switch (location.dimension.id) {
            case MinecraftDimensionTypes.Overworld:
                dimension = { translate: "dimension.dimensionName0" }
                break
            
            case MinecraftDimensionTypes.Nether:
                dimension = { translate: "dimension.dimensionName1"}
                break

            case MinecraftDimensionTypes.TheEnd:
                dimension = { translate: "dimension.dimensionName2"}
                break

            default:
                dimension = { translate: "areas.unknown" }
                break
        }

        // Get the coordinates
        const coordinates: RawMessage = {
            translate: "areas.coordinates",
            with: [xString, yString, zString]
        }
        
        // Combine them
        const parsedLocation: RawMessage = {
            translate: "areas.dimensionLocation",
            with: { rawtext: [coordinates, dimension] }
        }

        return parsedLocation
    }

    /**
     * Parses a block id into a raw message.
     * @param blockTypeId The block's type id.
     * @returns The raw message.
     */
    private parseBlock(blockTypeId: string) {
        // Example: tile.sapling.spruce.name=Spruce Sapling
        const blockTypeIdNoNamespace = blockTypeId.split(":")[1]

        const rawBlockMessage: RawMessage = { translate: `tile.${blockTypeIdNoNamespace}.name` }
        return rawBlockMessage
    }

    /**
     * Parses a block interaction (e.g. block exploded).
     * @param interaction The type of interaction. ({@link BlockInteractionTypes})
     * @returns A raw message string.
     */
    private parseBlockInteraction(interaction: BlockInteractionTypes) {
        
        let interactionMessage: RawMessage
        switch (interaction) {
            case BlockInteractionTypes.NULL:
                interactionMessage = { translate: "areas.unknown"}
                break

            case BlockInteractionTypes.BlockBroken:
                interactionMessage = { translate: "areas.interaction.blockPlaced" }
                break

            case BlockInteractionTypes.BlockExploded:
                interactionMessage = { translate: "areas.interaction.blockBroken" }
                break

            case BlockInteractionTypes.BlockPlaced:
                interactionMessage = { translate: "areas.interaction.blockExploded" }
                break

            case BlockInteractionTypes.BlockInitialise:
                interactionMessage = { translate: "areas.interaction.blockInitialised" }
                break

            default:
                throw new RawMessageParseError("Error in parsing block interaction.")
        }

        return interactionMessage
    }
}