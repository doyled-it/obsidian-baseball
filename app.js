/**
 * Baseball Stats Display Application
 * Enhanced with color-coded metrics, tooltips, and expandable game cards
 */

// Current active season
let currentSeason = null;

// Helper to format numbers
const fmt = {
    num: (n) => Number(n).toFixed(0),
    avg: (n) => Number(n).toFixed(3),
    pct: (n) => (Number(n) * 100).toFixed(1) + '%',
    decimal: (n, places = 2) => Number(n).toFixed(places)
};

// Color coding thresholds for batting metrics
const colorThresholds = {
    // Hitting
    avg: { great: 0.400, good: 0.300, poor: 0.200 },
    obp: { great: 0.450, good: 0.350, poor: 0.300 },
    slg: { great: 0.550, good: 0.450, poor: 0.350 },
    ops: { great: 1.000, good: 0.800, poor: 0.700 },
    babip: { great: 0.350, good: 0.300, poor: 0.250 },
    iso: { great: 0.200, good: 0.140, poor: 0.100 },
    bb_pct: { great: 0.12, good: 0.08, poor: 0.05 },
    k_pct: { great: 0.15, good: 0.20, poor: 0.25, inverse: true }, // Lower is better
    clutch_avg: { great: 0.350, good: 0.275, poor: 0.200 },
    contact_quality: { great: 0.40, good: 0.30, poor: 0.20 },
    pitches_per_pa: { great: 4.5, good: 4.0, poor: 3.5 }, // Higher is better

    // Fielding
    fielding_pct: { great: 0.950, good: 0.900, poor: 0.850 },
    range_factor: { great: 3.0, good: 2.0, poor: 1.5 }, // Higher is better

    // Pitching
    era: { great: 3.00, good: 4.50, poor: 6.00, inverse: true },
    whip: { great: 1.20, good: 1.50, poor: 1.80, inverse: true },
    k_bb: { great: 2.5, good: 2.0, poor: 1.0 }, // Higher is better
    k9: { great: 8.0, good: 6.0, poor: 4.0 }, // Higher is better
    pitches_per_batter: { great: 3.5, good: 4.0, poor: 4.5, inverse: true } // Lower is better
};

// Get color class for a metric
function getColorClass(value, metric) {
    const thresh = colorThresholds[metric];
    if (!thresh) return '';

    const inverse = thresh.inverse || false;

    if (inverse) {
        // Lower is better (e.g., ERA, K%)
        if (value <= thresh.great) return 'stat-great';
        if (value <= thresh.good) return 'stat-good';
        if (value <= thresh.poor) return 'stat-average';
        return 'stat-poor';
    } else {
        // Higher is better (e.g., AVG, OBP)
        if (value >= thresh.great) return 'stat-great';
        if (value >= thresh.good) return 'stat-good';
        if (value >= thresh.poor) return 'stat-average';
        return 'stat-poor';
    }
}

// Metric definitions for tooltips
const metricDefinitions = {
    // Hitting - Basic
    'AB': 'At-Bats: Official plate appearances (excludes walks, HBP, sacrifices)',
    'H': 'Hits: Times reaching base safely via hit',
    '2B': 'Doubles: Two-base hits',
    '3B': 'Triples: Three-base hits',
    'HR': 'Home Runs: Four-base hits',
    'RBI': 'Runs Batted In: Runs scored as a result of your hit or action',
    'R': 'Runs: Times you scored a run',
    'BB': 'Walks: Times you reached base via 4 balls (not counted as at-bats)',
    'K': 'Strikeouts: Times you struck out (counted as at-bats)',
    'SB': 'Stolen Bases: Times you successfully stole a base',

    // Hitting - Rate Stats
    'AVG': 'Batting Average: Hits divided by At-Bats (H/AB)',
    'OBP': 'On-Base Percentage: How often you reach base (H+BB+HBP)/(AB+BB+HBP+SF)',
    'SLG': 'Slugging Percentage: Total bases per at-bat',
    'OPS': 'On-Base Plus Slugging: OBP + SLG, measures overall offensive production',

    // Hitting - Advanced
    'BABIP': 'Batting Average on Balls In Play: Measures luck and contact quality',
    'ISO': 'Isolated Power: SLG - AVG, measures extra-base hit power',
    'XBH%': 'Extra-Base Hit Percentage: (2B+3B+HR)/H',
    'BB%': 'Walk Percentage: Walks per plate appearance',
    'K%': 'Strikeout Percentage: Strikeouts per plate appearance (lower is better)',
    'Clutch AVG': 'Batting average with runners in scoring position (RISP)',
    'Contact Quality': 'Hard contact rate: well-struck balls per at-bat',
    'With RISP': 'Performance with Runners In Scoring Position (2nd/3rd base)',
    'Hard Contact': 'Hard-hit balls regardless of outcome - measures contact quality',
    'Pitches/PA': 'Average pitches seen per plate appearance - measures patience',

    // Fielding
    'PO': 'Putouts: Times you recorded the final out (catch, force, tag)',
    'A': 'Assists: Times you helped make an out (throw to base, etc.)',
    'E': 'Errors: Times you made a fielding mistake',
    'TC': 'Total Chances: Total fielding opportunities (PO + A + E)',
    'DP': 'Double Plays: Times you participated in turning a double play',
    'Fielding %': 'Fielding Percentage: (PO + A) / TC - higher is better',
    'Range Factor': 'Range Factor: (PO + A) per game - measures defensive range',

    // Pitching
    'IP': 'Innings Pitched: Innings completed (use .1 for 1 out, .2 for 2 outs)',
    'ER': 'Earned Runs: Runs that scored without the benefit of an error',
    'BF': 'Batters Faced: Total number of batters you faced while pitching',
    'PC': 'Pitch Count: Total number of pitches thrown',
    'ERA': 'Earned Run Average: Earned runs per 9 innings (lower is better)',
    'WHIP': 'Walks + Hits per Inning Pitched (lower is better)',
    'K/BB': 'Strikeout-to-Walk Ratio: Higher is better',
    'K/9': 'Strikeouts per 9 innings: Higher is better',
    'BB/9': 'Walks per 9 innings: Lower is better',
    'Pitches/Batter': 'Average pitches thrown per batter faced - efficiency metric'
};

// Initialize the app
function init() {
    if (typeof statsData === 'undefined') {
        console.error('Stats data not loaded');
        return;
    }

    // Set current season
    currentSeason = statsData.currentSeason;

    // Render season tabs
    renderSeasonTabs();

    // Load current season data
    loadSeason(currentSeason);

    // Update last updated time
    updateLastUpdated();

    // Add tooltip functionality
    addTooltipListeners();
}

// Add tooltip listeners
function addTooltipListeners() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'metric-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    // Add listeners to all elements with data-metric attribute
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-metric]');
        if (target) {
            const metric = target.dataset.metric;
            const definition = metricDefinitions[metric];
            if (definition) {
                tooltip.textContent = definition;
                tooltip.style.display = 'block';
                positionTooltip(e, tooltip);
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (tooltip.style.display === 'block') {
            positionTooltip(e, tooltip);
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-metric]');
        if (target && !e.relatedTarget?.closest('[data-metric]')) {
            tooltip.style.display = 'none';
        }
    });
}

// Position tooltip near cursor
function positionTooltip(e, tooltip) {
    const offset = 15;
    let x = e.pageX + offset;
    let y = e.pageY + offset;

    // Prevent tooltip from going off-screen
    const tooltipRect = tooltip.getBoundingClientRect();
    if (x + tooltipRect.width > window.innerWidth) {
        x = e.pageX - tooltipRect.width - offset;
    }
    if (y + tooltipRect.height > window.innerHeight) {
        y = e.pageY - tooltipRect.height - offset;
    }

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

// Render season tabs
function renderSeasonTabs() {
    const tabsContainer = document.getElementById('seasonTabs');
    tabsContainer.innerHTML = '';

    const seasons = Object.keys(statsData.seasons);

    for (const seasonId of seasons) {
        const season = statsData.seasons[seasonId];
        const tab = document.createElement('button');
        tab.className = 'season-tab';
        tab.textContent = season.name;
        tab.dataset.season = seasonId;

        if (seasonId === currentSeason) {
            tab.classList.add('active');
        }

        tab.addEventListener('click', () => {
            currentSeason = seasonId;
            document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadSeason(seasonId);
        });

        tabsContainer.appendChild(tab);
    }
}

// Load season data
function loadSeason(seasonId) {
    const season = statsData.seasons[seasonId];
    if (!season) {
        console.error('Season not found:', seasonId);
        return;
    }

    const { stats } = season;

    // Update player info
    document.getElementById('teamName').textContent = season.team;
    document.getElementById('position').textContent = season.position;
    document.getElementById('gamesPlayed').textContent = stats.games.played;
    document.getElementById('teamRecord').textContent =
        `${stats.games.wins}-${stats.games.losses}${stats.games.ties > 0 ? `-${stats.games.ties}` : ''}`;

    // Update hitting stats
    updateHittingStats(stats);

    // Update fielding stats
    updateFieldingStats(stats);

    // Update pitching stats
    updatePitchingStats(stats);

    // Update game log
    updateGameLog(stats.gamesList);

    // Update performance trends
    updatePerformanceTrends(stats);
}

// Update hitting stats
function updateHittingStats(stats) {
    const { hitting, calculated } = stats;

    // Basic totals
    const totalsBody = document.getElementById('hittingTotalsBody');
    totalsBody.innerHTML = `
        <tr>
            <td>${fmt.num(hitting.AB)}</td>
            <td>${fmt.num(hitting.H)}</td>
            <td>${fmt.num(hitting['2B'])}</td>
            <td>${fmt.num(hitting['3B'])}</td>
            <td>${fmt.num(hitting.HR)}</td>
            <td>${fmt.num(hitting.RBI)}</td>
            <td>${fmt.num(hitting.R)}</td>
            <td>${fmt.num(hitting.BB)}</td>
            <td>${fmt.num(hitting.K)}</td>
            <td>${fmt.num(hitting.SB)}</td>
        </tr>
    `;

    // Rate stats with color coding (tooltips on labels only)
    document.getElementById('avg').innerHTML = `<span class="${getColorClass(calculated.AVG, 'avg')}">${fmt.avg(calculated.AVG)}</span>`;
    document.getElementById('obp').innerHTML = `<span class="${getColorClass(calculated.OBP, 'obp')}">${fmt.avg(calculated.OBP)}</span>`;
    document.getElementById('slg').innerHTML = `<span class="${getColorClass(calculated.SLG, 'slg')}">${fmt.avg(calculated.SLG)}</span>`;
    document.getElementById('ops').innerHTML = `<span class="${getColorClass(calculated.OPS, 'ops')}">${fmt.avg(calculated.OPS)}</span>`;

    // Advanced metrics with color coding (tooltips on headers only)
    const metricsBody = document.getElementById('advancedMetricsBody');
    metricsBody.innerHTML = `
        <tr>
            <td><span class="${getColorClass(calculated.BABIP, 'babip')}">${fmt.avg(calculated.BABIP)}</span></td>
            <td><span class="${getColorClass(calculated.ISO, 'iso')}">${fmt.avg(calculated.ISO)}</span></td>
            <td><span>${fmt.pct(calculated.XBH_pct)}</span></td>
            <td><span class="${getColorClass(calculated.BB_pct, 'bb_pct')}">${fmt.pct(calculated.BB_pct)}</span></td>
            <td><span class="${getColorClass(calculated.K_pct, 'k_pct')}">${fmt.pct(calculated.K_pct)}</span></td>
            <td><span class="${getColorClass(calculated.clutch_avg, 'clutch_avg')}">${fmt.avg(calculated.clutch_avg)}</span></td>
            <td><span class="${getColorClass(calculated.contact_quality, 'contact_quality')}">${fmt.pct(calculated.contact_quality)}</span></td>
        </tr>
    `;

    // Clutch details in metric cards with color coding
    const obpDen = hitting.AB + hitting.BB + hitting.HBP + hitting.SF;
    const pitchesPerPA = obpDen && hitting.pitches_seen ? hitting.pitches_seen / obpDen : 0;

    // Color code the entire metric value
    const rispStatsEl = document.getElementById('rispStats');
    rispStatsEl.innerHTML = `${fmt.num(hitting.RISP_H)}/${fmt.num(hitting.RISP)}`;
    rispStatsEl.className = 'metric-value ' + getColorClass(calculated.clutch_avg, 'clutch_avg');

    const hardContactEl = document.getElementById('hardContact');
    hardContactEl.innerHTML = `${fmt.pct(calculated.contact_quality)}`;
    hardContactEl.className = 'metric-value ' + getColorClass(calculated.contact_quality, 'contact_quality');

    const pitchesPerPAEl = document.getElementById('pitchesPerPA');
    if (obpDen && hitting.pitches_seen) {
        pitchesPerPAEl.innerHTML = `${fmt.decimal(pitchesPerPA, 1)}`;
        pitchesPerPAEl.className = 'metric-value ' + getColorClass(pitchesPerPA, 'pitches_per_pa');
    } else {
        pitchesPerPAEl.innerHTML = 'N/A';
        pitchesPerPAEl.className = 'metric-value';
    }
}

// Update fielding stats
function updateFieldingStats(stats) {
    const { fielding, calculated } = stats;

    const fieldingBody = document.getElementById('fieldingBody');
    fieldingBody.innerHTML = `
        <tr>
            <td>${fmt.num(fielding.PO)}</td>
            <td>${fmt.num(fielding.A)}</td>
            <td>${fmt.num(fielding.E)}</td>
            <td>${fmt.num(fielding.TC)}</td>
            <td>${fmt.num(fielding.DP)}</td>
        </tr>
    `;

    // Color code fielding metrics
    const fieldingPctEl = document.getElementById('fieldingPct');
    fieldingPctEl.innerHTML = fmt.avg(calculated.fieldingPct);
    fieldingPctEl.className = 'metric-value ' + getColorClass(calculated.fieldingPct, 'fielding_pct');

    const rangeFactorEl = document.getElementById('rangeFactor');
    rangeFactorEl.innerHTML = fmt.decimal(calculated.rangeFactor, 1);
    rangeFactorEl.className = 'metric-value ' + getColorClass(calculated.rangeFactor, 'range_factor');
}

// Update pitching stats
function updatePitchingStats(stats) {
    const { pitching, calculated } = stats;

    if (pitching.IP > 0) {
        const pitchingBody = document.getElementById('pitchingBody');
        pitchingBody.innerHTML = `
            <tr>
                <td>${fmt.decimal(pitching.IP, 1)}</td>
                <td>${fmt.num(pitching.H_p)}</td>
                <td>${fmt.num(pitching.R_p)}</td>
                <td>${fmt.num(pitching.ER)}</td>
                <td>${fmt.num(pitching.BB_p)}</td>
                <td>${fmt.num(pitching.K_p)}</td>
                <td>${fmt.num(pitching.HR_p)}</td>
                <td>${fmt.num(pitching.BF)}</td>
                <td>${fmt.num(pitching.PC)}</td>
            </tr>
        `;

        const kbbValue = calculated.K_BB === Infinity ? '∞' : fmt.decimal(calculated.K_BB);

        // Color code pitching metrics
        const eraEl = document.getElementById('era');
        eraEl.innerHTML = fmt.decimal(calculated.ERA);
        eraEl.className = 'metric-value ' + getColorClass(calculated.ERA, 'era');

        const whipEl = document.getElementById('whip');
        whipEl.innerHTML = fmt.decimal(calculated.WHIP);
        whipEl.className = 'metric-value ' + getColorClass(calculated.WHIP, 'whip');

        const kbbEl = document.getElementById('kbb');
        kbbEl.innerHTML = kbbValue;
        if (calculated.K_BB !== Infinity) {
            kbbEl.className = 'metric-value ' + getColorClass(calculated.K_BB, 'k_bb');
        } else {
            kbbEl.className = 'metric-value stat-great'; // Infinity K/BB is great!
        }

        const k9El = document.getElementById('k9');
        k9El.innerHTML = fmt.decimal(calculated.K9, 1);
        k9El.className = 'metric-value ' + getColorClass(calculated.K9, 'k9');

        const bb9El = document.getElementById('bb9');
        bb9El.innerHTML = fmt.decimal(calculated.BB9, 1);
        bb9El.className = 'metric-value ' + getColorClass(calculated.BB9, 'era');

        const pitchesPerBatterEl = document.getElementById('pitchesPerBatter');
        if (pitching.BF) {
            const ppb = pitching.PC / pitching.BF;
            pitchesPerBatterEl.innerHTML = fmt.decimal(ppb, 1);
            pitchesPerBatterEl.className = 'metric-value ' + getColorClass(ppb, 'pitches_per_batter');
        } else {
            pitchesPerBatterEl.innerHTML = 'N/A';
            pitchesPerBatterEl.className = 'metric-value';
        }
    } else {
        document.getElementById('pitchingContent').innerHTML =
            '<p style="text-align: center; color: #a0a8cc; font-style: italic; padding: 20px;">No pitching statistics recorded this season</p>';
    }
}

// Update game log with expandable game cards
function updateGameLog(games) {
    const gameLogGrid = document.getElementById('gameLogGrid');
    gameLogGrid.innerHTML = '';

    if (games.length === 0) {
        gameLogGrid.innerHTML = '<p style="text-align: center; color: #a0a8cc; font-style: italic; padding: 20px;">No games recorded yet</p>';
        return;
    }

    // Reverse to show most recent first
    const sortedGames = [...games].reverse();

    for (let i = 0; i < sortedGames.length; i++) {
        const game = sortedGames[i];

        // Create game card container
        const gameCardContainer = document.createElement('div');
        gameCardContainer.className = 'game-card-container';

        // Create main game card
        const gameCard = document.createElement('div');
        gameCard.className = `game-card ${game.result.toLowerCase()}`;

        if (!game.played) {
            gameCard.classList.add('not-played');
        }

        // Format date
        const dateObj = new Date(game.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Clean location (remove quotes)
        const location = game.location.replace(/"/g, '');
        const isAway = location.startsWith('@');
        const cleanLocation = location.replace('@', '');

        gameCard.innerHTML = `
            <div class="game-info">
                <div class="game-date">${formattedDate}</div>
                <div class="game-matchup">
                    ${isAway ? 'at' : 'vs'} ${game.opponent}
                    ${!game.played ? '<span class="game-badge not-played">DID NOT PLAY</span>' : ''}
                </div>
                <div class="game-location">📍 ${cleanLocation}</div>
                ${game.notable ? `<div class="game-notable">⭐ ${game.notable}</div>` : ''}
            </div>
            <div class="game-score-section">
                <div class="game-score ${game.result.toLowerCase()}">${game.score}</div>
                ${game.played ? '<div class="expand-hint">Click for stats ▼</div>' : ''}
            </div>
        `;

        // Create expandable stats section
        if (game.played && game.stats) {
            const statsSection = document.createElement('div');
            statsSection.className = 'game-stats-expanded';
            statsSection.style.display = 'none';

            const gameAvg = game.stats.avg;

            statsSection.innerHTML = `
                <div class="game-stats-grid">
                    <div class="game-stat-section">
                        <h4>🥎 Hitting</h4>
                        <div class="game-stat-line"><strong>Batting:</strong> ${fmt.num(game.stats.hitting.H)}-${fmt.num(game.stats.hitting.AB)} <span class="game-avg ${getColorClass(gameAvg, 'avg')}">(${fmt.avg(gameAvg)})</span></div>
                        ${game.stats.hitting['2B'] > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting['2B'])} Double${game.stats.hitting['2B'] > 1 ? 's' : ''}</div>` : ''}
                        ${game.stats.hitting['3B'] > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting['3B'])} Triple${game.stats.hitting['3B'] > 1 ? 's' : ''}</div>` : ''}
                        ${game.stats.hitting.HR > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting.HR)} Home Run${game.stats.hitting.HR > 1 ? 's' : ''}</div>` : ''}
                        ${game.stats.hitting.RBI > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting.RBI)} RBI</div>` : ''}
                        ${game.stats.hitting.R > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting.R)} Run${game.stats.hitting.R > 1 ? 's' : ''} scored</div>` : ''}
                        ${game.stats.hitting.BB > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting.BB)} Walk${game.stats.hitting.BB > 1 ? 's' : ''}</div>` : ''}
                        ${game.stats.hitting.K > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting.K)} Strikeout${game.stats.hitting.K > 1 ? 's' : ''}</div>` : ''}
                        ${game.stats.hitting.SB > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.hitting.SB)} Stolen Base${game.stats.hitting.SB > 1 ? 's' : ''}</div>` : ''}
                    </div>
                    ${game.stats.fielding.TC > 0 ? `
                    <div class="game-stat-section">
                        <h4>🧤 Fielding</h4>
                        <div class="game-stat-line"><strong>PO:</strong> ${fmt.num(game.stats.fielding.PO)} | <strong>A:</strong> ${fmt.num(game.stats.fielding.A)}</div>
                        ${game.stats.fielding.E > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.fielding.E)} Error${game.stats.fielding.E > 1 ? 's' : ''}</div>` : ''}
                        ${game.stats.fielding.DP > 0 ? `<div class="game-stat-line">• ${fmt.num(game.stats.fielding.DP)} Double Play${game.stats.fielding.DP > 1 ? 's' : ''}</div>` : ''}
                    </div>
                    ` : ''}
                    ${game.stats.pitching.IP > 0 ? `
                    <div class="game-stat-section">
                        <h4>⚾️ Pitching</h4>
                        <div class="game-stat-line"><strong>${fmt.decimal(game.stats.pitching.IP, 1)} IP</strong> | ${fmt.num(game.stats.pitching.PC)} pitches</div>
                        <div class="game-stat-line">• ${fmt.num(game.stats.pitching.H_p)} H, ${fmt.num(game.stats.pitching.R_p)} R, ${fmt.num(game.stats.pitching.ER)} ER</div>
                        <div class="game-stat-line">• ${fmt.num(game.stats.pitching.K_p)} K, ${fmt.num(game.stats.pitching.BB_p)} BB</div>
                    </div>
                    ` : ''}
                </div>
            `;

            // Add click handler to toggle stats
            gameCard.style.cursor = 'pointer';
            gameCard.addEventListener('click', () => {
                const isExpanded = statsSection.style.display !== 'none';
                statsSection.style.display = isExpanded ? 'none' : 'block';
                gameCard.classList.toggle('expanded', !isExpanded);

                // Update expand hint
                const hint = gameCard.querySelector('.expand-hint');
                if (hint) {
                    hint.textContent = isExpanded ? 'Click for stats ▼' : 'Click to collapse ▲';
                }
            });

            gameCardContainer.appendChild(gameCard);
            gameCardContainer.appendChild(statsSection);
        } else {
            gameCardContainer.appendChild(gameCard);
        }

        gameLogGrid.appendChild(gameCardContainer);
    }
}

// Update performance trends section
function updatePerformanceTrends(stats) {
    updateSeasonGoals(stats);
    updateBattingTrend(stats);
}

// Update season goals with progress bars
function updateSeasonGoals(stats) {
    const { hitting, calculated, pitching, games } = stats;
    const goalsGrid = document.getElementById('goalsGrid');
    goalsGrid.innerHTML = '';

    // Define season goals (customize these)
    const goals = [
        {
            title: 'Batting Average .400+',
            current: calculated.AVG,
            target: 0.400,
            format: (v) => fmt.avg(v),
            inverse: false
        },
        {
            title: 'OPS 1.000+',
            current: calculated.OPS,
            target: 1.000,
            format: (v) => fmt.avg(v),
            inverse: false
        },
        {
            title: '10+ RBIs',
            current: hitting.RBI,
            target: 10,
            format: (v) => fmt.num(v),
            inverse: false
        },
        {
            title: '5+ Extra-Base Hits',
            current: calculated.XBH,
            target: 5,
            format: (v) => fmt.num(v),
            inverse: false
        },
        {
            title: 'Strikeout Rate < 15%',
            current: calculated.K_pct,
            target: 0.15,
            format: (v) => fmt.pct(v),
            inverse: true
        },
        {
            title: 'Fielding % .900+',
            current: calculated.fieldingPct,
            target: 0.900,
            format: (v) => fmt.avg(v),
            inverse: false
        }
    ];

    // Add pitching goals if there are pitching stats
    if (pitching.IP > 0) {
        goals.push(
            {
                title: 'ERA < 4.50',
                current: calculated.ERA,
                target: 4.50,
                format: (v) => fmt.decimal(v, 2),
                inverse: true
            },
            {
                title: 'WHIP < 1.50',
                current: calculated.WHIP,
                target: 1.50,
                format: (v) => fmt.decimal(v, 2),
                inverse: true
            }
        );
    }

    // Render goal cards
    for (const goal of goals) {
        const progress = goal.inverse
            ? Math.min(100, Math.max(0, (1 - (goal.current / goal.target)) * 100))
            : Math.min(100, (goal.current / goal.target) * 100);

        const isComplete = goal.inverse ? goal.current <= goal.target : goal.current >= goal.target;
        const progressClass = isComplete ? 'complete' : '';

        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-value ${getColorClass(goal.current, goal.title.includes('AVG') ? 'avg' : goal.title.includes('OPS') ? 'ops' : '')}">${goal.format(goal.current)}</div>
            </div>
            <div class="goal-progress-bar">
                <div class="goal-progress-fill ${progressClass}" style="width: ${progress}%"></div>
            </div>
            <div class="goal-status">
                ${isComplete ? '✓ Goal Achieved!' : `${progress.toFixed(0)}% to goal (${goal.format(goal.target)} target)`}
            </div>
        `;
        goalsGrid.appendChild(goalCard);
    }
}

// Update batting average trend chart
function updateBattingTrend(stats) {
    const canvas = document.getElementById('avgTrendChart');
    const ctx = canvas.getContext('2d');
    const games = stats.gamesList.filter(g => g.played);

    if (games.length === 0) {
        ctx.fillStyle = '#a0a8cc';
        ctx.font = '16px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('No game data available yet', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Calculate cumulative batting averages
    const avgData = [];
    const dataPoints = []; // Store coordinates for click detection
    let cumulativeH = 0;
    let cumulativeAB = 0;

    for (const game of games) {
        cumulativeH += game.stats.hitting.H;
        cumulativeAB += game.stats.hitting.AB;
        const avg = cumulativeAB > 0 ? cumulativeH / cumulativeAB : 0;
        avgData.push({
            avg: avg,
            cumulativeH: cumulativeH,
            cumulativeAB: cumulativeAB,
            game: game
        });
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Find min/max for scaling
    const avgValues = avgData.map(d => d.avg);
    const maxAvg = Math.max(...avgValues, 0.500); // At least .500 for scale
    const minAvg = Math.min(...avgValues, 0);
    const avgRange = maxAvg - minAvg;

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw horizontal grid lines and labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#b0b8d4';
    ctx.font = '12px "Segoe UI"';
    ctx.textAlign = 'right';

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding + (chartHeight / gridLines) * i;
        const avgValue = maxAvg - (avgRange / gridLines) * i;

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();

        ctx.fillText(avgValue.toFixed(3), padding - 10, y + 4);
    }

    // Draw reference line for .400 if in range
    if (0.400 >= minAvg && 0.400 <= maxAvg) {
        const y400 = padding + chartHeight * (1 - (0.400 - minAvg) / avgRange);
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, y400);
        ctx.lineTo(canvas.width - padding, y400);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#4CAF50';
        ctx.textAlign = 'left';
        ctx.fillText('.400', canvas.width - padding + 5, y400 + 4);
    }

    // Draw batting average line
    const pointSpacing = chartWidth / (avgData.length - 1 || 1);

    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < avgData.length; i++) {
        const x = padding + i * pointSpacing;
        const y = padding + chartHeight * (1 - (avgData[i].avg - minAvg) / avgRange);

        // Store coordinates for click detection
        dataPoints.push({ x, y, index: i, data: avgData[i] });

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < avgData.length; i++) {
        const x = padding + i * pointSpacing;
        const y = padding + chartHeight * (1 - (avgData[i].avg - minAvg) / avgRange);

        // Circle
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Highlight last point
        if (i === avgData.length - 1) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Draw game labels (every other game to avoid crowding)
    ctx.fillStyle = '#b0b8d4';
    ctx.font = '10px "Segoe UI"';
    ctx.textAlign = 'center';

    for (let i = 0; i < games.length; i++) {
        if (i % 2 === 0 || i === games.length - 1) {
            const x = padding + i * pointSpacing;
            const gameNum = i + 1;
            ctx.fillText(`G${gameNum}`, x, canvas.height - padding + 20);
        }
    }

    // Update trend stats
    const trendStats = document.getElementById('trendStats');
    const currentAvg = avgData[avgData.length - 1].avg;
    const startAvg = avgData[0].avg;
    const highAvg = Math.max(...avgValues);
    const lowAvg = Math.min(...avgValues);
    const trend = currentAvg - startAvg;

    trendStats.innerHTML = `
        <div class="trend-stat">
            <div class="trend-stat-label">Current AVG</div>
            <div class="trend-stat-value ${getColorClass(currentAvg, 'avg')}">${fmt.avg(currentAvg)}</div>
        </div>
        <div class="trend-stat">
            <div class="trend-stat-label">Season High</div>
            <div class="trend-stat-value ${getColorClass(highAvg, 'avg')}">${fmt.avg(highAvg)}</div>
        </div>
        <div class="trend-stat">
            <div class="trend-stat-label">Season Low</div>
            <div class="trend-stat-value ${getColorClass(lowAvg, 'avg')}">${fmt.avg(lowAvg)}</div>
        </div>
        <div class="trend-stat">
            <div class="trend-stat-label">Trend</div>
            <div class="trend-stat-value ${trend >= 0 ? 'stat-great' : 'stat-poor'}">
                ${trend >= 0 ? '↗' : '↘'} ${fmt.avg(Math.abs(trend))}
            </div>
        </div>
    `;

    // Add click handler for interactive data points
    // Remove old listeners by replacing the canvas element
    if (!canvas.dataset.listenersAdded) {
        canvas.dataset.listenersAdded = 'true';

        // Add click listener to detect clicks on data points
        canvas.addEventListener('click', function(e) {
            // Get the current dataPoints from the canvas's stored data
            const points = this.dataPoints;
            if (!points) return;

            const rect = this.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            // Check if click is near any data point (within 15px radius)
            const clickRadius = 15;
            let clickedPoint = null;

            for (const point of points) {
                const distance = Math.sqrt(
                    Math.pow(clickX - point.x, 2) + Math.pow(clickY - point.y, 2)
                );

                if (distance <= clickRadius) {
                    clickedPoint = point;
                    break;
                }
            }

            if (clickedPoint) {
                displayGameDetails(clickedPoint);
            }
        });

        // Add hover effect - change cursor when over a point
        canvas.addEventListener('mousemove', function(e) {
            const points = this.dataPoints;
            if (!points) return;

            const rect = this.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const hoverRadius = 15;
            let overPoint = false;

            for (const point of points) {
                const distance = Math.sqrt(
                    Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                );

                if (distance <= hoverRadius) {
                    overPoint = true;
                    break;
                }
            }

            this.style.cursor = overPoint ? 'pointer' : 'default';
        });
    }

    // Store dataPoints on the canvas for the event listeners
    canvas.dataPoints = dataPoints;
}

// Display game details when a data point is clicked
function displayGameDetails(point) {
    const { index, data } = point;
    const game = data.game;
    const gameNum = index + 1;

    // Format date
    const dateObj = new Date(game.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Clean location
    const location = game.location.replace(/"/g, '').replace('@', '');

    // Get game-specific stats
    const gameH = game.stats.hitting.H;
    const gameAB = game.stats.hitting.AB;
    const gameAvg = gameAB > 0 ? gameH / gameAB : 0;
    const gameHR = game.stats.hitting.HR;
    const gameRBI = game.stats.hitting.RBI;
    const gameR = game.stats.hitting.R;
    const gameBB = game.stats.hitting.BB;
    const gameK = game.stats.hitting.K;

    const selectedGameInfo = document.getElementById('selectedGameInfo');
    selectedGameInfo.style.display = 'block';
    selectedGameInfo.innerHTML = `
        <div class="selected-game-header">
            <div>
                <div class="selected-game-title">Game ${gameNum}: vs ${game.opponent}</div>
                <div class="selected-game-date">${formattedDate} • ${location} • ${game.result} ${game.score}</div>
            </div>
        </div>
        <div class="selected-game-stats">
            <div class="selected-stat">
                <div class="selected-stat-label">Game AVG</div>
                <div class="selected-stat-value ${getColorClass(gameAvg, 'avg')}">${fmt.avg(gameAvg)}</div>
            </div>
            <div class="selected-stat">
                <div class="selected-stat-label">Batting</div>
                <div class="selected-stat-value">${gameH}-${gameAB}</div>
            </div>
            <div class="selected-stat">
                <div class="selected-stat-label">Cumulative AVG</div>
                <div class="selected-stat-value ${getColorClass(data.avg, 'avg')}">${fmt.avg(data.avg)}</div>
            </div>
            <div class="selected-stat">
                <div class="selected-stat-label">Season Total</div>
                <div class="selected-stat-value">${data.cumulativeH}-${data.cumulativeAB}</div>
            </div>
            ${gameHR > 0 ? `
            <div class="selected-stat">
                <div class="selected-stat-label">HR</div>
                <div class="selected-stat-value stat-great">${gameHR}</div>
            </div>
            ` : ''}
            ${gameRBI > 0 ? `
            <div class="selected-stat">
                <div class="selected-stat-label">RBI</div>
                <div class="selected-stat-value">${gameRBI}</div>
            </div>
            ` : ''}
            <div class="selected-stat">
                <div class="selected-stat-label">Runs</div>
                <div class="selected-stat-value">${gameR}</div>
            </div>
            <div class="selected-stat">
                <div class="selected-stat-label">BB</div>
                <div class="selected-stat-value">${gameBB}</div>
            </div>
            <div class="selected-stat">
                <div class="selected-stat-label">K</div>
                <div class="selected-stat-value">${gameK}</div>
            </div>
        </div>
        ${game.notable ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(76, 175, 80, 0.3); color: #FFD700; font-style: italic; text-align: center;">⭐ ${game.notable}</div>` : ''}
    `;

    // Scroll to the selected game info
    selectedGameInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Update last updated timestamp
function updateLastUpdated() {
    const lastUpdated = new Date(statsData.lastUpdated);
    const formatted = lastUpdated.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });

    document.getElementById('lastUpdated').textContent = formatted;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
