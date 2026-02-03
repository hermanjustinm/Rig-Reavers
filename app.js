const navButtons = document.querySelectorAll(".nav button");
const pages = document.querySelectorAll(".page");
const resourceEls = document.querySelectorAll("[data-resource]");
const storageEl = document.querySelector("[data-storage]");
const facilityCountEl = document.querySelector("[data-facility-count]");
const facilityDisplayEl = document.querySelector("[data-facility-display]");
const facilityStatusEl = document.querySelector("[data-facility-status]");
const statValueEls = document.querySelectorAll("[data-stat-value]");
const statTrainingEls = document.querySelectorAll("[data-train-stat]");
const statDisplayEls = document.querySelectorAll("[data-stat-display]");
const combatEls = document.querySelectorAll("[data-combat]");
const activityLog = document.querySelector("#activity-log");

const state = {
  health: 40,
  maxHealth: 40,
  energy: 25,
  maxEnergy: 25,
  resources: {
    scrap: 0,
    fuel: 0,
    water: 0,
    food: 0,
    parts: 0,
    credits: 0,
  },
  storageCap: 50,
  facilitiesBuilt: 0,
  facilities: {
    shelter: false,
  },
  stats: {
    strength: 1.0,
    dexterity: 1.0,
    endurance: 1.0,
    perception: 1.0,
    charisma: 1.0,
  },
  cooldowns: {
    rest: 0,
  },
};

const setActivePage = (pageId) => {
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageId);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getStorageUsed = () =>
  state.resources.scrap +
  state.resources.fuel +
  state.resources.water +
  state.resources.food +
  state.resources.parts;

const updateBars = () => {
  const healthBar = document.querySelector("[data-bar='health'] div");
  const energyBar = document.querySelector("[data-bar='energy'] div");
  const storageBar = document.querySelector("[data-bar='storage'] div");

  const healthPct = (state.health / state.maxHealth) * 100;
  const energyPct = (state.energy / state.maxEnergy) * 100;
  const storagePct = (getStorageUsed() / state.storageCap) * 100;

  healthBar.style.width = `${healthPct}%`;
  energyBar.style.width = `${energyPct}%`;
  storageBar.style.width = `${storagePct}%`;
};

const updateStats = () => {
  statValueEls.forEach((el) => {
    if (el.dataset.statValue === "health") {
      el.textContent = `${state.health} / ${state.maxHealth}`;
    }
    if (el.dataset.statValue === "energy") {
      el.textContent = `${state.energy} / ${state.maxEnergy}`;
    }
  });

  statTrainingEls.forEach((el) => {
    const key = el.dataset.trainStat;
    el.textContent = state.stats[key].toFixed(1);
  });

  statDisplayEls.forEach((el) => {
    const key = el.dataset.statDisplay;
    el.textContent = state.stats[key].toFixed(1);
  });

  const attack = (state.stats.strength + state.stats.dexterity).toFixed(1);
  const defense = (state.stats.endurance + state.stats.perception).toFixed(1);
  const crit = clamp(state.stats.perception * 0.6, 1, 15).toFixed(1);

  combatEls.forEach((el) => {
    if (el.dataset.combat === "attack") el.textContent = attack;
    if (el.dataset.combat === "defense") el.textContent = defense;
    if (el.dataset.combat === "crit") el.textContent = `${crit}%`;
    if (el.dataset.combat === "injuries") el.textContent = "0";
  });
};

const updateResources = () => {
  resourceEls.forEach((el) => {
    const key = el.dataset.resource;
    el.textContent = state.resources[key];
  });
  storageEl.textContent = `${getStorageUsed()} / ${state.storageCap}`;
};

const updateFacilities = () => {
  facilityCountEl.textContent = `Facilities: ${state.facilitiesBuilt}/10`;
  facilityDisplayEl.textContent = `${state.facilitiesBuilt}/10`;
  facilityStatusEl.textContent = state.facilities.shelter ? "Level: 1" : "Level: 0";
};

const updateButtons = () => {
  document.querySelectorAll("[data-cost-energy]").forEach((button) => {
    const cost = Number(button.dataset.costEnergy);
    button.disabled = state.energy < cost;
  });

  document.querySelectorAll("[data-action='build-shelter']").forEach((button) => {
    const scrapCost = Number(button.dataset.costScrap);
    const partsCost = Number(button.dataset.costParts);
    const canAfford =
      state.resources.scrap >= scrapCost && state.resources.parts >= partsCost;
    button.disabled = state.facilities.shelter || !canAfford;
    if (state.facilities.shelter) {
      button.textContent = "Shelter Built";
    }
  });

  document.querySelectorAll("[data-action='ration']").forEach((button) => {
    button.disabled = state.resources.food < 1;
  });
};

const addLog = (message) => {
  const item = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  item.textContent = `[${timestamp}] ${message}`;
  activityLog.prepend(item);
};

const addResource = (key, amount) => {
  if (key === "credits") {
    state.resources.credits += amount;
    return amount;
  }

  const availableSpace = state.storageCap - getStorageUsed();
  const stored = Math.max(Math.min(amount, availableSpace), 0);
  state.resources[key] += stored;
  return stored;
};

const spendEnergy = (amount) => {
  state.energy = clamp(state.energy - amount, 0, state.maxEnergy);
};

const spendResource = (key, amount) => {
  state.resources[key] = Math.max(state.resources[key] - amount, 0);
};

const doScavenge = () => {
  spendEnergy(5);
  const scrap = addResource("scrap", Math.floor(Math.random() * 3) + 1);
  const food = addResource("food", Math.random() > 0.6 ? 1 : 0);
  const credits = addResource("credits", Math.random() > 0.5 ? 1 : 0);
  addLog(
    `Scavenged nearby ruins: +${scrap} scrap${food ? `, +${food} food` : ""}${
      credits ? `, +${credits} credits` : ""
    }.`
  );
};

const doRest = () => {
  const now = Date.now();
  if (now < state.cooldowns.rest) {
    addLog("You need a moment before resting again.");
    return;
  }
  state.cooldowns.rest = now + 30000;
  state.health = clamp(state.health + 5, 0, state.maxHealth);
  state.energy = clamp(state.energy + 5, 0, state.maxEnergy);
  addLog("You catch your breath: +5 health, +5 energy.");
};

const doRation = () => {
  if (state.resources.food < 1) {
    addLog("No rations left. Scavenge for food.");
    return;
  }
  spendResource("food", 1);
  state.energy = clamp(state.energy + 8, 0, state.maxEnergy);
  state.health = clamp(state.health + 4, 0, state.maxHealth);
  addLog("You eat a ration: +8 energy, +4 health.");
};

const doTrain = (statKey) => {
  const gain = Math.random() * 0.3 + 0.2;
  spendEnergy(10);
  state.stats[statKey] = Number((state.stats[statKey] + gain).toFixed(2));
  addLog(`Training complete: ${statKey} +${gain.toFixed(2)}.`);
};

const doBuildShelter = () => {
  if (state.facilities.shelter) return;
  spendResource("scrap", 20);
  spendResource("parts", 5);
  state.facilities.shelter = true;
  state.facilitiesBuilt += 1;
  state.maxHealth += 20;
  state.maxEnergy += 10;
  state.health = state.maxHealth;
  state.energy = state.maxEnergy;
  addLog("Shelter repaired. Max health and energy increased.");
};

const bindActions = () => {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "scavenge") doScavenge();
      if (action === "rest") doRest();
      if (action === "ration") doRation();
      if (action === "train") doTrain(button.dataset.stat);
      if (action === "build-shelter") doBuildShelter();
      updateUI();
    });
  });
};

const updateUI = () => {
  updateStats();
  updateResources();
  updateFacilities();
  updateBars();
  updateButtons();
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActivePage(button.dataset.page);
  });
});

bindActions();
setActivePage("scavenging");
addLog("You wake up in the slums with nothing but a busted rig.");
updateUI();
