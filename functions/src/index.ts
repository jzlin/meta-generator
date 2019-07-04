import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as path from 'path';
import * as url from 'url';
const isBot = require('isbot');

admin.initializeApp();

const app = express();

app.engine('html', (_, options: any, callback) => {
  console.log(options.req.url);
  const params = (options.req.url as string).substr(1).split('/');
  const targetUrl = decodeURIComponent(decodeURIComponent(params[0]));
  const parseUrl = url.parse(targetUrl);
  console.log(parseUrl);
  let metaNames: {[key: string]: string} = {};
  try {
    metaNames = JSON.parse(decodeURIComponent(decodeURIComponent(params[1])));
  } catch (err) {
    console.log('JSON parse error!');
  }
  let metaProperties: {[key: string]: string} = {};
  try {
    metaProperties = JSON.parse(decodeURIComponent(decodeURIComponent(params[2])));
  } catch (err) {
    console.log('JSON parse error!');
  }
  console.log(targetUrl);
  console.log(metaNames);
  console.log(metaProperties);
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meta Generator</title>${
      Object.keys(metaNames || []).map(metaName => {
        return `<meta name="${metaName}" content="${metaNames[metaName]}">`;
      }).join('')
    }${
      Object.keys(metaProperties || []).map(metaProperty => {
        return `<meta property="${metaProperty}" content="${metaProperties[metaProperty]}">`;
      }).join('')
    }${
      parseUrl.hostname 
      ? `<script>(function(){location.replace('${targetUrl}');})();</script>` 
      : ''
    }
  </head>
  <body>
  </body>
  </html>`;
  callback(null, html);
});

app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, '../views'));

app.get('*.*', express.static(path.resolve(__dirname, '.../views')));

app.get('*', (req, res) => {
  console.log(req.url);
  const params = req.url.substr(1).split('/');
  const targetUrl = decodeURIComponent(decodeURIComponent(params[0]));
  console.log(targetUrl);
  if (targetUrl) {
    const parseUrl = url.parse(targetUrl);
    console.log(parseUrl);
    if (parseUrl.hostname) {
      console.log(req.headers['user-agent']);
      const isFromBot = isBot(req.headers['user-agent']);
      console.log(isFromBot);
      if (!isFromBot) {
        res.redirect(targetUrl, 302);
      }
    }
    res.render(path.resolve(__dirname, '../views/index.html'), { req });
  } else {
    res.sendFile(path.resolve(__dirname, '../views/index.html'), { req });
  }
});

exports.metagenerator = functions.https.onRequest(app);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
