#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';

// Helper function to safely convert values to numbers
const N = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const num = Number(v);
  return isFinite(num) ? num : 0;
};

// Parse a game file and extract stats
function parseGameFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);

    // Extract inline fields from content using regex
    const stats = {};
    // Look for patterns like "- AB:: 4" with more precise matching
    const inlineFieldRegex = /^-\s+([A-Za-z0-9_]+)::\s*([0-9]*\.?[0-9]*)$/gm;
    let match;

    while ((match = inlineFieldRegex.exec(parsed.content)) !== null) {
      const field = match[1].trim();
      const value = match[2].trim();

      // Convert empty strings to 0, otherwise keep the numeric value
      stats[field] = value === '' ? 0 : (isNaN(Number(value)) ? 0 : Number(value));
      console.log(`Found field: "${field}" = "${stats[field]}"`);
    }

    // Log all found stats for debugging
    console.log(`Stats found in ${filePath}:`, stats);

    return {
      frontmatter: parsed.data,
      stats: stats
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

// Find all game files
function findGameFiles(gamesDir) {
  const gameFiles = [];

  function searchDir(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (item.endsWith('.md')) {
        gameFiles.push(fullPath);
      }
    }
  }

  searchDir(gamesDir);
  return gameFiles;
}

// Calculate season statistics
function calculateSeasonStats(gamesFolder) {
  const gameFiles = findGameFiles(gamesFolder);
  const games = [];

  // Parse all game files
  console.log(`Found ${gameFiles.length} potential game files in ${gamesFolder}`);

  for (const filePath of gameFiles) {
    console.log(`Processing file: ${filePath}`);
    const gameData = parseGameFile(filePath);
    if (gameData && gameData.frontmatter.type === 'baseball-stats') {
      console.log(`Added game: ${filePath}`);
      games.push(gameData);
    } else {
      console.log(`Skipped file (not baseball-stats): ${filePath}`);
    }
  }

  console.log(`Total games found: ${games.length}`);

  // Filter to games where player actually played
  const playedGames = games.filter(game => {
    const stats = game.stats;
    return N(stats.AB) > 0 || N(stats.H) > 0 || N(stats.PO) > 0 || N(stats.A) > 0 || N(stats.IP) > 0;
  });

  // Calculate totals
  const totals = {
    // Hitting
    AB: 0, H: 0, '2B': 0, '3B': 0, HR: 0, RBI: 0, R: 0, BB: 0, K: 0, HBP: 0, SF: 0, SB: 0, CS: 0,
    RISP: 0, RISP_H: 0, hard_contact: 0, pitches_seen: 0,
    // Fielding
    PO: 0, A: 0, E: 0, TC: 0, DP: 0,
    // Pitching
    IP: 0, H_p: 0, R_p: 0, ER: 0, BB_p: 0, K_p: 0, HR_p: 0, BF: 0, PC: 0
  };

  for (const game of playedGames) {
    const s = game.stats;
    console.log(`Processing game stats:`, s);

    // Hitting
    totals.AB += N(s.AB); totals.H += N(s.H); totals['2B'] += N(s['2B']);
    totals['3B'] += N(s['3B']); totals.HR += N(s.HR); totals.RBI += N(s.RBI);
    totals.R += N(s.R); totals.BB += N(s.BB); totals.K += N(s.K);
    totals.HBP += N(s.HBP); totals.SF += N(s.SF); totals.SB += N(s.SB); totals.CS += N(s.CS);
    totals.RISP += N(s.RISP); totals.RISP_H += N(s.RISP_H);
    totals.hard_contact += N(s.hard_contact); totals.pitches_seen += N(s.pitches_seen);

    // Fielding
    totals.PO += N(s.PO); totals.A += N(s.A); totals.E += N(s.E);
    totals.TC += N(s.TC); totals.DP += N(s.DP);

    // Pitching
    totals.IP += N(s.IP); totals.H_p += N(s.H_p); totals.R_p += N(s.R_p);
    totals.ER += N(s.ER); totals.BB_p += N(s.BB_p); totals.K_p += N(s.K_p);
    totals.HR_p += N(s.HR_p); totals.BF += N(s.BF); totals.PC += N(s.PC);
  }

  console.log(`Final totals:`, totals);

  // Calculate rates
  const singles = Math.max(0, totals.H - totals['2B'] - totals['3B'] - totals.HR);
  const AVG = totals.AB ? (totals.H / totals.AB) : 0;
  const obpDen = (totals.AB + totals.BB + totals.HBP + totals.SF);
  const OBP = obpDen ? ((totals.H + totals.BB + totals.HBP) / obpDen) : 0;
  const tb = singles + 2*totals['2B'] + 3*totals['3B'] + 4*totals.HR;
  const SLG = totals.AB ? (tb / totals.AB) : 0;
  const OPS = OBP + SLG;

  // Advanced metrics
  const BABIP = (totals.AB - totals.K - totals.HR + totals.SF) ?
    ((totals.H - totals.HR) / (totals.AB - totals.K - totals.HR + totals.SF)) : 0;
  const ISO = SLG - AVG;
  const XBH = totals['2B'] + totals['3B'] + totals.HR;
  const XBH_pct = totals.H ? (XBH / totals.H) : 0;
  const BB_pct = obpDen ? (totals.BB / obpDen) : 0;
  const K_pct = obpDen ? (totals.K / obpDen) : 0;
  const clutch_avg = totals.RISP ? (totals.RISP_H / totals.RISP) : 0;
  const contact_quality = totals.AB ? (totals.hard_contact / totals.AB) : 0;

  // Fielding
  const fldpct = totals.TC ? ((totals.PO + totals.A) / totals.TC) : 0;

  // Pitching
  const era = totals.IP ? (totals.ER * 9 / totals.IP) : 0;
  const whip = totals.IP ? ((totals.BB_p + totals.H_p) / totals.IP) : 0;
  const kbb = totals.BB_p ? (totals.K_p / totals.BB_p) : (totals.K_p ? Infinity : 0);
  const k9 = totals.IP ? (totals.K_p * 9 / totals.IP) : 0;
  const bb9 = totals.IP ? (totals.BB_p * 9 / totals.IP) : 0;

  return {
    totals,
    rates: { AVG, OBP, SLG, OPS, BABIP, ISO, XBH_pct, BB_pct, K_pct, clutch_avg, contact_quality, fldpct, era, whip, kbb, k9, bb9 },
    games: playedGames,
    gamesPlayed: playedGames.length
  };
}

// Generate static tables
function generateStaticTables(stats) {
  const { totals, rates } = stats;

  // Basic totals table
  const basicTotalsTable = `
| AB | H | 2B | 3B | HR | RBI | R | BB | K | HBP | SF | SB | CS |
|----|---|----|----|----|----|---|----|----|-----|----|----|----|
| ${totals.AB} | ${totals.H} | ${totals['2B']} | ${totals['3B']} | ${totals.HR} | ${totals.RBI} | ${totals.R} | ${totals.BB} | ${totals.K} | ${totals.HBP} | ${totals.SF} | ${totals.SB} | ${totals.CS} |
`;

  // Standard rates table
  const standardRatesTable = `
| AVG | OBP | SLG | OPS |
|-----|-----|-----|-----|
| ${rates.AVG.toFixed(3)} | ${rates.OBP.toFixed(3)} | ${rates.SLG.toFixed(3)} | ${rates.OPS.toFixed(3)} |
`;

  // Advanced metrics table
  const advancedMetricsTable = `
| BABIP | ISO | XBH% | BB% | K% | Clutch Avg | Contact Quality |
|-------|-----|------|-----|----|-----------|-----------------|
| ${rates.BABIP.toFixed(3)} | ${rates.ISO.toFixed(3)} | ${(rates.XBH_pct*100).toFixed(1)}% | ${(rates.BB_pct*100).toFixed(1)}% | ${(rates.K_pct*100).toFixed(1)}% | ${rates.clutch_avg.toFixed(3)} | ${(rates.contact_quality*100).toFixed(1)}% |
`;

  // Fielding table
  const fieldingTable = `
| PO | A | E | TC | DP |
|----|---|---|----|----|
| ${totals.PO} | ${totals.A} | ${totals.E} | ${totals.TC} | ${totals.DP} |
`;

  // Pitching table (only if there are pitching stats)
  let pitchingSection = "";
  if (totals.IP > 0) {
    const pitchingTable = `
| IP | H | R | ER | BB | K | HR | BF | PC |
|----|---|---|----|----|---|----|----|----|
| ${totals.IP} | ${totals.H_p} | ${totals.R_p} | ${totals.ER} | ${totals.BB_p} | ${totals.K_p} | ${totals.HR_p} | ${totals.BF} | ${totals.PC} |
`;

    pitchingSection = `
${pitchingTable}

**ERA** ${rates.era.toFixed(2)} • **WHIP** ${rates.whip.toFixed(2)} • **K/BB** ${rates.kbb === Infinity ? '∞' : rates.kbb.toFixed(2)}

**K/9** ${rates.k9.toFixed(1)} • **BB/9** ${rates.bb9.toFixed(1)} • **Pitches/Batter** ${totals.BF ? (totals.PC/totals.BF).toFixed(1) : "N/A"}
`;
  } else {
    pitchingSection = "*No pitching statistics recorded this season*";
  }

  // Clutch performance
  const clutchPerformance = `
**With RISP:** ${totals.RISP_H}/${totals.RISP} (${rates.clutch_avg.toFixed(3)})

**Hard Contact Rate:** ${(rates.contact_quality*100).toFixed(1)}% (${totals.hard_contact}/${totals.AB})

**Pitches/PA:** ${totals.pitches_seen && (totals.AB + totals.BB + totals.HBP + totals.SF) ? (totals.pitches_seen / (totals.AB + totals.BB + totals.HBP + totals.SF)).toFixed(1) : "N/A"}
`;

  // Fielding percentage
  const fieldingPercentage = `**Fielding %** ${rates.fldpct.toFixed(3)} • **Range Factor** ${stats.gamesPlayed ? ((totals.PO + totals.A) / stats.gamesPlayed).toFixed(1) : "0.0"} per game`;

  return {
    basicTotalsTable,
    standardRatesTable,
    advancedMetricsTable,
    fieldingTable,
    fieldingPercentage,
    pitchingSection,
    clutchPerformance
  };
}

// Generate signature moments and performance trends
function generateSignatureMoments(stats) {
  const { games } = stats;

  // Find signature games
  let signatureGames = [];
  let gameRatings = [];
  let monthlyStats = {};

  for (const game of games) {
    const hits = N(game.stats.H);
    const hrs = N(game.stats.HR);
    const rbis = N(game.stats.RBI);
    const rating = N(game.stats.game_rating);
    const ab = N(game.stats.AB);

    // Signature game criteria
    let reasons = [];
    if (hits >= 3) reasons.push(`${hits} hits`);
    if (hrs >= 1) reasons.push(`${hrs} HR`);
    if (rbis >= 3) reasons.push(`${rbis} RBI`);
    if (ab >= 4 && hits === ab) reasons.push("Perfect batting");
    if (rating >= 9) reasons.push("Outstanding game");

    if (reasons.length > 0) {
      // Get date from frontmatter or filename
      const gameDate = game.frontmatter.date || "Unknown Date";
      signatureGames.push({
        date: gameDate,
        opponent: game.frontmatter.opponent || "Unknown",
        reasons: reasons,
        rating: rating
      });
    }

    if (rating > 0) gameRatings.push(rating);

    // Monthly breakdown
    if (game.frontmatter.date) {
      const month = game.frontmatter.date.toString().substring(0, 7); // YYYY-MM
      if (!monthlyStats[month]) {
        monthlyStats[month] = {games: 0, hits: 0, abs: 0, hrs: 0};
      }
      monthlyStats[month].games++;
      monthlyStats[month].hits += hits;
      monthlyStats[month].abs += ab;
      monthlyStats[month].hrs += hrs;
    }
  }

  // Generate signature games section
  let signatureSection = "### ⭐ Signature Games\n\n";
  if (signatureGames.length > 0) {
    // Sort by rating, then by date
    signatureGames.sort((a, b) => (b.rating - a.rating) || (b.date - a.date));

    for (const game of signatureGames.slice(0, 5)) { // Top 5
      signatureSection += `**${game.date}** vs ${game.opponent} - ${game.reasons.join(", ")} ${game.rating ? `(${game.rating}/10)` : ""}\n\n`;
    }
  } else {
    signatureSection += "*No signature games yet - keep grinding!*\n\n";
  }

  // Generate performance trends section
  signatureSection += "### 📈 Performance Trends\n\n";
  if (gameRatings.length > 0) {
    const avgRating = gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length;
    const recentGames = gameRatings.slice(-5);
    const recentAvg = recentGames.reduce((a, b) => a + b, 0) / recentGames.length;
    const trend = recentAvg > avgRating ? "📈 Trending up" :
                  recentAvg < avgRating ? "📉 Trending down" : "➡️ Steady";

    signatureSection += `**Season Rating:** ${avgRating.toFixed(1)}/10 • **Recent (last 5):** ${recentAvg.toFixed(1)}/10 ${trend}\n\n`;
  }

  // Monthly progression
  if (Object.keys(monthlyStats).length > 1) {
    signatureSection += "#### Monthly Progression\n\n";
    const months = Object.keys(monthlyStats).sort();
    for (const month of months) {
      const stats = monthlyStats[month];
      const avg = stats.abs ? (stats.hits / stats.abs) : 0;
      signatureSection += `**${month}:** ${stats.games} games, ${avg.toFixed(3)} avg, ${stats.hrs} HR\n\n`;
    }
  }

  return signatureSection;
}

// Generate season goals and insights
function generateSeasonGoals(stats) {
  const { games, totals } = stats;

  let goalsSection = "### 📊 Season Overview\n\n";

  // Calculate basic season info
  const totalGames = games.length;
  let homeGames = 0;
  let teamWins = 0;

  for (const game of games) {
    // Check if home game (no @ symbol means home)
    if (game.frontmatter.location && !game.frontmatter.location.toString().includes("@")) {
      homeGames++;
    }

    // Count team wins
    if (game.frontmatter.result === "W") teamWins++;
  }

  goalsSection += `**Games Played:** ${totalGames} • **Home:** ${homeGames} • **Away:** ${totalGames - homeGames}\n\n`;
  const teamWinPct = totalGames ? (teamWins/totalGames) : 0;
  goalsSection += `**Team Record:** ${teamWins}-${totalGames - teamWins} (${teamWinPct.toFixed(3)})\n\n`;

  // Goals tracking
  const currentAvg = totals.AB ? (totals.H / totals.AB) : 0;

  goalsSection += "### 🎯 Season Goals Progress\n\n";
  goalsSection += `**Batting Average Goal:** .300 → Currently ${currentAvg.toFixed(3)} ${currentAvg >= 0.300 ? "✅" : "🎯"}\n\n`;
  goalsSection += `**Home Run Goal:** 1 → Currently ${totals.HR} ${totals.HR >= 1 ? "✅" : "🎯"}\n\n`;
  goalsSection += `**Games Played Goal:** 8 → Currently ${totalGames} ${totalGames >= 8 ? "✅" : "🎯"}\n\n`;

  return goalsSection;
}

// Calculate career statistics for index page
function calculateCareerStats(contentDir) {
  const seasonsDir = path.join(contentDir, 'seasons');
  let careerTotals = {
    seasons: 0, gamesPlayed: 0,
    AB: 0, H: 0, '2B': 0, '3B': 0, HR: 0, RBI: 0, R: 0, BB: 0, K: 0, HBP: 0, SF: 0, SB: 0, CS: 0,
    RISP: 0, RISP_H: 0, hard_contact: 0, pitches_seen: 0,
    PO: 0, A: 0, E: 0, TC: 0, DP: 0,
    IP: 0, H_p: 0, R_p: 0, ER: 0, BB_p: 0, K_p: 0, HR_p: 0, BF: 0, PC: 0
  };

  if (!fs.existsSync(seasonsDir)) return careerTotals;

  const seasonFiles = fs.readdirSync(seasonsDir).filter(f => f.endsWith('.md'));

  for (const seasonFile of seasonFiles) {
    const seasonPath = path.join(seasonsDir, seasonFile);
    const seasonContent = fs.readFileSync(seasonPath, 'utf8');
    const seasonParsed = matter(seasonContent);

    if (seasonParsed.data.type === 'baseball-season-summary') {
      careerTotals.seasons++;

      const gamesFolder = path.join(contentDir, seasonParsed.data.games_folder || 'games/');
      if (fs.existsSync(gamesFolder)) {
        const gameFiles = findGameFiles(gamesFolder);

        for (const gameFile of gameFiles) {
          const gameData = parseGameFile(gameFile);
          if (gameData && gameData.frontmatter.type === 'baseball-stats') {
            const stats = gameData.stats;

            // Check if player actually played
            if (N(stats.AB) > 0 || N(stats.H) > 0 || N(stats.PO) > 0 || N(stats.A) > 0 || N(stats.IP) > 0) {
              careerTotals.gamesPlayed++;

              // Sum all statistics
              careerTotals.AB += N(stats.AB); careerTotals.H += N(stats.H); careerTotals['2B'] += N(stats['2B']);
              careerTotals['3B'] += N(stats['3B']); careerTotals.HR += N(stats.HR); careerTotals.RBI += N(stats.RBI);
              careerTotals.R += N(stats.R); careerTotals.BB += N(stats.BB); careerTotals.K += N(stats.K);
              careerTotals.HBP += N(stats.HBP); careerTotals.SF += N(stats.SF); careerTotals.SB += N(stats.SB); careerTotals.CS += N(stats.CS);
              careerTotals.RISP += N(stats.RISP); careerTotals.RISP_H += N(stats.RISP_H);
              careerTotals.hard_contact += N(stats.hard_contact); careerTotals.pitches_seen += N(stats.pitches_seen);
              careerTotals.PO += N(stats.PO); careerTotals.A += N(stats.A); careerTotals.E += N(stats.E);
              careerTotals.TC += N(stats.TC); careerTotals.DP += N(stats.DP);
              careerTotals.IP += N(stats.IP); careerTotals.H_p += N(stats.H_p); careerTotals.R_p += N(stats.R_p);
              careerTotals.ER += N(stats.ER); careerTotals.BB_p += N(stats.BB_p); careerTotals.K_p += N(stats.K_p);
              careerTotals.HR_p += N(stats.HR_p); careerTotals.BF += N(stats.BF); careerTotals.PC += N(stats.PC);
            }
          }
        }
      }
    }
  }

  return careerTotals;
}

// Generate career statistics tables
function generateCareerTables(careerTotals, contentDir) {
  // Career overview
  const careerOverview = `### 🏆 Career Overview

**Seasons Played:** ${careerTotals.seasons} • **Games Played:** ${careerTotals.gamesPlayed} • **Primary Position:** Utility`;

  // Career hitting table
  const careerHittingTable = `### 🥎 Career Hitting

| [AB](Glossary.md#ab) | [H](Glossary.md#h) | [2B](Glossary.md#2b) | [3B](Glossary.md#3b) | [HR](Glossary.md#hr) | [RBI](Glossary.md#rbi) | [R](Glossary.md#r) | [BB](Glossary.md#bb) | [K](Glossary.md#k) | [HBP](Glossary.md#hbp) | [SF](Glossary.md#sf) | [SB](Glossary.md#sb) | [CS](Glossary.md#cs) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ${careerTotals.AB} | ${careerTotals.H} | ${careerTotals['2B']} | ${careerTotals['3B']} | ${careerTotals.HR} | ${careerTotals.RBI} | ${careerTotals.R} | ${careerTotals.BB} | ${careerTotals.K} | ${careerTotals.HBP} | ${careerTotals.SF} | ${careerTotals.SB} | ${careerTotals.CS} |`;

  // Calculate career rates
  const singles = Math.max(0, careerTotals.H - careerTotals['2B'] - careerTotals['3B'] - careerTotals.HR);
  const AVG = careerTotals.AB ? (careerTotals.H / careerTotals.AB) : 0;
  const obpDen = (careerTotals.AB + careerTotals.BB + careerTotals.HBP + careerTotals.SF);
  const OBP = obpDen ? ((careerTotals.H + careerTotals.BB + careerTotals.HBP) / obpDen) : 0;
  const tb = singles + 2*careerTotals['2B'] + 3*careerTotals['3B'] + 4*careerTotals.HR;
  const SLG = careerTotals.AB ? (tb / careerTotals.AB) : 0;
  const OPS = OBP + SLG;

  const careerRatesTable = `### 📈 Career Rates

| [AVG](Glossary.md#avg) | [OBP](Glossary.md#obp) | [SLG](Glossary.md#slg) | [OPS](Glossary.md#ops) |
|---|---|---|---|
| ${AVG.toFixed(3)} | ${OBP.toFixed(3)} | ${SLG.toFixed(3)} | ${OPS.toFixed(3)} |`;

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

  const advancedMetricsTable = `### 🔬 Advanced Career Metrics

| [BABIP](Glossary.md#babip) | [ISO](Glossary.md#iso) | [XBH%](Glossary.md#xbh) | [BB%](Glossary.md#bb-rate) | [K%](Glossary.md#k-rate) | Clutch [AVG](Glossary.md#avg) | Contact Quality |
|---|---|---|---|---|---|---|
| ${BABIP.toFixed(3)} | ${ISO.toFixed(3)} | ${(XBH_pct*100).toFixed(1)}% | ${(BB_pct*100).toFixed(1)}% | ${(K_pct*100).toFixed(1)}% | ${clutch_avg.toFixed(3)} | ${(contact_quality*100).toFixed(1)}% |`;

  // Career fielding
  const fldpct = careerTotals.TC ? ((careerTotals.PO + careerTotals.A) / careerTotals.TC) : 0;
  const careerFieldingTable = `### 🧤 Career Fielding

| [PO](Glossary.md#po) | [A](Glossary.md#a) | [E](Glossary.md#e) | [TC](Glossary.md#tc) | [DP](Glossary.md#dp) |
|---|---|---|---|---|
| ${careerTotals.PO} | ${careerTotals.A} | ${careerTotals.E} | ${careerTotals.TC} | ${careerTotals.DP} |

**[Fielding %](Glossary.md#fielding-percentage)** ${fldpct.toFixed(3)} • **Range Factor** ${careerTotals.gamesPlayed ? ((careerTotals.PO + careerTotals.A) / careerTotals.gamesPlayed).toFixed(1) : "0.0"} per game`;

  // Career pitching (only if there are pitching stats)
  let careerPitchingSection = "";
  if (careerTotals.IP > 0) {
    const era = careerTotals.IP ? (careerTotals.ER * 9 / careerTotals.IP) : 0;
    const whip = careerTotals.IP ? ((careerTotals.BB_p + careerTotals.H_p) / careerTotals.IP) : 0;
    const kbb = careerTotals.BB_p ? (careerTotals.K_p / careerTotals.BB_p) : (careerTotals.K_p ? Infinity : 0);
    const k9 = careerTotals.IP ? (careerTotals.K_p * 9 / careerTotals.IP) : 0;
    const bb9 = careerTotals.IP ? (careerTotals.BB_p * 9 / careerTotals.IP) : 0;

    careerPitchingSection = `### ⚾️ Career Pitching

| [IP](Glossary.md#ip) | [H](Glossary.md#h-pitching) | [R](Glossary.md#r-pitching) | [ER](Glossary.md#er) | [BB](Glossary.md#bb-pitching) | [K](Glossary.md#k-pitching) | [HR](Glossary.md#hr-pitching) | [BF](Glossary.md#bf) | [PC](Glossary.md#pc) |
|---|---|---|---|---|---|---|---|---|
| ${careerTotals.IP} | ${careerTotals.H_p} | ${careerTotals.R_p} | ${careerTotals.ER} | ${careerTotals.BB_p} | ${careerTotals.K_p} | ${careerTotals.HR_p} | ${careerTotals.BF} | ${careerTotals.PC} |

**[ERA](Glossary.md#era)** ${era.toFixed(2)} • **[WHIP](Glossary.md#whip)** ${whip.toFixed(2)} • **[K/BB](Glossary.md#kbb)** ${(kbb===Infinity?'∞':kbb.toFixed(2))}

**[K/9](Glossary.md#k9)** ${k9.toFixed(1)} • **[BB/9](Glossary.md#bb9)** ${bb9.toFixed(1)} • **Pitches/Batter** ${careerTotals.BF ? (careerTotals.PC/careerTotals.BF).toFixed(1) : "N/A"}`;
  }

  return {
    careerOverview,
    careerHittingTable,
    careerRatesTable,
    advancedMetricsTable,
    careerFieldingTable,
    careerPitchingSection
  };
}

// Generate season history and milestones for career page
function generateCareerExtras(careerTotals, contentDir) {
  // Season history
  const seasonsDir = path.join(contentDir, 'seasons');
  let seasonHistory = "### 🏆 All Seasons\n\n";

  if (fs.existsSync(seasonsDir)) {
    const seasonFiles = fs.readdirSync(seasonsDir).filter(f => f.endsWith('.md'));
    if (seasonFiles.length > 0) {
      seasonHistory += "| Season | Team | Position | Games Folder |\n|---|---|---|---|\n";

      for (const seasonFile of seasonFiles) {
        const seasonPath = path.join(seasonsDir, seasonFile);
        const seasonContent = fs.readFileSync(seasonPath, 'utf8');
        const seasonParsed = matter(seasonContent);

        if (seasonParsed.data.type === 'baseball-season-summary') {
          const seasonName = seasonParsed.data.season || 'Unknown Season';
          const team = seasonParsed.data.team || 'Unknown Team';
          const position = seasonParsed.data.player_position || 'Unknown Position';
          const gamesFolder = seasonParsed.data.games_folder || 'games/';

          seasonHistory += `| [${seasonName}](seasons/${seasonFile.replace('.md', '')}) | ${team} | ${position} | ${gamesFolder} |\n`;
        }
      }
    } else {
      seasonHistory += "*No season data found. Create season cards in the 'seasons' folder.*\n\n";
    }
  } else {
    seasonHistory += "*No season data found. Create season cards in the 'seasons' folder.*\n\n";
  }

  // Career milestones
  let milestones = [];
  const careerAVG = careerTotals.AB ? (careerTotals.H / careerTotals.AB) : 0;

  if (careerTotals.H >= 50) milestones.push("🏆 50+ Career Hits");
  if (careerTotals.H >= 100) milestones.push("🏆 100+ Career Hits");
  if (careerTotals.HR >= 5) milestones.push("💥 5+ Career Home Runs");
  if (careerTotals.HR >= 10) milestones.push("💥 10+ Career Home Runs");
  if (careerTotals.RBI >= 50) milestones.push("🎯 50+ Career RBIs");
  if (careerTotals.RBI >= 100) milestones.push("🎯 100+ Career RBIs");
  if (careerTotals.gamesPlayed >= 50) milestones.push("🎮 50+ Games Played");
  if (careerTotals.gamesPlayed >= 100) milestones.push("🎮 100+ Games Played");
  if (careerAVG >= 0.300) milestones.push("⭐ .300+ Career Average");
  if (careerTotals.seasons >= 3) milestones.push("🏃‍♂️ 3+ Seasons Veteran");

  let milestonesSection = "### 🏆 Career Milestones\n\n";
  if (milestones.length > 0) {
    for (const milestone of milestones) {
      milestonesSection += `- ${milestone}\n`;
    }
  } else {
    milestonesSection += "*Keep playing to unlock career milestones!*\n";
  }

  // Calculate actual personal bests
  let singleGameBests = {
    hits: 0, hrs: 0, rbis: 0, runs: 0, walks: 0, stolenBases: 0,
    gameDate: '', gameOpponent: ''
  };

  let seasonBests = {
    bestAVG: 0, bestOBP: 0, bestSLG: 0, bestOPS: 0,
    mostHits: 0, mostHRs: 0, mostRBIs: 0, mostGames: 0,
    seasonYear: ''
  };

  // Find bests across all seasons and games
  const seasonsDir = path.join(contentDir, 'seasons');
  if (fs.existsSync(seasonsDir)) {
    const seasonFiles = fs.readdirSync(seasonsDir).filter(f => f.endsWith('.md'));

    for (const seasonFile of seasonFiles) {
      const seasonPath = path.join(seasonsDir, seasonFile);
      const seasonContent = fs.readFileSync(seasonPath, 'utf8');
      const seasonParsed = matter(seasonContent);

      if (seasonParsed.data.type === 'baseball-season-summary') {
        const gamesFolder = path.join(contentDir, seasonParsed.data.games_folder || 'games/');

        if (fs.existsSync(gamesFolder)) {
          const gameFiles = findGameFiles(gamesFolder);
          let seasonTotals = { AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, HBP: 0, SF: 0, '2B': 0, '3B': 0 };

          for (const gameFile of gameFiles) {
            const gameData = parseGameFile(gameFile);
            if (gameData && gameData.frontmatter.type === 'baseball-stats') {
              const stats = gameData.stats;

              // Check single-game records
              const gameHits = N(stats.H);
              const gameHRs = N(stats.HR);
              const gameRBIs = N(stats.RBI);
              const gameRuns = N(stats.R);
              const gameWalks = N(stats.BB);
              const gameSB = N(stats.SB);

              if (gameHits > singleGameBests.hits) {
                singleGameBests.hits = gameHits;
                singleGameBests.gameDate = gameData.frontmatter.date || 'Unknown Date';
                singleGameBests.gameOpponent = gameData.frontmatter.opponent || 'Unknown';
              }
              if (gameHRs > singleGameBests.hrs) singleGameBests.hrs = gameHRs;
              if (gameRBIs > singleGameBests.rbis) singleGameBests.rbis = gameRBIs;
              if (gameRuns > singleGameBests.runs) singleGameBests.runs = gameRuns;
              if (gameWalks > singleGameBests.walks) singleGameBests.walks = gameWalks;
              if (gameSB > singleGameBests.stolenBases) singleGameBests.stolenBases = gameSB;

              // Accumulate season totals
              seasonTotals.AB += N(stats.AB); seasonTotals.H += N(stats.H); seasonTotals.HR += N(stats.HR);
              seasonTotals.RBI += N(stats.RBI); seasonTotals.BB += N(stats.BB); seasonTotals.HBP += N(stats.HBP);
              seasonTotals.SF += N(stats.SF); seasonTotals['2B'] += N(stats['2B']); seasonTotals['3B'] += N(stats['3B']);
            }
          }

          // Calculate season rates
          const seasonAVG = seasonTotals.AB ? (seasonTotals.H / seasonTotals.AB) : 0;
          const obpDen = (seasonTotals.AB + seasonTotals.BB + seasonTotals.HBP + seasonTotals.SF);
          const seasonOBP = obpDen ? ((seasonTotals.H + seasonTotals.BB + seasonTotals.HBP) / obpDen) : 0;
          const seasonSingles = Math.max(0, seasonTotals.H - seasonTotals['2B'] - seasonTotals['3B'] - seasonTotals.HR);
          const seasonTB = seasonSingles + 2*seasonTotals['2B'] + 3*seasonTotals['3B'] + 4*seasonTotals.HR;
          const seasonSLG = seasonTotals.AB ? (seasonTB / seasonTotals.AB) : 0;
          const seasonOPS = seasonOBP + seasonSLG;

          // Check season records
          if (seasonAVG > seasonBests.bestAVG) {
            seasonBests.bestAVG = seasonAVG;
            seasonBests.seasonYear = seasonParsed.data.season || 'Unknown Season';
          }
          if (seasonOBP > seasonBests.bestOBP) seasonBests.bestOBP = seasonOBP;
          if (seasonSLG > seasonBests.bestSLG) seasonBests.bestSLG = seasonSLG;
          if (seasonOPS > seasonBests.bestOPS) seasonBests.bestOPS = seasonOPS;
          if (seasonTotals.H > seasonBests.mostHits) seasonBests.mostHits = seasonTotals.H;
          if (seasonTotals.HR > seasonBests.mostHRs) seasonBests.mostHRs = seasonTotals.HR;
          if (seasonTotals.RBI > seasonBests.mostRBIs) seasonBests.mostRBIs = seasonTotals.RBI;
          if (gameFiles.length > seasonBests.mostGames) seasonBests.mostGames = gameFiles.length;
        }
      }
    }
  }

  milestonesSection += "\n### 🌟 Personal Bests\n\n";

  // Display single-game bests
  milestonesSection += "#### Single-Game Records\n\n";
  if (singleGameBests.hits > 0) {
    milestonesSection += `**Most Hits:** ${singleGameBests.hits} ${singleGameBests.gameDate ? `(${singleGameBests.gameDate} vs ${singleGameBests.gameOpponent})` : ''}\n\n`;
    if (singleGameBests.hrs > 0) milestonesSection += `**Most Home Runs:** ${singleGameBests.hrs}\n\n`;
    if (singleGameBests.rbis > 0) milestonesSection += `**Most RBIs:** ${singleGameBests.rbis}\n\n`;
    if (singleGameBests.runs > 0) milestonesSection += `**Most Runs:** ${singleGameBests.runs}\n\n`;
    if (singleGameBests.walks > 0) milestonesSection += `**Most Walks:** ${singleGameBests.walks}\n\n`;
    if (singleGameBests.stolenBases > 0) milestonesSection += `**Most Stolen Bases:** ${singleGameBests.stolenBases}\n\n`;
  } else {
    milestonesSection += "*No single-game records found yet*\n\n";
  }

  // Display season bests
  milestonesSection += "#### Season Records\n\n";
  if (seasonBests.bestAVG > 0) {
    milestonesSection += `**Best Season Average:** ${seasonBests.bestAVG.toFixed(3)} ${seasonBests.seasonYear ? `(${seasonBests.seasonYear})` : ''}\n\n`;
    if (seasonBests.bestOBP > 0) milestonesSection += `**Best Season OBP:** ${seasonBests.bestOBP.toFixed(3)}\n\n`;
    if (seasonBests.bestSLG > 0) milestonesSection += `**Best Season SLG:** ${seasonBests.bestSLG.toFixed(3)}\n\n`;
    if (seasonBests.bestOPS > 0) milestonesSection += `**Best Season OPS:** ${seasonBests.bestOPS.toFixed(3)}\n\n`;
    if (seasonBests.mostHits > 0) milestonesSection += `**Most Season Hits:** ${seasonBests.mostHits}\n\n`;
    if (seasonBests.mostHRs > 0) milestonesSection += `**Most Season HRs:** ${seasonBests.mostHRs}\n\n`;
    if (seasonBests.mostRBIs > 0) milestonesSection += `**Most Season RBIs:** ${seasonBests.mostRBIs}\n\n`;
    if (seasonBests.mostGames > 0) milestonesSection += `**Most Games Played:** ${seasonBests.mostGames}\n\n`;
  } else {
    milestonesSection += "*No season records found yet*\n\n";
  }

  return {
    seasonHistory,
    milestonesSection
  };
}

// Process career statistics index page
function processIndexPage(indexPath, contentDir) {
  const content = fs.readFileSync(indexPath, 'utf8');
  const parsed = matter(content);

  // Calculate career statistics
  const careerTotals = calculateCareerStats(contentDir);
  const careerTables = generateCareerTables(careerTotals, contentDir);
  const careerExtras = generateCareerExtras(careerTotals, contentDir);

  let processedContent = parsed.content;

  // Replace the first DataviewJS block (career statistics)
  processedContent = processedContent.replace(
    /```dataviewjs\s*\/\/ Get all season files[\s\S]*?```/,
    `${careerTables.careerOverview}

${careerTables.careerHittingTable}

${careerTables.careerRatesTable}

${careerTables.advancedMetricsTable}

${careerTables.careerFieldingTable}

${careerTables.careerPitchingSection}`
  );

  // Replace the second DataviewJS block (season history)
  processedContent = processedContent.replace(
    /```dataviewjs\s*\/\/ Display all seasons with links[\s\S]*?```/,
    careerExtras.seasonHistory
  );

  // Replace the third DataviewJS block (career highlights & milestones)
  processedContent = processedContent.replace(
    /```dataviewjs\s*\/\/ Recalculate career totals for milestones[\s\S]*?```/,
    careerExtras.milestonesSection
  );

  // Remove any remaining dataviewjs blocks
  processedContent = processedContent.replace(
    /```dataviewjs[\s\S]*?```/g,
    '*[Advanced analytics features work in Obsidian - static data shown here]*'
  );

  // Reconstruct the full file with frontmatter
  const fullProcessedContent = matter.stringify(processedContent, parsed.data);
  return fullProcessedContent;
}

// Process a season card file
function processSeasonCard(filePath, gamesFolder) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(content);
  const stats = calculateSeasonStats(gamesFolder);
  const tables = generateStaticTables(stats);
  const signatureMoments = generateSignatureMoments(stats);
  const seasonGoals = generateSeasonGoals(stats);

  // Replace DataviewJS blocks with static content
  let processedContent = parsed.content;

  // Replace frontmatter field references with actual values
  processedContent = processedContent.replace(/`=this\.player`/g, parsed.data.player || 'Unknown Player');
  processedContent = processedContent.replace(/`=this\.team`/g, parsed.data.team || 'Unknown Team');
  processedContent = processedContent.replace(/`=this\.player_position`/g, parsed.data.player_position || 'Unknown Position');
  processedContent = processedContent.replace(/`=this\.season`/g, parsed.data.season || 'Unknown Season');
  processedContent = processedContent.replace(/`=this\.games_folder`/g, parsed.data.games_folder || 'games/');

  // Fix the player profile section formatting with proper newlines
  const playerProfileSection = `> [!info]+ Player Profile
> **Player:** ${parsed.data.player || 'Unknown Player'}
> **Team:** ${parsed.data.team || 'Unknown Team'}
> **Position:** ${parsed.data.player_position || 'Unknown Position'}
> **Season:** ${parsed.data.season || 'Unknown Season'}
> **Games folder:** ${parsed.data.games_folder || 'games/'}`;

  processedContent = processedContent.replace(
    /> \[!info\]\+ Player Profile\s*\*\*Player:\*\* `=this\.player`[\s\S]*?\*\*Games folder:\*\* `=this\.games_folder`/,
    playerProfileSection
  );

  // Also fix the title (handle both template variations)
  processedContent = processedContent.replace(/# 📇 (?:Enhanced )?Season Baseball Card – `=this\.season`/g,
    `# 📇 ${parsed.data.season || 'Unknown Season'} Baseball Card`);

  // Replace hitting performance block (look for the first large dataviewjs block)
  processedContent = processedContent.replace(
    /```dataviewjs\s*const cur = dv\.current\(\);[\s\S]*?```/,
    `### 📊 Basic Totals
${tables.basicTotalsTable}

### 📈 Standard Rates
${tables.standardRatesTable}

### 🔬 Advanced Metrics
${tables.advancedMetricsTable}

### 🎯 Clutch Performance
${tables.clutchPerformance}`
  );

  // Replace fielding block
  processedContent = processedContent.replace(
    /```dataviewjs\s*const cur2 = dv\.current\(\);[\s\S]*?```/,
    `${tables.fieldingTable}

${tables.fieldingPercentage}`
  );

  // Replace pitching block
  processedContent = processedContent.replace(
    /```dataviewjs\s*const cur3 = dv\.current\(\);[\s\S]*?```/,
    tables.pitchingSection
  );

  // Replace signature moments block (4th dataviewjs block)
  processedContent = processedContent.replace(
    /```dataviewjs\s*const cur4 = dv\.current\(\);[\s\S]*?```/,
    signatureMoments
  );

  // Replace season goals block (5th dataviewjs block)
  processedContent = processedContent.replace(
    /```dataviewjs\s*const cur5 = dv\.current\(\);[\s\S]*?```/,
    seasonGoals
  );

  // Remove any remaining dataviewjs blocks and replace with placeholder
  processedContent = processedContent.replace(
    /```dataviewjs[\s\S]*?```/g,
    '*[Advanced analytics features work in Obsidian - static data shown here]*'
  );

  // Reconstruct the full file with frontmatter
  const fullProcessedContent = matter.stringify(processedContent, parsed.data);
  return fullProcessedContent;
}

// Main function
function main() {
  const contentDir = './content';

  // Process index.md file (career statistics page)
  const indexPath = path.join(contentDir, 'index.md');
  if (fs.existsSync(indexPath)) {
    console.log('Processing career statistics page: index.md');
    try {
      const processedContent = processIndexPage(indexPath, contentDir);
      fs.writeFileSync(indexPath, processedContent);
      console.log('✅ Successfully processed index.md');
    } catch (error) {
      console.error('❌ Error processing index.md:', error.message);
    }
  }

  // Process all season card files
  const seasonsDir = path.join(contentDir, 'seasons');
  if (fs.existsSync(seasonsDir)) {
    const seasonFiles = fs.readdirSync(seasonsDir).filter(f => f.endsWith('.md'));

    for (const seasonFile of seasonFiles) {
      const seasonPath = path.join(seasonsDir, seasonFile);
      const gamesFolder = path.join(contentDir, 'games');

      console.log(`Processing season card: ${seasonFile}`);
      try {
        const processedContent = processSeasonCard(seasonPath, gamesFolder);
        fs.writeFileSync(seasonPath, processedContent);
        console.log(`✅ Successfully processed ${seasonFile}`);
      } catch (error) {
        console.error(`❌ Error processing ${seasonFile}:`, error.message);
      }
    }
  }

  console.log('DataviewJS processing complete!');
}

// Main execution
async function run() {
  try {
    await import('gray-matter');
  } catch (error) {
    console.log('Installing gray-matter dependency...');
    execSync('npm install gray-matter', { stdio: 'inherit' });
  }

  main();
}

// Run the script
run().catch(console.error);

export { calculateSeasonStats, processSeasonCard };