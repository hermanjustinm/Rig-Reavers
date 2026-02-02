const state = {
  level: 1,
  xp: 0,
  ap: 10,
  maxAp: 10,
  scrap: 0,
  water: 0,
  fuel: 0,
  tech: 0,
  rigProgress: 0,
  rigTarget: 120,
  blueprintUnlocked: false,
};

const zones = {
  rust: {
    name: "Rust Flats",
    cost: 2,
    rewards: { scrap: [4, 10], water: [1, 3], fuel: [0, 2] },
    xp: 6,
  },
  ash: {
    name: "Ash Dunes",
    cost: 3,
    rewards: { scrap: [8, 14], water: [2, 4], fuel: [1, 3], tech: [0, 1] },
    xp: 9,
  },
  glass: {
    name: "Glass Wastes",
    cost: 5,
    rewards: { scrap: [12, 22], water: [3, 6], fuel: [2, 4], tech: [1, 3] },
    xp: 14,
  },
};

const refs = {
  level: document.getElementById("level"),
  ap: document.getElementById("ap"),
  morale: document.getElementById("morale"),
  scrap: document.getElementById("scrap"),
  water: document.getElementById("water"),
  fuel: document.getElementById("fuel"),
  tech: document.getElementById("tech"),
  blueprint: document.getElementById("blueprint"),
  rigProgress: document.getElementById("rig-progress"),
  rigStatus: document.getElementById("rig-status"),
  rigButton: document.getElementById("build-rig"),
  log: document.getElementById("log"),
};

const logEntries = [];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const addLog = (message) => {
  logEntries.unshift({ message, time: new Date().toLocaleTimeString() });
  if (logEntries.length > 6) {
    logEntries.pop();
  }
  refs.log.innerHTML = logEntries
    .map((entry) => `<li><strong>${entry.time}</strong> — ${entry.message}</li>`)
    .join("");
};

const updateMorale = () => {
  if (state.ap <= 2) {
    refs.morale.textContent = "Drained";
  } else if (state.ap <= 5) {
    refs.morale.textContent = "Tense";
  } else {
    refs.morale.textContent = "Stable";
  }
};

const updateRigStatus = () => {
  if (!state.blueprintUnlocked) {
    refs.blueprint.textContent = "Locked";
    refs.rigStatus.textContent = "Unavailable";
    refs.rigButton.disabled = true;
  } else if (state.rigProgress >= state.rigTarget) {
    refs.blueprint.textContent = "Secured";
    refs.rigStatus.textContent = "Operational";
    refs.rigButton.disabled = true;
  } else {
    refs.blueprint.textContent = "Secured";
    refs.rigStatus.textContent = "Building";
    refs.rigButton.disabled = state.scrap < 10;
  }
};

const updateUi = () => {
  refs.level.textContent = state.level;
  refs.ap.textContent = `${state.ap} / ${state.maxAp}`;
  refs.scrap.textContent = state.scrap;
  refs.water.textContent = state.water;
  refs.fuel.textContent = state.fuel;
  refs.tech.textContent = state.tech;
  refs.rigProgress.textContent = `${state.rigProgress} / ${state.rigTarget}`;
  updateMorale();
  updateRigStatus();
};

const gainResources = (rewards) => {
  Object.entries(rewards).forEach(([key, range]) => {
    const amount = randomBetween(range[0], range[1]);
    state[key] += amount;
  });
};

const maybeUnlockBlueprint = () => {
  if (!state.blueprintUnlocked && state.level >= 3) {
    state.blueprintUnlocked = true;
    addLog("You recovered a war rig core blueprint from a buried depot.");
  }
};

const handleScavenge = (zoneKey) => {
  const zone = zones[zoneKey];
  if (state.ap < zone.cost) {
    addLog("Not enough AP to scavenge. Wait for recovery.");
    return;
  }

  state.ap -= zone.cost;
  gainResources(zone.rewards);
  state.xp += zone.xp;
  state.level = Math.min(10, Math.floor(state.xp / 20) + 1);
  maybeUnlockBlueprint();

  addLog(`You scouted ${zone.name} and brought back salvage.`);
  updateUi();
};

const handleRigContribution = () => {
  if (!state.blueprintUnlocked || state.scrap < 10) {
    return;
  }
  state.scrap -= 10;
  state.rigProgress = Math.min(state.rigTarget, state.rigProgress + 10);
  if (state.rigProgress >= state.rigTarget) {
    addLog("The war rig roars to life. Auto-scavenge routes are now possible.");
  } else {
    addLog("You reinforced the war rig frame with salvaged scrap.");
  }
  updateUi();
};

const regenAp = () => {
  state.ap = Math.min(state.maxAp, state.ap + 1);
  updateUi();
};

const bindEvents = () => {
  document.querySelectorAll("button[data-zone]").forEach((button) => {
    button.addEventListener("click", () => handleScavenge(button.dataset.zone));
  });
  refs.rigButton.addEventListener("click", handleRigContribution);
};

bindEvents();
updateUi();
addLog("You arrive at the Rust Flats with a half-full canteen.");

setInterval(regenAp, 8000);
