import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import { DataSource } from "typeorm"
import {
    AddExperiencesRequest,
    AddExperiencesResponse,
    GetLevelRequest,
    GetLevelResponse
} from "./level.dto"
import { ExperienceCannotBeZeroOrNegativeException, UserNotFoundException } from "@src/exceptions"

@Injectable()
export class LevelService {
    private readonly logger: Logger = new Logger(LevelService.name)
    constructor(private readonly dataSource: DataSource) {}

    private computeExperiencesQuota(level: number): number {
        //the formula to calculate the experience quota
        //compute first 10 levels
        // 1: 50
        // 2: 125
        // 3: 225
        // 4: 350
        // 5: 500
        // 6: 675
        // 7: 875
        // 8: 1100
        // 9: 1350
        // 10: 1625
        return 50 * level + 25 * Math.pow(level - 1, 2)
    }

    public async getLevel(request: GetLevelRequest): Promise<GetLevelResponse> {
        const user = await this.findUserById(request.userId)
        return {
            level: user.level,
            experiences: user.experiences,
            experienceQuota: this.computeExperiencesQuota(user.level)
        }
    }

    public addExperiences(request: AddExperiencesRequest): AddExperiencesResponse {
        const { entity, experiences } = request
        
        //ensure the experiences is a positive value
        if (experiences <= 0) 
            throw new ExperienceCannotBeZeroOrNegativeException(experiences)

        const quota = this.computeExperiencesQuota(entity.level)
        
        let current = entity.experiences + experiences
        let level: number = undefined

        if (current >= quota) {
            level = entity.level + 1
            current = entity.experiences - quota
        }
        return {
            level,
            experiences: current
        }
    }

    private async findUserById(userId: string): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: userId }
        })
        if (!user) throw new UserNotFoundException(userId)
        return user
    }
}
