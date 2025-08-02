const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = {
  // ...other config
  plugins: [
    new WorkboxWebpackPlugin.InjectManifest({
      swSrc: './src/service-worker.js',
      swDest: 'service-worker.js',
    }),
  ],
};