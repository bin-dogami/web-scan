const path = require('path')

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    config.resolve.alias['@@'] = path.resolve(__dirname, './components');
    return config;
  }
}


