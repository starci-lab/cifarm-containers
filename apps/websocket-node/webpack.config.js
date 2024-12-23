const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

// Base package.json để làm cơ sở
const basePackage = {
    name: "websocket-node",
    version: "1.0.0",
    main: "./main.js",
    scripts: {
        "start": "node ./main.js"
    },
    engines: {
        node: ">= 14",
    },
    dependencies: {
    }
}

module.exports = {
    entry: "./apps/websocket-node/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "websocket-node"),
        filename: "main.js",
    },
    target: "node",
    externals: [nodeExternals()],
    plugins: [
        new GeneratePackageJsonPlugin(basePackage, {
            debug: true,
            resolveContextPaths: [__dirname],
            useInstalledVersions: true,
            excludeDependencies: [          
                
            ],
        }),
    ],
}
