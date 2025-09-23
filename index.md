---
title: "Michael Doyle - Career Baseball Analytics"
type: career-summary
player: Michael Doyle
---

# ⚾ Michael Doyle - Career Baseball Analytics

> [!info]+ Player Overview
> **Name:** Michael Doyle
> **Primary Position:** Utility (P/IF/OF)
> **Teams:** Happy Sox
> **Active Seasons:** 2025-Present

---

## 📊 Career Statistics

*Career statistics are automatically calculated from all season data*

```dataviewjs
// Get all season files
const seasonPages = dv.pages('"seasons"').where(p => p.type === "baseball-season-summary");

// Helper function to safely convert values to numbers
const N = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const num = Number(v);
  return isFinite(num) ? num : 0;
};

// Initialize career totals
let careerTotals = {
  // Hitting
  seasons: 0, gamesPlayed: 0,
  AB: 0, H: 0, '2B': 0, '3B': 0, HR: 0, RBI: 0, R: 0, BB: 0, K: 0, HBP: 0, SF: 0, SB: 0, CS: 0,
  RISP: 0, RISP_H: 0, hard_contact: 0, pitches_seen: 0,
  // Fielding
  PO: 0, A: 0, E: 0, TC: 0, DP: 0,
  // Pitching
  IP: 0, H_p: 0, R_p: 0, ER: 0, BB_p: 0, K_p: 0, HR_p: 0, BF: 0, PC: 0
};

// Process each season
for (const season of seasonPages) {
  careerTotals.seasons++;

  // Get all games for this season
  const gamesFolder = season.games_folder || 'games/';
  const seasonGames = dv.pages('"' + gamesFolder + '"').where(p => p.type === "baseball-stats");

  // Filter to games where player actually played
  const playedGames = seasonGames.where(p =>
    (N(p.AB) > 0) || (N(p.H) > 0) || (N(p.PO) > 0) || (N(p.A) > 0) || (N(p.IP) > 0)
  );

  careerTotals.gamesPlayed += playedGames.length;

  // Sum statistics from all games in this season
  for (const game of playedGames) {
    // Hitting
    careerTotals.AB += N(game.AB); careerTotals.H += N(game.H); careerTotals['2B'] += N(game['2B']);
    careerTotals['3B'] += N(game['3B']); careerTotals.HR += N(game.HR); careerTotals.RBI += N(game.RBI);
    careerTotals.R += N(game.R); careerTotals.BB += N(game.BB); careerTotals.K += N(game.K);
    careerTotals.HBP += N(game.HBP); careerTotals.SF += N(game.SF); careerTotals.SB += N(game.SB); careerTotals.CS += N(game.CS);
    careerTotals.RISP += N(game.RISP); careerTotals.RISP_H += N(game.RISP_H);
    careerTotals.hard_contact += N(game.hard_contact); careerTotals.pitches_seen += N(game.pitches_seen);

    // Fielding
    careerTotals.PO += N(game.PO); careerTotals.A += N(game.A); careerTotals.E += N(game.E);
    careerTotals.TC += N(game.TC); careerTotals.DP += N(game.DP);

    // Pitching
    careerTotals.IP += N(game.IP); careerTotals.H_p += N(game.H_p); careerTotals.R_p += N(game.R_p);
    careerTotals.ER += N(game.ER); careerTotals.BB_p += N(game.BB_p); careerTotals.K_p += N(game.K_p);
    careerTotals.HR_p += N(game.HR_p); careerTotals.BF += N(game.BF); careerTotals.PC += N(game.PC);
  }
}

// Display career overview
dv.header(3, "🏆 Career Overview");
dv.paragraph(`**Seasons Played:** ${careerTotals.seasons} • **Games Played:** ${careerTotals.gamesPlayed} • **Primary Position:** Utility`);

// Career hitting totals
dv.header(3, "🥎 Career Hitting");
dv.table(
  ["[AB](Glossary.md#ab)","[H](Glossary.md#h)","[2B](Glossary.md#2b)","[3B](Glossary.md#3b)","[HR](Glossary.md#hr)","[RBI](Glossary.md#rbi)","[R](Glossary.md#r)","[BB](Glossary.md#bb)","[K](Glossary.md#k)","[HBP](Glossary.md#hbp)","[SF](Glossary.md#sf)","[SB](Glossary.md#sb)","[CS](Glossary.md#cs)"],
  [[careerTotals.AB, careerTotals.H, careerTotals['2B'], careerTotals['3B'], careerTotals.HR, careerTotals.RBI, careerTotals.R, careerTotals.BB, careerTotals.K, careerTotals.HBP, careerTotals.SF, careerTotals.SB, careerTotals.CS]]
);

// Calculate career rates
const singles = Math.max(0, careerTotals.H - careerTotals['2B'] - careerTotals['3B'] - careerTotals.HR);
const AVG = careerTotals.AB ? (careerTotals.H / careerTotals.AB) : 0;
const obpDen = (careerTotals.AB + careerTotals.BB + careerTotals.HBP + careerTotals.SF);
const OBP = obpDen ? ((careerTotals.H + careerTotals.BB + careerTotals.HBP) / obpDen) : 0;
const tb = singles + 2*careerTotals['2B'] + 3*careerTotals['3B'] + 4*careerTotals.HR;
const SLG = careerTotals.AB ? (tb / careerTotals.AB) : 0;
const OPS = OBP + SLG;

dv.header(3, "📈 Career Rates");
dv.table(
  ["[AVG](Glossary.md#avg)","[OBP](Glossary.md#obp)","[SLG](Glossary.md#slg)","[OPS](Glossary.md#ops)"],
  [[AVG.toFixed(3), OBP.toFixed(3), SLG.toFixed(3), OPS.toFixed(3)]]
);

// Advanced career metrics
const BABIP = (careerTotals.AB - careerTotals.K - careerTotals.HR + careerTotals.SF) ?
  ((careerTotals.H - careerTotals.HR) / (careerTotals.AB - careerTotals.K - careerTotals.HR + careerTotals.SF)) : 0;
const ISO = SLG - AVG;
const XBH = careerTotals['2B'] + careerTotals['3B'] + careerTotals.HR;
const XBH_pct = careerTotals.H ? (XBH / careerTotals.H) : 0;
const BB_pct = obpDen ? (careerTotals.BB / obpDen) : 0;
const K_pct = obpDen ? (careerTotals.K / obpDen) : 0;
const clutch_avg = careerTotals.RISP ? (careerTotals.RISP_H / careerTotals.RISP) : 0;
const contact_quality = careerTotals.AB ? (careerTotals.hard_contact / careerTotals.AB) : 0;

dv.header(3, "🔬 Advanced Career Metrics");
dv.table(
  ["[BABIP](Glossary.md#babip)","[ISO](Glossary.md#iso)","[XBH%](Glossary.md#xbh)","[BB%](Glossary.md#bb-rate)","[K%](Glossary.md#k-rate)","Clutch [AVG](Glossary.md#avg)","Contact Quality"],
  [[BABIP.toFixed(3), ISO.toFixed(3), (XBH_pct*100).toFixed(1)+"%",
    (BB_pct*100).toFixed(1)+"%", (K_pct*100).toFixed(1)+"%",
    clutch_avg.toFixed(3), (contact_quality*100).toFixed(1)+"%"]]
);

// Career fielding
dv.header(3, "🧤 Career Fielding");
dv.table(
  ["[PO](Glossary.md#po)","[A](Glossary.md#a)","[E](Glossary.md#e)","[TC](Glossary.md#tc)","[DP](Glossary.md#dp)"],
  [[careerTotals.PO, careerTotals.A, careerTotals.E, careerTotals.TC, careerTotals.DP]]
);

const fldpct = careerTotals.TC ? ((careerTotals.PO + careerTotals.A) / careerTotals.TC) : 0;
dv.paragraph(`**[Fielding %](Glossary.md#fielding-percentage)** ${fldpct.toFixed(3)} • **Range Factor** ${careerTotals.gamesPlayed ? ((careerTotals.PO + careerTotals.A) / careerTotals.gamesPlayed).toFixed(1) : "0.0"} per game`);

// Career pitching (only if there are pitching stats)
if (careerTotals.IP > 0) {
  dv.header(3, "⚾️ Career Pitching");
  dv.table(
    ["[IP](Glossary.md#ip)","[H](Glossary.md#h-pitching)","[R](Glossary.md#r-pitching)","[ER](Glossary.md#er)","[BB](Glossary.md#bb-pitching)","[K](Glossary.md#k-pitching)","[HR](Glossary.md#hr-pitching)","[BF](Glossary.md#bf)","[PC](Glossary.md#pc)"],
    [[careerTotals.IP, careerTotals.H_p, careerTotals.R_p, careerTotals.ER, careerTotals.BB_p, careerTotals.K_p, careerTotals.HR_p, careerTotals.BF, careerTotals.PC]]
  );

  const era = careerTotals.IP ? (careerTotals.ER * 9 / careerTotals.IP) : 0;
  const whip = careerTotals.IP ? ((careerTotals.BB_p + careerTotals.H_p) / careerTotals.IP) : 0;
  const kbb = careerTotals.BB_p ? (careerTotals.K_p / careerTotals.BB_p) : (careerTotals.K_p ? Infinity : 0);
  const k9 = careerTotals.IP ? (careerTotals.K_p * 9 / careerTotals.IP) : 0;
  const bb9 = careerTotals.IP ? (careerTotals.BB_p * 9 / careerTotals.IP) : 0;

  dv.paragraph(`**[ERA](Glossary.md#era)** ${era.toFixed(2)} • **[WHIP](Glossary.md#whip)** ${whip.toFixed(2)} • **[K/BB](Glossary.md#kbb)** ${(kbb===Infinity?'∞':kbb.toFixed(2))}`);
  dv.paragraph(`**[K/9](Glossary.md#k9)** ${k9.toFixed(1)} • **[BB/9](Glossary.md#bb9)** ${bb9.toFixed(1)} • **Pitches/Batter** ${careerTotals.BF ? (careerTotals.PC/careerTotals.BF).toFixed(1) : "N/A"}`);
}
```

---

## 📅 Season History

```dataviewjs
// Display all seasons with links
const seasons = dv.pages('"seasons"').where(p => p.type === "baseball-season-summary");

if (seasons.length > 0) {
  dv.header(3, "🏆 All Seasons");

  // Create season summary table
  const seasonData = seasons.map(s => [
    `[[${s.file.name}|${s.season || 'Unknown Season'}]]`,
    s.team || 'Unknown Team',
    s.player_position || 'Unknown Position',
    s.games_folder || 'games/'
  ]);

  dv.table(
    ["Season", "Team", "Position", "Games Folder"],
    seasonData
  );
} else {
  dv.paragraph("*No season data found. Create season cards in the 'seasons' folder.*");
}
```

---

## 🎯 Career Highlights & Milestones

```dataviewjs
// Recalculate career totals for milestones
const seasonPages = dv.pages('"seasons"').where(p => p.type === "baseball-season-summary");

// Helper function to safely convert values to numbers
const N = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const num = Number(v);
  return isFinite(num) ? num : 0;
};

// Initialize career totals
let careerTotals = {
  seasons: 0, gamesPlayed: 0,
  AB: 0, H: 0, '2B': 0, '3B': 0, HR: 0, RBI: 0, R: 0, BB: 0, K: 0, HBP: 0, SF: 0, SB: 0, CS: 0,
  RISP: 0, RISP_H: 0, hard_contact: 0, pitches_seen: 0,
  PO: 0, A: 0, E: 0, TC: 0, DP: 0,
  IP: 0, H_p: 0, R_p: 0, ER: 0, BB_p: 0, K_p: 0, HR_p: 0, BF: 0, PC: 0
};

// Process each season
for (const season of seasonPages) {
  careerTotals.seasons++;
  const gamesFolder = season.games_folder || 'games/';
  const seasonGames = dv.pages('"' + gamesFolder + '"').where(p => p.type === "baseball-stats");
  const playedGames = seasonGames.where(p =>
    (N(p.AB) > 0) || (N(p.H) > 0) || (N(p.PO) > 0) || (N(p.A) > 0) || (N(p.IP) > 0)
  );
  careerTotals.gamesPlayed += playedGames.length;

  for (const game of playedGames) {
    careerTotals.AB += N(game.AB); careerTotals.H += N(game.H); careerTotals['2B'] += N(game['2B']);
    careerTotals['3B'] += N(game['3B']); careerTotals.HR += N(game.HR); careerTotals.RBI += N(game.RBI);
    careerTotals.R += N(game.R); careerTotals.BB += N(game.BB); careerTotals.K += N(game.K);
    careerTotals.HBP += N(game.HBP); careerTotals.SF += N(game.SF); careerTotals.SB += N(game.SB); careerTotals.CS += N(game.CS);
    careerTotals.RISP += N(game.RISP); careerTotals.RISP_H += N(game.RISP_H);
    careerTotals.hard_contact += N(game.hard_contact); careerTotals.pitches_seen += N(game.pitches_seen);
    careerTotals.PO += N(game.PO); careerTotals.A += N(game.A); careerTotals.E += N(game.E);
    careerTotals.TC += N(game.TC); careerTotals.DP += N(game.DP);
    careerTotals.IP += N(game.IP); careerTotals.H_p += N(game.H_p); careerTotals.R_p += N(game.R_p);
    careerTotals.ER += N(game.ER); careerTotals.BB_p += N(game.BB_p); careerTotals.K_p += N(game.K_p);
    careerTotals.HR_p += N(game.HR_p); careerTotals.BF += N(game.BF); careerTotals.PC += N(game.PC);
  }
}

let careerHighlights = [];
let milestones = [];

// Career milestone tracking
const careerStats = {
  totalHits: careerTotals.H,
  totalHRs: careerTotals.HR,
  totalRBIs: careerTotals.RBI,
  totalGames: careerTotals.gamesPlayed,
  totalSeasons: careerTotals.seasons,
  careerAVG: careerTotals.AB ? (careerTotals.H / careerTotals.AB) : 0
};

// Check for milestones
if (careerStats.totalHits >= 50) milestones.push("🏆 50+ Career Hits");
if (careerStats.totalHits >= 100) milestones.push("🏆 100+ Career Hits");
if (careerStats.totalHRs >= 5) milestones.push("💥 5+ Career Home Runs");
if (careerStats.totalHRs >= 10) milestones.push("💥 10+ Career Home Runs");
if (careerStats.totalRBIs >= 50) milestones.push("🎯 50+ Career RBIs");
if (careerStats.totalRBIs >= 100) milestones.push("🎯 100+ Career RBIs");
if (careerStats.totalGames >= 50) milestones.push("🎮 50+ Games Played");
if (careerStats.totalGames >= 100) milestones.push("🎮 100+ Games Played");
if (careerStats.careerAVG >= 0.300) milestones.push("⭐ .300+ Career Average");
if (careerStats.totalSeasons >= 3) milestones.push("🏃‍♂️ 3+ Seasons Veteran");

dv.header(3, "🏆 Career Milestones");
if (milestones.length > 0) {
  for (const milestone of milestones) {
    dv.paragraph(`- ${milestone}`);
  }
} else {
  dv.paragraph("*Keep playing to unlock career milestones!*");
}

// Calculate personal bests from all game data
dv.header(3, "🌟 Personal Bests");

let singleGameBests = {
  hits: 0, hrs: 0, rbis: 0, runs: 0, walks: 0, stolenBases: 0,
  gameDate: '', gameOpponent: ''
};

let seasonBests = {
  bestAVG: 0, bestOBP: 0, bestSLG: 0, bestOPS: 0,
  mostHits: 0, mostHRs: 0, mostRBIs: 0, mostGames: 0,
  seasonYear: ''
};

// Find single-game bests across all seasons
for (const season of seasonPages) {
  const gamesFolder = season.games_folder || 'games/';
  const seasonGames = dv.pages('"' + gamesFolder + '"').where(p => p.type === "baseball-stats");
  const playedGames = seasonGames.where(p =>
    (N(p.AB) > 0) || (N(p.H) > 0) || (N(p.PO) > 0) || (N(p.A) > 0) || (N(p.IP) > 0)
  );

  // Calculate season totals for this season
  let seasonTotals = { AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, HBP: 0, SF: 0 };

  for (const game of playedGames) {
    // Check single-game records
    const gameHits = N(game.H);
    const gameHRs = N(game.HR);
    const gameRBIs = N(game.RBI);
    const gameRuns = N(game.R);
    const gameWalks = N(game.BB);
    const gameSB = N(game.SB);

    if (gameHits > singleGameBests.hits) {
      singleGameBests.hits = gameHits;
      singleGameBests.gameDate = game.date ? game.date.toString().split('T')[0] : 'Unknown Date';
      singleGameBests.gameOpponent = game.opponent || 'Unknown';
    }
    if (gameHRs > singleGameBests.hrs) singleGameBests.hrs = gameHRs;
    if (gameRBIs > singleGameBests.rbis) singleGameBests.rbis = gameRBIs;
    if (gameRuns > singleGameBests.runs) singleGameBests.runs = gameRuns;
    if (gameWalks > singleGameBests.walks) singleGameBests.walks = gameWalks;
    if (gameSB > singleGameBests.stolenBases) singleGameBests.stolenBases = gameSB;

    // Accumulate season totals
    seasonTotals.AB += N(game.AB); seasonTotals.H += N(game.H); seasonTotals.HR += N(game.HR);
    seasonTotals.RBI += N(game.RBI); seasonTotals.BB += N(game.BB); seasonTotals.HBP += N(game.HBP);
    seasonTotals.SF += N(game.SF);
  }

  // Calculate season rates
  const seasonAVG = seasonTotals.AB ? (seasonTotals.H / seasonTotals.AB) : 0;
  const obpDen = (seasonTotals.AB + seasonTotals.BB + seasonTotals.HBP + seasonTotals.SF);
  const seasonOBP = obpDen ? ((seasonTotals.H + seasonTotals.BB + seasonTotals.HBP) / obpDen) : 0;

  // Calculate season SLG (need to get 2B, 3B from games)
  let seasonSingles = 0, season2B = 0, season3B = 0;
  for (const game of playedGames) {
    season2B += N(game['2B']); season3B += N(game['3B']);
  }
  seasonSingles = Math.max(0, seasonTotals.H - season2B - season3B - seasonTotals.HR);
  const seasonTB = seasonSingles + 2*season2B + 3*season3B + 4*seasonTotals.HR;
  const seasonSLG = seasonTotals.AB ? (seasonTB / seasonTotals.AB) : 0;
  const seasonOPS = seasonOBP + seasonSLG;

  // Check season records
  if (seasonAVG > seasonBests.bestAVG) {
    seasonBests.bestAVG = seasonAVG;
    seasonBests.seasonYear = season.season || 'Unknown Season';
  }
  if (seasonOBP > seasonBests.bestOBP) seasonBests.bestOBP = seasonOBP;
  if (seasonSLG > seasonBests.bestSLG) seasonBests.bestSLG = seasonSLG;
  if (seasonOPS > seasonBests.bestOPS) seasonBests.bestOPS = seasonOPS;
  if (seasonTotals.H > seasonBests.mostHits) seasonBests.mostHits = seasonTotals.H;
  if (seasonTotals.HR > seasonBests.mostHRs) seasonBests.mostHRs = seasonTotals.HR;
  if (seasonTotals.RBI > seasonBests.mostRBIs) seasonBests.mostRBIs = seasonTotals.RBI;
  if (playedGames.length > seasonBests.mostGames) seasonBests.mostGames = playedGames.length;
}

// Display single-game bests
dv.header(4, "Single-Game Records");
if (singleGameBests.hits > 0) {
  dv.paragraph(`**Most Hits:** ${singleGameBests.hits} ${singleGameBests.gameDate ? `(${singleGameBests.gameDate} vs ${singleGameBests.gameOpponent})` : ''}`);
  if (singleGameBests.hrs > 0) dv.paragraph(`**Most Home Runs:** ${singleGameBests.hrs}`);
  if (singleGameBests.rbis > 0) dv.paragraph(`**Most RBIs:** ${singleGameBests.rbis}`);
  if (singleGameBests.runs > 0) dv.paragraph(`**Most Runs:** ${singleGameBests.runs}`);
  if (singleGameBests.walks > 0) dv.paragraph(`**Most Walks:** ${singleGameBests.walks}`);
  if (singleGameBests.stolenBases > 0) dv.paragraph(`**Most Stolen Bases:** ${singleGameBests.stolenBases}`);
} else {
  dv.paragraph("*No single-game records found yet*");
}

// Display season bests
dv.header(4, "Season Records");
if (seasonBests.bestAVG > 0) {
  dv.paragraph(`**Best Season Average:** ${seasonBests.bestAVG.toFixed(3)} ${seasonBests.seasonYear ? `(${seasonBests.seasonYear})` : ''}`);
  if (seasonBests.bestOBP > 0) dv.paragraph(`**Best Season OBP:** ${seasonBests.bestOBP.toFixed(3)}`);
  if (seasonBests.bestSLG > 0) dv.paragraph(`**Best Season SLG:** ${seasonBests.bestSLG.toFixed(3)}`);
  if (seasonBests.bestOPS > 0) dv.paragraph(`**Best Season OPS:** ${seasonBests.bestOPS.toFixed(3)}`);
  if (seasonBests.mostHits > 0) dv.paragraph(`**Most Season Hits:** ${seasonBests.mostHits}`);
  if (seasonBests.mostHRs > 0) dv.paragraph(`**Most Season HRs:** ${seasonBests.mostHRs}`);
  if (seasonBests.mostRBIs > 0) dv.paragraph(`**Most Season RBIs:** ${seasonBests.mostRBIs}`);
  if (seasonBests.mostGames > 0) dv.paragraph(`**Most Games Played:** ${seasonBests.mostGames}`);
} else {
  dv.paragraph("*No season records found yet*");
}
```

---

## 📈 Quick Links

- **[📊 All Season Cards](seasons/)** - Detailed season-by-season breakdowns
- **[📅 Game Logs](games/)** - Individual game statistics
- **[📖 Baseball Glossary](Glossary.md)** - Statistical definitions and explanations
- **[⚙️ Templates](templates/)** - Templates for new games and seasons

---

> [!tip] 📊 Statistical Notes
> - Career statistics automatically aggregate from all season data
> - Click any statistic abbreviation to view its definition in the [Glossary](Glossary.md)
> - Season cards provide detailed breakdowns with advanced analytics
> - Game logs contain the raw data feeding all statistics

*Last updated automatically from season data*