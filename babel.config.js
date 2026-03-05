module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@backend/api': './convex/_generated/api',
            '@backend/dataModel': './convex/_generated/dataModel',
            '@backend/types': './convex/types',
            '@': './src',
          },
        },
      ],
    ],
  };
};