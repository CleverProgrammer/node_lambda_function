var http = require("http");

const fetch = require("node-fetch");

const moment = require("moment");

require("dotenv").config();

const start_of_yesterday = moment().subtract(1, "days").startOf("day").unix();

const end_of_yesterday = moment().subtract(1, "days").endOf("day").unix();

let params = {
  limit: 100,
  start: start_of_yesterday,
  end: end_of_yesterday,
};

const stripe_auth = {
  Authorization: `Bearer ${process.env.REACT_APP_STRIPE_KEY}`,
};
const stripe_url = `https://api.stripe.com/v1/charges?limit=${params.limit}&created[gte]=${params.start}&created[lte]=${end_of_yesterday}`;

console.log(stripe_url);

const loadCustomers = async () =>
  await fetch(stripe_url, {
    method: "GET",
    headers: stripe_auth,
  })
    .then((res) => (res.ok ? res : Promise.reject(res)))
    .then((res) => res.json())
    .then(function (charges) {
      const paid_charges = charges.data.filter(function (charge) {
        return charge.paid === true;
      });
      const sum_charge_amount = function (charges, amount) {
        return charges.reduce(function (previous, current) {
          return previous + current[amount] / 100;
        }, 0);
      };

      console.log(sum_charge_amount(paid_charges, "amount"));

      // console.log("🔫", paid_charges);

      return paid_charges;
    });

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  loadCustomers();
  res.end("Hello World");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
