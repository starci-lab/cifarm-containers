import { join } from "path"

const BUILD_FOLDER = "cifarm-build/Build"
const FILE_NAME = "cifarm-build"

export const packageConfig = () => ({
    loader: {
        filename: `${FILE_NAME}.loader.js`,
        url: join(process.cwd(), BUILD_FOLDER, `${FILE_NAME}.loader.js`),
    },
    data: {
        filename: `${FILE_NAME}.data.unityweb`,
        url: join(process.cwd(), BUILD_FOLDER, `${FILE_NAME}.data.unityweb`),
    },
    framework: {
        filename: `${FILE_NAME}.framework.js.unityweb`,
        url: join(process.cwd(), BUILD_FOLDER, `${FILE_NAME}.framework.js.unityweb`),
        contentType: "application/javascript"
    },
    wasm: {
        filename: `${FILE_NAME}.wasm.unityweb`,
        url: join(process.cwd(), BUILD_FOLDER, `${FILE_NAME}.wasm.unityweb`),
    } 
})