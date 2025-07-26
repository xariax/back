// ✅ controllers/doneReport.js (CommonJS):

const doneReport = (req, res) => {
  const report = req.body;
  console.log('📥 Odebrany raport:', report);
  res.status(200).json({
    message: '✅ Raport otrzymany!',
    received: report
  });
};

module.exports = { doneReport };