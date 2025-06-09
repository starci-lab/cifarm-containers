import { BulkSchema, BulkPaid, VaultData } from "@src/databases"

export interface ComputePaidAmountParams {
    vaultData: VaultData
    bulk: BulkSchema
    bulkPaid: BulkPaid
}



