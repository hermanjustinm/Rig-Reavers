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
  { id: "expeditions", label: "Expeditions" },
  { id: "crafting", label: "Crafting" },
  { id: "vehicles", label: "Vehicles" },
  { id: "trading", label: "Trading" },
  { id: "achievements", label: "Achievements" },
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
  },
  achievements: [],
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

const sumResources = (resourceList) =>
  resourceList.reduce((acc, resource) => acc + resource.amount, 0);

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

        const newAchievements = ACHIEVEMENTS.filter(
          (achievement) =>
            !next.achievements.includes(achievement.id) &&
            achievement.check(next)
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

  const craftedVehicles = state.activeCrafts
    .filter((item) => item.type === "vehicle")
    .map((item) => item.id);

  useEffect(() => {
    if (!craftedVehicles.length) return;
    setState((prev) => ({
      ...prev,
      vehicles: [...new Set([...prev.vehicles, ...craftedVehicles])],
    }));
  }, [craftedVehicles.length]);

  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          Wasteland <span>Reavers</span>
        </div>
        <div className="nav-group">
          {SECTION_LIST.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${section === item.id ? "active" : ""}`}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="card">
          <h3>Empire Status</h3>
          <p>Base tier: {Object.keys(state.buildings).length + 1}</p>
          <p>Expeditions completed: {state.stats.expeditions}</p>
          <p>Equipment crafted: {state.stats.crafts}</p>
          <div className="taglist">
            {state.unlocked.operations ? (
              <span className="tag">Long Ops Ready</span>
            ) : (
              <span className="tag">Early Settlement</span>
            )}
            {state.vehicles.length > 0 ? (
              <span className="tag">Vehicle Fleet</span>
            ) : (
              <span className="tag">No Vehicles</span>
            )}
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="resource-bar">
            {Object.entries(state.resources).map(([key, value]) => (
              <div key={key} className="resource">
                <label>{key}</label>
                <strong>{formatNumber(value)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="content">
          {section === "overview" && (
            <div className="grid">
              <div className="card">
                <h3>Core Loop</h3>
                <ul>
                  <li>Scavenge in the ruins for scrap, rations, and credits.</li>
                  <li>Invest in facilities to unlock deeper systems.</li>
                  <li>Deploy expeditions to gather rare resources.</li>
                  <li>Craft equipment and vehicles to scale your empire.</li>
                  <li>Trade with factions to earn reputation and influence.</li>
                </ul>
                <div className="pill">Persistent Progression</div>
              </div>
              <div className="card">
                <h3>Idle Economy</h3>
                <p>
                  Facilities generate resources every second. Stack production to sustain long-term play
                  sessions and 50+ hours of progression.
                </p>
                <div className="taglist">
                  {longTermProjection.map((resource) => (
                    <span key={resource.name} className="tag">
                      +{resource.amount.toFixed(1)} {resource.name}/sec
                    </span>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>Active Operations</h3>
                <p>
                  Real-time timers keep expeditions, crafting queues, and base construction moving even when
                  idle. Stack multiple timers to orchestrate a thriving wasteland empire.
                </p>
                <div className="taglist">
                  <span className="tag">Build Queue: {state.activeBuilds.length}</span>
                  <span className="tag">Craft Queue: {state.activeCrafts.length}</span>
                  <span className="tag">Expeditions: {state.activeExpeditions.length}</span>
                </div>
              </div>
            </div>
          )}

          {section === "scavenge" && (
            <div className="grid">
              <div className="card">
                <h3>Scavenge the Ashlands</h3>
                <p>
                  Lead a quick run through derelict zones. Each run feeds your growing settlement and
                  unlocks long-term upgrades.
                </p>
                <div className="taglist">
                  <span className="tag">Bonus gear: {state.equipment.length}</span>
                  <span className="tag">Crew cap: {3 + (state.buildings.habitat || 0) * 2}</span>
                </div>
                <div className="action">
                  <button className="primary" onClick={scavengeResources}>
                    Quick Scavenge
                  </button>
                </div>
              </div>
              <div className="card">
                <h3>Scavenge Tips</h3>
                <ul>
                  <li>Craft equipment to improve your scavenging yields.</li>
                  <li>Build Scrapyards to automate scrap income.</li>
                  <li>Vehicles reduce expedition downtime and unlock auto-runs.</li>
                </ul>
              </div>
            </div>
          )}

          {section === "base" && (
            <div className="grid">
              {BUILDINGS.map((building) => (
                <div key={building.id} className="card">
                  <div className="section-header">
                    <h3>{building.name}</h3>
                    <span className="pill">Lvl {state.buildings[building.id] || 0}</span>
                  </div>
                  <p>{building.description}</p>
                  <div className="taglist">
                    {Object.entries(building.outputs).map(([key, value]) => (
                      <span key={key} className="tag">
                        +{value}/sec {key}
                      </span>
                    ))}
                  </div>
                  <p>
                    Cost: {Object.entries(building.baseCost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}
                  </p>
                  <div className="action">
                    <button
                      className="primary"
                      onClick={() => startBuild(building)}
                      disabled={!canAfford(state.resources, building.baseCost)}
                    >
                      Build ({building.time}s)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "expeditions" && (
            <div className="grid">
              {EXPEDITIONS.map((expedition) => {
                const locked = !isUnlocked(expedition.unlock);
                return (
                  <div key={expedition.id} className="card">
                    <div className="section-header">
                      <h3>{expedition.name}</h3>
                      <span className={`pill ${locked ? "warning" : ""}`}>
                        {locked ? "Locked" : expedition.risk}
                      </span>
                    </div>
                    <p>Duration: {formatTime(expedition.duration)}</p>
                    <p>
                      Rewards: {Object.entries(expedition.rewards)
                        .map(([key, value]) => `${value} ${key}`)
                        .join(", ")}
                    </p>
                    <div className="action">
                      <button
                        className="primary"
                        onClick={() => launchExpedition(expedition)}
                        disabled={locked}
                      >
                        Deploy Squad
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {section === "crafting" && (
            <div className="grid">
              {CRAFTING_RECIPES.map((recipe) => (
                <div key={recipe.id} className="card">
                  <div className="section-header">
                    <h3>{recipe.name}</h3>
                    <span className="pill">{recipe.type}</span>
                  </div>
                  <p>{recipe.effect}</p>
                  <p>
                    Cost: {Object.entries(recipe.cost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}
                  </p>
                  <div className="action">
                    <button
                      className="primary"
                      onClick={() => startCraft(recipe)}
                      disabled={!state.unlocked.crafting || !canAfford(state.resources, recipe.cost)}
                    >
                      Craft ({recipe.time}s)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "vehicles" && (
            <div className="grid">
              {VEHICLES.map((vehicle) => (
                <div key={vehicle.id} className="card">
                  <div className="section-header">
                    <h3>{vehicle.name}</h3>
                    {state.vehicles.includes(vehicle.id) ? (
                      <span className="pill">Owned</span>
                    ) : (
                      <span className="pill warning">Prototype</span>
                    )}
                  </div>
                  <p>{vehicle.bonus}</p>
                  <p>
                    Cost: {Object.entries(vehicle.cost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}
                  </p>
                  <div className="action">
                    <button
                      className="primary"
                      onClick={() => startVehicle(vehicle)}
                      disabled={!state.unlocked.vehicles || !canAfford(state.resources, vehicle.cost)}
                    >
                      Build ({vehicle.time}s)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "trading" && (
            <div className="grid">
              {TRADES.map((trade) => (
                <div key={trade.id} className="card">
                  <div className="section-header">
                    <h3>{trade.name}</h3>
                    <span className="pill">Deal</span>
                  </div>
                  <p>{trade.description}</p>
                  <p>
                    Cost: {Object.entries(trade.cost)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}
                  </p>
                  <p>
                    Reward: {Object.entries(trade.reward)
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")}
                  </p>
                  <div className="action">
                    <button
                      className="primary"
                      onClick={() => executeTrade(trade)}
                      disabled={!state.unlocked.trading || !canAfford(state.resources, trade.cost)}
                    >
                      Execute Trade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "achievements" && (
            <div className="grid">
              {ACHIEVEMENTS.map((achievement) => (
                <div key={achievement.id} className="card">
                  <div className="section-header">
                    <h3>{achievement.title}</h3>
                    <span className="pill">
                      {state.achievements.includes(achievement.id) ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <div className="section-header">
              <h3>Active Timers</h3>
              <span className="pill">Real-time</span>
            </div>
            <div className="grid">
              {state.activeBuilds.map((build) => (
                <div key={build.endTime} className="card">
                  <h3>{build.name}</h3>
                  <div className="timer">{formatTime(build.remaining / 1000)}</div>
                  <div className="progress">
                    <span style={{ width: `${calculateProgress(build.endTime, build.duration)}%` }} />
                  </div>
                </div>
              ))}
              {state.activeCrafts.map((craft) => (
                <div key={craft.endTime} className="card">
                  <h3>{craft.name}</h3>
                  <div className="timer">{formatTime(craft.remaining / 1000)}</div>
                  <div className="progress">
                    <span style={{ width: `${calculateProgress(craft.endTime, craft.duration)}%` }} />
                  </div>
                </div>
              ))}
              {state.activeExpeditions.map((expedition) => (
                <div key={expedition.endTime} className="card">
                  <h3>{expedition.name}</h3>
                  <div className="timer">{formatTime(expedition.remaining / 1000)}</div>
                  <div className="progress">
                    <span
                      style={{
                        width: `${calculateProgress(expedition.endTime, expedition.duration)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {!state.activeBuilds.length &&
                !state.activeCrafts.length &&
                !state.activeExpeditions.length && <p>No active timers yet.</p>}
            </div>
          </div>

          <div className="footer-note">
            Progress is saved automatically in local storage. Keep pushing through the wasteland and
            unlock ever deeper systems.
          </div>
        </div>
      </main>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
