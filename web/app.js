const state = {
  level: 1,
  xp: 0,
  ap: 10,
  maxAp: 10,
  scrap: 0,
  water: 0,
  fuel: 0,
  tech: 0,
  armor: 0,
  electronics: 0,
  medkits: 0,
  rigProgress: 0,
  rigTarget: 300,
  blueprintUnlocked: false,
  rigOperational: false,
  reputation: 0,
  injuries: 0,
  morale: 50,
  crew: 2,
  crewCap: 2,
  activeTask: null,
  activeMission: null,
  activeCraft: null,
  recruiting: null,
  rallyTask: null,
  outpostStage: 0,
  outpostTask: null,
  activeContract: null,
  contractCooldown: 0,
  perks: new Set(),
};

const zones = {
  rust: {
    name: "Rust Flats",
    cost: 2,
    rewards: { scrap: [4, 10], water: [1, 3], fuel: [0, 2] },
    xp: 6,
    rep: 1,
    unlockLevel: 1,
  },
  ash: {
    name: "Ash Dunes",
    cost: 3,
    rewards: { scrap: [8, 14], water: [2, 4], fuel: [1, 3], tech: [0, 1] },
    xp: 9,
    rep: 2,
    unlockLevel: 2,
  },
  glass: {
    name: "Glass Wastes",
    cost: 5,
    rewards: { scrap: [12, 22], water: [3, 6], fuel: [2, 4], tech: [1, 3] },
    xp: 14,
    rep: 4,
    unlockLevel: 4,
  },
  dead: {
    name: "Dead Grid",
    cost: 7,
    rewards: {
      scrap: [18, 30],
      water: [4, 8],
      fuel: [3, 6],
      tech: [2, 4],
      electronics: [0, 1],
    },
    xp: 22,
    rep: 6,
    unlockLevel: 6,
  },
};

const missions = {
  short: {
    name: "Short Run",
    duration: 90,
    rewards: { scrap: [12, 20], water: [4, 7], fuel: [1, 2] },
    fuelCost: 2,
    rep: 3,
    unlockRep: 0,
  },
  medium: {
    name: "Medium Run",
    duration: 180,
    rewards: { scrap: [20, 32], water: [6, 10], fuel: [2, 4], tech: [0, 1] },
    fuelCost: 4,
    rep: 6,
    unlockRep: 15,
  },
  long: {
    name: "Long Run",
    duration: 300,
    rewards: { scrap: [30, 46], water: [10, 14], fuel: [3, 6], tech: [1, 2] },
    fuelCost: 6,
    rep: 10,
    unlockRep: 35,
  },
  convoy: {
    name: "Convoy Escort",
    duration: 360,
    rewards: { scrap: [40, 60], water: [12, 18], fuel: [4, 8], tech: [2, 3] },
    fuelCost: 8,
    rep: 18,
    unlockRep: 60,
    requiresCrew: 3,
  },
};

const recipes = {
  armor: {
    name: "Armor Plates",
    duration: 45,
    costs: { scrap: 8 },
    output: { armor: 2 },
  },
  electronics: {
    name: "Electronics",
    duration: 60,
    costs: { tech: 2, scrap: 5 },
    output: { electronics: 1 },
  },
  drone: {
    name: "Scout Drone",
    duration: 120,
    costs: { electronics: 2, tech: 2, scrap: 10 },
    output: { rep: 5 },
  },
  medkit: {
    name: "Medkit",
    duration: 75,
    costs: { water: 4, tech: 1 },
    output: { medkits: 1 },
  },
};

const outpostStages = [
  {
    stage: 1,
    name: "Outpost Foundations",
    duration: 180,
    costs: { scrap: 60, water: 20, armor: 5 },
    bonus: "Unlocks passive scrap drip.",
  },
  {
    stage: 2,
    name: "Fuel Depot",
    duration: 300,
    costs: { scrap: 80, fuel: 20, armor: 10 },
    bonus: "Fuel regen +1 every 60s.",
  },
  {
    stage: 3,
    name: "Signal Tower",
    duration: 420,
    costs: { scrap: 120, electronics: 6, tech: 6 },
    bonus: "Unlocks rare contracts.",
  },
];

const contracts = [
  {
    name: "Water Relay Repair",
    duration: 120,
    rewards: { water: [8, 12], scrap: [10, 16] },
    rep: 6,
    unlockRep: 0,
  },
  {
    name: "Signal Recovery",
    duration: 180,
    rewards: { tech: [2, 4], scrap: [12, 18] },
    rep: 10,
    unlockRep: 20,
  },
  {
    name: "Fuel Depot Sweep",
    duration: 240,
    rewards: { fuel: [6, 10], scrap: [14, 22] },
    rep: 14,
    unlockRep: 45,
  },
];

const perks = [
  {
    id: "scavenger",
    name: "Scavenger Instincts",
    cost: 15,
    description: "+10% scavenge yield.",
  },
  {
    id: "quartermaster",
    name: "Quartermaster",
    cost: 25,
    description: "+25 storage capacity.",
  },
  {
    id: "veteran",
    name: "Veteran Crew",
    cost: 40,
    description: "+1 max AP.",
  },
  {
    id: "salvager",
    name: "Salvage Optics",
    cost: 55,
    description: "+10% mission yield.",
  },
];

const refs = {
  level: document.getElementById("level"),
  ap: document.getElementById("ap"),
  morale: document.getElementById("morale"),
  moraleDetail: document.getElementById("morale-detail"),
  rep: document.getElementById("rep"),
  injuries: document.getElementById("injuries"),
  scrap: document.getElementById("scrap"),
  water: document.getElementById("water"),
  fuel: document.getElementById("fuel"),
  tech: document.getElementById("tech"),
  armor: document.getElementById("armor"),
  electronics: document.getElementById("electronics"),
  medkits: document.getElementById("medkits"),
  storage: document.getElementById("storage"),
  xp: document.getElementById("xp"),
  nextUnlock: document.getElementById("next-unlock"),
  taskName: document.getElementById("task-name"),
  taskTimer: document.getElementById("task-timer"),
  taskButton: document.getElementById("start-task"),
  craftName: document.getElementById("craft-name"),
  craftTimer: document.getElementById("craft-timer"),
  blueprint: document.getElementById("blueprint"),
  rigProgress: document.getElementById("rig-progress"),
  rigStatus: document.getElementById("rig-status"),
  rigBenefit: document.getElementById("rig-benefit"),
  rigButton: document.getElementById("build-rig"),
  missionName: document.getElementById("mission-name"),
  missionTimer: document.getElementById("mission-timer"),
  crewSlots: document.getElementById("crew-slots"),
  recruitStatus: document.getElementById("recruit-status"),
  hireCrew: document.getElementById("hire-crew"),
  rallyStatus: document.getElementById("rally-status"),
  rallyTimer: document.getElementById("rally-timer"),
  startRally: document.getElementById("start-rally"),
  injuryStatus: document.getElementById("injury-status"),
  maxAp: document.getElementById("max-ap"),
  useMedkit: document.getElementById("use-medkit"),
  contractName: document.getElementById("contract-name"),
  contractTimer: document.getElementById("contract-timer"),
  takeContract: document.getElementById("take-contract"),
  outpostStage: document.getElementById("outpost-stage"),
  outpostStatus: document.getElementById("outpost-status"),
  outpostButton: document.getElementById("start-outpost"),
  perkList: document.getElementById("perk-list"),
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
  if (logEntries.length > 7) {
    logEntries.pop();
  }
  refs.log.innerHTML = logEntries
    .map((entry) => `<li><strong>${entry.time}</strong> — ${entry.message}</li>`)
    .join("");
};

const updateMorale = () => {
  const target =
    50 +
    state.reputation * 0.3 +
    state.crew * 3 -
    state.injuries * 10 -
    (state.maxAp - state.ap) * 3;
  state.morale = Math.max(0, Math.min(100, Math.round(target)));
  let label = "Stable";
  if (state.morale >= 75) label = "Inspired";
  if (state.morale <= 30) label = "Shaken";
  if (state.morale <= 15) label = "Broken";
  refs.morale.textContent = `${label} (${state.morale})`;
  refs.moraleDetail.textContent =
    state.morale >= 70
      ? "+5% scavenge yield"
      : state.morale <= 30
        ? "Higher injury risk"
        : "Baseline yields";
};

const updateRigStatus = () => {
  if (!state.blueprintUnlocked) {
    refs.blueprint.textContent = "Locked";
    refs.rigStatus.textContent = "Unavailable";
    refs.rigBenefit.textContent = "--";
    refs.rigButton.disabled = true;
  } else if (state.rigOperational) {
    refs.blueprint.textContent = "Secured";
    refs.rigStatus.textContent = "Operational";
    refs.rigBenefit.textContent = "Auto-scavenge + 10% mission yield";
    refs.rigButton.disabled = true;
  } else if (state.rigProgress >= state.rigTarget && state.activeTask) {
    refs.blueprint.textContent = "Secured";
    refs.rigStatus.textContent = "Assembling";
    refs.rigBenefit.textContent = "Assembly in progress";
    refs.rigButton.disabled = true;
  } else {
    refs.blueprint.textContent = "Secured";
    refs.rigStatus.textContent = "Building";
    refs.rigBenefit.textContent = "Unlock auto-scavenge";
    refs.rigButton.disabled = state.scrap < 15 || state.fuel < 2;
  }

  document.querySelectorAll("button[data-mission]").forEach((button) => {
    const mission = missions[button.dataset.mission];
    const lockedByRep = state.reputation < mission.unlockRep;
    const lockedByCrew = mission.requiresCrew && state.crew < mission.requiresCrew;
    button.disabled =
      !state.rigOperational ||
      state.activeMission !== null ||
      lockedByRep ||
      lockedByCrew;
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
    refs.taskButton.disabled =
      state.blueprintUnlocked ||
      state.level < 2 ||
      state.tech < 2 ||
      state.scrap < 10 ||
      state.water < 5;
  }
};

const updateCraftUi = () => {
  if (state.activeCraft) {
    refs.craftName.textContent = state.activeCraft.name;
    refs.craftTimer.textContent = formatTimer(state.activeCraft.remaining);
  } else {
    refs.craftName.textContent = "None";
    refs.craftTimer.textContent = "--";
  }
  document.querySelectorAll("button[data-recipe]").forEach((button) => {
    button.disabled = state.activeCraft !== null;
  });
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

const updateContractUi = () => {
  if (state.activeContract) {
    refs.contractName.textContent = state.activeContract.name;
    refs.contractTimer.textContent = formatTimer(state.activeContract.remaining);
    refs.takeContract.disabled = true;
  } else if (state.contractCooldown > 0) {
    refs.contractName.textContent = "Cooldown";
    refs.contractTimer.textContent = formatTimer(state.contractCooldown);
    refs.takeContract.disabled = true;
  } else {
    refs.contractName.textContent = "Available";
    refs.contractTimer.textContent = "--";
    refs.takeContract.disabled = false;
  }
};

const updateCrewUi = () => {
  refs.crewSlots.textContent = `${state.crew} / ${state.crewCap}`;
  if (state.recruiting) {
    refs.recruitStatus.textContent = "Recruiting";
    refs.hireCrew.disabled = true;
  } else {
    refs.recruitStatus.textContent = "Idle";
    refs.hireCrew.disabled = state.crew >= state.crewCap || state.water < 6;
  }
};

const updateRallyUi = () => {
  if (state.rallyTask) {
    refs.rallyStatus.textContent = "Rallying";
    refs.rallyTimer.textContent = formatTimer(state.rallyTask.remaining);
    refs.startRally.disabled = true;
  } else {
    refs.rallyStatus.textContent = "Idle";
    refs.rallyTimer.textContent = "--";
    refs.startRally.disabled = state.water < 4;
  }
};

const updateHealthUi = () => {
  refs.injuries.textContent = state.injuries;
  refs.injuryStatus.textContent = state.injuries;
  refs.maxAp.textContent = state.maxAp;
  refs.useMedkit.disabled = state.medkits < 1 || state.injuries < 1;
};

const updateOutpostUi = () => {
  refs.outpostStage.textContent = `${state.outpostStage} / 3`;
  if (!state.rigOperational) {
    refs.outpostStatus.textContent = "Unavailable";
    refs.outpostButton.disabled = true;
    return;
  }

  if (state.outpostTask) {
    refs.outpostStatus.textContent = `${state.outpostTask.name}`;
    refs.outpostButton.disabled = true;
    return;
  }

  if (state.outpostStage >= outpostStages.length) {
    refs.outpostStatus.textContent = "Completed";
    refs.outpostButton.disabled = true;
    return;
  }

  const stage = outpostStages[state.outpostStage];
  refs.outpostStatus.textContent = "Ready";
  refs.outpostButton.textContent = `Start ${stage.name} (${stage.duration}s, ${formatCost(stage.costs)})`;
  refs.outpostButton.disabled = !hasCosts(stage.costs);
};

const updatePerkUi = () => {
  refs.perkList.innerHTML = perks
    .map((perk) => {
      const owned = state.perks.has(perk.id);
      const disabled = owned || state.reputation < perk.cost;
      return `<button type="button" data-perk="${perk.id}" ${disabled ? "disabled" : ""}>
        ${owned ? "Unlocked" : `Unlock (${perk.cost} rep)`}: ${perk.name}
        <span class="hint">${perk.description}</span>
      </button>`;
    })
    .join("");
};

const updateUi = () => {
  refs.level.textContent = state.level;
  refs.ap.textContent = `${state.ap} / ${state.maxAp}`;
  refs.scrap.textContent = state.scrap;
  refs.water.textContent = state.water;
  refs.fuel.textContent = state.fuel;
  refs.tech.textContent = state.tech;
  refs.armor.textContent = state.armor;
  refs.electronics.textContent = state.electronics;
  refs.medkits.textContent = state.medkits;
  refs.xp.textContent = `${state.xp} / ${state.level * 20}`;
  refs.rigProgress.textContent = `${state.rigProgress} / ${state.rigTarget}`;
  refs.rep.textContent = state.reputation;
  refs.storage.textContent = `${getStorageUsed()} / ${getStorageCap()}`;
  updateMorale();
  updateRigStatus();
  updateNextUnlock();
  updateTaskUi();
  updateCraftUi();
  updateMissionUi();
  updateContractUi();
  updateCrewUi();
  updateRallyUi();
  updateHealthUi();
  updateOutpostUi();
  updatePerkUi();
};

const formatCost = (costs) =>
  Object.entries(costs)
    .map(([key, value]) => `${value} ${key}`)
    .join(" + ");

const hasCosts = (costs) =>
  Object.entries(costs).every(([key, value]) => state[key] >= value);

const spendCosts = (costs) => {
  Object.entries(costs).forEach(([key, value]) => {
    state[key] -= value;
  });
};

const getStorageCap = () => {
  const base = 120;
  const outpostBonus = state.outpostStage * 40;
  const perkBonus = state.perks.has("quartermaster") ? 25 : 0;
  return base + outpostBonus + perkBonus;
};

const getStorageUsed = () =>
  state.scrap +
  state.water +
  state.fuel +
  state.tech +
  state.armor +
  state.electronics +
  state.medkits;

const clampStorage = () => {
  const cap = getStorageCap();
  let overflow = getStorageUsed() - cap;
  if (overflow <= 0) return;
  const dumpOrder = ["scrap", "water", "fuel", "tech", "armor", "electronics", "medkits"];
  dumpOrder.forEach((key) => {
    if (overflow <= 0) return;
    const available = state[key];
    const removed = Math.min(available, overflow);
    state[key] -= removed;
    overflow -= removed;
  });
  addLog("Storage full. Excess supplies were left behind.");
};

const getScavengeMultiplier = () => {
  const perkBonus = state.perks.has("scavenger") ? 1.1 : 1;
  const moraleBonus = state.morale >= 70 ? 1.05 : state.morale <= 30 ? 0.9 : 1;
  return perkBonus * moraleBonus;
};
const getMissionMultiplier = () => (state.perks.has("salvager") ? 1.1 : 1);

const updateMaxAp = () => {
  const perkBonus = state.perks.has("veteran") ? 1 : 0;
  const injuryPenalty = Math.min(3, state.injuries);
  state.maxAp = Math.max(6, 10 + perkBonus - injuryPenalty);
  state.ap = Math.min(state.ap, state.maxAp);
};

const gainResources = (rewards, multiplier = 1) => {
  Object.entries(rewards).forEach(([key, range]) => {
    const amount = Math.round(randomBetween(range[0], range[1]) * multiplier);
    state[key] += amount;
  });
  clampStorage();
};

const maybeUnlockBlueprint = () => {
  if (!state.blueprintUnlocked && state.level >= 2 && !state.activeTask) {
    refs.taskButton.disabled = state.tech < 2 || state.scrap < 10 || state.water < 5;
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
  gainResources(zone.rewards, getScavengeMultiplier());
  state.xp += zone.xp;
  state.reputation += zone.rep;
  state.level = Math.min(15, Math.floor(state.xp / 20) + 1);
  maybeUnlockBlueprint();

  const injuryRoll = Math.random();
  const baseInjury =
    zoneKey === "dead" ? 0.2 : zoneKey === "glass" ? 0.12 : 0.05;
  const moralePenalty = state.morale <= 30 ? 0.05 : 0;
  const injuryChance = baseInjury + moralePenalty;
  if (injuryRoll < injuryChance) {
    state.injuries += 1;
    updateMaxAp();
    addLog("You suffered a minor injury during the run.");
  }

  addLog(`You scouted ${zone.name} and brought back salvage.`);
  updateUi();
};

const handleRigContribution = () => {
  if (!state.blueprintUnlocked || state.scrap < 15 || state.fuel < 2) {
    return;
  }
  state.scrap -= 15;
  state.fuel -= 2;
  state.rigProgress = Math.min(state.rigTarget, state.rigProgress + 10);
  if (state.rigProgress >= state.rigTarget && !state.rigOperational) {
    state.activeTask = {
      name: "Rig Assembly",
      remaining: 90,
    };
    addLog("Rig chassis complete. Assembly begins (90s).");
  } else {
    addLog("You reinforced the war rig frame with salvaged scrap.");
  }
  updateUi();
};

const startBlueprintTask = () => {
  if (state.blueprintUnlocked || state.activeTask) return;
  if (state.tech < 2 || state.scrap < 10 || state.water < 5) {
    addLog("Not enough resources to start blueprint research.");
    return;
  }
  state.tech -= 2;
  state.scrap -= 10;
  state.water -= 5;
  state.activeTask = {
    name: "Blueprint Research",
    remaining: 60,
  };
  addLog("Workshop queue started: Blueprint research.");
  updateUi();
};

const finishBlueprintTask = () => {
  if (state.activeTask?.name === "Rig Assembly") {
    state.activeTask = null;
    state.rigOperational = true;
    addLog("War rig assembly complete. Auto-scavenge unlocked.");
    updateUi();
    return;
  }

  state.blueprintUnlocked = true;
  state.activeTask = null;
  addLog("Blueprint research completed. The rig design is now available.");
  updateUi();
};

const startMission = (missionKey) => {
  if (state.activeMission || !state.rigOperational) return;
  const mission = missions[missionKey];
  if (state.reputation < mission.unlockRep) {
    addLog("Reputation too low for that mission.");
    return;
  }
  if (mission.requiresCrew && state.crew < mission.requiresCrew) {
    addLog("Not enough crew for that convoy.");
    return;
  }
  if (state.fuel < mission.fuelCost) {
    addLog("Not enough fuel to launch the war rig.");
    return;
  }
  state.fuel -= mission.fuelCost;
  state.activeMission = {
    name: mission.name,
    remaining: mission.duration,
    rewards: mission.rewards,
    rep: mission.rep,
  };
  addLog(`War rig deployed: ${mission.name} (fuel -${mission.fuelCost}).`);
  updateUi();
};

const finishMission = () => {
  if (!state.activeMission) return;
  gainResources(
    state.activeMission.rewards,
    state.rigOperational ? 1.1 * getMissionMultiplier() : 1,
  );
  state.reputation += state.activeMission.rep;
  addLog(`War rig returned from ${state.activeMission.name} with salvage.`);
  state.activeMission = null;
  updateUi();
};

const startCrafting = (recipeKey) => {
  if (state.activeCraft) return;
  const recipe = recipes[recipeKey];
  if (!hasCosts(recipe.costs)) {
    addLog("Not enough resources to craft that item.");
    return;
  }
  spendCosts(recipe.costs);
  state.activeCraft = {
    name: recipe.name,
    remaining: recipe.duration,
    output: recipe.output,
  };
  addLog(`Crafting started: ${recipe.name}.`);
  updateUi();
};

const finishCrafting = () => {
  if (!state.activeCraft) return;
  const output = state.activeCraft.output;
  Object.entries(output).forEach(([key, value]) => {
    if (key === "rep") {
      state.reputation += value;
      return;
    }
    state[key] = (state[key] || 0) + value;
  });
  addLog(`Crafting complete: ${state.activeCraft.name}.`);
  state.activeCraft = null;
  updateUi();
};

const startRally = () => {
  if (state.rallyTask || state.water < 4) {
    if (state.water < 4) {
      addLog("Not enough water to hold a rally.");
    }
    return;
  }
  state.water -= 4;
  state.rallyTask = {
    remaining: 90,
  };
  addLog("Camp rally underway. Spirits are rising.");
  updateUi();
};

const finishRally = () => {
  if (!state.rallyTask) return;
  state.rallyTask = null;
  state.morale = Math.min(100, state.morale + 10);
  addLog("Rally complete. Morale improved.");
  updateUi();
};

const useMedkit = () => {
  if (state.medkits < 1 || state.injuries < 1) return;
  state.medkits -= 1;
  state.injuries -= 1;
  updateMaxAp();
  addLog("Medkit used. Injuries stabilized.");
  updateUi();
};

const startRecruiting = () => {
  if (state.recruiting || state.crew >= state.crewCap) return;
  if (state.water < 6) {
    addLog("Not enough water to recruit a scavenger.");
    return;
  }
  state.water -= 6;
  state.recruiting = {
    remaining: 90,
  };
  addLog("Recruitment started: scavenger candidate.");
  updateUi();
};

const finishRecruiting = () => {
  state.crew += 1;
  if (state.crew > state.crewCap) {
    state.crewCap += 1;
  }
  state.recruiting = null;
  addLog("New scavenger joined the crew.");
  updateUi();
};

const startOutpostStage = () => {
  if (!state.rigOperational || state.outpostTask) return;
  if (state.outpostStage >= outpostStages.length) return;
  const stage = outpostStages[state.outpostStage];
  if (!hasCosts(stage.costs)) {
    addLog("Not enough resources to start the outpost stage.");
    return;
  }
  spendCosts(stage.costs);
  state.outpostTask = {
    name: stage.name,
    remaining: stage.duration,
    bonus: stage.bonus,
  };
  addLog(`Outpost project started: ${stage.name}.`);
  updateUi();
};

const finishOutpostStage = () => {
  if (!state.outpostTask) return;
  addLog(`Outpost milestone complete: ${state.outpostTask.name}. ${state.outpostTask.bonus}`);
  state.outpostStage += 1;
  state.outpostTask = null;
  updateUi();
};

const startContract = () => {
  if (state.activeContract || state.contractCooldown > 0) return;
  const available = contracts.filter((contract) => state.reputation >= contract.unlockRep);
  if (available.length === 0) {
    addLog("No contracts available for your reputation tier.");
    return;
  }
  const contract = available[Math.floor(Math.random() * available.length)];
  state.activeContract = {
    name: contract.name,
    remaining: contract.duration,
    rewards: contract.rewards,
    rep: contract.rep,
  };
  addLog(`Contract accepted: ${contract.name}.`);
  updateUi();
};

const finishContract = () => {
  if (!state.activeContract) return;
  gainResources(state.activeContract.rewards, 1);
  state.reputation += state.activeContract.rep;
  addLog(`Contract complete: ${state.activeContract.name}.`);
  state.activeContract = null;
  state.contractCooldown = 120;
  updateUi();
};

const unlockPerk = (perkId) => {
  const perk = perks.find((item) => item.id === perkId);
  if (!perk || state.perks.has(perk.id)) return;
  if (state.reputation < perk.cost) {
    addLog("Not enough reputation to unlock that perk.");
    return;
  }
  state.reputation -= perk.cost;
  state.perks.add(perk.id);
  updateMaxAp();
  addLog(`Perk unlocked: ${perk.name}.`);
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

  if (state.activeCraft) {
    state.activeCraft.remaining -= 1;
    if (state.activeCraft.remaining <= 0) {
      finishCrafting();
    }
  }

  if (state.recruiting) {
    state.recruiting.remaining -= 1;
    if (state.recruiting.remaining <= 0) {
      finishRecruiting();
    }
  }

  if (state.outpostTask) {
    state.outpostTask.remaining -= 1;
    if (state.outpostTask.remaining <= 0) {
      finishOutpostStage();
    }
  }

  if (state.activeContract) {
    state.activeContract.remaining -= 1;
    if (state.activeContract.remaining <= 0) {
      finishContract();
    }
  }

  if (state.contractCooldown > 0) {
    state.contractCooldown -= 1;
  }

  if (state.rallyTask) {
    state.rallyTask.remaining -= 1;
    if (state.rallyTask.remaining <= 0) {
      finishRally();
    }
  }

  updateTaskUi();
  updateCraftUi();
  updateMissionUi();
  updateContractUi();
  updateCrewUi();
  updateRallyUi();
  updateHealthUi();
  updateOutpostUi();
};

const regenAp = () => {
  state.ap = Math.min(state.maxAp, state.ap + 1);
  updateUi();
};

const passiveOutpostTick = () => {
  if (state.outpostStage >= 1) {
    state.scrap += 1;
  }
  if (state.outpostStage >= 2) {
    state.fuel += 1;
  }
  updateUi();
};

const bindEvents = () => {
  document.querySelectorAll("button[data-zone]").forEach((button) => {
    button.addEventListener("click", () => handleScavenge(button.dataset.zone));
  });
  document.querySelectorAll("button[data-mission]").forEach((button) => {
    button.addEventListener("click", () => startMission(button.dataset.mission));
  });
  document.querySelectorAll("button[data-recipe]").forEach((button) => {
    button.addEventListener("click", () => startCrafting(button.dataset.recipe));
  });
  refs.rigButton.addEventListener("click", handleRigContribution);
  refs.taskButton.addEventListener("click", startBlueprintTask);
  refs.hireCrew.addEventListener("click", startRecruiting);
  refs.startRally.addEventListener("click", startRally);
  refs.outpostButton.addEventListener("click", startOutpostStage);
  refs.useMedkit.addEventListener("click", useMedkit);
  refs.takeContract.addEventListener("click", startContract);
  refs.perkList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-perk]");
    if (!button) return;
    unlockPerk(button.dataset.perk);
  });
};

bindEvents();
updateMaxAp();
updateUi();
addLog("You arrive at the Rust Flats with a half-full canteen.");

setInterval(regenAp, 8000);
setInterval(tickTimers, 1000);
setInterval(passiveOutpostTick, 60000);
