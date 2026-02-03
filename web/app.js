const state = {
  level: 1,
  xp: 0,
  energy: 10,
  maxEnergy: 10,
  scrap: 0,
  water: 0,
  fuel: 0,
  armor: 0,
  campLevel: 1,
};

const refs = {
  scrap: document.getElementById("scrap"),
  water: document.getElementById("water"),
  fuel: document.getElementById("fuel"),
  armor: document.getElementById("armor"),
  level: document.getElementById("level"),
  xp: document.getElementById("xp"),
  xpProgress: document.getElementById("xp-progress"),
  energy: document.getElementById("energy"),
  energyProgress: document.getElementById("energy-progress"),
  nextUnlock: document.getElementById("next-unlock"),
  log: document.getElementById("log"),
  latestScavenge: document.getElementById("latest-scavenge"),
  craftStatus: document.getElementById("craft-status"),
  campStatus: document.getElementById("camp-status"),
  scavengeRust: document.getElementById("scavenge-rust"),
  scavengeAsh: document.getElementById("scavenge-ash"),
  craftArmor: document.getElementById("craft-armor"),
  upgradeCamp: document.getElementById("upgrade-camp"),
};

const logEntries = [];

const addLog = (message) => {
  logEntries.unshift({ message, time: new Date().toLocaleTimeString() });
  if (logEntries.length > 6) logEntries.pop();
  refs.log.innerHTML = logEntries
    .map((entry) => `<li><strong>${entry.time}</strong> — ${entry.message}</li>`)
    .join("");
};

const setProgress = (element, current, total) => {
  if (!element) return;
  const pct = total <= 0 ? 0 : Math.min(100, (current / total) * 100);
  element.style.width = `${pct}%`;
};

const updateUi = () => {
  refs.scrap.textContent = state.scrap;
  refs.water.textContent = state.water;
  refs.fuel.textContent = state.fuel;
  refs.armor.textContent = state.armor;
  refs.level.textContent = state.level;
  refs.xp.textContent = `${state.xp} / ${state.level * 20}`;
  refs.energy.textContent = `${state.energy} / ${state.maxEnergy}`;
  refs.campStatus.textContent = `Camp Level ${state.campLevel} · Max Energy ${state.maxEnergy}`;
  setProgress(refs.xpProgress, state.xp, state.level * 20);
  setProgress(refs.energyProgress, state.energy, state.maxEnergy);
  refs.nextUnlock.textContent =
    state.level < 2 ? "Ash Dunes @ Lv 2" : "All starter zones unlocked";
  refs.scavengeAsh.disabled = state.level < 2 || state.energy < 3;
  refs.scavengeRust.disabled = state.energy < 2;
  refs.craftArmor.disabled = state.scrap < 8 || state.water < 2;
  refs.upgradeCamp.disabled = state.scrap < 15;
};

const gainXp = (amount) => {
  state.xp += amount;
  state.level = Math.floor(state.xp / 20) + 1;
};

const scavenge = (zone) => {
  const cost = zone === "ash" ? 3 : 2;
  if (state.energy < cost) {
    addLog("Not enough energy. Wait for recovery.");
    return;
  }

  state.energy -= cost;
  const scrapGain = zone === "ash" ? 10 : 6;
  const waterGain = zone === "ash" ? 3 : 2;
  const fuelGain = zone === "ash" ? 1 : 0;
  state.scrap += scrapGain;
  state.water += waterGain;
  state.fuel += fuelGain;
  gainXp(zone === "ash" ? 10 : 6);
  refs.latestScavenge.textContent =
    zone === "ash"
      ? "Ash Dunes run secured scrap, water, and tech scraps."
      : "Debris search brought back scrap and water.";
  addLog("Scavenge complete. Supplies added to camp stores.");
  updateUi();
};

const craftArmor = () => {
  if (state.scrap < 8 || state.water < 2) {
    addLog("Not enough scrap or water to craft armor.");
    return;
  }
  state.scrap -= 8;
  state.water -= 2;
  state.armor += 1;
  gainXp(4);
  refs.craftStatus.textContent = "Crafted 1 armor plate.";
  addLog("Workshop finished a set of armor plates.");
  updateUi();
};

const upgradeCamp = () => {
  if (state.scrap < 15) {
    addLog("Not enough scrap to upgrade the camp.");
    return;
  }
  state.scrap -= 15;
  state.campLevel += 1;
  state.maxEnergy += 2;
  state.energy = Math.min(state.energy + 2, state.maxEnergy);
  gainXp(5);
  addLog("Camp upgraded. Energy reserves increased.");
  updateUi();
};

const regenEnergy = () => {
  state.energy = Math.min(state.maxEnergy, state.energy + 1);
  updateUi();
};

refs.scavengeRust.addEventListener("click", () => scavenge("rust"));
refs.scavengeAsh.addEventListener("click", () => scavenge("ash"));
refs.craftArmor.addEventListener("click", craftArmor);
refs.upgradeCamp.addEventListener("click", upgradeCamp);

updateUi();
addLog("A scouting party is ready for orders.");
setInterval(regenEnergy, 8000);
