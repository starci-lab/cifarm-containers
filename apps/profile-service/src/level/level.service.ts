import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import { DataSource } from "typeorm"
import {
    AddExperiencesRequest,
    AddExperiencesResponse,
    GetLevelRequest,
    GetLevelResponse
} from "./level.dto"
import { UserNotFoundException } from "@src/exceptions"

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

    public async addExperiences(request: AddExperiencesRequest): Promise<AddExperiencesResponse> {
        const user = await this.findUserById(request.userId)
        user.experiences += Number(request.experiences)
        const quota = this.computeExperiencesQuota(user.level)
        if (user.experiences >= quota) {
            user.level++
            user.experiences = user.experiences - quota
        }
        await this.dataSource.manager.save(user)
        return
    }

    private async findUserById(userId: string): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: userId }
        })
        if (!user) throw new UserNotFoundException(userId)
        return user
    }
}
