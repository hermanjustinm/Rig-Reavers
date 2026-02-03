const manualScavengeAreas = {
  outskirts: {
    label: "Outskirts",
    lootMultiplier: 0.8,
    foodChance: 0.1,
    waterChance: 0.12,
  },
  suburbs: {
    label: "Suburbs",
    lootMultiplier: 1,
    foodChance: 0.14,
    waterChance: 0.16,
  },
  downtown: {
    label: "Downtown",
    lootMultiplier: 1.2,
    foodChance: 0.18,
    waterChance: 0.2,
  },
};

const logEntries = [];

function addLogEntry(message) {
  logEntries.push({ message, timestamp: Date.now() });
}

function rollSmallDrop(baseChance) {
  if (Math.random() >= baseChance) {
    return 0;
  }

  const bonus = Math.random() < 0.25 ? 1 : 0;
  return 1 + bonus;
}

function scavengingLoot(areaKey) {
  const area = manualScavengeAreas[areaKey] ?? manualScavengeAreas.outskirts;

  return {
    items: [],
    rations: rollSmallDrop(area.foodChance),
    water: rollSmallDrop(area.waterChance),
  };
}

function finishScavenge(state, areaKey) {
  const loot = scavengingLoot(areaKey);

  state.inventory = state.inventory ?? [];
  state.rations = (state.rations ?? 0) + loot.rations;
  state.water = (state.water ?? 0) + loot.water;

  if (loot.rations > 0) {
    addLogEntry(`Found ${loot.rations} ration${loot.rations === 1 ? "" : "s"}.`);
  }

  if (loot.water > 0) {
    addLogEntry(`Found ${loot.water} water bottle${loot.water === 1 ? "" : "s"}.`);
  }

  return loot;
}

module.exports = {
  manualScavengeAreas,
  addLogEntry,
  scavengingLoot,
  finishScavenge,
  logEntries,
};
