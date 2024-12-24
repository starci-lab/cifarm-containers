import { Logger } from "@nestjs/common"
import { AnimalCurrentState, AnimalInfoEntity, AnimalRandomness, SystemEntity, SystemId } from "@src/database"
import { DataSource, LessThanOrEqual, Not } from "typeorm"
import utc from "dayjs/plugin/utc"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import dayjs from "dayjs"
import { bullConfig, BullQueueName } from "@src/config"
import { AnimalJobData } from "@apps/cron-scheduler"
import { Job } from "bullmq"
import { AnimalsWorkerProcessTransactionFailedException } from "@src/exceptions"
dayjs.extend(utc)

@Processor(bullConfig[BullQueueName.Animal].name)
export class AnimalWorker extends WorkerHost  {
    private readonly logger = new Logger(AnimalWorker.name)
    
    constructor(private readonly dataSource: DataSource) {
        super()
    }
    
    public override async process(job: Job<AnimalJobData>): Promise<void> {
        this.logger.verbose(`Processing animal job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data
    
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            let animalInfos = await queryRunner.manager.find(AnimalInfoEntity, {
                where: {
                    currentState: Not(AnimalCurrentState.Hungry) && Not(AnimalCurrentState.Yield),
                    createdAt: LessThanOrEqual(dayjs(utcTime).toDate())
                },
                relations: {
                    animal: true
                },
                skip,
                take,
                order: {
                    createdAt: "ASC"
                }
            })
    
            const system = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.AnimalRandomness
                }
            })
            const { sickChance } = system.value as AnimalRandomness
            animalInfos = animalInfos.map((animalInfo) => {

                if(animalInfo.isAdult){
                    // If animal is adult, add time to the animal yield
                    animalInfo.currentYieldTime += time
                    if(animalInfo.currentYieldTime >= animalInfo.animal.yieldTime){
                        animalInfo.currentYieldTime = 0
                    
                        if(animalInfo.currentState === AnimalCurrentState.Sick){
                            animalInfo.alreadySick = true
                            animalInfo.currentState = AnimalCurrentState.Yield
                            animalInfo.harvestQuantityRemaining =
                                (animalInfo.animal.minHarvestQuantity +
                                    animalInfo.animal.maxHarvestQuantity) /
                                2

                        }else{
                            animalInfo.currentState = AnimalCurrentState.Yield
                            animalInfo.harvestQuantityRemaining = animalInfo.animal.maxHarvestQuantity
                        }

                        
                    }else{
                        if(animalInfo.currentYieldTime == (animalInfo.animal.yieldTime * 0.5)){
                            if(Math.random() < sickChance){
                                animalInfo.currentState = AnimalCurrentState.Sick
                            }
                        }
                    }
                }else{
                    // If animal is not adult, add time to the animal growth
                    if(animalInfo.currentGrowthTime < animalInfo.animal.growthTime){
                        // Add time to the animal growth
                        animalInfo.currentGrowthTime += time
                        // Add time to the animal hungry time
                        animalInfo.currentHungryTime += time

                        //Check if the animal is hungry
                        if(animalInfo.currentHungryTime >= animalInfo.animal.hungerTime){
                            animalInfo.currentState = AnimalCurrentState.Hungry
                        }
                    }else{
                        animalInfo.isAdult = true
                    }
                }
                    
                return animalInfo
            })

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(AnimalInfoEntity, animalInfos)
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new AnimalsWorkerProcessTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}
