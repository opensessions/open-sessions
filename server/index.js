/* eslint consistent-return:0 */

const express = require('express');
const logger = require('./logger');
const ngrok = require('ngrok');

const frontend = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';

const app = express();

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi);

// Initialize image serving
app.use('/images', express.static('app/images'));

// Initialize stormpath
const stormpathMiddleware = require('./middlewares/stormpathMiddleware');
app.use(stormpathMiddleware(app));

// Initialize stormpath
const apiMiddleware = require('./middlewares/api');
apiMiddleware(app);

// Initialize frontend middleware that will serve your JS app
const webpackConfig = isDev
  ? require('../internals/webpack/webpack.dev.babel')
  : require('../internals/webpack/webpack.prod.babel');
app.use(frontend(webpackConfig));

const port = process.env.PORT || 3000;

app.on('stormpath.ready', () => {
  logger.checkmark('Stormpath ready');
  app.listen(port, (err) => {
    if (err) {
      return logger.error(err);
    }

    // Connect to ngrok in dev mode
    if (isDev) {
      ngrok.connect(port, (innerErr, url) => {
        if (innerErr) {
          return logger.error(innerErr);
        }
        logger.appStarted(port, url);
      });
    } else {
      logger.appStarted(port);
    }
  });
});
