module.exports = {
  whitelist: ["http://localhost:3000", "http://localhost:5000"], // Allowed by CORS

  port: 5000,

  db: {
    database: "syncnote",
    host: "localhost",
    port: "27018",
    user: "",
    password: ""
  },

  security: {
    jwtSecret: "SECRET", // You need to change (Add number, special char, mix upper case lower case)
    bcryptSaltRounds: 12,
    secureFile: /(^[^.].*)/,
    illegalUsernames: [
      "administrator",
      "password",
      "user",
      "unknown",
      "anonymous",
      "null",
      "undefined",
      "api"
    ]
  },

  session: {
    maxAgeToken: "1d"
  }
};
