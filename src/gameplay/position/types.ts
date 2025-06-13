import { PlacedItemSchema, PlacedItemTypeSchema, Position } from "@src/databases"
import { ClientSession } from "mongoose"

export interface GetOccupiedPositionsParams {
    userId: string
    session: ClientSession
    itself?: PlacedItemSchema
}

export interface CheckPositionAvailableParams {
    position: Position,
    placedItemType: PlacedItemTypeSchema,
    occupiedPositions: Array<Position>
}

export interface GetAdjacentPositionsParams {
    position: Position,
    placedItemType: PlacedItemTypeSchema,
}

