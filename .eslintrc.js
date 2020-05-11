module.exports = {
  "env": {
      "browser": true,
      "commonjs": true,
      "es6": true,
      "node": true,
  },
  "extends": "google",
  "parserOptions": {
      "sourceType": "module",
      "ecmaVersion": 2018
  },
  "rules": {
      'switch-colon-spacing': 0,
      'max-len': [2, {
          "code": 120,
          "tabWidth": 4,
          "ignoreUrls": true,
      }],
      'require-jsdoc': 0,
  },
  "globals": {
      "$": true,
      "jQuery": true,
  }
};
