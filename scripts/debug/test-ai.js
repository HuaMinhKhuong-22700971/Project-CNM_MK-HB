const http = require('http');

const data = JSON.stringify({
  requirements: "gaming",
  budget: 20000000
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/ai-advisor/suggest-build',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let result = '';
  res.on('data', (d) => {
    result += d;
  });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(result), null, 2));
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
