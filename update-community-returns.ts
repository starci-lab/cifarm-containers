import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

// Function to recursively find all files in a directory
async function findFiles(dir: string, fileList: string[] = []): Promise<string[]> {
    const files = await fs.promises.readdir(dir)
    
    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = await fs.promises.stat(filePath)
        
        if (stat.isDirectory()) {
            await findFiles(filePath, fileList)
        } else if (file.endsWith(".resolver.ts") || file.endsWith(".service.ts")) {
            fileList.push(filePath)
        }
    }
    
    return fileList
}

// Function to update a file
async function updateFile(filePath: string): Promise<void> {
    try {
        let content = await readFile(filePath, "utf8")
        let modified = false
        
        // Update imports
        if (content.includes("import { EmptyObjectType }") || content.includes("EmptyObjectType }")) {
            if (filePath.endsWith(".resolver.ts") && !content.includes("VoidResolver")) {
                content = content.replace(/import \{ EmptyObjectType \} from "@src\/common"/g, 'import { VoidResolver } from "graphql-scalars"')
                content = content.replace(/import \{ ([^}]+), EmptyObjectType \} from "@src\/common"/g, 'import { $1 } from "@src/common"\nimport { VoidResolver } from "graphql-scalars"')
                modified = true
            } else if (filePath.endsWith(".service.ts")) {
                content = content.replace(/import \{ ([^}]+), EmptyObjectType \} from "@src\/common"/g, 'import { $1 } from "@src/common"')
                content = content.replace(/import \{ EmptyObjectType \} from "@src\/common"/g, "")
                modified = true
            }
        }
        
        // Update resolver Mutation decorators
        if (filePath.endsWith(".resolver.ts")) {
            if (content.includes("@Mutation(() => EmptyObjectType")) {
                content = content.replace(/@Mutation\(\(\) => EmptyObjectType/g, "@Mutation(() => VoidResolver")
                modified = true
            }
            
            // Add Promise<void> return type if missing
            content = content.replace(/public async ([a-zA-Z0-9_]+)\(([^)]*)\)(\s*)\{/g, "public async $1($2): Promise<void> {")
            modified = true
        }
        
        // Update return types in method signatures
        if (content.includes("Promise<EmptyObjectType>")) {
            content = content.replace(/Promise<EmptyObjectType>/g, "Promise<void>")
            modified = true
        }
        
        // Update service methods to return void
        if (filePath.endsWith(".service.ts")) {
            // Add Promise<void> return type if missing
            content = content.replace(/async ([a-zA-Z0-9_]+)\(([^)]*)\)(\s*)\{/g, "async $1($2): Promise<void> {")
            
            // Replace "const result = await" with just "await"
            content = content.replace(/const result = await mongoSession\.withTransaction/g, "await mongoSession.withTransaction")
            
            // Remove "return result" statements
            content = content.replace(/return result(\s*\/\/[^\n]*)?/g, "// No return value needed for void$1")
            
            // Replace "return {}" with a comment
            content = content.replace(/return \{\}(\s*\/\/[^\n]*)?/g, "// No return value needed for void$1")
            
            modified = true
        }
        
        if (modified) {
            await writeFile(filePath, content, "utf8")
            console.log(`Updated ${filePath}`)
        }
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error)
    }
}

// Main function
async function main(): Promise<void> {
    const communityDir = path.join("apps", "gameplay-subgraph", "src", "mutations", "community")
    const files = await findFiles(communityDir)
    
    console.log(`Found ${files.length} files to process`)
    
    for (const file of files) {
        await updateFile(file)
    }
    
    console.log("Done!")
}

main().catch(console.error) 