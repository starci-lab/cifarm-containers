import { PlacedItemTypeSchema, Position } from "@src/databases"
import { Connection } from "mongoose"

export interface GetOccupiedPositionsParams {
    userId: string
    connection: Connection,
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

