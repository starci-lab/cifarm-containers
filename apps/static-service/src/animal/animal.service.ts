import { Injectable, Logger } from "@nestjs/common"
import { AnimalEntity } from "@src/database"
import { DataSource } from "typeorm"
import {
    CreateAnimalRequest,
    CreateAnimalResponse,
    DeleteAnimalRequest,
    DeleteAnimalResponse,
    GetAnimalRequest,
    GetAnimalResponse,
    GetAnimalsResponse,
    UpdateAnimalRequest,
    UpdateAnimalResponse
} from "./animal.dto"
import { AnimalNotFoundException } from "@src/exceptions/static/animal.exception"

@Injectable()
export class AnimalService {
    private readonly logger: Logger = new Logger(AnimalService.name)

    constructor(private readonly dataSource: DataSource) {}

    public async getAnimals(): Promise<GetAnimalsResponse> {
        const items = await this.dataSource.manager.find(AnimalEntity)
        return { items }
    }

    public async getAnimal(request: GetAnimalRequest): Promise<GetAnimalResponse> {
        const item = await this.dataSource.manager.findOne(AnimalEntity, {
            where: { id: request.id }
        })
        if (!item) {
            throw new AnimalNotFoundException(request.id)
        }
        return item
    }

    public async createAnimal(request: CreateAnimalRequest): Promise<CreateAnimalResponse> {
        const { id } = await this.dataSource.manager.save(AnimalEntity, {
            ...request.item
        })
        return { id }
    }

    // Update an existing Animal
    public async updateAnimal(request: UpdateAnimalRequest): Promise<UpdateAnimalResponse> {
        const item = this.dataSource.manager.findOne(AnimalEntity, {
            where: { id: request.id }
        })
        if (!item) {
            throw new AnimalNotFoundException(request.id)
        }

        await this.dataSource.manager.save(AnimalEntity, {
            ...request.item,
            id: request.id
        })
        return {}
    }

    public async deleteAnimal(request: DeleteAnimalRequest): Promise<DeleteAnimalResponse> {
        const item = this.dataSource.manager.findOne(AnimalEntity, {
            where: { id: request.id }
        })

        if (!item) {
            throw new AnimalNotFoundException(request.id)
        }

        await this.dataSource.manager.delete(AnimalEntity, item)
        return {}
    }
}
