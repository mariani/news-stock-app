// Web mock for react-native-config
// On web, read from environment or use defaults
module.exports = {
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || '',
};
