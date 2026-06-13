// ============================================================
// MAIN.JS - Inițializare jocului și game loop
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Încarcă save-ul (dacă există)
  loadGame();

  // 2. Inițializează combat (asigură monstru curent)
  initCombat();

  // 3. Setup UI: tabs, selecție clasă
  setupTabs();
  setupClassSelection();

  // 4. Render inițial
  renderAll();

  // 5. Event listeners principale
  setupEventListeners();

  // 6. Game loop: DPS tick la 1 secundă
  setInterval(gameLoopTick, 1000);

  // 7. Autosave la 30 secunde
  startAutosave(30);

  // 8. Save la închiderea/reîncărcarea paginii
  window.addEventListener("beforeunload", () => saveGame(false));
});

// ---------- ATTACK BUTTON ----------
function setupEventListeners() {
  // Click pe monstru (sprite) sau pe butonul Atacă
  const attackBtn = document.getElementById("attackBtn");
  const sprite = document.getElementById("monsterSprite");

  attackBtn.addEventListener("click", handleAttack);
  sprite.addEventListener("click", handleAttack);

  // Save / Reset
  document.getElementById("saveBtn").addEventListener("click", () => saveGame(true));
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Sigur vrei să resetezi TOT progresul? Această acțiune nu poate fi anulată!")) {
      resetGame();
    }
  });

  // Prestige
  document.getElementById("prestigeBtn").addEventListener("click", handlePrestige);
}

// ---------- HANDLE ATTACK (click pe monstru) ----------
function handleAttack() {
  if (!state.className) {
    addCombatLog("⚠️ Alege o clasă în tab-ul Personaj înainte de a lupta!");
    return;
  }

  const result = performClickAttack();
  processAttackResult(result);
}

// ---------- GAME LOOP TICK (DPS, o dată per secundă) ----------
function gameLoopTick() {
  if (!state.className) return;

  const result = performDpsTick();
  if (result) {
    processAttackResult(result, true);
  }
}

// ---------- PROCESEAZĂ REZULTATUL UNUI ATAC (click sau dps) ----------
// silent: dacă true, nu loghează damage-ul normal (doar evenimente importante) - folosit pt DPS
function processAttackResult(result, silent = false) {
  // Log damage normal (doar pentru click, ca să nu inunde log-ul cu DPS)
  if (!silent) {
    const critText = result.isCrit ? " 💥 CRITIC!" : "";
    addCombatLog(`Ai provocat ${formatNumber(result.damageDealt)} damage.${critText}`);
  }

  if (result.monsterDied) {
    const monsterLabel = result.wasBoss ? "BOSS-ul" : "Monstrul";

    addCombatLog(
      `${monsterLabel} a fost învins! +${formatNumber(result.rewards.gold)}💰 +${formatNumber(result.rewards.xp)}✨`,
      result.wasBoss ? "log-boss" : "log-gold"
    );

    if (result.droppedItem) {
      addCombatLog(`🎁 Item găsit: ${result.droppedItem.name}!`, "log-drop");
    }

    if (result.leveledUp) {
      addCombatLog(`🎉 LEVEL UP! Ai atins nivelul ${state.level}! (+${result.leveledUp} skill points)`, "log-levelup");
    }

    if (result.newlyUnlockedZones && result.newlyUnlockedZones.length > 0) {
      for (const zone of result.newlyUnlockedZones) {
        addCombatLog(`🗺️ Zonă nouă deblocată: ${zone.icon} ${zone.name}!`, "log-levelup");
      }
    }

    // Re-render zone tab dacă a apărut o zonă nouă sau e tab-ul activ
    if (getActiveTabName() === "zones") renderZones();
    if (getActiveTabName() === "inventory") renderInventory();
    if (getActiveTabName() === "skills") renderSkills();
    if (getActiveTabName() === "pets") renderPets();
    if (getActiveTabName() === "prestige") renderPrestige();
  }

  // Update UI esențial mereu
  renderTopBar();
  renderCombat();
  if (getActiveTabName() === "character") renderCharacter();
}
