module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Temporarily disabled to avoid WorkletsError
      // 'react-native-reanimated/plugin',
    ],
  };
};
