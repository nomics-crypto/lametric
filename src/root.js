const request = require('request-promise-native');

const key = process.env.NOMICS_API_KEY;

const formatter = new Intl.NumberFormat(
  'en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0, minimumFractionDigits: 0}
);

const smallFormatter = new Intl.NumberFormat(
  'en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 4, minimumFractionDigits: 0, maximumSignificantDigits: 4, useGrouping: false}
);

const currencies = [
  {id: "BTC", icon: "i10814", formatter: formatter},
  {id: "BCH", icon: "i12303", formatter: formatter},
  {id: "ETH", icon: "i11862", formatter: formatter},
  {id: "LTC", icon: "i11792", formatter: formatter},
  {id: "XRP", icon: "i15863", formatter: smallFormatter},
]

const frames = function(opts, data, mkt) {
  return {
    frames: [
      {text: "Nomics", icon: iconFromDelta(mkt)},
    ].concat(currencies.
      filter((c) => opts[c.id.toLowerCase()] !== "false").
      map((c) => ({
        text: c.formatter.format(data.find((d) => d.currency === c.id).close),
        icon: c.icon
      })
    ))
  }
}

const iconFromDelta = function(mkt) {
  var closes = mkt.day[0].closes
  var open = closes[0]
  var close = closes[closes.length-1]
  var delta = (close-open)/open
  if (delta > 0.10) return "i17824"
  if (delta > 0.05) return "i17825"
  if (delta >= -0.05) return "i15855"
  if (delta >= -0.10) return "i17826"
  return "i17827"
}

module.exports = async function root(req, res) {
  const dashboard = JSON.parse(await request("https://api.nomics.com/v1/dashboard?key="+key));
  const sparkline = JSON.parse(await request("https://api.nomics.com/v1/market-cap/sparkline?key="+key));
  res.json(frames(req.query, dashboard, sparkline));
}
