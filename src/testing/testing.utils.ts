import { ModuleMetadata } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { getPostgreSqlToken, PostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { MOCK_DATABASE_OPTIONS } from "@src/testing"
import { DataSource } from "typeorm"

export async function createTestModule(metadata: ModuleMetadata) {
    const module = await Test.createTestingModule({
        ...metadata,
        imports: [
            EnvModule.forRoot(),
            PostgreSQLModule.forRoot(MOCK_DATABASE_OPTIONS),
            ...metadata.imports,
        ],
    }).compile()

    const dataSource = module.get<DataSource>(getPostgreSqlToken(MOCK_DATABASE_OPTIONS))
    return { module, dataSource }
}
