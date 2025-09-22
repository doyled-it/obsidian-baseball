# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an advanced Obsidian vault for tracking personal baseball statistics with professional-level analytics. The vault uses a sophisticated approach to track individual game statistics and automatically aggregate them into comprehensive season summaries using enhanced DataviewJS queries.

## Project Structure

```
/
├── .obsidian/                      # Obsidian configuration (includes this CLAUDE.md)
├── templates/                      # Obsidian templates for new content
│   ├── game template.md           # Template for individual game logs (enhanced)
│   ├── season baseball card.md    # Template for advanced season summaries
│   └── enhanced season baseball card.md  # Alternative advanced template
├── games/                         # Game log storage organized by year/season
│   └── YYYY/
│       └── season/                # Individual game files with stats
├── [season cards]                 # Season summary files in root
└── README.md                      # Complete user documentation
```

## Core Architecture

### Game Logs (`type: baseball-stats`)
Individual game files track comprehensive statistics across hitting, fielding, pitching, and game quality:

**Frontmatter Structure:**
```yaml
---
date: YYYY-MM-DD
type: baseball-stats
opponent: Team Name
location: Field Name (use "@Field Name" for away games)
result: W/L
score: X-Y
---
```

**Statistical Sections:**
1. **Hitting**: Standard stats + advanced clutch metrics
2. **Fielding**: Standard defensive stats
3. **Pitching**: Complete pitching line (uses _p suffix to avoid conflicts)
4. **Game Quality**: Performance ratings and situational context

### Season Cards (`type: baseball-season-summary`)
Advanced analytics aggregation with multiple sophisticated features:

**Frontmatter Structure:**
```yaml
---
type: baseball-season-summary
season: Season Name
player: Player Name
team: Team Name
player_position: "Utility (P/IF/OF)"  # Use player_position, not position
games_folder: games/YYYY/season
---
```

### Key Statistical Fields

**Standard Hitting:** AB, H, 2B, 3B, HR, RBI, R, BB, K, HBP, SF, SB, CS

**Advanced Hitting Metrics:**
- `RISP`: At-bats with runners in scoring position (2nd/3rd base)
- `RISP_H`: Hits with runners in scoring position (clutch hitting)
- `hard_contact`: Well-struck balls regardless of outcome
- `pitches_seen`: Total pitches faced (plate discipline metric)

**Fielding:** PO, A, E, TC, DP

**Pitching (uses _p suffix to avoid naming conflicts):**
- IP, H_p, R_p, ER, BB_p, K_p, HR_p, BF, PC

**Game Quality Tracking:**
- `game_rating`: 1-10 performance scale
- `leverage_situations`: high/medium/low pressure
- `notable_moments`: Key plays description
- `lessons_learned`: Development focus areas

### Advanced Features Implementation

#### 1. Smart Game Filtering
All statistical calculations use intelligent filtering to distinguish between:
- **Games played in**: Has AB > 0 OR H > 0 OR PO > 0 OR A > 0 OR IP > 0
- **Team games**: All games regardless of participation

**Filter Pattern:**
```javascript
const allPages = dv.pages('"' + folder + '"').where(p => p.type === "baseball-stats");
const playedGames = allPages.where(p => (Number(p.AB ?? 0) > 0) || (Number(p.H ?? 0) > 0) || (Number(p.PO ?? 0) > 0) || (Number(p.A ?? 0) > 0) || (Number(p.IP ?? 0) > 0));
```

#### 2. Home/Away Game Detection
- **Home games**: Location field without "@" symbol
- **Away games**: Location field with "@" prefix (e.g., "@Enemy Field")

#### 3. Signature Moments Detection
Automatically identifies exceptional games based on:
- 3+ hits in a game
- Home runs hit
- 3+ RBI games
- Perfect batting (hits = at-bats with 4+ AB)
- Outstanding games (9+ rating)

#### 4. Performance Trends Analysis
- Monthly progression tracking
- Recent vs season performance comparison
- Game rating trends with directional indicators
- Hot/cold streak identification

#### 5. Advanced Metrics Calculations

**Hitting Analytics:**
- BABIP: (H - HR) ÷ (AB - K - HR + SF)
- ISO: SLG - AVG
- XBH%: (2B + 3B + HR) ÷ H
- BB%: BB ÷ (AB + BB + HBP + SF)
- K%: K ÷ (AB + BB + HBP + SF)
- Clutch Average: RISP_H ÷ RISP
- Contact Quality: hard_contact ÷ AB

**Pitching Analytics:**
- K/9: (K_p × 9) ÷ IP
- BB/9: (BB_p × 9) ÷ IP
- Pitches per Batter: PC ÷ BF

### Critical Implementation Details

#### Null-Safe Number Conversion
Always use this pattern for statistical aggregation:
```javascript
const N = (v) => Number(v ?? 0);
```

#### Date Formatting
Handle Obsidian date objects properly:
```javascript
const gameDate = p.date ? p.date.toString().split('T')[0] : "Unknown Date";
```

#### Position Field Handling
- Use `player_position` field name (not `position` - reserved in Obsidian)
- Always quote complex position strings in frontmatter
- Reference as `=this.player_position` in templates

#### Season Length Context
- Fall/Summer seasons: ~10 games
- Spring seasons: ~11-12 games
- Adjust goals accordingly (current template uses 8 games as target)

### File Naming Conventions

- **Game logs**: `YYYY-MM-DD.md` format
- **Season cards**: `YYYY [Season Name] Baseball Card.md` format
- **Templates**: Descriptive names ending in "template.md"

### Required Obsidian Plugins

- **Dataview**: Essential for all statistical aggregation and display
- **Obsidian Git**: Used for version control of baseball statistics

### Common Development Tasks

#### Creating New Game Logs
1. Use the enhanced "game template.md" template
2. Place in appropriate `games/YYYY/season/` folder structure
3. Ensure `type: baseball-stats` in frontmatter
4. Fill statistical fields using `field:: value` format
5. Include clutch/quality metrics for comprehensive analysis

#### Creating Season Summaries
1. Use "season baseball card.md" template for advanced analytics
2. Set appropriate `games_folder` path in frontmatter
3. The DataviewJS code automatically aggregates all games with `type: baseball-stats`
4. Filtering ensures only played games affect personal statistics

#### Handling Non-Participation Games
1. Create game file with metadata only (opponent, location, result, score)
2. Leave all statistical sections blank
3. System will count toward team record but not personal stats
4. Use "@" prefix in location for away games

### Troubleshooting Common Issues

#### NaN Values in Statistics
- Caused by including games with no statistical data
- Fixed by robust filtering logic that checks for actual participation
- Each section filters independently for hitting, fielding, and pitching

#### Position Not Displaying
- Use `player_position` field instead of `position`
- Quote complex position strings in frontmatter
- Reference as `=this.player_position` in display templates

#### Date Display Issues
- Obsidian date objects need `.toString().split('T')[0]` for clean display
- Used in signature games and monthly progression sections

### Security and Best Practices

- All calculations handle missing/null values gracefully
- No sensitive information stored (personal baseball statistics only)
- Follow existing code patterns for consistency
- Always test with empty/partial game data
- Maintain backward compatibility when modifying templates

### Extension Points

The system is designed for easy extension:
- Add new statistical fields to game template
- Extend advanced metrics in season card calculations
- Modify signature game criteria
- Adjust performance trend algorithms
- Customize goal tracking targets

### Performance Considerations

- DataviewJS queries are optimized for small datasets (10-20 games per season)
- Filtering logic minimizes unnecessary calculations
- All rate calculations include division-by-zero protection
- Null coalescing used throughout for robustness