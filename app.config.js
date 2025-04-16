const imperial = require('./clients/imperial.json')
export default ({ config }) => {
  const env = process.env.APP_ENV
  if(env === 'imperial') {
    return {...imperial}
  }
    return {
      ...config,
    };
  };