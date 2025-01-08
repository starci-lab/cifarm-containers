import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, UserEntity } from "@src/databases"
import { UpdateTutorialTransactionFailedException } from "@src/exceptions"
import { DataSource } from "typeorm"
import { UpdateTutorialRequest, UpdateTutorialResponse } from "./update-tutorial.dto"

@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {
    }

    async updateTutorial(request: UpdateTutorialRequest): Promise<UpdateTutorialResponse> {
        this.logger.debug(`Starting claim daily reward for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Get latest user
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // Start transaction
            await queryRunner.startTransaction()
            try {
                // Save user
                await queryRunner.manager.update(UserEntity, user.id, {
                    tutorialIndex: request.tutorialIndex,
                    stepIndex: request.stepIndex
                })

                await queryRunner.commitTransaction()

                this.logger.log(`Update tutorial for user ${request.userId} successfully`)
            } catch (error) {
                this.logger.error(`Update tutorial for user ${request.userId} failed`)
                await queryRunner.rollbackTransaction()
                throw new UpdateTutorialTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
