/**
 
Metro configuration for React Native
Handles SVGs as components without breaking PNGs/JPGs*/

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  const {assetExts, sourceExts} = defaultConfig.resolver;

  const config = {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'), // Remove SVG from assets
      sourceExts: [...sourceExts, 'svg'], // Add SVG to source files
    },
  };

  return mergeConfig(defaultConfig, config);
})();
