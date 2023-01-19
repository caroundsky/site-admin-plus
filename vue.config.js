const confEnv = process.env.VUE_APP_ENV
const isProd = confEnv === 'prod'
const isServer = process.env.VUE_APP_CLIENT === 'server'

const path = require('path')
const publicPath = isServer ? './' : '/'
const useSourceMap = !isServer || !isProd

module.exports = {
  publicPath,

  pages: {
    index: {
      entry: 'example',
    },
  },

  outputDir: `dist/`,

  // css: {
  //   sourceMap: process.env.NODE_ENV !== 'production',
  //   extract: false
  // },

  productionSourceMap: useSourceMap,

  css: {
    sourceMap: useSourceMap,
    extract: false,
    // loaderOptions: {
    //   less: { javascriptEnabled: true }
    // }
  },

  chainWebpack: (config) => {
    config.devtool('source-map')

    // Only convert .svg files that are imported by these files as Vue component
    const FILE_RE = /\.(vue|jsx?|tsx?|svg)$/
    // Use vue-cli's default rule for svg in non .vue .js .ts files
    config.module.rule('svg').issuer((file) => !FILE_RE.test(file))
    // Use our loader to handle svg imported by other files
    config.module
      .rule('svg-component')
      .test(/\.svg$/)
      .issuer((file) => FILE_RE.test(file))
      .use('vue')
      .loader('vue-loader')
      .end()
      .use('svg-to-vue-component')
      .loader('svg-to-vue-component/loader')
      .tap((options) => {
        options = options || {}
        options.svgoConfig = {
          plugins: [{ addClassesToSVGElement: { classNames: ['svg-icon'] } }],
        }
        return options
      })

    config.module
      .rule('json5')
      .test(/\.json5$/)
      .use('json5-loader')
      .loader('json5-loader')

    config.performance.hints(false)
  },

  configureWebpack: (config) => {
    if (process.env.BUILD_MODE === 'lib') {
      const nodeExternals = require('webpack-node-externals')
      config.externals = config.externals || {}
      config.externals = [
        config.externals,
        {
          'element-ui': {
            root: 'ELEMENT',
            commonjs: 'element-ui',
            commonjs2: 'element-ui',
            amd: 'element-ui',
          },
        },
        nodeExternals({
          allowlist: [/^@babel/, /current-script-polyfill/],
        }),
      ]
    }

    const version = process.env.VERSION || require('./package.json').version
    const banner = `site container plus v${version}`
    const webpack = require('webpack')
    config.plugins.push(new webpack.BannerPlugin(banner))

    if (isServer) {
      // GZIP
      const CompressionWebpackPlugin = require('compression-webpack-plugin')
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: new RegExp('\\.(js|css)$'),
          threshold: 10240,
          minRatio: 0.8,
        })
      )
    }
  },

  devServer: {
    disableHostCheck: true,
    // before: require('./tests/mock-api'),
    proxy: null,
  },

  // p-retry未编译，手动转译
  // https://cli.vuejs.org/zh/config/#runtimecompiler
  transpileDependencies: ['p-retry'],

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      // patterns: ['src\\styles\\variables.less']
      patterns: [path.resolve(__dirname, 'src/styles/variables.less')],
    },
    i18n: {
      locale: 'zh-CN',
      fallbackLocale: 'zh-CN',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
}
