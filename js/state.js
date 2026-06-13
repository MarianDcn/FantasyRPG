// ============================================================
// STATE.JS - State global al jocului + save/load (localStorage)
// ============================================================

const SAVE_KEY = "fantasyClickerRPG_save";

// State global - tot ce trebuie salvat
let state = {
  // Personaj
  className: null,        // "warrior" | "mage" | "rogue"
  level: 1,
  xp: 0,
  gold: 0,

  // Skill tree: { skillId: levelCumparat }
  skills: {},
  skillPoints: 0,

  // Zone & combat
  currentZoneId: "forest",
  unlockedZoneIds: ["forest"],
  monsterKillCount: 0,     // câți monștri normali au fost uciși în zona curentă (pt boss trigger)
  currentMonster: null,    // { name, icon, hp, maxHp, isBoss }

  // Echipament
  inventory: [],           // listă de iteme { id, slot, name, rarity, stats:{} }
  equipped: { weapon: null, armor: null, accessory: null }, // id-uri din inventory

  // Pets
  unlockedPetIds: ["wolf_pup"],
  petLevels: { wolf_pup: 0 },

  // Prestige
  prestigeCount: 0,
  essence: 0,

  // Meta
  lastSaved: null
};

// ---------- ID generator pt iteme ----------
let _itemIdCounter = 0;
function generateItemId() {
  _itemIdCounter++;
  return "item_" + Date.now() + "_" + _itemIdCounter;
}

// ---------- SAVE ----------
function saveGame(showStatus = true) {
  state.lastSaved = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    if (showStatus) {
      const el = document.getElementById("saveStatus");
      if (el) {
        el.textContent = "Salvat ✓";
        setTimeout(() => { el.textContent = ""; }, 1500);
      }
    }
  } catch (e) {
    console.error("Eroare la salvare:", e);
    const el = document.getElementById("saveStatus");
    if (el) el.textContent = "Eroare la salvare!";
  }
}

// ---------- LOAD ----------
function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const loaded = JSON.parse(raw);
    // Merge - ca să nu se piardă proprietăți noi adăugate în update-uri viitoare
    state = Object.assign({}, state, loaded);

    // Asigură structuri imbricate corecte (în caz de save vechi incomplet)
    state.skills = loaded.skills || {};
    state.equipped = loaded.equipped || { weapon: null, armor: null, accessory: null };
    state.petLevels = loaded.petLevels || { wolf_pup: 0 };
    state.unlockedPetIds = loaded.unlockedPetIds || ["wolf_pup"];
    state.unlockedZoneIds = loaded.unlockedZoneIds || ["forest"];
    state.inventory = loaded.inventory || [];

    return true;
  } catch (e) {
    console.error("Eroare la încărcare:", e);
    return false;
  }
}

// ---------- RESET TOTAL ----------
function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

// ---------- AUTOSAVE ----------
function startAutosave(intervalSeconds = 30) {
  setInterval(() => saveGame(true), intervalSeconds * 1000);
}

// ---------- GETTERS UTILE ----------
function getCurrentZone() {
  return ZONES.find(z => z.id === state.currentZoneId);
}

function isZoneUnlocked(zoneId) {
  return state.unlockedZoneIds.includes(zoneId);
}

function getXpRequired() {
  return xpRequiredForLevel(state.level);
}
