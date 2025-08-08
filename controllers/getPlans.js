// controllers/getPlans.js
const path = require("path");
const XLSX = require("xlsx");

const getPlans = (req, res) => {
  const machineFromRequest = req.params.sheetName; // np. psg1
  const filePath = path.join(__dirname, "..", "files", "plans.xlsx");





  try {
    const workbook = XLSX.readFile(filePath);
    const allSheetNames = workbook.SheetNames; // np. ['Plany PSG1', 'Plany LINIA3']

    // Szukamy arkusza, którego nazwa kończy się na daną maszynę (ignorując wielkość liter)
    const matchedSheet = allSheetNames.find(sheet =>
      sheet.toLowerCase().trim().endsWith(machineFromRequest.toLowerCase())
    );

    if (!matchedSheet) {
      return res.status(404).json({ error: `Nie znaleziono arkusza dla maszyny "${machineFromRequest}"` });
    }

    const sheet = workbook.Sheets[matchedSheet];
    const data = XLSX.utils.sheet_to_json(sheet);

    res.json(data);
  } catch (err) {
    console.error("Błąd przy wczytywaniu Excela:", err);
    res.status(500).json({ error: "Błąd odczytu pliku Excel" });
  }
};

module.exports = getPlans;

