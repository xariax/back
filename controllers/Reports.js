// ✅ controllers/doneReport.js (CommonJS):

exports.doneReport = (req, res) => {
  const report = req.body;
  console.log('📥 Odebrany raport:', report);
  res.status(200).json({
    message: '✅ Raport otrzymany!',
    received: report
  });
};

exports.toVerifyReport = (req, res) => {
  const report = req.body;
  console.log('📥 Odebrany raport do weryfikacji:', report);
  res.status(200).json({
    message: '✅ Raport otrzymany do weryfikacji!',
    received: report
  });
};