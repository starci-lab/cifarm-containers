import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { userGrpcConstants } from "../constants"
import { LevelService } from "./level.service"
import {
    AddExperiencesRequest,
    AddExperiencesResponse,
    GetLevelRequest,
    GetLevelResponse
} from "./level.dto"
@Controller()
export class LevelController {
    private readonly logger = new Logger(LevelController.name)

    constructor(private readonly levelService: LevelService) {}

    @GrpcMethod(userGrpcConstants.SERVICE, "GetLevel")
    async getLevel(request: GetLevelRequest): Promise<GetLevelResponse> {
        this.logger.debug(`Received getLevel request for user: ${request.userId}`)
        return this.levelService.getLevel(request)
    }

    @GrpcMethod(userGrpcConstants.SERVICE, "AddExperiences")
    async addExperiences(request: AddExperiencesRequest): Promise<AddExperiencesResponse> {
        this.logger.debug(`Received addExperiences request for user: ${request.userId}`)
        return this.levelService.addExperiences(request)
    }
}
