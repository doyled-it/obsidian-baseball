---
type: baseball-season-summary
season: Summer 2025
player: Michael Doyle
team: Happy Sox
player_position: Utility (P/IF/OF)
games_folder: games/2025/summer
---

# 📇 Enhanced Season Baseball Card – `=this.season`

> [!info]+ Player Profile
**Player:** `=this.player`
**Team:** `=this.team`
**Position:** `=this.player_position`
**Season:** `=this.season`
**Games folder:** `=this.games_folder`

---

## 🥎 Hitting Performance

```dataviewjs
const cur = dv.current();
const allPages = dv.pages('"' + cur.games_folder + '"').where(p => p.type === "baseball-stats");

// Filter to only games where you actually played (have hitting stats)
const pages = allPages.where(p => (Number(p.AB ?? 0) > 0) || (Number(p.H ?? 0) > 0));

// Helper to safely coerce numbers
const N = (v) => Number(v ?? 0);

// Calculate sums
let totals = {
  AB: 0, H: 0, "2B": 0, "3B": 0, HR: 0, RBI: 0, R: 0, BB: 0, K: 0, HBP: 0, SF: 0, SB: 0, CS: 0,
  RISP: 0, RISP_H: 0, hard_contact: 0, pitches_seen: 0
};

for (const p of pages) {
  totals.AB += N(p.AB); totals.H += N(p.H); totals["2B"] += N(p["2B"]);
  totals["3B"] += N(p["3B"]); totals.HR += N(p.HR); totals.RBI += N(p.RBI);
  totals.R += N(p.R); totals.BB += N(p.BB); totals.K += N(p.K);
  totals.HBP += N(p.HBP); totals.SF += N(p.SF); totals.SB += N(p.SB); totals.CS += N(p.CS);
  totals.RISP += N(p.RISP); totals.RISP_H += N(p.RISP_H);
  totals.hard_contact += N(p.hard_contact); totals.pitches_seen += N(p.pitches_seen);
}

// Basic stats table
dv.header(3, "📊 Basic Totals");
dv.table(
  ["AB","H","2B","3B","HR","RBI","R","BB","K","HBP","SF","SB","CS"],
  [[totals.AB, totals.H, totals["2B"], totals["3B"], totals.HR, totals.RBI, totals.R, totals.BB, totals.K, totals.HBP, totals.SF, totals.SB, totals.CS]]
);

// Calculate standard rates
const singles = Math.max(0, totals.H - totals["2B"] - totals["3B"] - totals.HR);
const AVG = totals.AB ? (totals.H / totals.AB) : 0;
const obpDen = (totals.AB + totals.BB + totals.HBP + totals.SF);
const OBP = obpDen ? ((totals.H + totals.BB + totals.HBP) / obpDen) : 0;
const tb = singles + 2*totals["2B"] + 3*totals["3B"] + 4*totals.HR;
const SLG = totals.AB ? (tb / totals.AB) : 0;
const OPS = OBP + SLG;

// Advanced metrics
const BABIP = (totals.AB - totals.K - totals.HR + totals.SF) ?
  ((totals.H - totals.HR) / (totals.AB - totals.K - totals.HR + totals.SF)) : 0;
const ISO = SLG - AVG;
const XBH = totals["2B"] + totals["3B"] + totals.HR;
const XBH_pct = totals.H ? (XBH / totals.H) : 0;
const BB_pct = obpDen ? (totals.BB / obpDen) : 0;
const K_pct = obpDen ? (totals.K / obpDen) : 0;
const clutch_avg = totals.RISP ? (totals.RISP_H / totals.RISP) : 0;
const contact_quality = totals.AB ? (totals.hard_contact / totals.AB) : 0;

dv.header(3, "📈 Standard Rates");
dv.table(
  ["AVG","OBP","SLG","OPS"],
  [[AVG.toFixed(3), OBP.toFixed(3), SLG.toFixed(3), OPS.toFixed(3)]]
);

dv.header(3, "🔬 Advanced Metrics");
dv.table(
  ["BABIP","ISO","XBH%","BB%","K%","Clutch Avg","Contact Quality"],
  [[BABIP.toFixed(3), ISO.toFixed(3), (XBH_pct*100).toFixed(1)+"%",
    (BB_pct*100).toFixed(1)+"%", (K_pct*100).toFixed(1)+"%",
    clutch_avg.toFixed(3), (contact_quality*100).toFixed(1)+"%"]]
);

dv.header(3, "🎯 Clutch Performance");
dv.paragraph(`**With RISP:** ${totals.RISP_H}/${totals.RISP} (${clutch_avg.toFixed(3)})`);
dv.paragraph(`**Hard Contact Rate:** ${(contact_quality*100).toFixed(1)}% (${totals.hard_contact}/${totals.AB})`);
dv.paragraph(`**Pitches/PA:** ${totals.pitches_seen && obpDen ? (totals.pitches_seen / obpDen).toFixed(1) : "N/A"}`);
```

---

## 🧤 Fielding Performance

```dataviewjs
const cur2 = dv.current();
const allPages2 = dv.pages('"' + cur2.games_folder + '"').where(p => p.type === "baseball-stats");
// Filter to games where you played (have hitting, fielding, or pitching stats)
const pages2 = allPages2.where(p => (Number(p.AB ?? 0) > 0) || (Number(p.PO ?? 0) > 0) || (Number(p.A ?? 0) > 0) || (Number(p.IP ?? 0) > 0));
const N2 = (v) => Number(v ?? 0);
let PO=0,A=0,E=0,TC=0,DP=0;
for (const p of pages2){ PO+=N2(p.PO); A+=N2(p.A); E+=N2(p.E); TC+=N2(p.TC); DP+=N2(p.DP); }

dv.table(
  ["PO","A","E","TC","DP"],
  [[PO, A, E, TC, DP]]
);

const fldpct = TC ? ( (PO + A) / TC ) : 0;
dv.paragraph(`**Fielding %** ${fldpct.toFixed(3)} • **Range Factor** ${pages2.length ? ((PO + A) / pages2.length).toFixed(1) : "0.0"} per game`);
```

---

## ⚾️ Pitching Performance

```dataviewjs
const cur3 = dv.current();
const allPages3 = dv.pages('"' + cur3.games_folder + '"').where(p => p.type === "baseball-stats");
// Filter to games where you played
const pages3 = allPages3.where(p => (Number(p.AB ?? 0) > 0) || (Number(p.PO ?? 0) > 0) || (Number(p.A ?? 0) > 0) || (Number(p.IP ?? 0) > 0));
const N3 = (v) => Number(v ?? 0);
let IP=0,H_p=0,R_p=0,ER=0,BB_p=0,K_p=0,HR_p=0,BF=0,PC=0;
for (const p of pages3){ IP+=N3(p.IP); H_p+=N3(p.H_p); R_p+=N3(p.R_p); ER+=N3(p.ER); BB_p+=N3(p.BB_p); K_p+=N3(p.K_p); HR_p+=N3(p.HR_p); BF+=N3(p.BF); PC+=N3(p.PC); }

if (IP > 0) {
  dv.table(
    ["IP","H","R","ER","BB","K","HR","BF","PC"],
    [[IP, H_p, R_p, ER, BB_p, K_p, HR_p, BF, PC]]
  );

  const era = IP ? (ER * 9 / IP) : 0;
  const whip = IP ? ((BB_p + H_p) / IP) : 0;
  const kbb = BB_p ? (K_p / BB_p) : (K_p ? Infinity : 0);
  const k9 = IP ? (K_p * 9 / IP) : 0;
  const bb9 = IP ? (BB_p * 9 / IP) : 0;

  dv.paragraph(`**ERA** ${era.toFixed(2)} • **WHIP** ${whip.toFixed(2)} • **K/BB** ${(kbb===Infinity?'∞':kbb.toFixed(2))}`);
  dv.paragraph(`**K/9** ${k9.toFixed(1)} • **BB/9** ${bb9.toFixed(1)} • **Pitches/Batter** ${BF ? (PC/BF).toFixed(1) : "N/A"}`);
} else {
  dv.paragraph("*No pitching statistics recorded this season*");
}
```

---

## 🏆 Signature Moments & Performance Trends

```dataviewjs
const cur4 = dv.current();
const allPages4 = dv.pages('"' + cur4.games_folder + '"').where(p => p.type === "baseball-stats");
// Filter to games where you played
const pages4 = allPages4.where(p => (Number(p.AB ?? 0) > 0) || (Number(p.PO ?? 0) > 0) || (Number(p.A ?? 0) > 0) || (Number(p.IP ?? 0) > 0));
const N4 = (v) => Number(v ?? 0);

// Find signature games
let signatureGames = [];
let gameRatings = [];
let monthlyStats = {};

for (const p of pages4) {
  const hits = N4(p.H);
  const hrs = N4(p.HR);
  const rbis = N4(p.RBI);
  const rating = N4(p.game_rating);
  const ab = N4(p.AB);

  // Signature game criteria
  let reasons = [];
  if (hits >= 3) reasons.push(`${hits} hits`);
  if (hrs >= 1) reasons.push(`${hrs} HR`);
  if (rbis >= 3) reasons.push(`${rbis} RBI`);
  if (ab >= 4 && hits === ab) reasons.push("Perfect batting");
  if (rating >= 9) reasons.push("Outstanding game");

  if (reasons.length > 0) {
    // Format date properly
    const gameDate = p.date ? p.date.toString().split('T')[0] : "Unknown Date";
    signatureGames.push({
      file: p.file.name,
      date: gameDate,
      opponent: p.opponent || "Unknown",
      reasons: reasons,
      rating: rating
    });
  }

  if (rating > 0) gameRatings.push(rating);

  // Monthly breakdown
  if (p.date) {
    const month = p.date.toString().split('T')[0].substring(0, 7); // YYYY-MM
    if (!monthlyStats[month]) {
      monthlyStats[month] = {games: 0, hits: 0, abs: 0, hrs: 0};
    }
    monthlyStats[month].games++;
    monthlyStats[month].hits += hits;
    monthlyStats[month].abs += ab;
    monthlyStats[month].hrs += hrs;
  }
}

// Display signature games
dv.header(3, "⭐ Signature Games");
if (signatureGames.length > 0) {
  // Sort by rating, then by date
  signatureGames.sort((a, b) => (b.rating - a.rating) || (b.date - a.date));

  for (const game of signatureGames.slice(0, 5)) { // Top 5
    dv.paragraph(`**${game.date}** vs ${game.opponent} - ${game.reasons.join(", ")} ${game.rating ? `(${game.rating}/10)` : ""}`);
  }
} else {
  dv.paragraph("*No signature games yet - keep grinding!*");
}

// Performance trends
dv.header(3, "📈 Performance Trends");
if (gameRatings.length > 0) {
  const avgRating = gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length;
  const recentGames = gameRatings.slice(-5);
  const recentAvg = recentGames.reduce((a, b) => a + b, 0) / recentGames.length;
  const trend = recentAvg > avgRating ? "📈 Trending up" :
                recentAvg < avgRating ? "📉 Trending down" : "➡️ Steady";

  dv.paragraph(`**Season Rating:** ${avgRating.toFixed(1)}/10 • **Recent (last 5):** ${recentAvg.toFixed(1)}/10 ${trend}`);
}

// Monthly progression
if (Object.keys(monthlyStats).length > 1) {
  dv.header(4, "Monthly Progression");
  const months = Object.keys(monthlyStats).sort();
  for (const month of months) {
    const stats = monthlyStats[month];
    const avg = stats.abs ? (stats.hits / stats.abs) : 0;
    dv.paragraph(`**${month}:** ${stats.games} games, ${avg.toFixed(3)} avg, ${stats.hrs} HR`);
  }
}
```

---

## 🎯 Season Goals & Insights

```dataviewjs
const cur5 = dv.current();
const pages5 = dv.pages('"' + cur5.games_folder + '"').where(p => p.type === "baseball-stats");

// Calculate some season insights
const totalGames = pages5.length;
let homeGames = 0;
let teamWins = 0;
let gamesPlayed = 0; // Only count games where you actually played

for (const p of pages5) {
  // Only count if you played (have at least some stats)
  const playedInGame = (Number(p.AB ?? 0) > 0) || (Number(p.IP ?? 0) > 0) || (Number(p.PO ?? 0) > 0) || (Number(p.A ?? 0) > 0);

  if (playedInGame) {
    gamesPlayed++;

    // Check if home game (no @ symbol means home)
    if (p.location && !p.location.toString().includes("@")) {
      homeGames++;
    }
  }

  // Count team wins regardless of whether you played
  if (p.result === "W") teamWins++;
}

dv.header(3, "📊 Season Overview");
dv.paragraph(`**Games Played (by you):** ${gamesPlayed} • **Home:** ${homeGames} • **Away:** ${gamesPlayed - homeGames}`);
dv.paragraph(`**Total Team Games:** ${totalGames}`);
const teamWinPct = totalGames ? (teamWins/totalGames) : 0;
dv.paragraph(`**Team Record:** ${teamWins}-${totalGames - teamWins} (${teamWinPct.toFixed(3)})`);

// Goals tracking (you can customize these)
let seasonAB = 0, seasonH = 0, seasonHR = 0;
for (const p of pages5) {
  seasonAB += Number(p.AB ?? 0);
  seasonH += Number(p.H ?? 0);
  seasonHR += Number(p.HR ?? 0);
}
const currentAvg = seasonAB ? (seasonH / seasonAB) : 0;

dv.header(3, "🎯 Season Goals Progress");
dv.paragraph(`**Batting Average Goal:** .300 → Currently ${currentAvg.toFixed(3)} ${currentAvg >= 0.300 ? "✅" : "🎯"}`);
dv.paragraph(`**Home Run Goal:** 1 → Currently ${seasonHR} ${seasonHR >= 1 ? "✅" : "🎯"}`);
dv.paragraph(`**Games Played Goal:** 8 → Currently ${gamesPlayed} ${gamesPlayed >= 8 ? "✅" : "🎯"}`);
```

---

> [!star] 🏆 Highlights
- **Best Game:**
- **Key Breakthrough:**
- **Next Focus Area:**
- **End of Season Goals:**