const STORAGE_KEY = "wasteland-reclaimer-save";

const state = {
  day: 1,
  energy: 80,
  maxEnergy: 100,
  health: 85,
  maxHealth: 100,
  xp: 0,
  level: 1,
  xpToNext: 100,
  reputation: 0,
  crew: 1,
  threat: 2,
  resources: {
    scrap: 40,
    rations: 20,
    water: 15,
    credits: 10,
  },
  stats: {
    strength: 1,
    awareness: 1,
    resilience: 1,
    defense: 1,
    tech: 0,
  },
  facilities: {
    camp: { level: 1, label: "Camp" },
    waterStill: { level: 0, label: "Water Still" },
    workshop: { level: 0, label: "Workshop" },
    outpost: { level: 0, label: "Outpost" },
    tradingPost: { level: 0, label: "Trading Post" },
    warRig: { level: 0, label: "War Rig Garage" },
  },
  exploration: {
    inProgress: false,
    endsAt: 0,
    key: null,
    duration: 0,
  },
  work: {
    inProgress: false,
    endsAt: 0,
    key: null,
    duration: 0,
  },
  scavenging: {
    inProgress: false,
    endsAt: 0,
    key: null,
    duration: 0,
  },
  training: {
    inProgress: false,
    endsAt: 0,
    statKey: null,
  },
  achievements: {
    firstRun: false,
    buildWaterStill: false,
    trainOnce: false,
    firstExploration: false,
    reachRep10: false,
  },
  activityLog: [],
};

const baseCosts = {
  waterStill: { scrap: 60, credits: 20 },
  workshop: { scrap: 120, rations: 40, credits: 60 },
  outpost: { scrap: 180, water: 60, credits: 100 },
  tradingPost: { scrap: 220, rations: 80, credits: 140 },
  warRig: { scrap: 320, rations: 120, water: 120, credits: 240 },
};

const scavengingLoot = (multiplier = 1) => {
  const strengthBonus = state.stats.strength * 0.12;
  const awarenessBonus = state.stats.awareness * 0.1;
  return {
    scrap: Math.round((12 + Math.random() * (10 + strengthBonus * 10)) * multiplier),
    rations: Math.round((5 + Math.random() * (4 + awarenessBonus * 5)) * multiplier),
    water: Math.round((3 + Math.random() * (4 + awarenessBonus * 4)) * multiplier),
    credits: Math.random() < 0.35 ? Math.round((2 + Math.floor(Math.random() * 4)) * multiplier) : 0,
  };
};

const trainingData = [
  {
    key: "strength",
    label: "Strength",
    description: "Carry more scrap and hit harder on future expeditions.",
  },
  {
    key: "awareness",
    label: "Awareness",
    description: "Spot safer paths and better supplies.",
  },
  {
    key: "resilience",
    label: "Resilience",
    description: "Recover health faster and survive longer runs.",
  },
  {
    key: "defense",
    label: "Defense",
    description: "Reduce damage from hazards and keep health stable.",
  },
];

const facilities = [
  {
    key: "waterStill",
    label: "Water Still",
    description: "Produces clean water daily and unlocks health recovery.",
    unlocks: "Unlocks passive water generation.",
  },
  {
    key: "workshop",
    label: "Workshop",
    description: "Opens crafting and equipment upgrades.",
    unlocks: "Unlocks crafting and equipment slots.",
  },
  {
    key: "outpost",
    label: "Outpost",
    description: "Launch expeditions to distant ruins.",
    unlocks: "Unlocks timed expeditions.",
  },
  {
    key: "tradingPost",
    label: "Trading Post",
    description: "Trade with caravans for hard-to-find materials.",
    unlocks: "Unlocks trading and market events.",
  },
  {
    key: "warRig",
    label: "War Rig Garage",
    description: "Massive project that unlocks long-range exploration.",
    unlocks: "Unlocks advanced timed explorations.",
  },
];

const achievements = [
  {
    key: "firstRun",
    label: "First Run",
    description: "Complete your first scavenging run.",
  },
  {
    key: "buildWaterStill",
    label: "Clean Water",
    description: "Build your first Water Still.",
  },
  {
    key: "trainOnce",
    label: "Getting Stronger",
    description: "Complete a training session.",
  },
  {
    key: "firstExploration",
    label: "Into the Dust",
    description: "Complete a timed exploration.",
  },
  {
    key: "reachRep10",
    label: "Known in the Dust",
    description: "Reach 10 reputation.",
  },
];

const manualScavengeAreas = [
  {
    key: "scrap-alley",
    label: "Scrap Alley",
    cost: 5,
    multiplier: 1,
    duration: 40,
    requirement: "Always available.",
  },
  {
    key: "sunken-rail",
    label: "Sunken Rail Yard",
    cost: 18,
    multiplier: 1.4,
    duration: 70,
    requirement: "Unlocks at Strength 3.",
    unlock: () => state.stats.strength >= 3,
  },
  {
    key: "market-bonefields",
    label: "Market Bonefields",
    cost: 22,
    multiplier: 1.7,
    duration: 90,
    requirement: "Unlocks at Awareness 3.",
    unlock: () => state.stats.awareness >= 3,
  },
  {
    key: "overpass-gutters",
    label: "Overpass Gutters",
    cost: 26,
    multiplier: 2.1,
    duration: 120,
    requirement: "Unlocks at Defense 4.",
    unlock: () => state.stats.defense >= 4,
  },
];

const expeditionList = [
  {
    key: "service-tunnel",
    label: "Service Tunnel Sweep",
    duration: 90,
    reward: "Steady scrap and rations.",
    requirement: "Basic exploration available.",
    unlock: () => true,
  },
  {
    key: "stormfront-pass",
    label: "Stormfront Pass",
    duration: 240,
    reward: "Higher credits and salvage.",
    requirement: "Requires War Rig Garage.",
    unlock: () => state.facilities.warRig.level > 0,
  },
  {
    key: "dust-sea",
    label: "Dust Sea Relay",
    duration: 420,
    reward: "Chance at rare components.",
    requirement: "Requires War Rig Garage + Defense 5.",
    unlock: () => state.facilities.warRig.level > 0 && state.stats.defense >= 5,
  },
];

const workContracts = [
  {
    key: "courier",
    label: "Courier Route",
    duration: 120,
    reward: { credits: 12, reputation: 1, xp: 15 },
  },
  {
    key: "salvage-guard",
    label: "Salvage Guard",
    duration: 180,
    reward: { credits: 18, reputation: 2, xp: 20 },
  },
];

const craftingList = [
  {
    label: "Reinforced Backpack",
    recipe: "60 scrap, 20 rations",
  },
  {
    label: "Improvised Sidearm",
    recipe: "90 scrap, 30 credits",
  },
];

const tradingList = [
  {
    label: "Sell surplus scrap",
    offer: "Trade 30 scrap for 10 credits",
  },
  {
    label: "Buy water drums",
    offer: "Trade 15 credits for 20 water",
  },
];

const navButtons = document.querySelectorAll(".nav__item");
const panels = document.querySelectorAll(".panel");

const energyFill = document.getElementById("energyFill");
const healthFill = document.getElementById("healthFill");
const xpFill = document.getElementById("xpFill");
const energyValue = document.getElementById("energyValue");
const healthValue = document.getElementById("healthValue");
const xpValue = document.getElementById("xpValue");
const repValue = document.getElementById("repValue");
const dayValue = document.getElementById("dayValue");
const crewValue = document.getElementById("crewValue");
const threatValue = document.getElementById("threatValue");

const resourceList = document.getElementById("resourceList");
const milestoneList = document.getElementById("milestoneList");
const manualScavengeList = document.getElementById("manualScavengeList");
const workList = document.getElementById("workList");
const workStatus = document.getElementById("workStatus");
const workButton = document.getElementById("workButton");
const scavengeProgressFill = document.getElementById("scavengeProgressFill");
const scavengeProgressValue = document.getElementById("scavengeProgressValue");
const workProgressFill = document.getElementById("workProgressFill");
const workProgressValue = document.getElementById("workProgressValue");

const rationValue = document.getElementById("rationValue");
const waterValue = document.getElementById("waterValue");
const scrapValue = document.getElementById("scrapValue");
const creditValue = document.getElementById("creditValue");

const facilityList = document.getElementById("facilityList");
const trainingList = document.getElementById("trainingList");
const statList = document.getElementById("statList");

const expeditionLock = document.getElementById("expeditionLock");
const expeditionContainer = document.getElementById("expeditionList");
const craftingLock = document.getElementById("craftingLock");
const craftingContainer = document.getElementById("craftingList");
const tradingLock = document.getElementById("tradingLock");
const tradingContainer = document.getElementById("tradingList");
const achievementList = document.getElementById("achievementList");
const activityLog = document.getElementById("activityLog");

const saveButton = document.getElementById("saveGame");
const resetButton = document.getElementById("resetGame");

const formatNumber = (value) => Math.max(0, Math.floor(value));

const updateStatus = () => {
  energyValue.textContent = `${formatNumber(state.energy)}/${state.maxEnergy}`;
  healthValue.textContent = `${formatNumber(state.health)}/${state.maxHealth}`;
  xpValue.textContent = `${formatNumber(state.xp)}/${state.xpToNext} (Lv. ${state.level})`;
  repValue.textContent = formatNumber(state.reputation);
  dayValue.textContent = state.day;
  crewValue.textContent = state.crew;
  threatValue.textContent = state.threat;

  energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
  healthFill.style.width = `${(state.health / state.maxHealth) * 100}%`;
  xpFill.style.width = `${(state.xp / state.xpToNext) * 100}%`;
};

const updateResources = () => {
  const items = [
    { label: "Scrap", value: state.resources.scrap },
    { label: "Rations", value: state.resources.rations },
    { label: "Water", value: state.resources.water },
    { label: "Credits", value: state.resources.credits },
  ];
  resourceList.innerHTML = items
    .map(
      (item) => `<li><span>${item.label}</span><strong>${formatNumber(item.value)}</strong></li>`
    )
    .join("");

  rationValue.textContent = formatNumber(state.resources.rations);
  waterValue.textContent = formatNumber(state.resources.water);
  scrapValue.textContent = formatNumber(state.resources.scrap);
  creditValue.textContent = formatNumber(state.resources.credits);
};

const addLogEntry = (message) => {
  state.activityLog = state.activityLog || [];
  state.activityLog.unshift({ message, timestamp: Date.now() });
  state.activityLog = state.activityLog.slice(0, 6);
  updateActivityLog();
};

const updateActivityLog = () => {
  if (!activityLog) {
    return;
  }
  if (!state.activityLog || state.activityLog.length === 0) {
    activityLog.innerHTML = `<div class="activity-log__entry">No activity yet.</div>`;
    return;
  }
  activityLog.innerHTML = state.activityLog
    .map((entry) => {
      const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `<div class="activity-log__entry">${time} · ${entry.message}</div>`;
    })
    .join("");
};

const updateMilestones = () => {
  const milestones = [
    {
      label: "Build a Water Still to secure hydration.",
      done: state.facilities.waterStill.level > 0,
    },
    {
      label: "Train once to unlock deeper scavenging bonuses.",
      done: state.achievements.trainOnce,
    },
    {
      label: "Save enough scrap to build the Workshop.",
      done: state.facilities.workshop.level > 0,
    },
    {
      label: "Establish the Outpost for explorations.",
      done: state.facilities.outpost.level > 0,
    },
    {
      label: "Start the War Rig Garage for long-range expeditions.",
      done: state.facilities.warRig.level > 0,
    },
  ];

  milestoneList.innerHTML = milestones
    .map(
      (item) => `<li><span>${item.label}</span><strong>${item.done ? "Done" : "Pending"}</strong></li>`
    )
    .join("");
};

const canAfford = (cost) =>
  Object.entries(cost).every(([key, value]) => state.resources[key] >= value);

const spendResources = (cost) => {
  Object.entries(cost).forEach(([key, value]) => {
    state.resources[key] -= value;
  });
};

const addXp = (amount) => {
  state.xp += amount;
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = Math.round(state.xpToNext * 1.2);
    state.maxEnergy += 5;
    state.maxHealth += 3;
    state.energy = Math.min(state.energy + 10, state.maxEnergy);
    state.health = Math.min(state.health + 5, state.maxHealth);
  }
};

const updateFacilities = () => {
  facilityList.innerHTML = "";
  facilities.forEach((facility) => {
    const current = state.facilities[facility.key];
    const cost = baseCosts[facility.key];
    const affordable = canAfford(cost);
    const isBuilt = current.level > 0;

    const item = document.createElement("div");
    item.className = "facility-item";

    item.innerHTML = `
      <div>
        <strong>${facility.label}</strong>
        <div class="muted">${facility.description}</div>
        <div class="muted">${facility.unlocks}</div>
        <div class="muted">Status: ${isBuilt ? "Operational" : "Unbuilt"}</div>
      </div>
      <button class="primary" ${isBuilt ? "disabled" : ""}>
        ${isBuilt ? "Built" : `Build (${formatCost(cost)})`}
      </button>
    `;

    const button = item.querySelector("button");
    button.disabled = isBuilt || !affordable;
    button.addEventListener("click", () => buildFacility(facility.key));

    facilityList.appendChild(item);
  });
};

const formatCost = (cost) =>
  Object.entries(cost)
    .map(([key, value]) => `${value} ${key}`)
    .join(", ");

const buildFacility = (key) => {
  const cost = baseCosts[key];
  if (!canAfford(cost)) {
    return;
  }
  spendResources(cost);
  state.facilities[key].level = 1;
  if (key === "waterStill") {
    state.achievements.buildWaterStill = true;
    state.reputation += 1;
  }
  updateUI();
};

const updateTraining = () => {
  trainingList.innerHTML = "";
  trainingData.forEach((training) => {
    const item = document.createElement("div");
    item.className = "training-item";
    const level = state.stats[training.key];
    const cost = 12 + level * 4;
    const duration = 45 + level * 15;
    const disabled = state.training.inProgress || state.energy < cost;

    item.innerHTML = `
      <div>
        <strong>${training.label} (Lv. ${level})</strong>
        <div class="muted">${training.description}</div>
        <div class="muted">Cost: ${cost} energy · Time: ${duration}s</div>
      </div>
      <button class="primary" ${disabled ? "disabled" : ""}>Train</button>
    `;

    const button = item.querySelector("button");
    button.addEventListener("click", () => startTraining(training.key, cost, duration));
    trainingList.appendChild(item);
  });

  statList.innerHTML = Object.entries(state.stats)
    .map(
      ([key, value]) => `<li><span>${key}</span><strong>${value}</strong></li>`
    )
    .join("");
};

const updateLockedSections = () => {
  expeditionLock.textContent =
    state.facilities.outpost.level > 0
      ? ""
      : "Build the Outpost to unlock timed explorations.";
  expeditionContainer.innerHTML = state.facilities.outpost.level
    ? expeditionList
        .map((expedition) => {
          const unlocked = expedition.unlock();
          const isActive = state.exploration.inProgress && state.exploration.key === expedition.key;
          const remaining = isActive
            ? Math.max(0, Math.ceil((state.exploration.endsAt - Date.now()) / 1000))
            : null;
          return `
      <div class="expedition-item">
        <div>
          <strong>${expedition.label}</strong>
          <div class="muted">Duration: ${expedition.duration}s</div>
          <div class="muted">Reward: ${expedition.reward}</div>
          <div class="muted">${expedition.requirement}</div>
        </div>
        <button class="primary" ${unlocked && !state.exploration.inProgress ? "" : "disabled"}>
          ${isActive ? `${remaining}s` : unlocked ? "Start" : "Locked"}
        </button>
      </div>
    `;
        })
        .join("")
    : "";

  craftingLock.textContent =
    state.facilities.workshop.level > 0
      ? ""
      : "Build the Workshop to unlock crafting.";
  craftingContainer.innerHTML = state.facilities.workshop.level
    ? craftingList
        .map(
          (item) => `
      <div class="crafting-item">
        <div>
          <strong>${item.label}</strong>
          <div class="muted">Recipe: ${item.recipe}</div>
        </div>
        <button class="primary" disabled>Locked</button>
      </div>
    `
        )
        .join("")
    : "";

  tradingLock.textContent =
    state.facilities.tradingPost.level > 0
      ? ""
      : "Build the Trading Post to unlock trading.";
  tradingContainer.innerHTML = state.facilities.tradingPost.level
    ? tradingList
        .map(
          (item) => `
      <div class="trading-item">
        <div>
          <strong>${item.label}</strong>
          <div class="muted">${item.offer}</div>
        </div>
        <button class="primary" disabled>Locked</button>
      </div>
    `
        )
        .join("")
    : "";
};

const updateManualScavenge = () => {
  manualScavengeList.innerHTML = manualScavengeAreas
    .map((area) => {
      const unlocked = area.unlock ? area.unlock() : true;
      const canAffordEnergy = state.energy >= area.cost;
      const isActive = state.scavenging.inProgress && state.scavenging.key === area.key;
      return `
      <div class="manual-scavenge__item">
        <div>
          <strong>${area.label}</strong>
          <div class="muted">Cost: ${area.cost} energy · Duration: ${area.duration}s</div>
          <div class="muted">${area.requirement}</div>
        </div>
        <button class="primary" ${unlocked && canAffordEnergy && !state.scavenging.inProgress ? "" : "disabled"}>
          ${isActive ? "Scavenging..." : unlocked ? "Start" : "Locked"}
        </button>
      </div>
    `;
    })
    .join("");

  manualScavengeList.querySelectorAll(".manual-scavenge__item").forEach((item, index) => {
    const button = item.querySelector("button");
    button.addEventListener("click", () => startScavenge(manualScavengeAreas[index]));
  });
};

const updateWork = () => {
  workList.innerHTML = workContracts
    .map((contract) => {
      const isSelected = state.work.key === contract.key;
      return `
      <div class="work-item">
        <div>
          <strong>${contract.label}</strong>
          <div class="muted">Duration: ${contract.duration}s</div>
          <div class="muted">Reward: ${contract.reward.credits} credits, ${contract.reward.xp} xp</div>
        </div>
        <button class="primary">${isSelected ? "Selected" : "Select"}</button>
      </div>
    `;
    })
    .join("");

  workList.querySelectorAll(".work-item").forEach((item, index) => {
    const button = item.querySelector("button");
    button.addEventListener("click", () => selectWorkContract(workContracts[index].key));
  });

  if (state.work.inProgress) {
    const remaining = Math.max(0, Math.ceil((state.work.endsAt - Date.now()) / 1000));
    workStatus.textContent = `Working: ${remaining}s remaining.`;
    workButton.disabled = true;
    workButton.textContent = "Contract Active";
    const progress = 1 - remaining / state.work.duration;
    workProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    workProgressValue.textContent = `${remaining}s remaining`;
  } else {
    workStatus.textContent = state.work.key
      ? `Ready to start: ${workContracts.find((c) => c.key === state.work.key).label}.`
      : "Select a contract to begin.";
    workButton.disabled = !state.work.key;
    workButton.textContent = "Start Contract";
    workProgressFill.style.width = "0%";
    workProgressValue.textContent = "Idle";
  }
};

const updateExplorationButtons = () => {
  expeditionContainer.querySelectorAll(".expedition-item").forEach((item, index) => {
    const button = item.querySelector("button");
    const expedition = expeditionList[index];
    button.addEventListener("click", () => startExploration(expedition));
  });
};

const updateAchievements = () => {
  achievementList.innerHTML = achievements
    .map((achievement) => {
      const completed = state.achievements[achievement.key];
      return `
      <div class="achievement-item ${completed ? "completed" : ""}">
        <div>
          <strong>${achievement.label}</strong>
          <div class="muted">${achievement.description}</div>
        </div>
        <strong>${completed ? "Complete" : "Pending"}</strong>
      </div>
    `;
    })
    .join("");
};

const startScavenge = (area) => {
  const unlocked = area.unlock ? area.unlock() : true;
  if (!unlocked || state.energy < area.cost || state.scavenging.inProgress) {
    return;
  }
  state.energy -= area.cost;
  state.scavenging.inProgress = true;
  state.scavenging.key = area.key;
  state.scavenging.duration = area.duration;
  state.scavenging.endsAt = Date.now() + area.duration * 1000;
  addLogEntry(`Started scavenging ${area.label}.`);
  updateUI();
};

const finishScavenge = () => {
  const area = manualScavengeAreas.find((item) => item.key === state.scavenging.key);
  if (!area) {
    state.scavenging.inProgress = false;
    return;
  }
  const loot = scavengingLoot(area.multiplier);
  Object.keys(loot).forEach((key) => {
    state.resources[key] += loot[key];
  });
  state.reputation += 1;
  addXp(8);
  state.achievements.firstRun = true;
  if (state.reputation >= 10) {
    state.achievements.reachRep10 = true;
  }
  addLogEntry(`Scavenge complete: +${loot.scrap} scrap.`);
  state.scavenging.inProgress = false;
  state.scavenging.key = null;
  state.scavenging.duration = 0;
  updateUI();
};

const selectWorkContract = (key) => {
  if (state.work.inProgress) {
    return;
  }
  state.work.key = key;
  updateUI();
};

const startWorkContract = () => {
  if (state.work.inProgress || !state.work.key) {
    return;
  }
  const contract = workContracts.find((item) => item.key === state.work.key);
  if (!contract) {
    return;
  }
  state.work.inProgress = true;
  state.work.endsAt = Date.now() + contract.duration * 1000;
  state.work.duration = contract.duration;
  addLogEntry(`Started work: ${contract.label}.`);
  updateUI();
};

const finishWorkContract = () => {
  const contract = workContracts.find((item) => item.key === state.work.key);
  if (!contract) {
    state.work.inProgress = false;
    return;
  }
  state.resources.credits += contract.reward.credits;
  state.reputation += contract.reward.reputation;
  addXp(contract.reward.xp);
  addLogEntry(`Work complete: +${contract.reward.credits} credits.`);
  state.work.inProgress = false;
  state.work.duration = 0;
  updateUI();
};

const startExploration = (expedition) => {
  if (state.exploration.inProgress || !expedition.unlock()) {
    return;
  }
  state.exploration.inProgress = true;
  state.exploration.key = expedition.key;
  state.exploration.endsAt = Date.now() + expedition.duration * 1000;
  state.exploration.duration = expedition.duration;
  addLogEntry(`Exploration started: ${expedition.label}.`);
  updateUI();
};

const finishExploration = () => {
  const expedition = expeditionList.find((item) => item.key === state.exploration.key);
  if (!expedition) {
    state.exploration.inProgress = false;
    return;
  }
  const loot = scavengingLoot(2.2);
  Object.keys(loot).forEach((key) => {
    state.resources[key] += loot[key];
  });
  state.reputation += 2;
  addXp(20);
  state.achievements.firstExploration = true;
  addLogEntry(`Exploration complete: +${loot.scrap} scrap.`);
  state.exploration.inProgress = false;
  state.exploration.duration = 0;
  updateUI();
};

const startTraining = (key, cost, duration) => {
  if (state.training.inProgress || state.energy < cost) {
    return;
  }
  state.energy -= cost;
  state.training.inProgress = true;
  state.training.statKey = key;
  state.training.endsAt = Date.now() + duration * 1000;
  addLogEntry(`Training started: ${key}.`);
  updateUI();
};

const finishTraining = () => {
  const key = state.training.statKey;
  if (key) {
    state.stats[key] += 1;
  }
  state.training.inProgress = false;
  state.training.statKey = null;
  state.achievements.trainOnce = true;
  addLogEntry(`Training complete: ${key} +1.`);
  updateUI();
};

const updateTimers = () => {
  if (state.scavenging.inProgress && Date.now() >= state.scavenging.endsAt) {
    finishScavenge();
  }
  if (state.exploration.inProgress && Date.now() >= state.exploration.endsAt) {
    finishExploration();
  }
  if (state.work.inProgress && Date.now() >= state.work.endsAt) {
    finishWorkContract();
  }
  if (state.training.inProgress && Date.now() >= state.training.endsAt) {
    finishTraining();
  }
};

const passiveTick = () => {
  state.energy = Math.min(state.maxEnergy, state.energy + 1);
  if (state.facilities.waterStill.level > 0) {
    state.resources.water += 1;
  }
  if (state.resources.rations > 0 && state.resources.water > 0) {
    state.health = Math.min(state.maxHealth, state.health + 0.25);
    state.resources.rations -= 0.15;
    state.resources.water -= 0.15;
  }
  if (state.health < 30) {
    state.reputation = Math.max(0, state.reputation - 0.2);
  }
  updateUI();
};

const updateUI = () => {
  updateStatus();
  updateResources();
  updateMilestones();
  updateFacilities();
  updateTraining();
  updateLockedSections();
  updateManualScavenge();
  updateWork();
  updateExplorationButtons();
  updateActivityLog();
  updateAchievements();
  if (state.reputation >= 10) {
    state.achievements.reachRep10 = true;
  }
};

const handleNavigation = (target) => {
  navButtons.forEach((button) => {
    button.classList.toggle("nav__item--active", button.dataset.section === target);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === target);
  });
};

const saveGame = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadGame = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }
  const parsed = JSON.parse(saved);
  Object.assign(state, parsed);
  state.activityLog = state.activityLog || [];
};

const resetGame = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => handleNavigation(button.dataset.section));
});

document.querySelectorAll("[data-section-target]").forEach((button) => {
  button.addEventListener("click", () => handleNavigation(button.dataset.sectionTarget));
});

workButton.addEventListener("click", startWorkContract);

saveButton.addEventListener("click", saveGame);
resetButton.addEventListener("click", resetGame);

loadGame();
updateUI();

setInterval(() => {
  updateTimers();
  updateLockedSections();
  updateWork();
  updateExplorationButtons();
  if (state.scavenging.inProgress) {
    const remaining = Math.max(0, Math.ceil((state.scavenging.endsAt - Date.now()) / 1000));
    const progress = 1 - remaining / state.scavenging.duration;
    scavengeProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    scavengeProgressValue.textContent = `${remaining}s remaining`;
  } else {
    scavengeProgressFill.style.width = "0%";
    scavengeProgressValue.textContent = "Idle";
  }
}, 1000);

setInterval(() => {
  passiveTick();
  state.day += 1;
  saveGame();
}, 30000);
