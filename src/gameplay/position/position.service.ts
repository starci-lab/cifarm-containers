import { Injectable } from "@nestjs/common"
import { CheckPositionAvailableParams, GetOccupiedPositionsParams } from "./position.types"
import { PlacedItemSchema } from "@src/databases"
import { Position } from "@src/databases"
import _ from "lodash"
import { PositionNotAvailableException } from "../exceptions"
//service for computing the position of placed items
@Injectable()
export class PositionService {
    constructor() {}

    public async getOccupiedPositions({
        connection,
        userId
    }: GetOccupiedPositionsParams): Promise<Array<Position>> {
        return await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({ user: userId })
            .select({
                x: 1,
                y: 1,
                _id: 0  // Exclude the _id field
            }).lean().exec()
    }

    public checkPositionAvailable(
        {
            position,
            placedItemType,
            occupiedPositions
        }: CheckPositionAvailableParams
    ) {
        const { sizeX, sizeY } = placedItemType

        // Create an array of positions from (sizeX-2, sizeY-2) to (sizeX, sizeY)
        const positions: Array<Position> = []
    
        // for (let x = sizeX - 2; x <= sizeX; x++) {
        //     for (let y = sizeY - 2; y <= sizeY; y++) {
        //         positions.push({ x, y })
        //     }
        // }
        for (let x = position.x ; x > position.x - sizeX; x--) {
            for (let y = position.y ; y > position.y - sizeY; y--) {
                positions.push({ x, y })
            }
        }
        console.log(occupiedPositions)
        console.log(positions)

        // use lodash to check if the positions are available
        // Use lodash _.every and _.some to check if the positions are available
        const isValid = _.every(positions, position => {
            return !_.some(occupiedPositions, occupiedPosition => {
                console.log(occupiedPosition, position)
                return _.isEqual(occupiedPosition, position) // Use _.isEqual for deep comparison
            })
        })    

        console.log(isValid)

        if (!isValid) {
            throw new PositionNotAvailableException()
        }
    }
}
