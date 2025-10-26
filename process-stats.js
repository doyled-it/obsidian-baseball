#!/usr/bin/env node

/**
 * Baseball Stats Processor
 * Processes Obsidian markdown game files and generates JSON data
 */

const fs = require('fs');
const path = require('path');

// Helper to safely parse numbers
const parseNum = (val) => {
  if (!val || val === '') return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// Helper to extract frontmatter and inline fields from markdown
function parseGameFile(content) {
  const lines = content.split('\n');
  const game = {
    metadata: {},
    hitting: {},
    fielding: {},
    pitching: {},
    quality: {}
  };

  // Parse frontmatter
  let inFrontmatter = false;
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle frontmatter
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        inFrontmatter = false;
        continue;
      }
    }

    if (inFrontmatter) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        game.metadata[match[1]] = match[2];
      }
      continue;
    }

    // Determine current section
    if (line.includes('## 🥎 Hitting')) {
      currentSection = 'hitting';
    } else if (line.includes('## 🧤 Fielding')) {
      currentSection = 'fielding';
    } else if (line.includes('## ⚾️ Pitching')) {
      currentSection = 'pitching';
    } else if (line.includes('## 📊 Game Quality')) {
      currentSection = 'quality';
    }

    // Parse inline fields (format: "- field:: value")
    const fieldMatch = line.match(/^-\s+(\w+)::\s*([^\(]*)/);
    if (fieldMatch && currentSection) {
      const fieldName = fieldMatch[1];
      const fieldValue = fieldMatch[2].trim();

      if (currentSection === 'hitting') {
        game.hitting[fieldName] = fieldValue;
      } else if (currentSection === 'fielding') {
        game.fielding[fieldName] = fieldValue;
      } else if (currentSection === 'pitching') {
        game.pitching[fieldName] = fieldValue;
      } else if (currentSection === 'quality') {
        game.quality[fieldName] = fieldValue;
      }
    }
  }

  return game;
}

// Check if a player actually played in this game
function didPlay(game) {
  const AB = parseNum(game.hitting.AB);
  const H = parseNum(game.hitting.H);
  const PO = parseNum(game.fielding.PO);
  const A = parseNum(game.fielding.A);
  const IP = parseNum(game.pitching.IP);

  return AB > 0 || H > 0 || PO > 0 || A > 0 || IP > 0;
}

// Process all game files for a season
function processSeasonGames(gamesFolder) {
  const games = [];

  if (!fs.existsSync(gamesFolder)) {
    console.warn(`Games folder not found: ${gamesFolder}`);
    return games;
  }

  const files = fs.readdirSync(gamesFolder)
    .filter(f => f.endsWith('.md'))
    .sort();

  for (const file of files) {
    const filePath = path.join(gamesFolder, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const gameData = parseGameFile(content);

    // Add file metadata
    gameData.file = file;
    gameData.played = didPlay(gameData);

    games.push(gameData);
  }

  return games;
}

// Calculate aggregate stats
function calculateStats(games) {
  // Only include games where player actually played
  const playedGames = games.filter(g => g.played);

  const stats = {
    hitting: {
      AB: 0, H: 0, '2B': 0, '3B': 0, HR: 0, RBI: 0, R: 0,
      BB: 0, K: 0, HBP: 0, SF: 0, SB: 0, CS: 0,
      RISP: 0, RISP_H: 0, hard_contact: 0, pitches_seen: 0
    },
    fielding: {
      PO: 0, A: 0, E: 0, TC: 0, DP: 0
    },
    pitching: {
      IP: 0, H_p: 0, R_p: 0, ER: 0, BB_p: 0, K_p: 0,
      HR_p: 0, BF: 0, PC: 0
    },
    games: {
      total: games.length,
      played: playedGames.length,
      wins: 0,
      losses: 0,
      ties: 0
    },
    gamesList: []
  };

  // Aggregate stats from all played games
  for (const game of playedGames) {
    // Hitting
    Object.keys(stats.hitting).forEach(key => {
      stats.hitting[key] += parseNum(game.hitting[key]);
    });

    // Fielding
    Object.keys(stats.fielding).forEach(key => {
      stats.fielding[key] += parseNum(game.fielding[key]);
    });

    // Pitching
    Object.keys(stats.pitching).forEach(key => {
      stats.pitching[key] += parseNum(game.pitching[key]);
    });
  }

  // Count all games for team record (not just played)
  for (const game of games) {
    const result = game.metadata.result;
    if (result === 'W') stats.games.wins++;
    else if (result === 'L') stats.games.losses++;
    else if (result === 'T') stats.games.ties++;

    // Calculate individual game stats
    const gameStats = {
      hitting: {
        AB: parseNum(game.hitting.AB),
        H: parseNum(game.hitting.H),
        '2B': parseNum(game.hitting['2B']),
        '3B': parseNum(game.hitting['3B']),
        HR: parseNum(game.hitting.HR),
        RBI: parseNum(game.hitting.RBI),
        R: parseNum(game.hitting.R),
        BB: parseNum(game.hitting.BB),
        K: parseNum(game.hitting.K),
        HBP: parseNum(game.hitting.HBP),
        SF: parseNum(game.hitting.SF),
        SB: parseNum(game.hitting.SB),
        CS: parseNum(game.hitting.CS),
        RISP: parseNum(game.hitting.RISP),
        RISP_H: parseNum(game.hitting.RISP_H),
        hard_contact: parseNum(game.hitting.hard_contact),
        pitches_seen: parseNum(game.hitting.pitches_seen)
      },
      fielding: {
        PO: parseNum(game.fielding.PO),
        A: parseNum(game.fielding.A),
        E: parseNum(game.fielding.E),
        TC: parseNum(game.fielding.TC),
        DP: parseNum(game.fielding.DP)
      },
      pitching: {
        IP: parseNum(game.pitching.IP),
        H_p: parseNum(game.pitching.H_p),
        R_p: parseNum(game.pitching.R_p),
        ER: parseNum(game.pitching.ER),
        BB_p: parseNum(game.pitching.BB_p),
        K_p: parseNum(game.pitching.K_p),
        HR_p: parseNum(game.pitching.HR_p),
        BF: parseNum(game.pitching.BF),
        PC: parseNum(game.pitching.PC)
      }
    };

    // Calculate game-level batting average
    gameStats.avg = gameStats.hitting.AB > 0 ? (gameStats.hitting.H / gameStats.hitting.AB) : 0;

    // Add to games list
    stats.gamesList.push({
      date: game.metadata.date,
      opponent: game.metadata.opponent,
      location: game.metadata.location,
      result: game.metadata.result,
      score: game.metadata.score,
      played: game.played,
      rating: game.quality.game_rating || '',
      notable: game.quality.notable_moments || '',
      stats: gameStats
    });
  }

  // Calculate derived stats
  const hitting = stats.hitting;
  const obpDen = hitting.AB + hitting.BB + hitting.HBP + hitting.SF;

  stats.calculated = {
    // Batting average
    AVG: hitting.AB ? (hitting.H / hitting.AB) : 0,

    // On-base percentage
    OBP: obpDen ? ((hitting.H + hitting.BB + hitting.HBP) / obpDen) : 0,

    // Slugging
    singles: Math.max(0, hitting.H - hitting['2B'] - hitting['3B'] - hitting.HR),
    tb: 0, // calculated below
    SLG: 0, // calculated below

    // OPS
    OPS: 0, // calculated below

    // Advanced metrics
    BABIP: 0,
    ISO: 0,
    XBH: hitting['2B'] + hitting['3B'] + hitting.HR,
    XBH_pct: hitting.H ? ((hitting['2B'] + hitting['3B'] + hitting.HR) / hitting.H) : 0,
    BB_pct: obpDen ? (hitting.BB / obpDen) : 0,
    K_pct: obpDen ? (hitting.K / obpDen) : 0,
    clutch_avg: hitting.RISP ? (hitting.RISP_H / hitting.RISP) : 0,
    contact_quality: hitting.AB ? (hitting.hard_contact / hitting.AB) : 0,

    // Pitching
    ERA: 0,
    WHIP: 0,
    K_BB: 0,
    K9: 0,
    BB9: 0
  };

  // Calculate slugging and derived stats
  const singles = stats.calculated.singles;
  stats.calculated.tb = singles + 2*hitting['2B'] + 3*hitting['3B'] + 4*hitting.HR;
  stats.calculated.SLG = hitting.AB ? (stats.calculated.tb / hitting.AB) : 0;
  stats.calculated.OPS = stats.calculated.OBP + stats.calculated.SLG;
  stats.calculated.ISO = stats.calculated.SLG - stats.calculated.AVG;

  // BABIP
  const babipDen = hitting.AB - hitting.K - hitting.HR + hitting.SF;
  if (babipDen > 0) {
    stats.calculated.BABIP = (hitting.H - hitting.HR) / babipDen;
  }

  // Fielding percentage
  const TC = stats.fielding.TC;
  stats.calculated.fieldingPct = TC ? ((stats.fielding.PO + stats.fielding.A) / TC) : 0;
  stats.calculated.rangeFactor = stats.games.played ?
    ((stats.fielding.PO + stats.fielding.A) / stats.games.played) : 0;

  // Pitching stats
  const pitching = stats.pitching;
  if (pitching.IP > 0) {
    stats.calculated.ERA = (pitching.ER * 9) / pitching.IP;
    stats.calculated.WHIP = (pitching.BB_p + pitching.H_p) / pitching.IP;
    stats.calculated.K_BB = pitching.BB_p ? (pitching.K_p / pitching.BB_p) : pitching.K_p;
    stats.calculated.K9 = (pitching.K_p * 9) / pitching.IP;
    stats.calculated.BB9 = (pitching.BB_p * 9) / pitching.IP;
  }

  return stats;
}

// Main function
function main() {
  console.log('🔄 Processing baseball stats...\n');

  // Define seasons to process
  const seasons = [
    {
      id: 'fall2025',
      name: 'Fall 2025',
      folder: 'games/2025/fall',
      player: 'Michael Doyle',
      team: 'Happy Sox',
      position: 'Utility (P/IF/OF)'
    }
  ];

  const output = {
    currentSeason: 'fall2025',
    lastUpdated: new Date().toISOString(),
    seasons: {}
  };

  for (const season of seasons) {
    console.log(`📊 Processing ${season.name}...`);

    const gamesFolder = path.join(__dirname, season.folder);
    const games = processSeasonGames(gamesFolder);
    const stats = calculateStats(games);

    output.seasons[season.id] = {
      ...season,
      stats,
      gamesProcessed: games.length
    };

    console.log(`  ✅ Processed ${games.length} games (${stats.games.played} played)\n`);
  }

  // Write output
  const outputPath = path.join(__dirname, 'stats-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Stats data written to: ${outputPath}\n`);

  // Also write as JavaScript module for direct inclusion
  const jsOutputPath = path.join(__dirname, 'stats-data.js');
  const jsContent = `// Baseball Stats Data\n// Auto-generated on ${new Date().toLocaleString()}\n\nconst statsData = ${JSON.stringify(output, null, 2)};\n`;
  fs.writeFileSync(jsOutputPath, jsContent);
  console.log(`✅ JavaScript data written to: ${jsOutputPath}\n`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processSeasonGames, calculateStats, parseGameFile };
