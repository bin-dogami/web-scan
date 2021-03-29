const path = require('path')

module.exports = {
  // x-powered-by用于告知网站是用何种语言或框架编写的， 这里不展示出去
  poweredByHeader: false,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    config.resolve.alias['@@'] = path.resolve(__dirname, './components');
    return config;
  }
}


