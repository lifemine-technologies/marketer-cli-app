const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...(defaultConfig.resolver?.sourceExts ?? []), 'css'],
    resolveRequest: (context, moduleName, platform) => {
      // Handle @/ path aliases
      if (moduleName.startsWith('@/')) {
        const aliasPath = moduleName.replace('@/', '');
        const fullPath = path.resolve(__dirname, 'src', aliasPath);
        return context.resolveRequest(context, fullPath, platform);
      }
      // Default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  watchFolders: [
    path.resolve(__dirname),
  ],
  // Exclude build artifacts and native module build directories from watching
  blockList: [
    /.*\/node_modules\/.*\/android\/\.cxx\/.*/,
    /.*\/node_modules\/.*\/android\/build\/.*/,
    /.*\/\.cxx\/.*/,
    /.*\/build\/.*/,
  ],
};

module.exports = withNativeWind(mergeConfig(defaultConfig, config), {
  input: './global.css',
});
