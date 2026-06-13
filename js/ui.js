// ============================================================
// UI.JS - Render pentru toate tab-urile + interacțiuni DOM
// ============================================================

// ---------- TAB SWITCHING ----------
function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");

      // Re-render conținutul tab-ului activ
      renderActiveTab(btn.dataset.tab);
    });
  });
}

function renderActiveTab(tabName) {
  switch (tabName) {
    case "combat": renderCombat(); break;
    case "character": renderCharacter(); break;
    case "inventory": renderInventory(); break;
    case "skills": renderSkills(); break;
    case "pets": renderPets(); break;
    case "prestige": renderPrestige(); break;
    case "zones": renderZones(); break;
  }
}

function getActiveTabName() {
  const active = document.querySelector(".tab-btn.active");
  return active ? active.dataset.tab : "combat";
}

// ---------- TOP BAR ----------
function renderTopBar() {
  document.getElementById("goldDisplay").textContent = formatNumber(state.gold);
  document.getElementById("levelDisplay").textContent = state.level;
  document.getElementById("xpDisplay").textContent = formatNumber(state.xp);
  document.getElementById("xpMaxDisplay").textContent = formatNumber(getXpRequired());
  document.getElementById("prestigeDisplay").textContent = state.prestigeCount;
}

// ---------- COMBAT TAB ----------
function renderCombat() {
  const zone = getCurrentZone();
  const monster = state.currentMonster;

  document.getElementById("zoneName").textContent = `${zone.icon} ${zone.name}  (${state.monsterKillCount}/${MONSTERS_BEFORE_BOSS} până la boss)`;

  if (monster) {
    document.getElementById("monsterName").textContent = monster.isBoss
      ? `👑 BOSS: ${monster.name}`
      : monster.name;
    document.getElementById("monsterSprite").textContent = monster.icon;

    const hpPercent = Math.max(0, (monster.hp / monster.maxHp) * 100);
    document.getElementById("monsterHpBar").style.width = hpPercent + "%";
    document.getElementById("monsterHpText").textContent =
      `${formatNumber(Math.max(0, monster.hp))} / ${formatNumber(monster.maxHp)}`;

    const sprite = document.getElementById("monsterSprite");
    sprite.style.filter = monster.isBoss ? "drop-shadow(0 0 12px #e74c3c)" : "none";
  }

  // Class selection visibility
  const classSelection = document.getElementById("classSelection");
  if (state.className) {
    classSelection.style.display = "none";
  }
}

function addCombatLog(text, cssClass = "") {
  const log = document.getElementById("combatLog");
  const entry = document.createElement("div");
  if (cssClass) entry.className = cssClass;
  entry.textContent = text;
  log.prepend(entry);

  // limit la 50 entries
  while (log.children.length > 50) {
    log.removeChild(log.lastChild);
  }
}

// ---------- CHARACTER TAB ----------
function renderCharacter() {
  const classSelection = document.getElementById("classSelection");
  const statsDiv = document.getElementById("characterStats");

  if (!state.className) {
    classSelection.style.display = "block";
    statsDiv.innerHTML = "";
    return;
  }

  classSelection.style.display = "none";

  const stats = getCharacterStats();
  const cls = CLASSES[state.className];

  const statRows = [
    { label: "Clasă", value: cls.icon + " " + cls.name },
    { label: "Damage Click", value: formatNumber(stats.clickDamage) },
    { label: "DPS", value: formatNumber(stats.dps) },
    { label: "Viață Max", value: formatNumber(stats.maxHp) },
    { label: "Șansă Critică", value: (stats.critChance * 100).toFixed(1) + "%" },
    { label: "Multiplicator Critic", value: stats.critMulti.toFixed(2) + "x" },
    { label: "Bonus Aur", value: "+" + (stats.goldBonus * 100).toFixed(1) + "%" },
    { label: "Bonus XP", value: "+" + (stats.xpBonus * 100).toFixed(1) + "%" }
  ];

  statsDiv.innerHTML = statRows.map(row => `
    <div class="stat-box">
      <div class="label">${row.label}</div>
      <div class="value">${row.value}</div>
    </div>
  `).join("");
}

function setupClassSelection() {
  document.querySelectorAll(".class-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (state.className) return;
      selectClass(btn.dataset.class);
      renderCharacter();
      renderCombat();
      saveGame();
    });
  });
}

// ---------- INVENTORY TAB ----------
function renderInventory() {
  // Equipped slots
  const equippedDiv = document.getElementById("equippedSlots");
  equippedDiv.innerHTML = EQUIPMENT_SLOTS.map(slot => {
    const item = getEquippedItem(slot);
    const slotLabels = { weapon: "Armă", armor: "Armură", accessory: "Accesoriu" };

    if (!item) {
      return `
        <div class="equip-slot">
          <div class="slot-label">${slotLabels[slot]}</div>
          <div>— gol —</div>
        </div>`;
    }

    const statsText = Object.entries(item.stats)
      .map(([k, v]) => `${STAT_LABELS[k]}: ${formatStatValue(k, v)}`)
      .join("<br>");

    return `
      <div class="equip-slot rarity-${item.rarity}">
        <div class="slot-label">${slotLabels[slot]}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-stats">${statsText}</div>
        <button onclick="handleUnequip('${slot}')">Dezechipează</button>
      </div>`;
  }).join("");

  // Inventory grid
  const gridDiv = document.getElementById("inventoryGrid");
  if (state.inventory.length === 0) {
    gridDiv.innerHTML = "<p>Inventarul este gol. Învinge monștri pentru a obține iteme!</p>";
    return;
  }

  // sortare: rarity desc, slot
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  const sorted = [...state.inventory].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  gridDiv.innerHTML = sorted.map(item => {
    const isEquipped = state.equipped[item.slot] === item.id;
    const statsText = Object.entries(item.stats)
      .map(([k, v]) => `${STAT_LABELS[k]}: ${formatStatValue(k, v)}`)
      .join("<br>");

    const rarity = RARITIES.find(r => r.id === item.rarity);
    const sellValue = Math.round(10 * rarity.statMulti);

    return `
      <div class="item-card rarity-${item.rarity}">
        <div class="item-name">${item.name}${isEquipped ? " ✅" : ""}</div>
        <div class="item-stats">${statsText}</div>
        <div style="margin-top:8px; display:flex; gap:6px;">
          ${isEquipped
            ? `<button onclick="handleUnequip('${item.slot}')">Dezechip.</button>`
            : `<button onclick="handleEquip('${item.id}')">Echipează</button>
               <button onclick="handleSell('${item.id}')">Vinde (${sellValue}💰)</button>`
          }
        </div>
      </div>`;
  }).join("");
}

function handleEquip(itemId) {
  equipItem(itemId);
  renderInventory();
  renderCharacter();
  saveGame();
}

function handleUnequip(slot) {
  unequipSlot(slot);
  renderInventory();
  renderCharacter();
  saveGame();
}

function handleSell(itemId) {
  sellItem(itemId);
  renderInventory();
  renderTopBar();
  saveGame();
}

// ---------- SKILLS TAB ----------
function renderSkills() {
  const skillTreeDiv = document.getElementById("skillTree");
  document.getElementById("skillPointsText").textContent = "Skill Points: " + state.skillPoints;

  if (!state.className) {
    skillTreeDiv.innerHTML = "<p>Alege mai întâi o clasă în tab-ul Personaj.</p>";
    return;
  }

  const classSkills = SKILLS[state.className];

  skillTreeDiv.innerHTML = classSkills.map(skill => {
    const currentLevel = state.skills[skill.id] || 0;
    const isMax = currentLevel >= skill.maxLevel;
    const canAfford = state.skillPoints > 0;

    return `
      <div class="skill-card">
        <h4>${skill.name}</h4>
        <p>${skill.desc}</p>
        <p>Nivel: ${currentLevel} / ${skill.maxLevel}</p>
        <button onclick="handleSkillUpgrade('${skill.id}')" ${(!canAfford || isMax) ? "disabled" : ""}>
          ${isMax ? "MAX" : "Upgrade (1 SP)"}
        </button>
      </div>`;
  }).join("");
}

function handleSkillUpgrade(skillId) {
  if (state.skillPoints <= 0) return;
  const classSkills = SKILLS[state.className];
  const skill = classSkills.find(s => s.id === skillId);
  if (!skill) return;

  const currentLevel = state.skills[skillId] || 0;
  if (currentLevel >= skill.maxLevel) return;

  state.skills[skillId] = currentLevel + 1;
  state.skillPoints--;

  renderSkills();
  renderCharacter();
  saveGame();
}

// ---------- PETS TAB ----------
function renderPets() {
  const petsGrid = document.getElementById("petsGrid");

  petsGrid.innerHTML = PETS.map(pet => {
    const unlocked = isPetUnlocked(pet.id);

    if (!unlocked) {
      const canAfford = state.gold >= pet.unlockCost;
      return `
        <div class="pet-card locked">
          <div class="pet-icon">${pet.icon}</div>
          <div><b>${pet.name}</b></div>
          <p style="font-size:0.8em; color:#999;">${pet.description}</p>
          <button onclick="handlePetUnlock('${pet.id}')" ${!canAfford ? "disabled" : ""}>
            Deblochează (${formatNumber(pet.unlockCost)}💰)
          </button>
        </div>`;
    }

    const level = state.petLevels[pet.id] || 0;
    const upgradeCost = getPetUpgradeCost(pet.id);
    const isMax = upgradeCost === null;
    const canAfford = !isMax && state.gold >= upgradeCost;
    const effectText = formatPetEffect(pet.id);

    return `
      <div class="pet-card">
        <div class="pet-icon">${pet.icon}</div>
        <div><b>${pet.name}</b></div>
        <p style="font-size:0.8em; color:#999;">Nivel ${level}/${pet.maxLevel} — ${effectText}</p>
        <button onclick="handlePetUpgrade('${pet.id}')" ${(!canAfford || isMax) ? "disabled" : ""}>
          ${isMax ? "MAX" : "Upgrade (" + formatNumber(upgradeCost) + "💰)"}
        </button>
      </div>`;
  }).join("");
}

function handlePetUnlock(petId) {
  const result = unlockPet(petId);
  if (result.success) {
    renderPets();
    renderTopBar();
    renderCharacter();
    saveGame();
  }
}

function handlePetUpgrade(petId) {
  const result = upgradePet(petId);
  if (result.success) {
    renderPets();
    renderTopBar();
    renderCharacter();
    saveGame();
  }
}

// ---------- PRESTIGE TAB ----------
function renderPrestige() {
  const infoDiv = document.getElementById("prestigeInfo");
  const btn = document.getElementById("prestigeBtn");

  const potential = calculatePotentialEssence();
  const eligible = canPrestige();

  infoDiv.innerHTML = `
    <b>Esențe curente:</b> ${state.essence} (bonus: +${getPrestigeBonusPercent().toFixed(1)}% damage/aur)<br>
    <b>Prestige-uri făcute:</b> ${state.prestigeCount}<br><br>
    Prestige resetează: nivel, XP, aur, skill-uri, echipament, zone deblocate.<br>
    Se păstrează: clasă, companioni (cu nivelele lor), esențele.<br><br>
    ${eligible
      ? `La prestige acum vei primi <b>+${potential} esențe</b> (nivel minim: ${PRESTIGE_CONFIG.minLevelRequired}).`
      : `Necesită nivel minim ${PRESTIGE_CONFIG.minLevelRequired}. Nivel curent: ${state.level}.`
    }
  `;

  btn.disabled = !eligible;
}

function handlePrestige() {
  if (!canPrestige()) return;
  if (!confirm("Sigur vrei să faci Prestige? Vei pierde nivelul, aurul, echipamentul și skill-urile, dar vei primi Esențe permanente.")) return;

  const result = doPrestige();
  if (result.success) {
    addCombatLog(`🌟 PRESTIGE! Ai primit ${result.essenceGained} esențe (total: ${result.totalEssence})`, "log-levelup");
    renderAll();
    saveGame();
  }
}

// ---------- ZONES TAB ----------
function renderZones() {
  const zonesGrid = document.getElementById("zonesGrid");

  zonesGrid.innerHTML = ZONES.map(zone => {
    const unlocked = isZoneUnlocked(zone.id);
    const isActive = state.currentZoneId === zone.id;

    let cssClass = "zone-card";
    if (isActive) cssClass += " active";
    if (!unlocked) cssClass += " locked";

    return `
      <div class="${cssClass}" onclick="${unlocked ? `handleZoneSwitch('${zone.id}')` : ""}">
        <div class="zone-icon">${zone.icon}</div>
        <div><b>${zone.name}</b></div>
        ${unlocked
          ? `<p style="font-size:0.8em; color:#999;">Boss: ${zone.boss.icon} ${zone.boss.name}</p>`
          : `<p style="font-size:0.8em; color:#999;">Necesită nivel ${zone.unlockLevel}</p>`
        }
      </div>`;
  }).join("");
}

function handleZoneSwitch(zoneId) {
  if (switchZone(zoneId)) {
    renderZones();
    renderCombat();
    saveGame();
  }
}

// ---------- FORMAT NUMBER (pentru numere mari) ----------
function formatNumber(num) {
  if (num < 1000) return Math.floor(num).toString();
  if (num < 1_000_000) return (num / 1000).toFixed(2) + "K";
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(2) + "M";
  return (num / 1_000_000_000).toFixed(2) + "B";
}

// ---------- RENDER ALL (folosit la init și după acțiuni majore) ----------
function renderAll() {
  renderTopBar();
  renderCombat();
  renderCharacter();
  renderInventory();
  renderSkills();
  renderPets();
  renderPrestige();
  renderZones();
}
