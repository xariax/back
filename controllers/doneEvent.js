const { v4: uuidv4 } = require('uuid');



// 🛠 Automatyczne generowanie 10 eventów
const machineList = ["psg1", "psg2", "psg3"];
const EventsTable = [];

for (let i = 0; i < 20; i++) {
  EventsTable.push({
    id: uuidv4(),
    time: `${String(6 + i).padStart(2, "0")}:00`,     // np. 06:00, 07:00 itd.
    duration: `${5 + i} min`,                         // np. 5 min, 6 min, ...
    reason: "",                                       // puste – do uzupełnienia z frontend
    status: "true",                                   // true = do uzupełnienia
    machine: machineList[i % machineList.length],     // cyklicznie: psg1, psg2, ...
  });
}


/// ✅ Zwraca 10 ostatnich:
const getRecentEvents = (req, res) => {
  const { machine } = req.query;

  if (!machine) {
    return res.status(400).json({ message: "Brakuje parametru ?machine=" });
  }

  // 🧠 Filtruj tylko po maszynie
  const filtered = EventsTable.filter(e => e.machine === machine);

  // Zwrotka maksymalnie 10 ostatnich
  const last10 = filtered.slice(-10).reverse();

  res.status(200).json(last10);
};


/// ✅ Zmienia powód danego eventu (po ID)
const updateEventReason = (req, res) => {
  const { id } = req.params;
  const { reason, machine } = req.body;

  const index = EventsTable.findIndex(ev => ev.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  const updatedEvent = {
    ...EventsTable[index],
    reason,
    status: 'false',
    machine: machine || EventsTable[index].machine, // <- 🧠 tu podstawiasz _nową_ maszynę jeśli podana, albo zostawiasz starą
  };

  EventsTable[index] = updatedEvent;

  console.log('📝 Zaktualizowano event:', updatedEvent);
  res.status(200).json({
    message: "✅ Zaktualizowano event",
    event: updatedEvent
  });
};


module.exports = {
  getRecentEvents,
  updateEventReason,
};
