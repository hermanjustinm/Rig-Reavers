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
  activeTask: null,
  activeMission: null,
};

const zones = {
  rust: {
    name: "Rust Flats",
    cost: 2,
    rewards: { scrap: [4, 10], water: [1, 3], fuel: [0, 2] },
    xp: 6,
    unlockLevel: 1,
  },
  ash: {
    name: "Ash Dunes",
    cost: 3,
    rewards: { scrap: [8, 14], water: [2, 4], fuel: [1, 3], tech: [0, 1] },
    xp: 9,
    unlockLevel: 2,
  },
  glass: {
    name: "Glass Wastes",
    cost: 5,
    rewards: { scrap: [12, 22], water: [3, 6], fuel: [2, 4], tech: [1, 3] },
    xp: 14,
    unlockLevel: 4,
  },
};

const missions = {
  short: {
    name: "Short Run",
    duration: 45,
    rewards: { scrap: [10, 18], water: [3, 6], fuel: [1, 2] },
  },
  medium: {
    name: "Medium Run",
    duration: 90,
    rewards: { scrap: [18, 28], water: [5, 9], fuel: [2, 4], tech: [0, 1] },
  },
  long: {
    name: "Long Run",
    duration: 150,
    rewards: { scrap: [26, 40], water: [8, 12], fuel: [3, 5], tech: [1, 2] },
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
  xp: document.getElementById("xp"),
  nextUnlock: document.getElementById("next-unlock"),
  taskName: document.getElementById("task-name"),
  taskTimer: document.getElementById("task-timer"),
  taskButton: document.getElementById("start-task"),
  blueprint: document.getElementById("blueprint"),
  rigProgress: document.getElementById("rig-progress"),
  rigStatus: document.getElementById("rig-status"),
  rigButton: document.getElementById("build-rig"),
  missionName: document.getElementById("mission-name"),
  missionTimer: document.getElementById("mission-timer"),
  log: document.getElementById("log"),
};

const logEntries = [];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const formatTimer = (seconds) => {
  if (seconds <= 0) return "Ready";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0
    ? `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`
    : `${remainingSeconds}s`;
};

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

  document.querySelectorAll("button[data-mission]").forEach((button) => {
    button.disabled = state.rigProgress < state.rigTarget || state.activeMission !== null;
  });
};

const updateNextUnlock = () => {
  const upcoming = Object.values(zones)
    .filter((zone) => zone.unlockLevel > state.level)
    .sort((a, b) => a.unlockLevel - b.unlockLevel)[0];

  refs.nextUnlock.textContent = upcoming
    ? `${upcoming.name} @ Lv ${upcoming.unlockLevel}`
    : "All zones unlocked";
};

const updateTaskUi = () => {
  if (state.activeTask) {
    refs.taskName.textContent = state.activeTask.name;
    refs.taskTimer.textContent = formatTimer(state.activeTask.remaining);
    refs.taskButton.disabled = true;
  } else {
    refs.taskName.textContent = "Idle";
    refs.taskTimer.textContent = "--";
    refs.taskButton.disabled = state.blueprintUnlocked;
  }
};

const updateMissionUi = () => {
  if (state.activeMission) {
    refs.missionName.textContent = state.activeMission.name;
    refs.missionTimer.textContent = formatTimer(state.activeMission.remaining);
  } else {
    refs.missionName.textContent = "None";
    refs.missionTimer.textContent = "--";
  }
};

const updateUi = () => {
  refs.level.textContent = state.level;
  refs.ap.textContent = `${state.ap} / ${state.maxAp}`;
  refs.scrap.textContent = state.scrap;
  refs.water.textContent = state.water;
  refs.fuel.textContent = state.fuel;
  refs.tech.textContent = state.tech;
  refs.xp.textContent = `${state.xp} / ${state.level * 20}`;
  refs.rigProgress.textContent = `${state.rigProgress} / ${state.rigTarget}`;
  updateMorale();
  updateRigStatus();
  updateNextUnlock();
  updateTaskUi();
  updateMissionUi();
};

const gainResources = (rewards) => {
  Object.entries(rewards).forEach(([key, range]) => {
    const amount = randomBetween(range[0], range[1]);
    state[key] += amount;
  });
};

const maybeUnlockBlueprint = () => {
  if (!state.blueprintUnlocked && state.level >= 2 && !state.activeTask) {
    refs.taskButton.disabled = false;
  }
};

const handleScavenge = (zoneKey) => {
  const zone = zones[zoneKey];
  if (state.ap < zone.cost) {
    addLog("Not enough AP to scavenge. Wait for recovery.");
    return;
  }

  if (state.level < zone.unlockLevel) {
    addLog(`${zone.name} unlocks at level ${zone.unlockLevel}.`);
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

const startBlueprintTask = () => {
  if (state.blueprintUnlocked || state.activeTask) return;
  state.activeTask = {
    name: "Blueprint Research",
    remaining: 30,
  };
  addLog("Workshop queue started: Blueprint research.");
  updateUi();
};

const finishBlueprintTask = () => {
  state.blueprintUnlocked = true;
  state.activeTask = null;
  addLog("Blueprint research completed. The rig design is now available.");
  updateUi();
};

const startMission = (missionKey) => {
  if (state.activeMission || state.rigProgress < state.rigTarget) return;
  const mission = missions[missionKey];
  state.activeMission = {
    name: mission.name,
    remaining: mission.duration,
    rewards: mission.rewards,
  };
  addLog(`War rig deployed: ${mission.name}.`);
  updateUi();
};

const finishMission = () => {
  if (!state.activeMission) return;
  gainResources(state.activeMission.rewards);
  addLog(`War rig returned from ${state.activeMission.name} with salvage.`);
  state.activeMission = null;
  updateUi();
};

const tickTimers = () => {
  if (state.activeTask) {
    state.activeTask.remaining -= 1;
    if (state.activeTask.remaining <= 0) {
      finishBlueprintTask();
    }
  }

  if (state.activeMission) {
    state.activeMission.remaining -= 1;
    if (state.activeMission.remaining <= 0) {
      finishMission();
    }
  }

  updateTaskUi();
  updateMissionUi();
};

const regenAp = () => {
  state.ap = Math.min(state.maxAp, state.ap + 1);
  updateUi();
};

const bindEvents = () => {
  document.querySelectorAll("button[data-zone]").forEach((button) => {
    button.addEventListener("click", () => handleScavenge(button.dataset.zone));
  });
  document.querySelectorAll("button[data-mission]").forEach((button) => {
    button.addEventListener("click", () => startMission(button.dataset.mission));
  });
  refs.rigButton.addEventListener("click", handleRigContribution);
  refs.taskButton.addEventListener("click", startBlueprintTask);
};

bindEvents();
updateUi();
addLog("You arrive at the Rust Flats with a half-full canteen.");

setInterval(regenAp, 8000);
setInterval(tickTimers, 1000);
