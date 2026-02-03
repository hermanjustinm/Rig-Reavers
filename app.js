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
const expeditionStatusEls = document.querySelectorAll("[data-expedition-status]");
const levelEl = document.querySelector("[data-level]");
const scavengeStatusEl = document.querySelector("[data-scavenge-status]");
const suppliesPanel = document.querySelector("[data-collapsible='supplies']");
const suppliesToggle = document.querySelector("[data-action='toggle-supplies']");
const blueprintList = document.querySelector("[data-blueprint-list]");
const trainingStatusEl = document.querySelector("[data-training-status]");
const trainingTimerEl = document.querySelector("[data-training-timer]");
const trainingProgressEl = document.querySelector("[data-training-progress]");
const trainingButtonEl = document.querySelector("[data-training-button]");
const trainingSummaryEl = document.querySelector("[data-training-summary]");
const achievementSummaryEl = document.querySelector("[data-achievement-summary]");
const achievementRewardsEl = document.querySelector("#achievement-rewards");
const playtimeEl = document.querySelector("[data-playtime]");
const totalStatEls = document.querySelectorAll("[data-stat-total]");
const achievementEls = document.querySelectorAll("[data-achievement]");

const state = {
  health: 40,
  maxHealth: 40,
  energy: 25,
  maxEnergy: 25,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  totalXp: 0,
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
    defense: 1.0,
    perception: 1.0,
    charisma: 1.0,
  },
  cooldowns: {
    rest: 0,
    work: 0,
  },
  expeditions: {
    "dry-flats": {
      inProgress: false,
      endsAt: 0,
      duration: 0,
    },
  },
  scavenge: {
    inProgress: false,
    endsAt: 0,
  },
  training: {
    inProgress: false,
    stat: null,
    endsAt: 0,
    duration: 0,
  },
  totals: {
    scavenge: 0,
    expedition: 0,
    work: 0,
    training: 0,
    trade: 0,
  },
  startTime: Date.now(),
  warRigBuilt: false,
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
  const xpBar = document.querySelector("[data-bar='xp'] div");

  const healthPct = (state.health / state.maxHealth) * 100;
  const energyPct = (state.energy / state.maxEnergy) * 100;
  const storagePct = (getStorageUsed() / state.storageCap) * 100;
  const xpPct = (state.xp / state.nextLevelXp) * 100;

  healthBar.style.width = `${healthPct}%`;
  energyBar.style.width = `${energyPct}%`;
  storageBar.style.width = `${storagePct}%`;
  xpBar.style.width = `${xpPct}%`;
};

const updateStats = () => {
  statValueEls.forEach((el) => {
    if (el.dataset.statValue === "health") {
      el.textContent = `${state.health} / ${state.maxHealth}`;
    }
    if (el.dataset.statValue === "energy") {
      el.textContent = `${state.energy} / ${state.maxEnergy}`;
    }
    if (el.dataset.statValue === "xp") {
      el.textContent = `${state.xp} / ${state.nextLevelXp}`;
    }
  });

  if (levelEl) {
    levelEl.textContent = state.level;
  }

  statTrainingEls.forEach((el) => {
    const key = el.dataset.trainStat;
    el.textContent = state.stats[key].toFixed(1);
  });

  statDisplayEls.forEach((el) => {
    const key = el.dataset.statDisplay;
    el.textContent = state.stats[key].toFixed(1);
  });

  const attack = (state.stats.strength + state.stats.dexterity).toFixed(1);
  const defenseRating = (
    state.stats.endurance +
    state.stats.defense +
    state.stats.perception * 0.4
  ).toFixed(1);
  const crit = clamp(state.stats.perception * 0.6, 1, 15).toFixed(1);

  combatEls.forEach((el) => {
    if (el.dataset.combat === "attack") el.textContent = attack;
    if (el.dataset.combat === "defense") el.textContent = defenseRating;
    if (el.dataset.combat === "crit") el.textContent = `${crit}%`;
    if (el.dataset.combat === "injuries") el.textContent = "0";
  });
};

const updateTotals = () => {
  totalStatEls.forEach((el) => {
    const key = el.dataset.statTotal;
    el.textContent = state.totals[key];
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

  document.querySelectorAll("[data-action='work']").forEach((button) => {
    button.disabled = Date.now() < state.cooldowns.work;
  });

  document.querySelectorAll("[data-action='train']").forEach((button) => {
    const cost = Number(button.dataset.costEnergy);
    button.disabled = state.training.inProgress || state.energy < cost;
  });

  document.querySelectorAll("[data-action='trade']").forEach((button) => {
    const tradeType = button.dataset.trade;
    if (tradeType === "sell-scrap") {
      button.disabled = state.resources.scrap < 20;
    }
    if (tradeType === "buy-water") {
      button.disabled = state.resources.credits < 35;
    }
    if (tradeType === "trade-food") {
      button.disabled = state.resources.food < 5;
    }
  });

  document.querySelectorAll("[data-action='scavenge-locked']").forEach((button) => {
    const stat = button.dataset.requiredStat;
    const requiredValue = Number(button.dataset.requiredValue);
    const unlocked = state.stats[stat] >= requiredValue;
    const cost = Number(button.dataset.costEnergy || 0);
    button.disabled = !unlocked || state.energy < cost;
    button.textContent = unlocked ? "Scavenge" : "Locked";
    button.dataset.action = unlocked ? "scavenge-advanced" : "scavenge-locked";
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

const addXp = (amount) => {
  state.xp += amount;
  state.totalXp += amount;
  while (state.xp >= state.nextLevelXp) {
    state.xp -= state.nextLevelXp;
    state.level += 1;
    state.nextLevelXp = Math.round(state.nextLevelXp * 1.15);
    addLog(`Level up! You reached level ${state.level}.`);
  }
};

const spendEnergy = (amount) => {
  state.energy = clamp(state.energy - amount, 0, state.maxEnergy);
};

const spendResource = (key, amount) => {
  state.resources[key] = Math.max(state.resources[key] - amount, 0);
};

const doScavenge = () => {
  if (state.scavenge.inProgress) {
    addLog("Already scavenging. Wait for the timer to finish.");
    return;
  }
  spendEnergy(5);
  state.scavenge.inProgress = true;
  state.scavenge.endsAt = Date.now() + 30000;
  addLog("Scavenging the nearby ruins. Stand by (30s).");
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

const doTrain = (statKey, durationSeconds) => {
  if (state.training.inProgress) {
    addLog("Already training. Finish the session first.");
    return;
  }
  spendEnergy(10);
  state.training.inProgress = true;
  state.training.stat = statKey;
  state.training.duration = durationSeconds * 1000;
  state.training.endsAt = Date.now() + state.training.duration;
  addLog(`Training started: ${statKey}.`);
};

const doAdvancedScavenge = (statKey, cost) => {
  spendEnergy(cost);
  const scrap = addResource("scrap", Math.floor(Math.random() * 5) + 2);
  const parts = addResource("parts", Math.random() > 0.6 ? 1 : 0);
  const credits = addResource("credits", Math.random() > 0.4 ? 2 : 1);
  state.totals.scavenge += 1;
  addXp(8);
  addLog(
    `Scavenged a tougher zone: +${scrap} scrap${parts ? `, +${parts} parts` : ""}, +${credits} credits.`
  );
};

const doWork = () => {
  const now = Date.now();
  if (now < state.cooldowns.work) {
    addLog("You already took a shift. Check back later.");
    return;
  }
  state.cooldowns.work = now + 15 * 60 * 1000;
  const credits = addResource("credits", 12);
  const food = addResource("food", 1);
  state.totals.work += 1;
  addXp(6);
  addLog(`Worked a shift: +${credits} credits, +${food} food.`);
};

const updateExpeditionStatus = () => {
  expeditionStatusEls.forEach((el) => {
    const key = el.dataset.expeditionStatus;
    const expedition = state.expeditions[key];
    if (!expedition) return;
    const button = document.querySelector(`[data-expedition='${key}']`);
    const progressEl = document.querySelector(`[data-expedition-progress='${key}']`);
    const progressLabel = document.querySelector(`[data-progress-label='${key}']`);
    if (!expedition.inProgress) {
      el.textContent = "Ready";
      if (progressLabel) progressLabel.textContent = "Ready";
      if (progressEl) {
        progressEl.classList.remove("is-active");
        progressEl.querySelector(".progress-fill").style.width = "0%";
      }
      if (button) {
        button.disabled = false;
        button.textContent = "Dispatch Crew";
      }
      return;
    }
    const remaining = expedition.endsAt - Date.now();
    if (remaining <= 0) {
      expedition.inProgress = false;
      el.textContent = "Complete";
      if (progressLabel) progressLabel.textContent = "Complete";
      if (progressEl) {
        progressEl.classList.remove("is-active");
        progressEl.querySelector(".progress-fill").style.width = "100%";
      }
      if (button) {
        button.disabled = false;
        button.textContent = "Dispatch Crew";
      }
      addResource("scrap", 4);
      addResource("water", 1);
      state.totals.expedition += 1;
      addXp(10);
      addLog("Exploration complete: +4 scrap, +1 water.");
      return;
    }
    if (progressEl) {
      const percent = ((expedition.duration - remaining) / expedition.duration) * 100;
      progressEl.classList.add("is-active");
      progressEl.querySelector(".progress-fill").style.width = `${percent}%`;
    }
    const minutes = Math.max(Math.floor(remaining / 60000), 0);
    const seconds = Math.max(Math.floor((remaining % 60000) / 1000), 0);
    if (progressLabel) {
      progressLabel.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }
    el.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (button) {
      button.disabled = true;
      button.textContent = "En Route";
    }
  });
};

const doExpedition = (key, durationSeconds) => {
  const expedition = state.expeditions[key];
  if (!expedition || expedition.inProgress) return;
  expedition.inProgress = true;
  expedition.duration = durationSeconds * 1000;
  expedition.endsAt = Date.now() + durationSeconds * 1000;
  addLog("Crew dispatched. Exploration underway.");
};

const updateScavengeStatus = () => {
  const button = document.querySelector("[data-action='scavenge']");
  const progressEl = document.querySelector("[data-progress='scavenge']");
  const progressLabel = document.querySelector("[data-progress-label='scavenge']");
  if (!scavengeStatusEl || !button) return;
  if (!state.scavenge.inProgress) {
    scavengeStatusEl.textContent = "Ready";
    if (progressLabel) progressLabel.textContent = "Ready";
    if (progressEl) {
      progressEl.classList.remove("is-active");
      progressEl.querySelector(".progress-fill").style.width = "0%";
    }
    button.disabled = state.energy < 5;
    button.textContent = "Search Ruins";
    return;
  }
  const remaining = state.scavenge.endsAt - Date.now();
  if (remaining <= 0) {
    state.scavenge.inProgress = false;
    const scrap = addResource("scrap", Math.floor(Math.random() * 3) + 1);
    const food = addResource("food", Math.random() > 0.6 ? 1 : 0);
    const credits = addResource("credits", Math.random() > 0.5 ? 1 : 0);
    state.totals.scavenge += 1;
    addXp(4);
    addLog(
      `Scavenged nearby ruins: +${scrap} scrap${food ? `, +${food} food` : ""}${
        credits ? `, +${credits} credits` : ""
      }.`
    );
    scavengeStatusEl.textContent = "Ready";
    if (progressLabel) progressLabel.textContent = "Ready";
    if (progressEl) {
      progressEl.classList.remove("is-active");
      progressEl.querySelector(".progress-fill").style.width = "100%";
    }
    button.disabled = state.energy < 5;
    button.textContent = "Search Ruins";
    return;
  }
  const seconds = Math.max(Math.ceil(remaining / 1000), 0);
  const percent = ((30000 - remaining) / 30000) * 100;
  if (progressEl) {
    progressEl.classList.add("is-active");
    progressEl.querySelector(".progress-fill").style.width = `${percent}%`;
  }
  if (progressLabel) {
    progressLabel.textContent = `00:${String(seconds).padStart(2, "0")}`;
  }
  scavengeStatusEl.textContent = `00:${String(seconds).padStart(2, "0")}`;
  button.disabled = true;
  button.textContent = "Searching...";
};

const updateTrainingStatus = () => {
  if (!trainingStatusEl || !trainingProgressEl || !trainingTimerEl || !trainingButtonEl) {
    return;
  }
  const progressLabel = document.querySelector("[data-progress-label='training']");
  if (!state.training.inProgress) {
    trainingStatusEl.textContent = "No active training. Start a session to queue a stat gain.";
    trainingTimerEl.textContent = "Queue: 0/1";
    trainingProgressEl.classList.remove("is-active");
    trainingProgressEl.querySelector(".progress-fill").style.width = "0%";
    if (progressLabel) progressLabel.textContent = "Idle";
    trainingButtonEl.textContent = "Training Queue Locked";
    if (trainingSummaryEl) trainingSummaryEl.textContent = "Training Slots: 0/1";
    return;
  }
  const remaining = state.training.endsAt - Date.now();
  if (remaining <= 0) {
    const gain = Math.random() * 0.3 + 0.2;
    state.stats[state.training.stat] = Number(
      (state.stats[state.training.stat] + gain).toFixed(2)
    );
    state.training.inProgress = false;
    state.training.stat = null;
    state.training.endsAt = 0;
    state.totals.training += 1;
    addXp(12);
    addLog(`Training complete: +${gain.toFixed(2)}.`);
    if (progressLabel) progressLabel.textContent = "Complete";
    updateTrainingStatus();
    return;
  }
  const percent = ((state.training.duration - remaining) / state.training.duration) * 100;
  trainingProgressEl.classList.add("is-active");
  trainingProgressEl.querySelector(".progress-fill").style.width = `${percent}%`;
  trainingStatusEl.textContent = `Training ${state.training.stat}.`;
  const minutes = Math.max(Math.floor(remaining / 60000), 0);
  const seconds = Math.max(Math.floor((remaining % 60000) / 1000), 0);
  trainingTimerEl.textContent = `Time Left: ${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
  if (progressLabel) {
    progressLabel.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }
  trainingButtonEl.textContent = "Training In Progress";
  if (trainingSummaryEl) trainingSummaryEl.textContent = "Training Slots: 1/1";
};

const updateAchievements = () => {
  const achievements = {
    xp: { label: "First Steps", value: state.totalXp, target: 10 },
    scavenge: { label: "Street Runner", value: state.totals.scavenge, target: 5 },
    work: { label: "Shift Regular", value: state.totals.work, target: 3 },
    trade: { label: "Barter Boss", value: state.totals.trade, target: 3 },
    training: { label: "Gym Rat", value: state.totals.training, target: 3 },
    expedition: { label: "Dust Drifter", value: state.totals.expedition, target: 2 },
  };
  let unlockedCount = 0;
  const unlockedRewards = [];
  achievementEls.forEach((el) => {
    const key = el.dataset.achievement;
    const achievement = achievements[key];
    if (!achievement) return;
    const complete = achievement.value >= achievement.target;
    if (complete) {
      unlockedCount += 1;
      unlockedRewards.push(`${achievement.label} Title`);
    }
    el.textContent = `${achievement.label} — ${complete ? "Unlocked" : ""}`.trim();
    if (!complete) {
      el.textContent = `${achievement.label} — ${achievement.value}/${achievement.target}`;
    }
  });
  if (achievementSummaryEl) {
    achievementSummaryEl.textContent = `Unlocked: ${unlockedCount}/6`;
  }
  if (achievementRewardsEl) {
    achievementRewardsEl.innerHTML = "";
    if (unlockedRewards.length === 0) {
      const item = document.createElement("li");
      item.textContent = "No rewards unlocked yet.";
      achievementRewardsEl.appendChild(item);
    } else {
      unlockedRewards.forEach((reward) => {
        const item = document.createElement("li");
        item.textContent = reward;
        achievementRewardsEl.appendChild(item);
      });
    }
  }
};

const updatePlaytime = () => {
  if (!playtimeEl) return;
  const elapsed = Date.now() - state.startTime;
  const minutes = Math.floor(elapsed / 60000);
  playtimeEl.textContent = `Playtime: ${minutes}m`;
};

const handleTrade = (type) => {
  if (type === "sell-scrap") {
    if (state.resources.scrap < 20) {
      addLog("Not enough scrap to sell.");
      return;
    }
    spendResource("scrap", 20);
    addResource("credits", 60);
  }
  if (type === "buy-water") {
    if (state.resources.credits < 35) {
      addLog("Not enough credits to buy water.");
      return;
    }
    spendResource("credits", 35);
    addResource("water", 10);
  }
  if (type === "trade-food") {
    if (state.resources.food < 5) {
      addLog("Not enough food to trade.");
      return;
    }
    spendResource("food", 5);
    addResource("fuel", 2);
  }
  state.totals.trade += 1;
  addXp(5);
  addLog("Trade completed.");
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
      if (action === "scavenge-advanced") {
        doAdvancedScavenge(button.dataset.requiredStat, Number(button.dataset.costEnergy));
      }
      if (action === "rest") doRest();
      if (action === "ration") doRation();
      if (action === "train") doTrain(button.dataset.stat, Number(button.dataset.duration));
      if (action === "work") doWork();
      if (action === "expedition") {
        doExpedition(button.dataset.expedition, Number(button.dataset.duration));
      }
      if (action === "build-shelter") doBuildShelter();
      if (action === "toggle-supplies" && suppliesPanel && suppliesToggle) {
        suppliesPanel.classList.toggle("collapsed");
        suppliesToggle.textContent = suppliesPanel.classList.contains("collapsed")
          ? "Expand"
          : "Collapse";
      }
      if (action === "toggle-blueprints" && blueprintList) {
        blueprintList.classList.toggle("is-hidden");
        button.textContent = blueprintList.classList.contains("is-hidden")
          ? "View Blueprints"
          : "Hide Blueprints";
      }
      if (action === "trade") handleTrade(button.dataset.trade);
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
  updateScavengeStatus();
  updateExpeditionStatus();
  updateTrainingStatus();
  updateTotals();
  updateAchievements();
  updatePlaytime();
};

const startEnergyRegen = () => {
  setInterval(() => {
    if (state.energy < state.maxEnergy) {
      state.energy = clamp(state.energy + 1, 0, state.maxEnergy);
      updateUI();
    }
  }, 60000);
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
startEnergyRegen();
setInterval(updateExpeditionStatus, 1000);
setInterval(updateScavengeStatus, 500);
setInterval(updateTrainingStatus, 500);
setInterval(updatePlaytime, 60000);
