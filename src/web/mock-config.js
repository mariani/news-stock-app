// Web stand-in for react-native-config. The web build deliberately holds no API keys: it calls the
// /api functions, which read their keys from the server environment.
module.exports = {
  NEWS_API_KEY: '',
};
