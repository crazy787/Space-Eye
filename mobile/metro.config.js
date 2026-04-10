const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: three.js package has invalid exports field that causes warnings
// This tells Metro to use the main field instead of exports
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
