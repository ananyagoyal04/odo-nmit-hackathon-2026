const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/mysql');

let isDBInitialized = false;

module.exports = async (req, res) => {
  if (!isDBInitialized) {
    try {
      await connectDB();
      isDBInitialized = true;
    } catch (e) {
      console.warn('Vercel Serverless DB init notice:', e.message);
    }
  }
  return app(req, res);
};
