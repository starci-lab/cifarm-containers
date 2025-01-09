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
            { id: ToolId.Scythe, availableIn: AvailableInType.Home, index: 0 },
            { id: ToolId.Steal, availableIn: AvailableInType.Neighbor, index: 1 },
            { id: ToolId.WaterCan, availableIn: AvailableInType.Both, index: 2 },
            { id: ToolId.Herbicide, availableIn: AvailableInType.Both, index: 3 },
            { id: ToolId.Pesticide, availableIn: AvailableInType.Both, index: 4 }
        ])
        this.logger.verbose("Tools seeded successfully.")
    }
}
