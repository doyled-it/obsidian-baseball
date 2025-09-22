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
    // Look for patterns like "- AB:: 4" but stop at end of line
    const inlineFieldRegex = /^-\s+([^:]+)::\s*([^\r\n]*)$/gm;
    let match;

    while ((match = inlineFieldRegex.exec(parsed.content)) !== null) {
      const field = match[1].trim();
      const value = match[2].trim();

      // Only store if value doesn't start with a dash or contain markdown (indicates it grabbed next line)
      if (!value.startsWith('-') && !value.includes('#') && !value.includes('(')) {
        stats[field] = value === '' ? 0 : value;
        console.log(`Found field: "${field}" = "${value}"`);
      } else {
        // This is likely an empty field that grabbed the next line
        stats[field] = 0;
        console.log(`Empty field: "${field}" = 0 (skipped invalid value: "${value}")`);
      }
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

// Process a season card file
function processSeasonCard(filePath, gamesFolder) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(content);
  const stats = calculateSeasonStats(gamesFolder);
  const tables = generateStaticTables(stats);

  // Replace DataviewJS blocks with static content
  let processedContent = parsed.content;

  // Replace frontmatter field references with actual values
  processedContent = processedContent.replace(/`=this\.player`/g, parsed.data.player || 'Unknown Player');
  processedContent = processedContent.replace(/`=this\.team`/g, parsed.data.team || 'Unknown Team');
  processedContent = processedContent.replace(/`=this\.player_position`/g, parsed.data.player_position || 'Unknown Position');
  processedContent = processedContent.replace(/`=this\.season`/g, parsed.data.season || 'Unknown Season');
  processedContent = processedContent.replace(/`=this\.games_folder`/g, parsed.data.games_folder || 'games/');

  // Fix the player profile section formatting
  const playerProfileSection = `> [!info]+ Player Profile
**Player:** ${parsed.data.player || 'Unknown Player'}
**Team:** ${parsed.data.team || 'Unknown Team'}
**Position:** ${parsed.data.player_position || 'Unknown Position'}
**Season:** ${parsed.data.season || 'Unknown Season'}
**Games folder:** ${parsed.data.games_folder || 'games/'}`;

  processedContent = processedContent.replace(
    /> \[!info\]\+ Player Profile\s*\*\*Player:\*\* `=this\.player`[\s\S]*?\*\*Games folder:\*\* `=this\.games_folder`/,
    playerProfileSection
  );

  // Also fix the title
  processedContent = processedContent.replace(/# 📇 Enhanced Season Baseball Card – `=this\.season`/g,
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