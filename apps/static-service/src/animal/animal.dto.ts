import { ApiProperty } from "@nestjs/swagger"
import { AnimalEntity } from "@src/database"
import { ArrayResponse, CreatedResponse, CreateRequest, Empty } from "@src/types"
import { IsString } from "class-validator"
import { DeepPartial } from "typeorm"

// GetAnimals
export class GetAnimalsResponse extends ArrayResponse<AnimalEntity> {}

// GetAnimal
export class GetAnimalRequest {
    id: string
}

export class GetAnimalResponse extends AnimalEntity {}

// CreateAnimal ussing deep partial

export class CreateAnimalRequest extends CreateRequest<AnimalEntity> {}

export class CreateAnimalResponse extends CreatedResponse {}

export class UpdateAnimalRequest {
    @IsString()
    @ApiProperty({ example: "Cow", description: "The key of the Animal" })
    id: string

    item: DeepPartial<AnimalEntity>
}

export type UpdateAnimalResponse = Empty

// DeleteAnimal
export class DeleteAnimalRequest {
    id: string
}
export type DeleteAnimalResponse = Empty
