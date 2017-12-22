var https = require('https');
var express = require('express');
var app = express();

app.get("/", function (req, res) {
  console.log(req.query);
  getData().then((data) => {
    res.json(frames(req.query, data));
  }).catch((error) => {
    console.log(error);
    res.status(500).send(error);
  });
});

var getData = function() {
  return new Promise((resolve, reject) => {
    https.get('https://api.nomics.com/v0/dashboard/day', (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        res.resume();
        reject(error);
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

var frames = function(opts, data) {
  var btc = data.find((c) => { return c.Currency == "BTC"; });
  var bch = data.find((c) => { return c.Currency == "BCH"; });
  var eth = data.find((c) => { return c.Currency == "ETH"; });
  var ltc = data.find((c) => { return c.Currency == "LTC"; });
  var xrp = data.find((c) => { return c.Currency == "XRP"; });
  var formatter = new Intl.NumberFormat(
    'en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0, minimumFractionDigits: 0}
  );
  var smallFormatter = new Intl.NumberFormat(
    'en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 4, minimumFractionDigits: 0, maximumSignificantDigits: 4, useGrouping: false}
  );
  var fs = [];
  fs.push({text: "Nomics", icon: "i15855"});
  if (opts.btc !== "0") {
    fs.push({text: formatter.format(btc.Close), icon: "i12460"});
  }
  if (opts.bch !== "0") {
    fs.push({text: formatter.format(bch.Close), icon: "i12303"});
  }
  if (opts.eth !== "0") {
    fs.push({text: formatter.format(eth.Close), icon: "i11862"});
  }
  if (opts.ltc !== "0") {
    fs.push({text: formatter.format(ltc.Close), icon: "i11792"});
  }
  if (opts.xrp !== "0") {
    fs.push({text: smallFormatter.format(xrp.Close), icon: "i15863"});
  }
  
  return {frames: fs};
}

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});