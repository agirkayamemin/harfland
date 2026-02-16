const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// import.meta web'de desteklenmiyor, .mjs dosyalarini sourceExts'ten cikar
// babel-plugin-transform-import-meta calismiyor cunku Metro .mjs'i babel'e gondermiyor
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'mjs');

module.exports = config;
