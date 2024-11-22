import { staticGrpcConstants } from "@apps/static-service/src/constants"
import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
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
import { AnimalService } from "./animal.service"

@Controller()
export class AnimalController {
    private readonly logger = new Logger(AnimalController.name)

    constructor(private readonly AnimalService: AnimalService) {}

    @GrpcMethod(staticGrpcConstants.SERVICE, "GetAnimals")
    async getAnimals(): Promise<GetAnimalsResponse> {
        return this.AnimalService.getAnimals()
    }

    @GrpcMethod(staticGrpcConstants.SERVICE, "GetAnimal")
    async getAnimal(request: GetAnimalRequest): Promise<GetAnimalResponse> {
        return this.AnimalService.getAnimal(request)
    }

    // Create a new Animal
    @GrpcMethod(staticGrpcConstants.SERVICE, "CreateAnimal")
    async createAnimal(request: CreateAnimalRequest): Promise<CreateAnimalResponse> {
        this.logger.debug(`Creating Animal: ${JSON.stringify(request)}`)
        return this.AnimalService.createAnimal(request)
    }

    // Update an existing Animal
    @GrpcMethod(staticGrpcConstants.SERVICE, "UpdateAnimal")
    async updateAnimal(request: UpdateAnimalRequest): Promise<UpdateAnimalResponse> {
        this.logger.debug(`Updating Animal: ${JSON.stringify(request)}`)
        return this.AnimalService.updateAnimal(request)
    }

    // Delete a Animal by ID
    @GrpcMethod(staticGrpcConstants.SERVICE, "DeleteAnimal")
    async deleteAnimal(request: DeleteAnimalRequest): Promise<DeleteAnimalResponse> {
        this.logger.debug(`Deleting Animal: ${JSON.stringify(request)}`)
        return this.AnimalService.deleteAnimal(request)
    }
}
