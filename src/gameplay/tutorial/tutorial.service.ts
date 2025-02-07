import { Injectable } from "@nestjs/common"
import { TutorialStep } from "@src/databases"

@Injectable()
export class TutorialService {
    // check whether is the last step of the tutorial
    isLastStep(step: TutorialStep): boolean {
        const steps = Object.values(TutorialStep)
        return steps.indexOf(step) === steps.length - 1
    }
}