const { useEffect, useMemo, useState } = React;

const STORAGE_KEY = "wasteland-reavers-save";

const BUILDINGS = [
  {
    id: "scrapyard",
    name: "Scrapyard",
    description: "Turns abandoned steel into usable scrap and basic credits.",
    unlocks: ["expeditions"],
    baseCost: { scrap: 40, rations: 10 },
    outputs: { scrap: 2, credits: 1 },
    time: 120,
  },
  {
    id: "workshop",
    name: "Makeshift Workshop",
    description: "Opens crafting and converts scrap into components.",
    unlocks: ["crafting"],
    baseCost: { scrap: 120, components: 30, credits: 20 },
    outputs: { components: 1 },
    time: 240,
  },
  {
    id: "habitat",
    name: "Habitat Pods",
    description: "Houses survivors, increasing passive rations and crew cap.",
    unlocks: ["crew"],
    baseCost: { scrap: 200, rations: 80, credits: 60 },
    outputs: { rations: 2 },
    time: 360,
  },
  {
    id: "garage",
    name: "Wasteland Garage",
    description: "Enables vehicle acquisition and boosts expedition safety.",
    unlocks: ["vehicles"],
    baseCost: { scrap: 360, components: 120, fuel: 80, credits: 120 },
    outputs: { fuel: 1 },
    time: 480,
  },
  {
    id: "market",
    name: "Trade Market",
    description: "Unlocks trading mechanics and reputation gains.",
    unlocks: ["trading"],
    baseCost: { scrap: 520, credits: 200, water: 120 },
    outputs: { reputation: 0.3 },
    time: 600,
  },
  {
    id: "command",
    name: "Warlord Command",
    description: "Opens long expeditions, strategic ops, and prestige systems.",
    unlocks: ["operations"],
    baseCost: { scrap: 900, components: 400, credits: 400, reputation: 80 },
    outputs: { influence: 0.2 },
    time: 900,
  },
];

const EXPEDITIONS = [
  {
    id: "ruined-arcade",
    name: "Ruined Arcade",
    risk: "Low",
    duration: 90,
    unlock: "scrapyard",
    rewards: { scrap: 35, rations: 20, credits: 12 },
  },
  {
    id: "derelict-train",
    name: "Derelict Train",
    risk: "Medium",
    duration: 180,
    unlock: "workshop",
    rewards: { scrap: 80, components: 20, water: 25, credits: 30 },
  },
  {
    id: "sunken-refinery",
    name: "Sunken Refinery",
    risk: "High",
    duration: 300,
    unlock: "garage",
    rewards: { fuel: 60, components: 45, credits: 80, reputation: 6 },
  },
  {
    id: "dust-ruins",
    name: "Dust Ruins",
    risk: "Extreme",
    duration: 420,
    unlock: "market",
    rewards: { relics: 4, reputation: 12, credits: 160, water: 80 },
  },
  {
    id: "radio-summit",
    name: "Radio Summit",
    risk: "Epic",
    duration: 720,
    unlock: "command",
    rewards: { relics: 8, influence: 4, credits: 260 },
  },
];

const CRAFTING_RECIPES = [
  {
    id: "rebar-blade",
    name: "Rebar Blade",
    type: "Weapon",
    cost: { scrap: 60, components: 20 },
    time: 120,
    effect: "Boosts scavenging yield by 8%.",
  },
  {
    id: "seal-armor",
    name: "Seal Armor",
    type: "Armor",
    cost: { scrap: 120, components: 35, rations: 25 },
    time: 200,
    effect: "Reduces expedition risk by 6%.",
  },
  {
    id: "signal-kit",
    name: "Signal Amplifier",
    type: "Utility",
    cost: { components: 50, credits: 40, water: 20 },
    time: 240,
    effect: "Unlocks bonus trade deals.",
  },
  {
    id: "fusion-core",
    name: "Fusion Core",
    type: "Vehicle",
    cost: { fuel: 120, components: 80, relics: 2 },
    time: 360,
    effect: "Required to craft mid-tier vehicles.",
  },
];

const VEHICLES = [
  {
    id: "scout-bike",
    name: "Scout Bike",
    cost: { scrap: 200, fuel: 80, components: 40 },
    time: 240,
    bonus: "Expedition duration reduced by 10%.",
  },
  {
    id: "hauler-rig",
    name: "Hauler Rig",
    cost: { scrap: 420, fuel: 200, components: 90, credits: 120 },
    time: 420,
    bonus: "Expedition haul increased by 18%.",
  },
  {
    id: "dune-crawler",
    name: "Dune Crawler",
    cost: { scrap: 600, fuel: 320, components: 140, relics: 4 },
    time: 540,
    bonus: "Unlocks expedition auto-repeat.",
  },
];

const TRADES = [
  {
    id: "ration-exchange",
    name: "Ration Exchange",
    description: "Trade water for preserved rations.",
    cost: { water: 40 },
    reward: { rations: 60, reputation: 2 },
  },
  {
    id: "credit-broker",
    name: "Credit Broker",
    description: "Swap relics for hardened credits.",
    cost: { relics: 2 },
    reward: { credits: 120, reputation: 5 },
  },
  {
    id: "fuel-convoy",
    name: "Fuel Convoy",
    description: "Exchange credits for high grade fuel.",
    cost: { credits: 80 },
    reward: { fuel: 70, reputation: 1 },
  },
];

const ACHIEVEMENTS = [
  {
    id: "scrap-100",
    title: "Hoarder of Rust",
    description: "Accumulate 100 scrap.",
    check: (state) => state.resources.scrap >= 100,
  },
  {
    id: "expedition-5",
    title: "Dust Runner",
    description: "Complete 5 expeditions.",
    check: (state) => state.stats.expeditions >= 5,
  },
  {
    id: "build-3",
    title: "Settlement Core",
    description: "Construct 3 facilities.",
    check: (state) => state.stats.buildings >= 3,
  },
  {
    id: "craft-2",
    title: "Forge Master",
    description: "Craft 2 pieces of equipment.",
    check: (state) => state.stats.crafts >= 2,
  },
  {
    id: "trade-3",
    title: "Market Whisperer",
    description: "Complete 3 trade deals.",
    check: (state) => state.stats.trades >= 3,
  },
];

const SECTION_LIST = [
  { id: "overview", label: "Overview" },
  { id: "scavenge", label: "Scavenge" },
  { id: "base", label: "Base" },
  { id: "rpg", label: "Wasteland Ops" },
  { id: "expeditions", label: "Expeditions" },
  { id: "crafting", label: "Crafting" },
  { id: "vehicles", label: "Vehicles" },
  { id: "trading", label: "Trading" },
  { id: "achievements", label: "Achievements" },
];

const FACTIONS = [
  {
    id: "dust-vipers",
    name: "Dust Vipers",
    focus: "Raiders who respect strength and decisive strikes.",
  },
  {
    id: "sundered-scribes",
    name: "Sundered Scribes",
    focus: "Archivists hunting pre-fall tech and rumors.",
  },
  {
    id: "iron-saints",
    name: "Iron Saints",
    focus: "A zealous militia protecting caravans and water wells.",
  },
];

const CONTRACTS = [
  {
    id: "convoy-escort",
    name: "Convoy Escort",
    summary: "Protect a caravan crossing the Salt Flats.",
    duration: 210,
    requirements: { crew: 3, vehicles: 1 },
    reward: { credits: 90, rations: 40, reputation: 4 },
    faction: "iron-saints",
    narrative: "The Iron Saints will owe you a favor if the cargo survives.",
  },
  {
    id: "relic-recovery",
    name: "Relic Recovery",
    summary: "Dive into a collapsed vault and return with artifacts.",
    duration: 260,
    requirements: { gear: 1, crafting: true },
    reward: { relics: 3, components: 35, reputation: 6 },
    faction: "sundered-scribes",
    narrative: "The Scribes pay well for anything that still hums.",
  },
  {
    id: "viper-strike",
    name: "Viper Strike",
    summary: "Lead a hit-and-run raid against a rival gang.",
    duration: 300,
    requirements: { vehicles: 1, crew: 4 },
    reward: { scrap: 140, fuel: 60, reputation: 5, influence: 1 },
    faction: "dust-vipers",
    narrative: "Survive the raid and the Vipers whisper your name with respect.",
  },
];

const initialState = {
  resources: {
    scrap: 60,
    rations: 40,
    water: 30,
    components: 10,
    fuel: 0,
    credits: 20,
    reputation: 0,
    relics: 0,
    influence: 0,
  },
  buildings: {},
  unlocked: {
    expeditions: false,
    crafting: false,
    vehicles: false,
    trading: false,
    operations: false,
  },
  activeBuilds: [],
  activeCrafts: [],
  activeExpeditions: [],
  vehicles: [],
  equipment: [],
  stats: {
    expeditions: 0,
    buildings: 0,
    crafts: 0,
    trades: 0,
    contracts: 0,
  },
  achievements: [],
  character: {
    name: "Nomad Captain",
    grit: 1,
    savvy: 1,
    tactics: 1,
    skillPoints: 2,
  },
  factionReputation: {
    "dust-vipers": 0,
    "sundered-scribes": 0,
    "iron-saints": 0,
  },
  storyLog: [
    "You arrive at the Rustline with a battered crew and a promise to build something lasting.",
  ],
  activeContracts: [],
  lastTick: Date.now(),
};

const formatNumber = (value) => Math.floor(value).toLocaleString();

const formatTime = (seconds) => {
  if (seconds <= 0) return "Complete";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const applyResourceDelta = (state, delta) => {
  const resources = { ...state.resources };
  Object.entries(delta).forEach(([key, value]) => {
    resources[key] = (resources[key] || 0) + value;
  });
  return { ...state, resources };
};

const canAfford = (resources, cost) =>
  Object.entries(cost).every(([key, value]) => (resources[key] || 0) >= value);

const spendResources = (state, cost) => {
  const resources = { ...state.resources };
  Object.entries(cost).forEach(([key, value]) => {
    resources[key] = (resources[key] || 0) - value;
  });
  return { ...state, resources };
};

const calculateProgress = (endTime, duration) => {
  const now = Date.now();
  const elapsed = Math.max(0, now - (endTime - duration * 1000));
  return Math.min(100, (elapsed / (duration * 1000)) * 100);
};

const h = React.createElement;

const App = () => {
  const [section, setSection] = useState("overview");
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    return { ...initialState, ...parsed };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        const deltaSeconds = Math.max(1, Math.floor((now - prev.lastTick) / 1000));
        let next = { ...prev, lastTick: now };

        if (deltaSeconds > 0) {
          const buildingOutputs = BUILDINGS.reduce((acc, building) => {
            const count = prev.buildings[building.id] || 0;
            if (!count) return acc;
            Object.entries(building.outputs).forEach(([key, value]) => {
              acc[key] = (acc[key] || 0) + value * count * deltaSeconds;
            });
            return acc;
          }, {});
          next = applyResourceDelta(next, buildingOutputs);
        }

        const updateTimers = (items) =>
          items.map((item) => ({
            ...item,
            remaining: Math.max(0, item.endTime - now),
          }));

        next.activeBuilds = updateTimers(prev.activeBuilds);
        next.activeCrafts = updateTimers(prev.activeCrafts);
        next.activeExpeditions = updateTimers(prev.activeExpeditions);
        next.activeContracts = updateTimers(prev.activeContracts);

        const completedBuilds = next.activeBuilds.filter((item) => item.remaining <= 0);
        if (completedBuilds.length) {
          completedBuilds.forEach((build) => {
            next.buildings[build.id] = (next.buildings[build.id] || 0) + 1;
            next.stats.buildings += 1;
            const building = BUILDINGS.find((entry) => entry.id === build.id);
            building.unlocks.forEach((unlock) => {
              next.unlocked[unlock] = true;
            });
          });
          next.activeBuilds = next.activeBuilds.filter((item) => item.remaining > 0);
        }

        const completedCrafts = next.activeCrafts.filter((item) => item.remaining <= 0);
        if (completedCrafts.length) {
          completedCrafts.forEach((craft) => {
            if (craft.type === "vehicle") {
              next.vehicles = [...new Set([...next.vehicles, craft.id])];
              return;
            }
            next.equipment = [...next.equipment, craft.id];
            next.stats.crafts += 1;
          });
          next.activeCrafts = next.activeCrafts.filter((item) => item.remaining > 0);
        }

        const completedExpeditions = next.activeExpeditions.filter((item) => item.remaining <= 0);
        if (completedExpeditions.length) {
          completedExpeditions.forEach((expedition) => {
            next = applyResourceDelta(next, expedition.rewards);
            next.stats.expeditions += 1;
          });
          next.activeExpeditions = next.activeExpeditions.filter((item) => item.remaining > 0);
        }

        const completedContracts = next.activeContracts.filter((item) => item.remaining <= 0);
        if (completedContracts.length) {
          completedContracts.forEach((contract) => {
            next = applyResourceDelta(next, contract.rewards);
            next.stats.contracts += 1;
            next.factionReputation[contract.faction] += contract.reputation;
            next.storyLog = [
              `${contract.name} completed — ${contract.summary}`,
              ...next.storyLog,
            ].slice(0, 8);
          });
          next.activeContracts = next.activeContracts.filter((item) => item.remaining > 0);
        }

        const newAchievements = ACHIEVEMENTS.filter(
          (achievement) =>
            !next.achievements.includes(achievement.id) && achievement.check(next)
        ).map((achievement) => achievement.id);

        if (newAchievements.length) {
          next.achievements = [...next.achievements, ...newAchievements];
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const scavengeResources = () => {
    const bonus = state.equipment.length * 0.02;
    const gains = {
      scrap: Math.round(18 * (1 + bonus)),
      rations: Math.round(8 * (1 + bonus)),
      water: Math.round(6 * (1 + bonus)),
      credits: Math.round(4 * (1 + bonus)),
    };
    setState((prev) => applyResourceDelta(prev, gains));
  };

  const startBuild = (building) => {
    if (!canAfford(state.resources, building.baseCost)) return;
    setState((prev) => {
      const next = spendResources(prev, building.baseCost);
      return {
        ...next,
        activeBuilds: [
          ...next.activeBuilds,
          {
            id: building.id,
            name: building.name,
            endTime: Date.now() + building.time * 1000,
            duration: building.time,
            remaining: building.time * 1000,
          },
        ],
      };
    });
  };

  const startCraft = (recipe) => {
    if (!canAfford(state.resources, recipe.cost)) return;
    setState((prev) => {
      const next = spendResources(prev, recipe.cost);
      return {
        ...next,
        activeCrafts: [
          ...next.activeCrafts,
          {
            id: recipe.id,
            name: recipe.name,
            endTime: Date.now() + recipe.time * 1000,
            duration: recipe.time,
            remaining: recipe.time * 1000,
          },
        ],
      };
    });
  };

  const startVehicle = (vehicle) => {
    if (!canAfford(state.resources, vehicle.cost)) return;
    setState((prev) => {
      const next = spendResources(prev, vehicle.cost);
      return {
        ...next,
        activeCrafts: [
          ...next.activeCrafts,
          {
            id: vehicle.id,
            name: vehicle.name,
            endTime: Date.now() + vehicle.time * 1000,
            duration: vehicle.time,
            remaining: vehicle.time * 1000,
            type: "vehicle",
          },
        ],
      };
    });
  };

  const launchExpedition = (expedition) => {
    setState((prev) => ({
      ...prev,
      activeExpeditions: [
        ...prev.activeExpeditions,
        {
          id: expedition.id,
          name: expedition.name,
          rewards: expedition.rewards,
          endTime: Date.now() + expedition.duration * 1000,
          duration: expedition.duration,
          remaining: expedition.duration * 1000,
        },
      ],
    }));
  };

  const executeTrade = (trade) => {
    if (!canAfford(state.resources, trade.cost)) return;
    setState((prev) => {
      const next = spendResources(prev, trade.cost);
      next.stats.trades += 1;
      return applyResourceDelta(next, trade.reward);
    });
  };

  const isUnlocked = (buildingId) => (state.buildings[buildingId] || 0) > 0;

  const longTermProjection = useMemo(() => {
    const baseGain = BUILDINGS.reduce((acc, building) => {
      const count = state.buildings[building.id] || 0;
      Object.entries(building.outputs).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value * count;
      });
      return acc;
    }, {});

    return Object.entries(baseGain).map(([key, value]) => ({
      name: key,
      amount: value,
    }));
  }, [state.buildings]);

  const crewCap = 3 + (state.buildings.habitat || 0) * 2;
  const ownedVehicles = state.vehicles.length;

  const canTakeContract = (contract) => {
    if (contract.requirements.crew && crewCap < contract.requirements.crew) return false;
    if (contract.requirements.vehicles && ownedVehicles < contract.requirements.vehicles) return false;
    if (contract.requirements.gear && state.equipment.length < contract.requirements.gear) return false;
    if (contract.requirements.crafting && !state.unlocked.crafting) return false;
    return true;
  };

  const startContract = (contract) => {
    if (!canTakeContract(contract)) return;
    setState((prev) => ({
      ...prev,
      activeContracts: [
        ...prev.activeContracts,
        {
          id: contract.id,
          name: contract.name,
          summary: contract.summary,
          endTime: Date.now() + contract.duration * 1000,
          duration: contract.duration,
          remaining: contract.duration * 1000,
          rewards: contract.reward,
          reputation: contract.reward.reputation || 0,
          faction: contract.faction,
        },
      ],
    }));
  };

  const spendSkillPoint = (stat) => {
    if (state.character.skillPoints <= 0) return;
    setState((prev) => ({
      ...prev,
      character: {
        ...prev.character,
        [stat]: prev.character[stat] + 1,
        skillPoints: prev.character.skillPoints - 1,
      },
    }));
  };

  const renderTag = (text) => h("span", { className: "tag" }, text);

  return h(
    React.Fragment,
    null,
    h(
      "aside",
      { className: "sidebar" },
      h(
        "div",
        { className: "brand" },
        "Wasteland ",
        h("span", null, "Reavers")
      ),
      h(
        "div",
        { className: "nav-group" },
        SECTION_LIST.map((item) =>
          h(
            "button",
            {
              key: item.id,
              className: `nav-button ${section === item.id ? "active" : ""}`,
              onClick: () => setSection(item.id),
            },
            item.label
          )
        )
      ),
      h(
        "div",
        { className: "card" },
        h("h3", null, "Empire Status"),
        h("p", null, `Base tier: ${Object.keys(state.buildings).length + 1}`),
        h("p", null, `Expeditions completed: ${state.stats.expeditions}`),
        h("p", null, `Equipment crafted: ${state.stats.crafts}`),
        h(
          "div",
          { className: "taglist" },
          state.unlocked.operations
            ? renderTag("Long Ops Ready")
            : renderTag("Early Settlement"),
          state.vehicles.length > 0 ? renderTag("Vehicle Fleet") : renderTag("No Vehicles")
        )
      )
    ),
    h(
      "main",
      { className: "main" },
      h(
        "div",
        { className: "topbar" },
        h(
          "div",
          { className: "resource-bar" },
          Object.entries(state.resources).map(([key, value]) =>
            h(
              "div",
              { key, className: "resource" },
              h("label", null, key),
              h("strong", null, formatNumber(value))
            )
          )
        )
      ),
      h(
        "div",
        { className: "content" },
        section === "overview"
          ? h(
              "div",
              { className: "grid" },
              h(
                "div",
                { className: "card" },
                h("h3", null, "Core Loop"),
                h(
                  "ul",
                  null,
                  h("li", null, "Scavenge in the ruins for scrap, rations, and credits."),
                  h("li", null, "Invest in facilities to unlock deeper systems."),
                  h("li", null, "Deploy expeditions to gather rare resources."),
                  h("li", null, "Craft equipment and vehicles to scale your empire."),
                  h("li", null, "Trade with factions to earn reputation and influence.")
                ),
                h("div", { className: "pill" }, "Persistent Progression")
              ),
              h(
                "div",
                { className: "card" },
                h("h3", null, "Idle Economy"),
                h(
                  "p",
                  null,
                  "Facilities generate resources every second. Stack production to sustain long-term play sessions and 50+ hours of progression."
                ),
                h(
                  "div",
                  { className: "taglist" },
                  longTermProjection.map((resource) =>
                    h(
                      "span",
                      { key: resource.name, className: "tag" },
                      `+${resource.amount.toFixed(1)} ${resource.name}/sec`
                    )
                  )
                )
              ),
              h(
                "div",
                { className: "card" },
                h("h3", null, "Wasteland Operations"),
                h(
                  "p",
                  null,
                  "Play like a wasteland RPG: accept contracts, grow faction ties, and invest skill points into your captain while your base powers the long game."
                ),
                h(
                  "div",
                  { className: "taglist" },
                  renderTag(`Contracts: ${state.activeContracts.length}`),
                  renderTag(`Faction Standing: ${Object.values(state.factionReputation).reduce((a, b) => a + b, 0)}`),
                  renderTag(`Skill Points: ${state.character.skillPoints}`)
                )
              )
            )
          : null,
        section === "rpg"
          ? h(
              "div",
              { className: "grid" },
              h(
                "div",
                { className: "card" },
                h("h3", null, "Captain Profile"),
                h("p", null, `${state.character.name}`),
                h(
                  "div",
                  { className: "taglist" },
                  renderTag(`Grit: ${state.character.grit}`),
                  renderTag(`Savvy: ${state.character.savvy}`),
                  renderTag(`Tactics: ${state.character.tactics}`)
                ),
                h(
                  "p",
                  null,
                  `Skill points available: ${state.character.skillPoints}`
                ),
                h(
                  "div",
                  { className: "action" },
                  h(
                    "button",
                    {
                      className: "secondary",
                      onClick: () => spendSkillPoint("grit"),
                      disabled: state.character.skillPoints <= 0,
                    },
                    "Boost Grit"
                  ),
                  h(
                    "button",
                    {
                      className: "secondary",
                      onClick: () => spendSkillPoint("savvy"),
                      disabled: state.character.skillPoints <= 0,
                    },
                    "Boost Savvy"
                  ),
                  h(
                    "button",
                    {
                      className: "secondary",
                      onClick: () => spendSkillPoint("tactics"),
                      disabled: state.character.skillPoints <= 0,
                    },
                    "Boost Tactics"
                  )
                )
              ),
              h(
                "div",
                { className: "card" },
                h("h3", null, "Faction Ties"),
                h(
                  "ul",
                  null,
                  FACTIONS.map((faction) =>
                    h(
                      "li",
                      { key: faction.id },
                      `${faction.name}: ${state.factionReputation[faction.id]} — ${faction.focus}`
                    )
                  )
                )
              ),
              h(
                "div",
                { className: "card" },
                h("h3", null, "Story Log"),
                h(
                  "ul",
                  null,
                  state.storyLog.map((entry, index) =>
                    h("li", { key: `${entry}-${index}` }, entry)
                  )
                )
              )
            )
          : null,
        section === "scavenge"
          ? h(
              "div",
              { className: "grid" },
              h(
                "div",
                { className: "card" },
                h("h3", null, "Scavenge the Ashlands"),
                h(
                  "p",
                  null,
                  "Lead a quick run through derelict zones. Each run feeds your growing settlement and unlocks long-term upgrades."
                ),
                h(
                  "div",
                  { className: "taglist" },
                  renderTag(`Bonus gear: ${state.equipment.length}`),
                  renderTag(`Crew cap: ${3 + (state.buildings.habitat || 0) * 2}`)
                ),
                h(
                  "div",
                  { className: "action" },
                  h(
                    "button",
                    { className: "primary", onClick: scavengeResources },
                    "Quick Scavenge"
                  )
                )
              ),
              h(
                "div",
                { className: "card" },
                h("h3", null, "Scavenge Tips"),
                h(
                  "ul",
                  null,
                  h("li", null, "Craft equipment to improve your scavenging yields."),
                  h("li", null, "Build Scrapyards to automate scrap income."),
                  h("li", null, "Vehicles reduce expedition downtime and unlock auto-runs.")
                )
              )
            )
          : null,
        section === "base"
          ? h(
              "div",
              { className: "grid" },
              BUILDINGS.map((building) =>
                h(
                  "div",
                  { key: building.id, className: "card" },
                  h(
                    "div",
                    { className: "section-header" },
                    h("h3", null, building.name),
                    h("span", { className: "pill" }, `Lvl ${state.buildings[building.id] || 0}`)
                  ),
                  h("p", null, building.description),
                  h(
                    "div",
                    { className: "taglist" },
                    Object.entries(building.outputs).map(([key, value]) =>
                      h("span", { key, className: "tag" }, `+${value}/sec ${key}`)
                    )
                  ),
                  h(
                    "p",
                    null,
                    `Cost: ${Object.entries(building.baseCost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}`
                  ),
                  h(
                    "div",
                    { className: "action" },
                    h(
                      "button",
                      {
                        className: "primary",
                        onClick: () => startBuild(building),
                        disabled: !canAfford(state.resources, building.baseCost),
                      },
                      `Build (${building.time}s)`
                    )
                  )
                )
              )
            )
          : null,
        section === "expeditions"
          ? h(
              "div",
              { className: "grid" },
              EXPEDITIONS.map((expedition) => {
                const locked = !isUnlocked(expedition.unlock);
                return h(
                  "div",
                  { key: expedition.id, className: "card" },
                  h(
                    "div",
                    { className: "section-header" },
                    h("h3", null, expedition.name),
                    h(
                      "span",
                      { className: `pill ${locked ? "warning" : ""}` },
                      locked ? "Locked" : expedition.risk
                    )
                  ),
                  h("p", null, `Duration: ${formatTime(expedition.duration)}`),
                  h(
                    "p",
                    null,
                    `Rewards: ${Object.entries(expedition.rewards)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}`
                  ),
                  h(
                    "div",
                    { className: "action" },
                    h(
                      "button",
                      {
                        className: "primary",
                        onClick: () => launchExpedition(expedition),
                        disabled: locked,
                      },
                      "Deploy Squad"
                    )
                  )
                );
              })
            )
          : null,
        section === "crafting"
          ? h(
              "div",
              { className: "grid" },
              CRAFTING_RECIPES.map((recipe) =>
                h(
                  "div",
                  { key: recipe.id, className: "card" },
                  h(
                    "div",
                    { className: "section-header" },
                    h("h3", null, recipe.name),
                    h("span", { className: "pill" }, recipe.type)
                  ),
                  h("p", null, recipe.effect),
                  h(
                    "p",
                    null,
                    `Cost: ${Object.entries(recipe.cost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}`
                  ),
                  h(
                    "div",
                    { className: "action" },
                    h(
                      "button",
                      {
                        className: "primary",
                        onClick: () => startCraft(recipe),
                        disabled: !state.unlocked.crafting || !canAfford(state.resources, recipe.cost),
                      },
                      `Craft (${recipe.time}s)`
                    )
                  )
                )
              )
            )
          : null,
        section === "vehicles"
          ? h(
              "div",
              { className: "grid" },
              VEHICLES.map((vehicle) =>
                h(
                  "div",
                  { key: vehicle.id, className: "card" },
                  h(
                    "div",
                    { className: "section-header" },
                    h("h3", null, vehicle.name),
                    state.vehicles.includes(vehicle.id)
                      ? h("span", { className: "pill" }, "Owned")
                      : h("span", { className: "pill warning" }, "Prototype")
                  ),
                  h("p", null, vehicle.bonus),
                  h(
                    "p",
                    null,
                    `Cost: ${Object.entries(vehicle.cost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}`
                  ),
                  h(
                    "div",
                    { className: "action" },
                    h(
                      "button",
                      {
                        className: "primary",
                        onClick: () => startVehicle(vehicle),
                        disabled: !state.unlocked.vehicles || !canAfford(state.resources, vehicle.cost),
                      },
                      `Build (${vehicle.time}s)`
                    )
                  )
                )
              )
            )
          : null,
        section === "trading"
          ? h(
              "div",
              { className: "grid" },
              TRADES.map((trade) =>
                h(
                  "div",
                  { key: trade.id, className: "card" },
                  h(
                    "div",
                    { className: "section-header" },
                    h("h3", null, trade.name),
                    h("span", { className: "pill" }, "Deal")
                  ),
                  h("p", null, trade.description),
                  h(
                    "p",
                    null,
                    `Cost: ${Object.entries(trade.cost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}`
                  ),
                  h(
                    "p",
                    null,
                    `Reward: ${Object.entries(trade.reward)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}`
                  ),
                  h(
                    "div",
                    { className: "action" },
                    h(
                      "button",
                      {
                        className: "primary",
                        onClick: () => executeTrade(trade),
                        disabled: !state.unlocked.trading || !canAfford(state.resources, trade.cost),
                      },
                      "Execute Trade"
                    )
                  )
                )
              )
            )
          : null,
        section === "achievements"
          ? h(
              "div",
              { className: "grid" },
              ACHIEVEMENTS.map((achievement) =>
                h(
                  "div",
                  { key: achievement.id, className: "card" },
                  h(
                    "div",
                    { className: "section-header" },
                    h("h3", null, achievement.title),
                    h(
                      "span",
                      { className: "pill" },
                      state.achievements.includes(achievement.id) ? "Unlocked" : "Locked"
                    )
                  ),
                  h("p", null, achievement.description)
                )
              )
            )
          : null,
        section === "rpg"
          ? h(
              "div",
              { className: "grid" },
              CONTRACTS.map((contract) =>
                h(
                  "div",
                  { key: contract.id, className: "card" },
                  h(
                    "div",
                    { className: "section-header" },
                    h("h3", null, contract.name),
                    h(
                      "span",
                      { className: "pill" },
                      FACTIONS.find((f) => f.id === contract.faction)?.name || "Faction"
                    )
                  ),
                  h("p", null, contract.summary),
                  h("p", null, contract.narrative),
                  h(
                    "p",
                    null,
                    `Requires: ${contract.requirements.crew ? `${contract.requirements.crew} crew` : "crew"}${contract.requirements.vehicles ? `, ${contract.requirements.vehicles} vehicle` : ""}${contract.requirements.gear ? `, ${contract.requirements.gear} gear` : ""}${contract.requirements.crafting ? ", workshop" : ""}`
                  ),
                  h(
                    "p",
                    null,
                    `Rewards: ${Object.entries(contract.reward)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}`
                  ),
                  h(
                    "div",
                    { className: "action" },
                    h(
                      "button",
                      {
                        className: "primary",
                        onClick: () => startContract(contract),
                        disabled: !canTakeContract(contract),
                      },
                      `Accept (${contract.duration}s)`
                    )
                  )
                )
              )
            )
          : null,
        h(
          "div",
          { className: "card" },
          h(
            "div",
            { className: "section-header" },
            h("h3", null, "Active Timers"),
            h("span", { className: "pill" }, "Real-time")
          ),
          h(
            "div",
            { className: "grid" },
            state.activeBuilds.map((build) =>
              h(
                "div",
                { key: build.endTime, className: "card" },
                h("h3", null, build.name),
                h("div", { className: "timer" }, formatTime(build.remaining / 1000)),
                h(
                  "div",
                  { className: "progress" },
                  h("span", {
                    style: { width: `${calculateProgress(build.endTime, build.duration)}%` },
                  })
                )
              )
            ),
            state.activeCrafts.map((craft) =>
              h(
                "div",
                { key: craft.endTime, className: "card" },
                h("h3", null, craft.name),
                h("div", { className: "timer" }, formatTime(craft.remaining / 1000)),
                h(
                  "div",
                  { className: "progress" },
                  h("span", {
                    style: { width: `${calculateProgress(craft.endTime, craft.duration)}%` },
                  })
                )
              )
            ),
            state.activeExpeditions.map((expedition) =>
              h(
                "div",
                { key: expedition.endTime, className: "card" },
                h("h3", null, expedition.name),
                h("div", { className: "timer" }, formatTime(expedition.remaining / 1000)),
                h(
                  "div",
                  { className: "progress" },
                  h("span", {
                    style: {
                      width: `${calculateProgress(expedition.endTime, expedition.duration)}%`,
                    },
                  })
                )
              )
            ),
            state.activeContracts.map((contract) =>
              h(
                "div",
                { key: contract.endTime, className: "card" },
                h("h3", null, contract.name),
                h("div", { className: "timer" }, formatTime(contract.remaining / 1000)),
                h(
                  "div",
                  { className: "progress" },
                  h("span", {
                    style: { width: `${calculateProgress(contract.endTime, contract.duration)}%` },
                  })
                )
              )
            ),
            !state.activeBuilds.length &&
            !state.activeCrafts.length &&
            !state.activeExpeditions.length &&
            !state.activeContracts.length
              ? h("p", null, "No active timers yet.")
              : null
          )
        ),
        h(
          "div",
          { className: "footer-note" },
          "Progress is saved automatically in local storage. Keep pushing through the wasteland and unlock ever deeper systems."
        )
      )
    )
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(App));
