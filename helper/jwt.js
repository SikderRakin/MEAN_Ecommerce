const { expressjwt: expressJwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/upload(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["PUT", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["POST", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["DELETE", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["PUT", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["POST", "OPTIONS"] },

      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

async function isRevoked(req, payload) {
  if (!payload.payload.isAdmin) {
    return true;
  }
  return undefined;
}
module.exports = authJwt;

/// this is regular expression \/api\/v1\/products(.*)/ this will allow get all api after product
