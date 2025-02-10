import { Logger } from "@nestjs/common"
import { AvailableInType, ToolEntity, ToolId } from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"

export class ToolSeeder implements Seeder {
    private readonly logger = new Logger(ToolSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding tools...")
        await dataSource.manager.save(ToolEntity, [
            { id: ToolId.Hand, availableIn: AvailableInType.Both, index: 0 },
            { id: ToolId.Scythe, availableIn: AvailableInType.Home, index: 1 },
            { id: ToolId.ThiefHand, availableIn: AvailableInType.Neighbor, index: 2 },
            { id: ToolId.WaterCan, availableIn: AvailableInType.Both, index: 3 },
            { id: ToolId.Herbicide, availableIn: AvailableInType.Both, index: 4 },
            { id: ToolId.Pesticide, availableIn: AvailableInType.Both, index: 5 }
        ])
        this.logger.verbose("Tools seeded successfully.")
    }
}
