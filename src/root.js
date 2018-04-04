const request = require('request-promise-native');

const key = "2GEF1zuwkDpQAL036qrwrVWUeRIx3fQ8";

const frames = function(opts, data, mkt) {
  var btc = data.find((c) => { return c.currency == "BTC"; });
  var bch = data.find((c) => { return c.currency == "BCH"; });
  var eth = data.find((c) => { return c.currency == "ETH"; });
  var ltc = data.find((c) => { return c.currency == "LTC"; });
  var xrp = data.find((c) => { return c.currency == "XRP"; });
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
    fs.push({text: formatter.format(btc.close), icon: "i10814"});
  }
  if (opts.bch !== "false") {
    fs.push({text: formatter.format(bch.close), icon: "i12303"});
  }
  if (opts.eth !== "false") {
    fs.push({text: formatter.format(eth.close), icon: "i11862"});
  }
  if (opts.ltc !== "false") {
    fs.push({text: formatter.format(ltc.close), icon: "i11792"});
  }
  if (opts.xrp !== "false") {
    fs.push({text: smallFormatter.format(xrp.close), icon: "i15863"});
  }
  
  return {frames: fs};
}

const iconFromDelta = function(mkt) {
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

module.exports = async function root(req, res) {
  const dashboard = JSON.parse(await request("https://api.nomics.com/v1/dashboard?key="+key));
  const sparkline = JSON.parse(await request("https://api.nomics.com/v1/market-cap/sparkline?key="+key));
  res.json(frames(req.query, dashboard, sparkline));
}
