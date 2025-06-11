// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Add path alias support
config.resolver.alias = {
  '~': path.resolve(__dirname),
};

module.exports = withNativeWind(config, { input: './global.css' });
