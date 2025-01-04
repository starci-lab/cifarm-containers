import { Injectable, Logger } from "@nestjs/common"
import { ExperienceCannotBeZeroOrNegativeException } from "@src/exceptions"
import {
    AddExperiencesParams,
    AddExperiencesResult
} from "./level.dto"

@Injectable()
export class LevelService {
    private readonly logger: Logger = new Logger(LevelService.name)

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

    public addExperiences(params: AddExperiencesParams): AddExperiencesResult {
        const { entity, experiences } = params

        //ensure the experiences is a positive value
        if (experiences <= 0) throw new ExperienceCannotBeZeroOrNegativeException(experiences)

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
}
