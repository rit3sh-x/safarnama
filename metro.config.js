const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.unstable_enableSymlinks = true;

config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
];

config.resolver.assetExts.push('riv');

config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    "@backend/api": path.resolve(projectRoot, "_generated/api"),
    "@backend/dataModel": path.resolve(projectRoot, "_generated/dataModel"),
    "@backend/types": path.resolve(projectRoot, "types"),
    "@": path.resolve(projectRoot, "src"),
};

config.watchFolders = [projectRoot];

module.exports = withUniwindConfig(config, {
    cssEntryFile: "./src/app/globals.css",
    dtsFile: "./uniwind-types.d.ts",
});