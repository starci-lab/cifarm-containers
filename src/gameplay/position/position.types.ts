import { PlacedItemSchema, PlacedItemTypeSchema, Position } from "@src/databases"
import { Connection } from "mongoose"

export interface GetOccupiedPositionsParams {
    userId: string
    connection: Connection,
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

