module.exports = {
  db: {
    database: "syncnote",
    host: "localhost",
    port: "27017",
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
