const STORAGE_KEY = "wasteland-reclaimer-save";

const state = {
  day: 1,
  energy: 80,
  maxEnergy: 100,
  health: 85,
  maxHealth: 100,
  reputation: 0,
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
    tech: 0,
  },
  facilities: {
    camp: { level: 1, label: "Camp" },
    waterStill: { level: 0, label: "Water Still" },
    workshop: { level: 0, label: "Workshop" },
    outpost: { level: 0, label: "Outpost" },
    tradingPost: { level: 0, label: "Trading Post" },
  },
  scavenging: {
    inProgress: false,
    endsAt: 0,
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
    reachRep10: false,
  },
};

const baseCosts = {
  waterStill: { scrap: 60, credits: 20 },
  workshop: { scrap: 120, rations: 40, credits: 60 },
  outpost: { scrap: 180, water: 60, credits: 100 },
  tradingPost: { scrap: 220, rations: 80, credits: 140 },
};

const scavengingLoot = () => {
  const strengthBonus = state.stats.strength * 0.12;
  const awarenessBonus = state.stats.awareness * 0.1;
  return {
    scrap: Math.round(12 + Math.random() * (10 + strengthBonus * 10)),
    rations: Math.round(5 + Math.random() * (4 + awarenessBonus * 5)),
    water: Math.round(3 + Math.random() * (4 + awarenessBonus * 4)),
    credits: Math.random() < 0.35 ? 2 + Math.floor(Math.random() * 4) : 0,
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
    key: "reachRep10",
    label: "Known in the Dust",
    description: "Reach 10 reputation.",
  },
];

const expeditionList = [
  {
    label: "Collapsed Metro",
    duration: 120,
    reward: "Rare scrap and medical finds.",
  },
  {
    label: "Radiated Mall",
    duration: 300,
    reward: "Chance at vehicle parts.",
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
const energyValue = document.getElementById("energyValue");
const healthValue = document.getElementById("healthValue");
const repValue = document.getElementById("repValue");
const dayValue = document.getElementById("dayValue");

const resourceList = document.getElementById("resourceList");
const milestoneList = document.getElementById("milestoneList");
const scavengeTimer = document.getElementById("scavengeTimer");
const scavengeDetails = document.getElementById("scavengeDetails");
const scavengeButton = document.getElementById("scavengeButton");

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

const saveButton = document.getElementById("saveGame");
const resetButton = document.getElementById("resetGame");

const formatNumber = (value) => Math.max(0, Math.floor(value));

const updateStatus = () => {
  energyValue.textContent = `${formatNumber(state.energy)}/${state.maxEnergy}`;
  healthValue.textContent = `${formatNumber(state.health)}/${state.maxHealth}`;
  repValue.textContent = formatNumber(state.reputation);
  dayValue.textContent = state.day;

  energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
  healthFill.style.width = `${(state.health / state.maxHealth) * 100}%`;
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
      label: "Establish the Outpost for expeditions.",
      done: state.facilities.outpost.level > 0,
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
      : "Build the Outpost to unlock expeditions.";
  expeditionContainer.innerHTML = state.facilities.outpost.level
    ? expeditionList
        .map(
          (expedition) => `
      <div class="expedition-item">
        <div>
          <strong>${expedition.label}</strong>
          <div class="muted">Duration: ${expedition.duration}s</div>
          <div class="muted">Reward: ${expedition.reward}</div>
        </div>
        <button class="primary" disabled>Locked</button>
      </div>
    `
        )
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

const updateScavenge = () => {
  if (!state.scavenging.inProgress) {
    scavengeTimer.textContent = "Ready";
    scavengeDetails.textContent = `Cost: 20 energy · Duration: 40s`;
    scavengeButton.disabled = state.energy < 20;
    return;
  }

  const remaining = Math.max(0, state.scavenging.endsAt - Date.now());
  const seconds = Math.ceil(remaining / 1000);
  scavengeTimer.textContent = `${seconds}s`;
  scavengeDetails.textContent = "Scavenging in progress...";
  scavengeButton.disabled = true;
};

const startScavenge = () => {
  if (state.scavenging.inProgress || state.energy < 20) {
    return;
  }
  state.energy -= 20;
  state.scavenging.inProgress = true;
  state.scavenging.endsAt = Date.now() + 40000;
  updateUI();
};

const finishScavenge = () => {
  const loot = scavengingLoot();
  Object.keys(loot).forEach((key) => {
    state.resources[key] += loot[key];
  });
  state.reputation += 1;
  state.achievements.firstRun = true;
  if (state.reputation >= 10) {
    state.achievements.reachRep10 = true;
  }
  state.scavenging.inProgress = false;
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
  updateUI();
};

const updateTimers = () => {
  if (state.scavenging.inProgress && Date.now() >= state.scavenging.endsAt) {
    finishScavenge();
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
    state.health = Math.min(state.maxHealth, state.health + 0.5);
    state.resources.rations -= 0.2;
    state.resources.water -= 0.2;
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
  updateAchievements();
  updateScavenge();
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

scavengeButton.addEventListener("click", startScavenge);

saveButton.addEventListener("click", saveGame);
resetButton.addEventListener("click", resetGame);

loadGame();
updateUI();

setInterval(() => {
  updateTimers();
  updateScavenge();
}, 1000);

setInterval(() => {
  passiveTick();
  state.day += 1;
  saveGame();
}, 30000);
