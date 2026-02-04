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
    components: 0,
    salvageCores: 0,
  },
  upkeep: {
    rationsPerDay: 1,
    waterPerDay: 1,
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
    canteen: { level: 0, label: "Canteen" },
    workshop: { level: 0, label: "Workshop" },
    infirmary: { level: 0, label: "Infirmary" },
    outpost: { level: 0, label: "Outpost" },
    tradingPost: { level: 0, label: "Trading Post" },
    garage: { level: 0, label: "Garage" },
  },
  vehicles: {
    battleCar: { level: 0, label: "Battle Car" },
    duneBuggy: { level: 0, label: "Dune Buggy" },
    warRig: { level: 0, label: "War Rig" },
  },
  exploration: {
    inProgress: false,
    endsAt: 0,
    key: null,
    duration: 0,
    lootMultiplier: 1,
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
  crafting: {
    inProgress: false,
    endsAt: 0,
    duration: 0,
    itemKey: null,
  },
  rest: {
    inProgress: false,
    endsAt: 0,
    duration: 0,
  },
  recovery: {
    inProgress: false,
    targetHealth: 20,
  },
  training: {
    inProgress: false,
    endsAt: 0,
    statKey: null,
    duration: 0,
  },
  workCooldowns: {},
  tradingCounts: {},
  vehiclePenalty: {
    active: false,
    durationMultiplier: 1,
    lootMultiplier: 1,
  },
  inventory: [],
  equipment: {
    ranged: null,
    melee: null,
    armor: null,
  },
  achievements: {
    firstRun: false,
    buildWaterStill: false,
    trainOnce: false,
    firstExploration: false,
    reachRep10: false,
  },
  activityLog: [],
  lastTick: Date.now(),
  lastUpkeep: Date.now(),
};

const baseCosts = {
  waterStill: { scrap: 60, credits: 20 },
  canteen: { scrap: 90, rations: 20, credits: 40 },
  workshop: { scrap: 120, rations: 40, credits: 60 },
  infirmary: { scrap: 140, rations: 30, credits: 70 },
  outpost: { scrap: 180, water: 60, credits: 100 },
  tradingPost: { scrap: 220, rations: 80, credits: 140 },
  garage: { scrap: 140, rations: 40, credits: 80 },
};

const vehicleCosts = {
  battleCar: { scrap: 160, rations: 40, credits: 120 },
  duneBuggy: { scrap: 220, water: 60, credits: 180 },
  warRig: { scrap: 420, rations: 140, water: 140, credits: 320 },
};

const vehicleUpkeep = {
  battleCar: { credits: 4, water: 2 },
  duneBuggy: { credits: 7, water: 3, rations: 1 },
  warRig: { credits: 15, water: 6, rations: 4 },
};

const workTiers = {
  tier1: { label: "Tier 1", minRep: 0, cooldownSeconds: 45 },
  tier2: { label: "Tier 2", minRep: 4, cooldownSeconds: 120 },
  tier3: { label: "Tier 3", minRep: 9, cooldownSeconds: 240 },
  tier4: { label: "Tier 4", minRep: 14, cooldownSeconds: 420 },
};
const equipmentCatalog = [
  {
    key: "rusted-revolver",
    name: "Rusted Revolver",
    slot: "ranged",
    tier: 1,
    rarity: "uncommon",
    sources: ["scavenge", "exploration"],
    bonuses: { awareness: 1, defense: 1 },
  },
  {
    key: "broken-knife",
    name: "Broken Knife",
    slot: "melee",
    tier: 1,
    rarity: "common",
    sources: ["starter"],
    bonuses: { strength: 1 },
  },
  {
    key: "tattered-leather-armor",
    name: "Tattered Leather Armor",
    slot: "armor",
    tier: 1,
    rarity: "common",
    sources: ["starter"],
    bonuses: { resilience: 1, defense: 1 },
  },
  {
    key: "scrap-bow",
    name: "Scrap Bow",
    slot: "ranged",
    tier: 1,
    rarity: "common",
    sources: ["scavenge"],
    craftable: true,
    recipe: { scrap: 50, components: 4 },
    bonuses: { awareness: 1 },
  },
  {
    key: "handmade-rifle",
    name: "Handmade Rifle",
    slot: "ranged",
    tier: 2,
    rarity: "rare",
    sources: ["exploration"],
    craftable: true,
    recipe: { scrap: 120, components: 12, salvageCores: 1, credits: 25 },
    bonuses: { awareness: 2, defense: 1 },
  },
  {
    key: "spike-bat",
    name: "Spike Bat",
    slot: "melee",
    tier: 1,
    rarity: "common",
    sources: ["scavenge"],
    craftable: true,
    recipe: { scrap: 40, components: 3 },
    bonuses: { strength: 1 },
  },
  {
    key: "crowbar",
    name: "Crowbar",
    slot: "melee",
    tier: 1,
    rarity: "uncommon",
    sources: ["scavenge", "exploration"],
    bonuses: { strength: 1, defense: 1 },
  },
  {
    key: "cleaver-spear",
    name: "Cleaver Spear",
    slot: "melee",
    tier: 2,
    rarity: "rare",
    sources: ["exploration"],
    craftable: true,
    recipe: { scrap: 110, components: 10, salvageCores: 1, credits: 20 },
    bonuses: { strength: 2, defense: 1 },
  },
  {
    key: "padded-vest",
    name: "Padded Vest",
    slot: "armor",
    tier: 1,
    rarity: "common",
    sources: ["scavenge"],
    craftable: true,
    recipe: { scrap: 45, rations: 12, components: 3 },
    bonuses: { resilience: 1, defense: 1 },
  },
  {
    key: "reinforced-plate",
    name: "Reinforced Plate",
    slot: "armor",
    tier: 2,
    rarity: "uncommon",
    sources: ["exploration"],
    craftable: true,
    recipe: { scrap: 140, components: 12, salvageCores: 1, credits: 30 },
    bonuses: { resilience: 2, defense: 1 },
  },
  {
    key: "warhound-armor",
    name: "Warhound Armor",
    slot: "armor",
    tier: 3,
    rarity: "legendary",
    sources: ["exploration"],
    bonuses: { resilience: 3, defense: 2 },
  },
];

const getEquipmentBonuses = () => {
  const bonuses = { strength: 0, awareness: 0, resilience: 0, defense: 0, tech: 0 };
  Object.values(state.equipment).forEach((item) => {
    if (!item) {
      return;
    }
    Object.entries(item.bonuses || {}).forEach(([key, value]) => {
      bonuses[key] = (bonuses[key] || 0) + value;
    });
  });
  return bonuses;
};

const getEffectiveStats = () => {
  const bonuses = getEquipmentBonuses();
  return Object.fromEntries(
    Object.entries(state.stats).map(([key, value]) => [key, value + (bonuses[key] || 0)])
  );
};

const rollRange = (min, max) => Math.round(min + Math.random() * (max - min));

const scavengingLoot = ({ multiplier = 1, duration = 60, source = "scavenge" }, stats = getEffectiveStats()) => {
  const strengthBonus = stats.strength * 0.12;
  const awarenessBonus = stats.awareness * 0.1;
  const durationFactor = Math.max(1, duration / 60);
  const baseScrap = 10 + durationFactor * 6;
  const baseCredits = 2 + durationFactor * 2;
  const baseComponentsChance = Math.min(0.25, 0.05 + durationFactor * 0.02 + awarenessBonus * 0.02);
  return {
    scrap: Math.round((baseScrap + Math.random() * (6 + strengthBonus * 8)) * multiplier),
    rations: Math.round((3 + Math.random() * (3 + awarenessBonus * 4)) * multiplier),
    water: Math.round((2 + Math.random() * (3 + awarenessBonus * 3)) * multiplier),
    credits: Math.random() < (source === "exploration" ? 0.45 : 0.3)
      ? Math.round((baseCredits + Math.floor(Math.random() * 4)) * multiplier)
      : 0,
    components: Math.random() < baseComponentsChance
      ? Math.round((1 + Math.random() * (1 + durationFactor * 0.5)) * multiplier)
      : 0,
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
    key: "canteen",
    label: "Canteen",
    description: "Turns scavenged supplies into steady rations.",
    unlocks: "Unlocks passive ration production.",
  },
  {
    key: "workshop",
    label: "Workshop",
    description: "Opens crafting and equipment upgrades.",
    unlocks: "Unlocks crafting and equipment slots.",
  },
  {
    key: "infirmary",
    label: "Infirmary",
    description: "Dedicated recovery ward for the crew.",
    unlocks: "Unlocks the Rest action for health recovery.",
  },
  {
    key: "outpost",
    label: "Outpost",
    description: "Launch expeditions to distant ruins.",
    unlocks: "Unlocks timed expeditions.",
  },
  {
    key: "garage",
    label: "Garage",
    description: "Workshop bay for vehicle upgrades.",
    unlocks: "Unlocks the Garage and vehicle construction.",
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

const rollSmallDrop = (baseChance) => {
  if (Math.random() >= baseChance) {
    return 0;
  }
  const bonus = Math.random() < 0.25 ? 1 : 0;
  return 1 + bonus;
};

const getItemTemplate = (key) => equipmentCatalog.find((item) => item.key === key);

const createItemInstance = (template) => ({
  id: `${template.key}-${crypto.randomUUID()}`,
  key: template.key,
  name: template.name,
  slot: template.slot,
  tier: template.tier,
  rarity: template.rarity,
  baseBonuses: { ...template.bonuses },
  bonuses: { ...template.bonuses },
});

const normalizeItem = (item) => {
  if (!item) {
    return null;
  }
  if (!item.baseBonuses) {
    item.baseBonuses = { ...(item.bonuses || {}) };
  }
  if (!item.bonuses) {
    item.bonuses = { ...item.baseBonuses };
  }
  if (!item.tier) {
    item.tier = 1;
  }
  return item;
};

const adjustItemTier = (item, tier) => {
  const multiplier = 1 + (tier - 1) * 0.35;
  item.tier = tier;
  item.bonuses = Object.fromEntries(
    Object.entries(item.baseBonuses).map(([key, value]) => [key, Math.ceil(value * multiplier)])
  );
};

const getMaxDropTier = (source, difficulty = 1) => {
  let tier = 1;
  if (state.level >= 4 || state.reputation >= 6 || difficulty >= 1.6) {
    tier = 2;
  }
  if (state.level >= 8 || state.reputation >= 14 || (source === "exploration" && state.vehicles.warRig.level > 0)) {
    tier = 3;
  }
  if (source === "scavenge") {
    return 1;
  }
  return tier;
};

const rollEquipmentDrop = (source, difficulty = 1) => {
  const baseChance = source === "exploration" ? 0.02 : 0.006;
  if (Math.random() > baseChance + difficulty * 0.004) {
    return null;
  }
  const maxTier = getMaxDropTier(source, difficulty);
  const pool = equipmentCatalog.filter(
    (item) => item.sources.includes(source) && item.tier <= maxTier
  );
  if (pool.length === 0) {
    return null;
  }
  const rarityWeights = {
    common: 60,
    uncommon: 25,
    rare: 12,
    legendary: 3,
  };
  const totalWeight = pool.reduce((sum, item) => sum + (rarityWeights[item.rarity] || 1), 0);
  let roll = Math.random() * totalWeight;
  const picked = pool.find((item) => {
    roll -= rarityWeights[item.rarity] || 1;
    return roll <= 0;
  }) || pool[0];
  return createItemInstance(picked);
};

const getUpgradeCost = (item) => ({
  scrap: 30 + item.tier * 20,
  components: 6 + item.tier * 4,
  credits: 10 + item.tier * 8,
  salvageCores: item.tier >= 2 ? 1 : 0,
});

const getBreakdownYield = (item) => ({
  components: 4 + item.tier * 3,
  scrap: 10 + item.tier * 6,
});

const manualScavengeAreas = [
  {
    key: "scrap-alley",
    label: "Scrap Alley",
    cost: 5,
    multiplier: 1,
    duration: 60,
    foodChance: 0.1,
    waterChance: 0.12,
    requirement: "Unlocks at Level 1.",
    unlock: () => state.level >= 1,
  },
  {
    key: "echo-yard",
    label: "Echo Yard",
    cost: 10,
    multiplier: 1.2,
    duration: 120,
    foodChance: 0.12,
    waterChance: 0.14,
    requirement: "Unlocks at Level 2 + Resilience 2.",
    unlock: () => state.level >= 2 && state.stats.resilience >= 2,
  },
  {
    key: "sunken-rail",
    label: "Sunken Rail Yard",
    cost: 18,
    multiplier: 1.4,
    duration: 180,
    foodChance: 0.14,
    waterChance: 0.16,
    requirement: "Unlocks at Level 3 + Strength 2.",
    unlock: () => state.level >= 3 && state.stats.strength >= 2,
  },
  {
    key: "market-bonefields",
    label: "Market Bonefields",
    cost: 22,
    multiplier: 1.7,
    duration: 270,
    foodChance: 0.16,
    waterChance: 0.18,
    requirement: "Unlocks at Level 4 + Awareness 3.",
    unlock: () => state.level >= 4 && state.stats.awareness >= 3,
  },
  {
    key: "radio-spire",
    label: "Radio Spire",
    cost: 24,
    multiplier: 1.9,
    duration: 360,
    foodChance: 0.18,
    waterChance: 0.2,
    requirement: "Unlocks at Level 5 + Tech 2.",
    unlock: () => state.level >= 5 && state.stats.tech >= 2,
  },
  {
    key: "overpass-gutters",
    label: "Overpass Gutters",
    cost: 26,
    multiplier: 2.1,
    duration: 540,
    foodChance: 0.2,
    waterChance: 0.22,
    requirement: "Unlocks at Level 6 + Defense 4.",
    unlock: () => state.level >= 6 && state.stats.defense >= 4,
  },
  {
    key: "crater-district",
    label: "Crater District",
    cost: 32,
    multiplier: 2.5,
    duration: 720,
    foodChance: 0.24,
    waterChance: 0.26,
    requirement: "Unlocks at Level 7 + Strength 5.",
    unlock: () => state.level >= 7 && state.stats.strength >= 5,
  },
];

const expeditionList = [
  {
    key: "service-tunnel",
    label: "Service Tunnel Sweep",
    duration: 300,
    lootMultiplier: 1.6,
    riskBase: 0.08,
    reward: "Steady scrap and rations.",
    requirement: "Unlocks at Level 2.",
    unlock: () => state.level >= 2,
  },
  {
    key: "glassway-haul",
    label: "Glassway Haul",
    duration: 900,
    lootMultiplier: 2.2,
    riskBase: 0.12,
    reward: "Longer haul with more supplies.",
    requirement: "Requires Dune Buggy + Level 5 + Awareness 4.",
    unlock: () => state.vehicles.duneBuggy.level > 0 && state.level >= 5 && state.stats.awareness >= 4,
  },
  {
    key: "stormfront-pass",
    label: "Stormfront Pass",
    duration: 1200,
    lootMultiplier: 2.6,
    riskBase: 0.16,
    reward: "Higher credits and salvage.",
    requirement: "Requires Battle Car + Level 4 + Defense 3.",
    unlock: () => state.vehicles.battleCar.level > 0 && state.level >= 4 && state.stats.defense >= 3,
  },
  {
    key: "dust-sea",
    label: "Dust Sea Relay",
    duration: 3600,
    lootMultiplier: 3.4,
    riskBase: 0.22,
    reward: "Chance at rare components.",
    requirement: "Requires War Rig + Level 7 + Resilience 4.",
    unlock: () => state.vehicles.warRig.level > 0 && state.level >= 7 && state.stats.resilience >= 4,
  },
  {
    key: "iron-wastes",
    label: "Iron Wastes Convoy",
    duration: 5400,
    lootMultiplier: 3.9,
    riskBase: 0.28,
    reward: "Major salvage and rare parts.",
    requirement: "Requires War Rig + Level 8 + Tech 4.",
    unlock: () => state.vehicles.warRig.level > 0 && state.level >= 8 && state.stats.tech >= 4,
  },
];

const workContracts = [
  {
    key: "courier",
    label: "Courier Route",
    duration: 1800,
    tier: "tier1",
    reward: { credits: [50, 90], reputation: 2, xp: [35, 55], water: [4, 8] },
    bonusDrops: {
      components: { chance: 0.05, range: [1, 1] },
    },
    requirement: "Unlocks at Level 1.",
    unlock: () => state.level >= 1,
  },
  {
    key: "salvage-guard",
    label: "Salvage Guard",
    duration: 3600,
    tier: "tier1",
    reward: { credits: [95, 150], reputation: 3, xp: [70, 110], scrap: [20, 40] },
    bonusDrops: {
      components: { chance: 0.12, range: [1, 2] },
    },
    requirement: "Unlocks at Level 2 + Defense 2.",
    unlock: () => state.level >= 2 && state.stats.defense >= 2,
  },
  {
    key: "water-runner",
    label: "Water Runner",
    duration: 2700,
    tier: "tier1",
    reward: { credits: [80, 130], reputation: 2, xp: [55, 90], water: [12, 20] },
    bonusDrops: {
      rations: { chance: 0.15, range: [6, 10] },
    },
    requirement: "Unlocks at Level 2 + Awareness 2.",
    unlock: () => state.level >= 2 && state.stats.awareness >= 2,
  },
  {
    key: "scrap-hauler",
    label: "Scrap Hauler",
    duration: 5400,
    tier: "tier2",
    reward: { credits: [160, 240], reputation: 3, xp: [110, 160], scrap: [60, 110] },
    bonusDrops: {
      components: { chance: 0.18, range: [2, 3] },
    },
    requirement: "Unlocks at Level 3 + Strength 3.",
    unlock: () => state.level >= 3 && state.stats.strength >= 3,
  },
  {
    key: "perimeter-watch",
    label: "Perimeter Watch",
    duration: 7200,
    tier: "tier2",
    reward: { credits: [200, 300], reputation: 4, xp: [140, 200], rations: [12, 20] },
    bonusDrops: {
      water: { chance: 0.2, range: [10, 16] },
    },
    requirement: "Unlocks at Level 4 + Defense 3.",
    unlock: () => state.level >= 4 && state.stats.defense >= 3,
  },
  {
    key: "canteen-supply",
    label: "Canteen Supply Run",
    duration: 9000,
    tier: "tier2",
    reward: { credits: [240, 360], reputation: 4, xp: [160, 230], rations: [24, 40], water: [14, 24] },
    bonusDrops: {
      components: { chance: 0.2, range: [2, 4] },
    },
    requirement: "Requires Canteen + Level 4 + Resilience 3.",
    unlock: () => state.facilities.canteen.level > 0 && state.level >= 4 && state.stats.resilience >= 3,
  },
  {
    key: "convoy-lead",
    label: "Convoy Lead",
    duration: 14400,
    tier: "tier3",
    reward: { credits: [380, 520], reputation: 6, xp: [240, 340], scrap: [110, 180], water: [20, 35] },
    bonusDrops: {
      components: { chance: 0.3, range: [3, 5] },
      salvageCores: { chance: 0.05, range: [1, 1] },
    },
    requirement: "Requires Battle Car + Level 5 + Strength 4.",
    unlock: () => state.vehicles.battleCar.level > 0 && state.level >= 5 && state.stats.strength >= 4,
  },
  {
    key: "outpost-escort",
    label: "Outpost Escort",
    duration: 18000,
    tier: "tier3",
    reward: { credits: [480, 680], reputation: 7, xp: [300, 420], water: [26, 45], rations: [18, 30] },
    bonusDrops: {
      components: { chance: 0.32, range: [3, 5] },
      salvageCores: { chance: 0.08, range: [1, 2] },
    },
    requirement: "Requires Outpost + Level 6 + Defense 5.",
    unlock: () => state.facilities.outpost.level > 0 && state.level >= 6 && state.stats.defense >= 5,
  },
  {
    key: "rig-haul",
    label: "War Rig Haul",
    duration: 28800,
    tier: "tier4",
    reward: { credits: [820, 1100], reputation: 10, xp: [480, 640], water: [60, 90], rations: [60, 90], scrap: [160, 240] },
    bonusDrops: {
      components: { chance: 0.45, range: [4, 7] },
      salvageCores: { chance: 0.15, range: [1, 2] },
    },
    requirement: "Requires War Rig + Level 8 + Strength 6.",
    unlock: () => state.vehicles.warRig.level > 0 && state.level >= 8 && state.stats.strength >= 6,
  },
];

const craftingList = [
  {
    key: "craft-scrap-bow",
    label: "Craft: Scrap Bow",
    cost: { scrap: 50, components: 4 },
    creates: "scrap-bow",
    recipe: "50 scrap, 4 components",
    duration: 90,
  },
  {
    key: "craft-spike-bat",
    label: "Craft: Spike Bat",
    cost: { scrap: 40, components: 3 },
    creates: "spike-bat",
    recipe: "40 scrap, 3 components",
    duration: 75,
  },
  {
    key: "craft-padded-vest",
    label: "Craft: Padded Vest",
    cost: { scrap: 45, rations: 12, components: 3 },
    creates: "padded-vest",
    recipe: "45 scrap, 12 rations, 3 components",
    duration: 110,
  },
  {
    key: "craft-handmade-rifle",
    label: "Craft: Handmade Rifle",
    cost: { scrap: 120, components: 12, salvageCores: 1, credits: 25 },
    creates: "handmade-rifle",
    recipe: "120 scrap, 12 components, 1 salvage core, 25 credits",
    duration: 180,
  },
  {
    key: "craft-cleaver-spear",
    label: "Craft: Cleaver Spear",
    cost: { scrap: 110, components: 10, salvageCores: 1, credits: 20 },
    creates: "cleaver-spear",
    recipe: "110 scrap, 10 components, 1 salvage core, 20 credits",
    duration: 165,
  },
  {
    key: "craft-reinforced-plate",
    label: "Craft: Reinforced Plate",
    cost: { scrap: 140, components: 12, salvageCores: 1, credits: 30 },
    creates: "reinforced-plate",
    recipe: "140 scrap, 12 components, 1 salvage core, 30 credits",
    duration: 200,
  },
];

const tradingList = [
  {
    key: "trade-scrap-credits",
    label: "Sell surplus scrap",
    offer: "Trade 30 scrap for 10 credits",
    cost: { scrap: 30 },
    gain: { credits: 10 },
    limitPerDay: 3,
  },
  {
    key: "trade-credits-water",
    label: "Buy water drums",
    offer: "Trade 15 credits for 20 water",
    cost: { credits: 15 },
    gain: { water: 20 },
    limitPerDay: 2,
  },
  {
    key: "trade-credits-rations",
    label: "Canteen bulk order",
    offer: "Trade 20 credits for 18 rations",
    cost: { credits: 20 },
    gain: { rations: 18 },
    limitPerDay: 2,
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
const energyTimer = document.getElementById("energyTimer");
const healthTimer = document.getElementById("healthTimer");
const repValue = document.getElementById("repValue");
const threatValue = document.getElementById("threatValue");

const resourceList = document.getElementById("resourceList");
const milestoneList = document.getElementById("milestoneList");
const manualScavengeList = document.getElementById("manualScavengeList");
const workList = document.getElementById("workList");
const workStatus = document.getElementById("workStatus");
const workButton = document.getElementById("workButton");
const trainingProgressFill = document.getElementById("trainingProgressFill");
const trainingProgressValue = document.getElementById("trainingProgressValue");
const scavengeProgressFill = document.getElementById("scavengeProgressFill");
const scavengeProgressValue = document.getElementById("scavengeProgressValue");
const workProgressFill = document.getElementById("workProgressFill");
const workProgressValue = document.getElementById("workProgressValue");

const rationValue = document.getElementById("rationValue");
const waterValue = document.getElementById("waterValue");
const scrapValue = document.getElementById("scrapValue");
const creditValue = document.getElementById("creditValue");
const componentValue = document.getElementById("componentValue");
const salvageCoreValue = document.getElementById("salvageCoreValue");
const rationNeedValue = document.getElementById("rationNeedValue");
const waterNeedValue = document.getElementById("waterNeedValue");
const upkeepStatus = document.getElementById("upkeepStatus");

const facilityList = document.getElementById("facilityList");
const trainingList = document.getElementById("trainingList");
const statList = document.getElementById("statList");

const expeditionLock = document.getElementById("expeditionLock");
const expeditionContainer = document.getElementById("expeditionList");
const garageLock = document.getElementById("garageLock");
const garageList = document.getElementById("garageList");
const craftingLock = document.getElementById("craftingLock");
const craftingContainer = document.getElementById("craftingList");
const craftingStatus = document.getElementById("craftingStatus");
const craftingProgressFill = document.getElementById("craftingProgressFill");
const craftingProgressValue = document.getElementById("craftingProgressValue");
const tradingLock = document.getElementById("tradingLock");
const tradingContainer = document.getElementById("tradingList");
const achievementList = document.getElementById("achievementList");
const activityLog = document.getElementById("activityLog");
const overviewOperations = document.getElementById("overviewOperations");
const restLock = document.getElementById("restLock");
const restButton = document.getElementById("restButton");
const restProgressFill = document.getElementById("restProgressFill");
const restProgressValue = document.getElementById("restProgressValue");
const inventoryList = document.getElementById("inventoryList");
const equipmentSlots = document.getElementById("equipmentSlots");
const materialList = document.getElementById("materialList");
const equipmentBonusSummary = document.getElementById("equipmentBonusSummary");

const formatNumber = (value) => Math.max(0, Math.floor(value));

const updateStatus = () => {
  energyValue.textContent = `${formatNumber(state.energy)}/${state.maxEnergy}`;
  healthValue.textContent = `${formatNumber(state.health)}/${state.maxHealth}`;
  xpValue.textContent = `${formatNumber(state.xp)}/${state.xpToNext} (Lv. ${state.level})`;
  repValue.textContent = formatNumber(state.reputation);
  threatValue.textContent = state.threat;

  energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
  healthFill.style.width = `${(state.health / state.maxHealth) * 100}%`;
  xpFill.style.width = `${(state.xp / state.xpToNext) * 100}%`;

  if (energyTimer) {
    energyTimer.textContent = state.energy < state.maxEnergy ? `+1 in ${formatCountdown(getNextTickMs())}` : "";
  }
  if (healthTimer) {
    healthTimer.textContent = state.health < state.maxHealth ? `+0.6 in ${formatCountdown(getNextTickMs())}` : "";
  }
};

const isInRecovery = () => state.health < state.recovery.targetHealth;

const updateResources = () => {
  const items = [
    { label: "Scrap", value: state.resources.scrap },
    { label: "Rations", value: state.resources.rations },
    { label: "Water", value: state.resources.water },
    { label: "Credits", value: state.resources.credits },
    { label: "Components", value: state.resources.components },
    { label: "Salvage Cores", value: state.resources.salvageCores },
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
  if (componentValue) {
    componentValue.textContent = formatNumber(state.resources.components);
  }
  if (salvageCoreValue) {
    salvageCoreValue.textContent = formatNumber(state.resources.salvageCores);
  }

  if (rationNeedValue && waterNeedValue && upkeepStatus) {
    rationNeedValue.textContent = state.upkeep.rationsPerDay;
    waterNeedValue.textContent = state.upkeep.waterPerDay;
    const hasFood = state.resources.rations >= state.upkeep.rationsPerDay;
    const hasWater = state.resources.water >= state.upkeep.waterPerDay;
    upkeepStatus.textContent = hasFood && hasWater ? "Stable" : "Shortages";
  }
};

const addLogEntry = (message) => {
  state.activityLog = state.activityLog || [];
  state.activityLog.unshift({ message, timestamp: Date.now() });
  state.activityLog = state.activityLog.slice(0, 6);
  updateActivityLog();
};

const getNextTickMs = () => {
  const intervalMs = 30000;
  const lastTick = state.lastTick || Date.now();
  const elapsed = Math.max(0, Date.now() - lastTick);
  return intervalMs - (elapsed % intervalMs);
};

const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
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
      label: "Open the Canteen to stabilize rations.",
      done: state.facilities.canteen.level > 0,
    },
    {
      label: "Unlock the Garage to start building vehicles.",
      done: state.facilities.garage.level > 0,
    },
    {
      label: "Save enough scrap to build the Workshop.",
      done: state.facilities.workshop.level > 0,
    },
    {
      label: "Establish the Infirmary for faster recovery.",
      done: state.facilities.infirmary.level > 0,
    },
    {
      label: "Establish the Outpost for explorations.",
      done: state.facilities.outpost.level > 0,
    },
    {
      label: "Build the War Rig for long-range expeditions.",
      done: state.vehicles.warRig.level > 0,
    },
  ];

  milestoneList.innerHTML = milestones
    .map(
      (item) => `<li><span>${item.label}</span><strong>${item.done ? "Done" : "Pending"}</strong></li>`
    )
    .join("");
};

const canAfford = (cost) =>
  Object.entries(cost).every(([key, value]) => (state.resources[key] ?? 0) >= value);

const spendResources = (cost) => {
  Object.entries(cost).forEach(([key, value]) => {
    state.resources[key] -= value;
  });
};

const getTierCooldownRemaining = (tierKey) =>
  Math.max(0, Math.ceil(((state.workCooldowns[tierKey] || 0) - Date.now()) / 1000));

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

const updateGarage = () => {
  if (state.facilities.garage.level === 0) {
    garageLock.textContent = "Build the Garage to unlock vehicle construction.";
    garageList.innerHTML = "";
    return;
  }
  garageLock.textContent = "";
  const vehicles = [
    {
      key: "battleCar",
      label: "Battle Car",
      description: "Armored starter vehicle for safer runs.",
      unlock: () => true,
    },
    {
      key: "duneBuggy",
      label: "Dune Buggy",
      description: "Faster scouting vehicle with better reach.",
      unlock: () => state.stats.awareness >= 4,
    },
    {
      key: "warRig",
      label: "War Rig",
      description: "Top-tier war machine for long-haul exploration.",
      unlock: () => state.stats.defense >= 5 && state.facilities.outpost.level > 0,
    },
  ];

  garageList.innerHTML = vehicles
    .map((vehicle) => {
      const current = state.vehicles[vehicle.key];
      const cost = vehicleCosts[vehicle.key];
      const upkeep = vehicleUpkeep[vehicle.key];
      const unlocked = vehicle.unlock();
      const affordable = canAfford(cost);
      const built = current.level > 0;
      return `
      <div class="garage-item">
        <div>
          <strong>${vehicle.label}</strong>
          <div class="muted">${vehicle.description}</div>
          <div class="muted">Cost: ${formatCost(cost)}</div>
          <div class="muted">Upkeep: ${formatCost(upkeep)}</div>
        </div>
        <button class="primary" ${built || !unlocked || !affordable ? "disabled" : ""}>
          ${built ? "Built" : unlocked ? "Build" : "Locked"}
        </button>
      </div>
    `;
    })
    .join("");

  if (state.vehiclePenalty.active) {
    garageList.insertAdjacentHTML(
      "beforeend",
      `<div class="garage-item garage-item--warning">
        <div>
          <strong>Vehicle Upkeep Shortage</strong>
          <div class="muted">Explorations suffer delays and reduced loot until upkeep is paid.</div>
        </div>
      </div>`
    );
  }

  garageList.querySelectorAll(".garage-item").forEach((item, index) => {
    const button = item.querySelector("button");
    const vehicle = vehicles[index];
    button.addEventListener("click", () => buildVehicle(vehicle.key));
  });
};

const buildVehicle = (key) => {
  const cost = vehicleCosts[key];
  if (!canAfford(cost) || state.vehicles[key].level > 0) {
    return;
  }
  spendResources(cost);
  state.vehicles[key].level = 1;
  addLogEntry(`Vehicle built: ${state.vehicles[key].label}.`);
  updateUI();
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
  const effectiveStats = getEffectiveStats();
  const bonuses = getEquipmentBonuses();
  trainingList.innerHTML = "";
  trainingData.forEach((training) => {
    const item = document.createElement("div");
    item.className = "training-item";
    const level = state.stats[training.key];
    const cost = 12 + level * 4;
    const duration = Math.max(25, 45 + level * 15 - (bonuses[training.key] || 0) * 6);
    const disabled = state.training.inProgress || state.energy < cost || state.rest.inProgress;

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
      ([key, value]) => {
        const bonus = bonuses[key] || 0;
        const label = bonus > 0 ? `${value} (+${bonus})` : `${value}`;
        return `<li><span>${key}</span><strong>${label}</strong></li>`;
      }
    )
    .join("");

  if (equipmentBonusSummary) {
    const summary = Object.entries(bonuses)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${key} +${value}`)
      .join(" · ");
    equipmentBonusSummary.textContent = summary.length > 0 ? `Equipped bonuses: ${summary}` : "";
  }

  if (state.training.inProgress) {
    const remaining = Math.max(0, Math.ceil((state.training.endsAt - Date.now()) / 1000));
    const duration = Math.max(1, state.training.duration || remaining);
    const progress = 1 - remaining / duration;
    trainingProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    trainingProgressValue.textContent = `${remaining}s remaining`;
  } else {
    trainingProgressFill.style.width = "0%";
    trainingProgressValue.textContent = "Idle";
  }
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
          const disabled = !unlocked || state.exploration.inProgress || state.rest.inProgress;
          const remaining = isActive
            ? Math.max(0, Math.ceil((state.exploration.endsAt - Date.now()) / 1000))
            : null;
          return `
      <div class="expedition-item">
        <div>
          <strong>${expedition.label}</strong>
          <div class="muted">Duration: ${expedition.duration}s</div>
          <div class="muted">Reward: ${expedition.reward}</div>
          <div class="muted">Risk: ${Math.round(expedition.riskBase * 100)}% baseline</div>
          <div class="muted">${expedition.requirement}</div>
        </div>
        <button class="primary" ${!disabled ? "" : "disabled"}>
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
  const craftingLocked = state.facilities.workshop.level === 0;
  if (craftingStatus) {
    craftingStatus.textContent = state.crafting.inProgress
      ? `Workshop busy: ${craftingList.find((item) => item.key === state.crafting.itemKey)?.label ?? "Crafting"}`
      : "Workshop idle.";
  }
  craftingContainer.innerHTML = state.facilities.workshop.level
    ? craftingList
        .map(
          (item) => {
            const affordable = canAfford(item.cost);
            const disabled = state.crafting.inProgress || !affordable;
            return `
      <div class="crafting-item">
        <div>
          <strong>${item.label}</strong>
          <div class="muted">Recipe: ${item.recipe}</div>
          <div class="muted">Time: ${item.duration}s</div>
        </div>
        <button class="primary" data-craft="${item.key}" ${disabled ? "disabled" : ""}>Craft</button>
      </div>
    `;
          }
        )
        .join("")
    : "";

  tradingLock.textContent =
    state.facilities.tradingPost.level > 0
      ? ""
      : "Build the Trading Post to unlock trading.";
  tradingContainer.innerHTML = state.facilities.tradingPost.level
    ? tradingList
        .map((item) => {
          const remaining = Math.max(0, item.limitPerDay - (state.tradingCounts[item.key] || 0));
          const affordable = canAfford(item.cost);
          return `
      <div class="trading-item">
        <div>
          <strong>${item.label}</strong>
          <div class="muted">${item.offer}</div>
          <div class="muted">Daily trades left: ${remaining}</div>
        </div>
        <button class="primary" data-trade="${item.key}" ${remaining === 0 || !affordable ? "disabled" : ""}>Trade</button>
      </div>
    `;
        })
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
        <button class="primary" ${unlocked && canAffordEnergy && !state.scavenging.inProgress && !state.rest.inProgress && !isInRecovery() ? "" : "disabled"}>
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
      const tier = workTiers[contract.tier];
      const tierUnlocked = state.reputation >= tier.minRep;
      const unlocked = contract.unlock() && tierUnlocked;
      const cooldownRemaining = getTierCooldownRemaining(contract.tier);
      const cooldownActive = cooldownRemaining > 0;
      const isSelected = state.work.key === contract.key;
      const rewardDisplay = (value, label) => {
        if (!value) {
          return null;
        }
        if (Array.isArray(value)) {
          return `${value[0]}-${value[1]} ${label}`;
        }
        return `${value} ${label}`;
      };
      const bonusDisplay = contract.bonusDrops
        ? Object.entries(contract.bonusDrops)
            .map(([key, bonus]) => `${Math.round(bonus.chance * 100)}% ${bonus.range[0]}-${bonus.range[1]} ${key}`)
            .join(", ")
        : null;
      const rewards = [
        rewardDisplay(contract.reward.credits, "credits"),
        rewardDisplay(contract.reward.rations, "rations"),
        rewardDisplay(contract.reward.water, "water"),
        rewardDisplay(contract.reward.scrap, "scrap"),
        rewardDisplay(contract.reward.xp, "xp"),
      ]
        .filter(Boolean)
        .join(", ");
      return `
      <div class="work-item">
        <div>
          <strong>${contract.label}</strong>
          <div class="muted">Duration: ${contract.duration}s</div>
          <div class="muted">Tier: ${tier.label}</div>
          <div class="muted">Reward: ${rewards}</div>
          ${bonusDisplay ? `<div class="muted">Bonus drops: ${bonusDisplay}</div>` : ""}
          <div class="muted">${contract.requirement}</div>
          ${tierUnlocked ? "" : `<div class="muted">Requires ${tier.minRep} reputation.</div>`}
          ${cooldownActive ? `<div class="muted">Cooldown: ${cooldownRemaining}s</div>` : ""}
        </div>
        <button class="primary" ${unlocked && !cooldownActive ? "" : "disabled"}>
          ${isSelected ? "Selected" : unlocked ? "Select" : "Locked"}
        </button>
      </div>
    `;
    })
    .join("");

  workList.querySelectorAll(".work-item").forEach((item, index) => {
    const button = item.querySelector("button");
    const contract = workContracts[index];
    button.addEventListener("click", () => {
      const tier = workTiers[contract.tier];
      const tierUnlocked = state.reputation >= tier.minRep;
      if (contract.unlock() && tierUnlocked && getTierCooldownRemaining(contract.tier) === 0) {
        selectWorkContract(contract.key);
      }
    });
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
    const selectedContract = state.work.key
      ? workContracts.find((c) => c.key === state.work.key)
      : null;
    const tierCooldown = selectedContract ? getTierCooldownRemaining(selectedContract.tier) : 0;
    workStatus.textContent = state.work.key
      ? tierCooldown > 0
        ? `Tier cooldown active: ${tierCooldown}s remaining.`
        : `Ready to start: ${selectedContract.label}.`
      : "Select a contract to begin.";
    workButton.disabled = !state.work.key || tierCooldown > 0 || state.rest.inProgress || isInRecovery();
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

const updateNavIndicators = () => {
  navButtons.forEach((button) => {
    const section = button.dataset.section;
    const isRunning =
      (section === "scavenge" && (state.scavenging.inProgress || state.rest.inProgress)) ||
      (section === "work" && state.work.inProgress) ||
      (section === "training" && state.training.inProgress) ||
      (section === "expeditions" && state.exploration.inProgress);
    button.classList.toggle("nav__item--running", isRunning);
  });
};

const updateOverviewOperations = () => {
  if (!overviewOperations) {
    return;
  }
  const entries = [];
  if (state.scavenging.inProgress) {
    entries.push("Scavenging run in progress.");
  }
  if (state.rest.inProgress) {
    entries.push("Resting in the infirmary.");
  }
  if (state.work.inProgress) {
    entries.push("Work contract active.");
  }
  if (state.training.inProgress) {
    entries.push("Training session underway.");
  }
  if (state.exploration.inProgress) {
    entries.push("Exploration team deployed.");
  }
  if (entries.length === 0) {
    entries.push("No active operations. Queue a scavenge or work contract.");
  }
  overviewOperations.innerHTML = entries
    .map((entry) => `<div class="activity-log__entry">${entry}</div>`)
    .join("");
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

const updateRest = () => {
  if (!restButton || !restProgressFill || !restProgressValue || !restLock) {
    return;
  }
  if (state.facilities.infirmary.level === 0) {
    restLock.textContent = "Build the Infirmary to unlock Rest.";
    restButton.disabled = true;
  } else {
    restLock.textContent = "";
    restButton.disabled =
      state.rest.inProgress ||
      state.scavenging.inProgress ||
      state.work.inProgress ||
      state.training.inProgress ||
      state.exploration.inProgress ||
      isInRecovery();
  }
  restButton.textContent = state.rest.inProgress ? "Resting..." : "Start Rest";

  if (state.rest.inProgress) {
    const remaining = Math.max(0, Math.ceil((state.rest.endsAt - Date.now()) / 1000));
    const duration = Math.max(1, state.rest.duration || remaining);
    const progress = 1 - remaining / duration;
    restProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    restProgressValue.textContent = `${remaining}s remaining`;
  } else {
    restProgressFill.style.width = "0%";
    restProgressValue.textContent = "Idle";
  }
};

const updateInventory = () => {
  if (!inventoryList || !equipmentSlots || !materialList) {
    return;
  }
  const slots = [
    { key: "ranged", label: "Ranged Weapon" },
    { key: "melee", label: "Melee Weapon" },
    { key: "armor", label: "Armor" },
  ];

  equipmentSlots.innerHTML = slots
    .map((slot) => {
      const item = state.equipment[slot.key];
      return `
      <div class="equipment-slot">
        <div>
          <strong>${slot.label}</strong>
          <div class="muted">${item ? formatItemName(item) : "Empty"}</div>
        </div>
        <button class="ghost" data-unequip="${slot.key}" ${item ? "" : "disabled"}>Unequip</button>
      </div>
    `;
    })
    .join("");

  materialList.innerHTML = [
    { label: "Scrap", value: state.resources.scrap },
    { label: "Rations", value: state.resources.rations },
    { label: "Water", value: state.resources.water },
    { label: "Components", value: state.resources.components },
    { label: "Salvage Cores", value: state.resources.salvageCores },
    { label: "Credits", value: state.resources.credits },
  ]
    .map(
      (item) => `<li><span>${item.label}</span><strong>${formatNumber(item.value)}</strong></li>`
    )
    .join("");

  if (state.inventory.length === 0) {
    inventoryList.innerHTML = `<div class="empty-state">No gear collected yet.</div>`;
    return;
  }

  inventoryList.innerHTML = state.inventory
    .map((item) => {
      const canUpgrade = state.facilities.workshop.level > 0 && item.tier < 3;
      const upgradeCost = getUpgradeCost(item);
      const upgradeAffordable = canAfford(upgradeCost);
      return `
      <div class="inventory-item">
        <div>
          <strong>${formatItemName(item)}</strong>
          <div class="muted">Slot: ${item.slot} · Tier ${item.tier} · ${item.rarity}</div>
          <div class="muted">Bonuses: ${formatBonuses(item.bonuses)}</div>
        </div>
        <div class="item-actions">
          <button class="primary" data-equip="${item.id}">Equip</button>
          <button class="ghost" data-breakdown="${item.id}">Breakdown</button>
          <button class="ghost" data-upgrade="${item.id}" ${canUpgrade && upgradeAffordable ? "" : "disabled"}>
            Upgrade (${formatCost(upgradeCost)})
          </button>
        </div>
      </div>
    `;
    })
    .join("");
};

const updateCraftingQueue = () => {
  if (!craftingProgressFill || !craftingProgressValue) {
    return;
  }
  if (state.crafting.inProgress) {
    const remaining = Math.max(0, Math.ceil((state.crafting.endsAt - Date.now()) / 1000));
    const duration = Math.max(1, state.crafting.duration || remaining);
    const progress = 1 - remaining / duration;
    craftingProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    craftingProgressValue.textContent = `${remaining}s remaining`;
  } else {
    craftingProgressFill.style.width = "0%";
    craftingProgressValue.textContent = "Idle";
  }
};

const formatItemName = (item) => `${item.name} +${item.tier}`;

const formatBonuses = (bonuses) =>
  Object.entries(bonuses)
    .map(([key, value]) => `${key} +${value}`)
    .join(", ");

const bindInventoryActions = () => {
  if (!inventoryList) {
    return;
  }
  inventoryList.querySelectorAll("[data-equip]").forEach((button) => {
    button.addEventListener("click", () => equipItem(button.dataset.equip));
  });
  inventoryList.querySelectorAll("[data-breakdown]").forEach((button) => {
    button.addEventListener("click", () => breakdownItem(button.dataset.breakdown));
  });
  inventoryList.querySelectorAll("[data-upgrade]").forEach((button) => {
    button.addEventListener("click", () => upgradeItem(button.dataset.upgrade));
  });
};

const bindEquipmentActions = () => {
  if (!equipmentSlots) {
    return;
  }
  equipmentSlots.querySelectorAll("[data-unequip]").forEach((button) => {
    button.addEventListener("click", () => unequipItem(button.dataset.unequip));
  });
};

const bindCraftingActions = () => {
  if (!craftingContainer) {
    return;
  }
  craftingContainer.querySelectorAll("[data-craft]").forEach((button) => {
    button.addEventListener("click", () => startCrafting(button.dataset.craft));
  });
};

const bindTradingActions = () => {
  if (!tradingContainer) {
    return;
  }
  tradingContainer.querySelectorAll("[data-trade]").forEach((button) => {
    button.addEventListener("click", () => executeTrade(button.dataset.trade));
  });
};

const equipItem = (itemId) => {
  const index = state.inventory.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return;
  }
  const item = state.inventory[index];
  const existing = state.equipment[item.slot];
  if (existing) {
    state.inventory.push(existing);
  }
  state.equipment[item.slot] = item;
  state.inventory.splice(index, 1);
  addLogEntry(`Equipped ${formatItemName(item)}.`);
  updateUI();
};

const unequipItem = (slot) => {
  const item = state.equipment[slot];
  if (!item) {
    return;
  }
  state.inventory.push(item);
  state.equipment[slot] = null;
  addLogEntry(`Unequipped ${formatItemName(item)}.`);
  updateUI();
};

const breakdownItem = (itemId) => {
  const index = state.inventory.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return;
  }
  const item = state.inventory[index];
  const yieldItems = getBreakdownYield(item);
  Object.entries(yieldItems).forEach(([key, value]) => {
    state.resources[key] += value;
  });
  state.inventory.splice(index, 1);
  addLogEntry(`Broke down ${formatItemName(item)} for components.`);
  updateUI();
};

const upgradeItem = (itemId) => {
  if (state.facilities.workshop.level === 0) {
    return;
  }
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item || item.tier >= 3) {
    return;
  }
  const cost = getUpgradeCost(item);
  if (!canAfford(cost)) {
    return;
  }
  spendResources(cost);
  adjustItemTier(item, item.tier + 1);
  addLogEntry(`Upgraded ${formatItemName(item)}.`);
  updateUI();
};

const startCrafting = (key) => {
  if (state.crafting.inProgress || state.facilities.workshop.level === 0) {
    return;
  }
  const recipe = craftingList.find((item) => item.key === key);
  if (!recipe || !canAfford(recipe.cost)) {
    return;
  }
  spendResources(recipe.cost);
  state.crafting.inProgress = true;
  state.crafting.duration = recipe.duration;
  state.crafting.endsAt = Date.now() + recipe.duration * 1000;
  state.crafting.itemKey = recipe.key;
  addLogEntry(`Workshop started: ${recipe.label}.`);
  updateUI();
};

const finishCrafting = () => {
  const recipe = craftingList.find((item) => item.key === state.crafting.itemKey);
  if (!recipe) {
    state.crafting.inProgress = false;
    return;
  }
  const template = getItemTemplate(recipe.creates);
  if (template) {
    const newItem = createItemInstance(template);
    state.inventory.push(newItem);
    addLogEntry(`Crafted ${formatItemName(newItem)}.`);
  }
  state.crafting.inProgress = false;
  state.crafting.duration = 0;
  state.crafting.itemKey = null;
  updateUI();
};

const executeTrade = (key) => {
  const trade = tradingList.find((item) => item.key === key);
  if (!trade) {
    return;
  }
  const used = state.tradingCounts[trade.key] || 0;
  if (used >= trade.limitPerDay || !canAfford(trade.cost)) {
    return;
  }
  spendResources(trade.cost);
  Object.entries(trade.gain).forEach(([resource, value]) => {
    state.resources[resource] += value;
  });
  state.tradingCounts[trade.key] = used + 1;
  addLogEntry(`Trade completed: ${trade.label}.`);
  updateUI();
};

const resetDailyTrades = () => {
  state.tradingCounts = Object.fromEntries(tradingList.map((item) => [item.key, 0]));
};

const startRest = () => {
  if (state.facilities.infirmary.level === 0 || state.rest.inProgress) {
    return;
  }
  if (state.scavenging.inProgress || state.work.inProgress || state.training.inProgress || state.exploration.inProgress || isInRecovery()) {
    return;
  }
  const duration = 90 + state.stats.resilience * 10;
  state.rest.inProgress = true;
  state.rest.duration = duration;
  state.rest.endsAt = Date.now() + duration * 1000;
  addLogEntry("Resting in the infirmary.");
  updateUI();
};

const finishRest = () => {
  const bonuses = getEquipmentBonuses();
  const healAmount = 18 + state.stats.resilience * 4 + (bonuses.resilience || 0) * 2;
  state.health = Math.min(state.maxHealth, state.health + healAmount);
  state.rest.inProgress = false;
  state.rest.duration = 0;
  addLogEntry(`Rest complete: +${Math.round(healAmount)} health.`);
  updateUI();
};

const startScavenge = (area) => {
  const unlocked = area.unlock ? area.unlock() : true;
  if (!unlocked || state.energy < area.cost || state.scavenging.inProgress || state.rest.inProgress || isInRecovery()) {
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
  const loot = scavengingLoot({ multiplier: area.multiplier, duration: area.duration, source: "scavenge" });
  Object.keys(loot).forEach((key) => {
    state.resources[key] += loot[key];
  });
  const rationDrop = rollSmallDrop(area.foodChance || 0);
  const waterDrop = rollSmallDrop(area.waterChance || 0);
  if (rationDrop > 0) {
    state.resources.rations += rationDrop;
    addLogEntry(`Found ${rationDrop} ration${rationDrop === 1 ? "" : "s"}.`);
  }
  if (waterDrop > 0) {
    state.resources.water += waterDrop;
    addLogEntry(`Found ${waterDrop} water bottle${waterDrop === 1 ? "" : "s"}.`);
  }
  const gearDrop = rollEquipmentDrop("scavenge", area.multiplier);
  if (gearDrop) {
    state.inventory.push(gearDrop);
    addLogEntry(`Rare find: ${formatItemName(gearDrop)} acquired.`);
  }
  const equipmentSlots = Object.values(state.equipment).filter(Boolean).length;
  const equipmentPenalty = equipmentSlots === 0 ? 0.18 : equipmentSlots === 1 ? 0.1 : 0.04;
  const baseInjuryChance = Math.min(0.35, 0.08 + state.level * 0.015);
  const effectiveStats = getEffectiveStats();
  const injuryChance = Math.max(0.04, baseInjuryChance + equipmentPenalty - effectiveStats.defense * 0.02);
  if (Math.random() < injuryChance) {
    const damage = Math.max(2, Math.round(4 + state.level * 0.6 + Math.random() * (5 + state.level * 0.4)));
    state.health = Math.max(0, state.health - damage);
    addLogEntry("Scavenge injury: took a bad hit in the wastes.");
    if (state.health <= 0) {
      state.recovery.inProgress = true;
      addLogEntry("Collapsed from injuries. Recovery required to reach 20 HP.");
    }
  }
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
  if (state.work.inProgress || !state.work.key || state.rest.inProgress || isInRecovery()) {
    return;
  }
  const contract = workContracts.find((item) => item.key === state.work.key);
  if (!contract) {
    return;
  }
  const tier = workTiers[contract.tier];
  const tierUnlocked = state.reputation >= tier.minRep;
  if (!contract.unlock() || !tierUnlocked || getTierCooldownRemaining(contract.tier) > 0) {
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
  const creditReward = Array.isArray(contract.reward.credits)
    ? rollRange(contract.reward.credits[0], contract.reward.credits[1])
    : (contract.reward.credits || 0);
  const xpReward = Array.isArray(contract.reward.xp)
    ? rollRange(contract.reward.xp[0], contract.reward.xp[1])
    : (contract.reward.xp || 0);
  const rationReward = Array.isArray(contract.reward.rations)
    ? rollRange(contract.reward.rations[0], contract.reward.rations[1])
    : (contract.reward.rations || 0);
  const waterReward = Array.isArray(contract.reward.water)
    ? rollRange(contract.reward.water[0], contract.reward.water[1])
    : (contract.reward.water || 0);
  const scrapReward = Array.isArray(contract.reward.scrap)
    ? rollRange(contract.reward.scrap[0], contract.reward.scrap[1])
    : (contract.reward.scrap || 0);

  state.resources.credits += creditReward;
  state.reputation += contract.reward.reputation || 0;
  if (rationReward) {
    state.resources.rations += rationReward;
  }
  if (waterReward) {
    state.resources.water += waterReward;
  }
  if (scrapReward) {
    state.resources.scrap += scrapReward;
  }
  if (contract.bonusDrops) {
    Object.entries(contract.bonusDrops).forEach(([key, bonus]) => {
      if (Math.random() < bonus.chance) {
        const amount = rollRange(bonus.range[0], bonus.range[1]);
        state.resources[key] = (state.resources[key] || 0) + amount;
        addLogEntry(`Work bonus: +${amount} ${key}.`);
      }
    });
  }
  addXp(xpReward);
  addLogEntry(`Work complete: +${creditReward} credits.`);
  const tierData = workTiers[contract.tier];
  if (tierData) {
    state.workCooldowns[contract.tier] = Date.now() + tierData.cooldownSeconds * 1000;
  }
  state.work.inProgress = false;
  state.work.duration = 0;
  updateUI();
};

const startExploration = (expedition) => {
  if (state.exploration.inProgress || !expedition.unlock() || state.rest.inProgress || isInRecovery()) {
    return;
  }
  const durationMultiplier = state.vehiclePenalty.active ? state.vehiclePenalty.durationMultiplier : 1;
  const lootMultiplier = state.vehiclePenalty.active ? state.vehiclePenalty.lootMultiplier : 1;
  state.exploration.inProgress = true;
  state.exploration.key = expedition.key;
  state.exploration.duration = Math.round(expedition.duration * durationMultiplier);
  state.exploration.endsAt = Date.now() + state.exploration.duration * 1000;
  state.exploration.lootMultiplier = lootMultiplier;
  addLogEntry(`Exploration started: ${expedition.label}.`);
  updateUI();
};

const finishExploration = () => {
  const expedition = expeditionList.find((item) => item.key === state.exploration.key);
  if (!expedition) {
    state.exploration.inProgress = false;
    return;
  }
  const effectiveDuration = state.exploration.duration || expedition.duration;
  const loot = scavengingLoot({
    multiplier: (expedition.lootMultiplier || 2.2) * (state.exploration.lootMultiplier || 1),
    duration: effectiveDuration,
    source: "exploration",
  });
  Object.keys(loot).forEach((key) => {
    state.resources[key] += loot[key];
  });
  const effectiveStats = getEffectiveStats();
  const statMitigation = (effectiveStats.defense + effectiveStats.resilience) * 0.015;
  const hazardChance = Math.max(0.06, (expedition.riskBase || 0.1) - statMitigation);
  if (Math.random() < hazardChance) {
    const damage = Math.max(3, Math.round(6 + effectiveDuration / 600 + state.level * 0.6));
    state.health = Math.max(0, state.health - damage);
    addLogEntry("Expedition hazard: injuries sustained.");
    if (state.health <= 0) {
      state.recovery.inProgress = true;
      addLogEntry("Collapsed on expedition. Recovery required to reach 20 HP.");
    }
  } else {
    const bonusChance = Math.min(0.35, 0.1 + (expedition.lootMultiplier || 2.2) * 0.05);
    if (Math.random() < bonusChance) {
      const bonusScrap = Math.round(10 + effectiveDuration / 300);
      state.resources.scrap += bonusScrap;
      addLogEntry(`Expedition bonus: +${bonusScrap} scrap.`);
    }
  }
  if (Math.random() < 0.18) {
    const cores = 1 + (Math.random() < 0.2 ? 1 : 0);
    state.resources.salvageCores += cores;
    addLogEntry(`Recovered ${cores} salvage core${cores === 1 ? "" : "s"}.`);
  }
  const gearDrop = rollEquipmentDrop("exploration", 2.5);
  if (gearDrop) {
    state.inventory.push(gearDrop);
    addLogEntry(`Recovered ${formatItemName(gearDrop)} from the ruins.`);
  }
  state.reputation += 2;
  addXp(20);
  state.achievements.firstExploration = true;
  addLogEntry(`Exploration complete: +${loot.scrap} scrap.`);
  state.exploration.inProgress = false;
  state.exploration.duration = 0;
  state.exploration.lootMultiplier = 1;
  updateUI();
};

const startTraining = (key, cost, duration) => {
  if (state.training.inProgress || state.energy < cost || state.rest.inProgress || isInRecovery()) {
    return;
  }
  state.energy -= cost;
  state.training.inProgress = true;
  state.training.statKey = key;
  state.training.endsAt = Date.now() + duration * 1000;
  state.training.duration = duration;
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
  state.training.duration = 0;
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
  if (state.rest.inProgress && Date.now() >= state.rest.endsAt) {
    finishRest();
  }
  if (state.crafting.inProgress && Date.now() >= state.crafting.endsAt) {
    finishCrafting();
  }
};

const passiveTick = (silent = false) => {
  state.energy = Math.min(state.maxEnergy, state.energy + 1);
  state.vehiclePenalty = { active: false, durationMultiplier: 1, lootMultiplier: 1 };
  if (state.facilities.waterStill.level > 0) {
    state.resources.water += 1;
  }
  if (state.facilities.canteen.level > 0) {
    state.resources.rations += 1;
  }
  if (state.resources.rations > 0 && state.resources.water > 0) {
    if (state.health < state.recovery.targetHealth) {
      state.health = Math.min(state.recovery.targetHealth, state.health + 0.4);
      if (state.health >= state.recovery.targetHealth && state.recovery.inProgress) {
        state.recovery.inProgress = false;
        addLogEntry("Recovered to 20 HP. Back on your feet.");
      }
    } else {
      state.health = Math.min(state.maxHealth, state.health + 0.6);
    }
  }
  const builtVehicles = Object.keys(state.vehicles).filter((key) => state.vehicles[key].level > 0);
  builtVehicles.forEach((vehicleKey) => {
    const upkeep = vehicleUpkeep[vehicleKey];
    if (!upkeep) {
      return;
    }
    if (canAfford(upkeep)) {
      spendResources(upkeep);
    } else {
      state.vehiclePenalty = { active: true, durationMultiplier: 1.2, lootMultiplier: 0.85 };
      if (!silent) {
        addLogEntry(`Vehicle upkeep missed for ${state.vehicles[vehicleKey].label}.`);
      }
    }
  });
  if (state.health < 30) {
    state.reputation = Math.max(0, state.reputation - 0.2);
  }
  updateUI();
};

const applyOfflineProgress = (now) => {
  const lastTick = state.lastTick || now;
  const intervalMs = 30000;
  const elapsed = Math.max(0, now - lastTick);
  const ticks = Math.floor(elapsed / intervalMs);
  if (ticks <= 0) {
    state.lastTick = now;
    return;
  }
  for (let i = 0; i < ticks; i += 1) {
    passiveTick(true);
  }
  const lastUpkeep = state.lastUpkeep || now;
  const upkeepInterval = 60 * 60 * 1000;
  const upkeepElapsed = Math.max(0, now - lastUpkeep);
  const upkeepTicks = Math.floor(upkeepElapsed / upkeepInterval);
  if (upkeepTicks > 0) {
    for (let i = 0; i < upkeepTicks; i += 1) {
      applyDailyUpkeep(true);
    }
    state.lastUpkeep = now;
    addLogEntry(`Offline upkeep applied: ${upkeepTicks} hour${upkeepTicks === 1 ? "" : "s"}.`);
  }
  updateTimers();
  addLogEntry(`Offline progress applied: ${ticks} tick${ticks === 1 ? "" : "s"} completed.`);
  state.lastTick = now;
  updateUI();
};

const updateUpkeepScaling = () => {
  const levelFactor = Math.floor(state.level / 4);
  state.upkeep.rationsPerDay = 1 + levelFactor;
  state.upkeep.waterPerDay = 1 + levelFactor;
};

const applyDailyUpkeep = (silent = false) => {
  updateUpkeepScaling();
  const needsRations = state.upkeep.rationsPerDay;
  const needsWater = state.upkeep.waterPerDay;
  const hasRations = state.resources.rations >= needsRations;
  const hasWater = state.resources.water >= needsWater;
  if (hasRations) {
    state.resources.rations -= needsRations;
  }
  if (hasWater) {
    state.resources.water -= needsWater;
  }
  if (!hasRations || !hasWater) {
    const penalty = (!hasRations && !hasWater) ? 4 : 2;
    state.health = Math.max(0, state.health - penalty);
    state.reputation = Math.max(0, state.reputation - 1);
    state.threat = Math.min(10, state.threat + 1);
    if (!silent) {
      addLogEntry("Hourly shortages hit the camp. Morale and health drop.");
    }
    if (state.health === 0 && !state.recovery.inProgress) {
      state.recovery.inProgress = true;
      addLogEntry("Collapsed from shortages. Recovery required to reach 20 HP.");
    }
  }
};

const updateUI = () => {
  updateStatus();
  updateResources();
  updateMilestones();
  updateFacilities();
  updateGarage();
  updateTraining();
  updateLockedSections();
  updateRest();
  updateCraftingQueue();
  updateManualScavenge();
  updateWork();
  updateExplorationButtons();
  updateNavIndicators();
  updateOverviewOperations();
  updateActivityLog();
  updateAchievements();
  updateInventory();
  bindInventoryActions();
  bindEquipmentActions();
  bindCraftingActions();
  bindTradingActions();
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
  state.lastTick = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadGame = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    state.energy = state.maxEnergy;
    state.health = state.maxHealth;
    state.lastTick = Date.now();
    state.inventory = [
      createItemInstance(getItemTemplate("broken-knife")),
      createItemInstance(getItemTemplate("tattered-leather-armor")),
    ];
    saveGame();
    return;
  }
  const parsed = JSON.parse(saved);
  Object.assign(state, parsed);
  state.activityLog = state.activityLog || [];
  state.resources = state.resources || { scrap: 0, rations: 0, water: 0, credits: 0, components: 0 };
  state.resources.components = state.resources.components || 0;
  state.resources.salvageCores = state.resources.salvageCores || 0;
  state.vehicles = state.vehicles || {
    battleCar: { level: 0, label: "Battle Car" },
    duneBuggy: { level: 0, label: "Dune Buggy" },
    warRig: { level: 0, label: "War Rig" },
  };
  state.facilities.garage = state.facilities.garage || { level: 0, label: "Garage" };
  state.facilities.canteen = state.facilities.canteen || { level: 0, label: "Canteen" };
  state.facilities.infirmary = state.facilities.infirmary || { level: 0, label: "Infirmary" };
  state.upkeep = state.upkeep || { rationsPerDay: 1, waterPerDay: 1 };
  state.rest = state.rest || { inProgress: false, endsAt: 0, duration: 0 };
  state.crafting = state.crafting || { inProgress: false, endsAt: 0, duration: 0, itemKey: null };
  state.recovery = state.recovery || { inProgress: false, targetHealth: 20 };
  state.lastTick = state.lastTick || Date.now();
  state.lastUpkeep = state.lastUpkeep || Date.now();
  state.exploration.lootMultiplier = state.exploration.lootMultiplier || 1;
  state.workCooldowns = state.workCooldowns || {};
  state.tradingCounts = state.tradingCounts || Object.fromEntries(tradingList.map((item) => [item.key, 0]));
  state.vehiclePenalty = state.vehiclePenalty || { active: false, durationMultiplier: 1, lootMultiplier: 1 };
  state.inventory = state.inventory || [];
  state.equipment = state.equipment || { ranged: null, melee: null, armor: null };
  state.inventory = state.inventory.map((item) => normalizeItem(item)).filter(Boolean);
  Object.keys(state.equipment).forEach((slot) => {
    state.equipment[slot] = normalizeItem(state.equipment[slot]);
  });
  applyOfflineProgress(Date.now());
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => handleNavigation(button.dataset.section));
});

document.querySelectorAll("[data-section-target]").forEach((button) => {
  button.addEventListener("click", () => handleNavigation(button.dataset.sectionTarget));
});

workButton.addEventListener("click", startWorkContract);
if (restButton) {
  restButton.addEventListener("click", startRest);
}

window.addEventListener("beforeunload", saveGame);

loadGame();
if (!state.tradingCounts || Object.keys(state.tradingCounts).length === 0) {
  resetDailyTrades();
}
updateUI();

setInterval(() => {
  updateTimers();
  updateLockedSections();
  updateWork();
  updateExplorationButtons();
  updateGarage();
  updateNavIndicators();
  updateOverviewOperations();
  updateTraining();
  if (state.scavenging.inProgress) {
    const remaining = Math.max(0, Math.ceil((state.scavenging.endsAt - Date.now()) / 1000));
    const progress = 1 - remaining / state.scavenging.duration;
    scavengeProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    scavengeProgressValue.textContent = `${remaining}s remaining`;
  } else {
    scavengeProgressFill.style.width = "0%";
    scavengeProgressValue.textContent = "Idle";
  }
  updateCraftingQueue();
  if (state.rest.inProgress) {
    const remaining = Math.max(0, Math.ceil((state.rest.endsAt - Date.now()) / 1000));
    const progress = 1 - remaining / state.rest.duration;
    restProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    restProgressValue.textContent = `${remaining}s remaining`;
  } else if (restProgressFill && restProgressValue) {
    restProgressFill.style.width = "0%";
    restProgressValue.textContent = "Idle";
  }
}, 1000);

setInterval(() => {
  passiveTick();
  const now = Date.now();
  const upkeepInterval = 60 * 60 * 1000;
  if (now - state.lastUpkeep >= upkeepInterval) {
    const ticks = Math.floor((now - state.lastUpkeep) / upkeepInterval);
    for (let i = 0; i < ticks; i += 1) {
      applyDailyUpkeep();
    }
    state.lastUpkeep = now;
  }
  resetDailyTrades();
  saveGame();
}, 30000);
