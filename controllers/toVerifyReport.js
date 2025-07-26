// ✅ controllers/doneReport.js (CommonJS):

const toVerifyReport = (req, res) => {
  const report = req.body;
  console.log('📥 Odebrany raport do weryfikacji:', report);
  res.status(200).json({
    message: '✅ Raport otrzymany do weryfikacji!',
    received: report
  });
};

module.exports = { toVerifyReport };