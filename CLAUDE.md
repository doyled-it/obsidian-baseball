# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian vault for tracking personal baseball statistics and performance analytics. The vault uses a structured approach to track individual game statistics and automatically aggregate them into season summaries using Dataview queries.

## Project Structure

```
/
├── templates/          # Obsidian templates for new content
│   ├── game template.md      # Template for individual game logs
│   └── season baseball card.md  # Template for season summaries
├── games/             # Game log storage organized by year/season
│   └── 2025/
│       └── summer/    # Individual game files with stats
└── [season cards]     # Season summary files in root (e.g., "2025 Summer Baseball Card.md")
```

## Core Architecture

### Game Logs (`type: baseball-stats`)
- Individual game files track detailed hitting, fielding, and pitching statistics
- Use structured frontmatter with `type: baseball-stats` and game metadata
- Stats stored as Obsidian dataview inline fields (e.g., `AB:: 4`, `H:: 2`)
- Three main categories: Hitting, Fielding, Pitching

### Season Cards (`type: baseball-season-summary`)
- Aggregate statistics across all games in a season
- Use DataviewJS for complex calculations and rate statistics
- Support both folder-based filtering (`games_folder`) and tag-based filtering (`season_tag`)
- Calculate advanced metrics like AVG, OBP, SLG, OPS, ERA, WHIP, K/BB

### Key Statistical Fields

**Hitting:** AB, H, 2B, 3B, HR, RBI, R, BB, K, HBP, SF, SB, CS
**Fielding:** PO, A, E, TC, DP
**Pitching:** IP (or OUTS), H, R, ER, BB, K, HR, BF, PC

### Advanced Features

- **Robust Pitching Calculation:** Supports both traditional IP format (4.2 = 4⅔ innings) and OUTS count, with OUTS taking precedence
- **Null-Safe Aggregation:** All calculations handle missing/null values gracefully
- **Rate Statistics:** Automatically calculates batting average, on-base percentage, slugging, OPS, ERA, WHIP, and strikeout-to-walk ratios

## Required Obsidian Plugins

- **Dataview:** Essential for all statistical aggregation and display
- **Obsidian Git:** Used for version control of the baseball statistics

## Common Development Tasks

### Creating New Game Logs
1. Use the "game template.md" template
2. Place in appropriate `games/YYYY/season/` folder structure
3. Ensure `type: baseball-stats` in frontmatter
4. Fill in statistical fields using `field:: value` format

### Creating Season Summaries
1. Use the "season baseball card.md" template
2. Set appropriate `games_folder` path in frontmatter
3. The DataviewJS code will automatically aggregate all games with `type: baseball-stats`

### Modifying Statistical Calculations
- Primary aggregation logic is in the DataviewJS blocks within season cards
- The main season card uses a comprehensive null-safe aggregation system
- Templates may have simpler Dataview queries for basic functionality

## File Naming Conventions

- Game logs: `YYYY-MM-DD.md` format
- Season cards: `YYYY [Season Name] Baseball Card.md` format
- Templates: Descriptive names ending in "template.md"

## Notes

- This vault is personal baseball statistics tracking, not team management
- All statistics follow standard baseball conventions
- The DataviewJS implementation includes sophisticated pitching IP/OUTS conversion logic
- Season cards can aggregate from either folder paths or tag-based filtering