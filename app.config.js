const ivantage = require('./clients/client.json')
export default ({ config }) => {
  const env = process.env.APP_ENV
  if(env === 'ivantage') {
    return {...ivantage}
  }
    return {
      ...config,
    };
  };