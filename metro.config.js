const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// .mjs dosyalarini coz - import.meta web'de crash yapiyor
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'mjs');

module.exports = config;
