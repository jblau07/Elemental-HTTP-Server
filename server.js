const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const PORT = process.env.PORT || 4000;

const server = http.createServer((request, response) => {

  let reqMethod = request.method;
  let reqURI = request.url;

  if (reqMethod === 'GET') {
    if (reqURI.length === 1) {
      reqURI = `/index.html`;
    }
    getHandler(request, response);
  }
  if (reqMethod === 'POST') {
    request.on('data', (chunk) => {
      let chunkStr = chunk.toString();
      let chunkQuery = querystring.parse(chunkStr);

      postHandler(chunkQuery, response);
    })
  }
});

function createGetHeader(res) {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200, 'OK');
}

function createPostHeader(res) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200, 'OK');
}

function create404Header(res) {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(404, 'Not Found');
}

function create500Header(res) {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(500, 'Internal Server Error');
}

function getHandler(getReq, getRes) {
  let uri = getReq.url

  fs.readFile(`./public/${uri}`, {
    encoding: 'utf8'
  }, (err, data) => {
    if (err) {
      fs.readFile(`./public/404.html`, (err, data) => {
        encoding: 'utfi8}'
      }, (err, data) => {
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

function postHandler(postReq, postRes) {
//200 ok file already exists. check if file exists. do something on err?
  

let postContent =
    `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>The Elements - ${postReq.elementName}</title>\n <link rel= "stylesheet" href="/css/styles.css">\n</head>\n<body>\n  <h1>${postReq.elementName}</h1>\n  <h2>${postReq.elementSymbol}</h2>\n  <h3>${postReq.elementAtomicNumber}</h3>\n  <p>${postReq.elementDescription}</p>\n  <p><a href="/">back</a></p>\n</body>\n</html>`;

  fs.writeFile(`./public/${postReq.elementName}.html`, postContent, (err) => {
    if (err) throw err;
  })
  createPostHeader(postRes)
  postRes.write(JSON.stringify({ 'success' : true }));
  return postRes.end();
};

server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});