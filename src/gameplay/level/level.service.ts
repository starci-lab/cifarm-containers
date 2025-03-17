import { Injectable, Logger } from "@nestjs/common"
import {
    AddExperiencesParams,
    AddExperiencesResult,
    ComputeTotalExperienceForLevelParams
} from "./level.types"
import { ExperienceCannotBeZeroOrNegativeException } from "../exceptions"

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
        const { user, experiences } = params

        //ensure the experiences is a positive value
        if (experiences <= 0) throw new ExperienceCannotBeZeroOrNegativeException(experiences)

        const quota = this.computeExperiencesQuota(user.level)

        let current = user.experiences + experiences
        let level: number = undefined

        if (current >= quota) {
            level = user.level + 1
            current = user.experiences - quota
        }
        user.level = level
        user.experiences = current
        return user
    }

    public computeTotalExperienceForLevel({
        experiences,
        level
    }: ComputeTotalExperienceForLevelParams): number {
        const total = [...Array(level)].reduce(
            (acc, _, i) => acc + this.computeExperiencesQuota(i + 1),
            0
        )
        return total + experiences
    }
}
