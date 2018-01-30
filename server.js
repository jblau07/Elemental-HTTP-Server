const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {

  let reqMethod = req.method;
  let reqURI = req.url;

  if (reqMethod === 'GET') {
    getHandler(req, res);
  }
  if (reqMethod === 'POST') {
    req.on('data', (chunk) => {
      let chunkStr = chunk.toString();
      let chunkQuery = querystring.parse(chunkStr);

      postHandler(chunkQuery, res);
    })
  }
});

function createGetHeader(res) {
  res.writeHead(200, 'OK');
}

function createPostHeader(res) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200, 'OK');
}

function createBadPostHeader(res) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(400, 'Bad Request');
}

function create404Header(res) {
  res.writeHead(404, 'Not Found');
}

function create500Header(res) {
  res.writeHead(500, 'Internal Server Error');
}

//Returns appropriate response header and body.
function getHandler(getReq, getRes) {
  let uri = getReq.url
  if (uri.length === 1) {
    uri = `/index.html`;
  }
  fs.readFile(`./public/${uri}`, {
    encoding: 'utf8'
  }, (err, data) => {
    if (err) {
      fs.readFile(`./public/404.html`, (err, data) => {
        encoding: 'utf8}'
        if (err) {
          create500Header(getRes);
          getRes.write('500 Internal Server Error');
          return getRes.end();
        }
        create404Header(getRes);
        getRes.write(data);
        return getRes.end();
      })
    } else {
      createGetHeader(getRes);
      getRes.write(data);
      return getRes.end();
    }
  })
};

//Adds new element.html to public folder. Returns appropriate response header and body.
function postHandler(postReq, postRes) {

  fs.readFile(`./public/${postReq.elementName}.html`, {
    encoding: 'utf8'
  }, (err, data) => {
    if (err) {
      let postContent =
        `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>The Elements - ${postReq.elementName}</title>\n <link rel= "stylesheet" href="/css/styles.css">\n</head>\n<body>\n  <h1>${postReq.elementName}</h1>\n  <h2>${postReq.elementSymbol}</h2>\n  <h3>${postReq.elementAtomicNumber}</h3>\n  <p>${postReq.elementDescription}</p>\n  <p><a href="/">back</a></p>\n</body>\n</html>`;

      fs.writeFile(`./public/${postReq.elementName}.html`, postContent, (err) => {
        if (err) throw err;
      })
      fs.readdir('./public', {
        encoding: 'utf8'
      }, (err, files) => {
        rewriteIndex(files);
      }) 
      createPostHeader(postRes);
      postRes.write(JSON.stringify({
        'success': true
      }));
      return postRes.end();
    }
    createBadPostHeader(postRes)
    postRes.write(JSON.stringify({
      'error': 'file already exists'
    }));
    return postRes.end();
  })
};

//Iterates through all files in public folder when invoked. Returns an updated index.html string that contains
//appropriate element.html files. Overwrites index.html with updateIndex template. Invoked in postHandler function.
function rewriteIndex (arr) {
  let indexList = arr.filter((element) => {
    return (element.endsWith('.html') && element !== '404.html' && element !== 'index.html')
  }).map((element) => {
    return `  <li><a href='${element}'>${element.split('.')[0]}</a><li>\n `;
  }).join('');

let updateIndex =
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>The Elements</h1>
  <h2>These are all the known elements.</h2>
  <h3>These are 2</h3>
  <ol>
 ${indexList}
  </ol>
</body>
</html>`;

fs.writeFile('./public/index.html', updateIndex, (err) => {
  if (err) throw err;
  console.log('index updated');
})
}

server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});