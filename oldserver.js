var https = require('https');
var express = require('express');
var app = express();

var respondError = function(res, error) {
  console.log(error);
  res.status(500).send(error);
}

app.get("/", function (req, res) {
  console.log(req.method, req.originalUrl);
  getData('/v0/dashboard').then((data) => {
    getData('/v0/market-cap/sparkline').then((mkt) => {
      res.json(frames(req.query, data, mkt));
    }).catch(respondError.bind(this, res));
  }).catch(respondError.bind(this, res));
});

var getData = function(path) {
  return new Promise((resolve, reject) => {
    https.request({hostname: 'api.nomics.com', path: path, headers: {Referer: 'nomics-lametric.glitch.me'}}, (res) => {
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
    }).end();
  });
}

var frames = function(opts, data, mkt) {
  var btc = data.find((c) => { return c.CurrencyID == "BTC"; });
  var bch = data.find((c) => { return c.CurrencyID == "BCH"; });
  var eth = data.find((c) => { return c.CurrencyID == "ETH"; });
  var ltc = data.find((c) => { return c.CurrencyID == "LTC"; });
  var xrp = data.find((c) => { return c.CurrencyID == "XRP"; });
  var icon = iconFromDelta(mkt)
  var formatter = new Intl.NumberFormat(
    'en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0, minimumFractionDigits: 0}
  );
  var smallFormatter = new Intl.NumberFormat(
    'en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 4, minimumFractionDigits: 0, maximumSignificantDigits: 4, useGrouping: false}
  );
  var fs = [];
  fs.push({text: "Nomics", icon: icon});
  if (opts.btc !== "false") {
    fs.push({text: formatter.format(btc.Close), icon: "i10814"});
  }
  if (opts.bch !== "false") {
    fs.push({text: formatter.format(bch.Close), icon: "i12303"});
  }
  if (opts.eth !== "false") {
    fs.push({text: formatter.format(eth.Close), icon: "i11862"});
  }
  if (opts.ltc !== "false") {
    fs.push({text: formatter.format(ltc.Close), icon: "i11792"});
  }
  if (opts.xrp !== "false") {
    fs.push({text: smallFormatter.format(xrp.Close), icon: "i15863"});
  }
  
  return {frames: fs};
}

var iconFromDelta = function(mkt) {
  var closes = mkt.day[0].closes
  var open = closes[0]
  var close = closes[closes.length-1]
  var delta = (close-open)/open
  if (delta > 0.10) {
    return "i17824"
  }
  if (delta > 0.05) {
    return "i17825"
  }
  if (delta >= -0.05) {
    return "i15855"
  }
  if (delta >= -0.10) {
    return "i17826"
  }
  return "i17827"
}

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});