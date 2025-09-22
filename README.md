# Baseball Statistics Tracker

This Obsidian vault tracks personal baseball statistics with automatic aggregation and rate calculations.

## Baseball Statistics Reference

### 🥎 Hitting Statistics

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **AB** | At Bats | Official plate appearances (excludes walks, HBP, sacrifices) |
| **H** | Hits | Times reaching base safely via hit |
| **1B** | Singles | One-base hits (calculated: H - 2B - 3B - HR) |
| **2B** | Doubles | Two-base hits |
| **3B** | Triples | Three-base hits |
| **HR** | Home Runs | Four-base hits |
| **RBI** | Runs Batted In | Runs scored as a result of your hit/action |
| **R** | Runs | Times you scored a run |
| **BB** | Walks (Base on Balls) | Times you reached first base via 4 balls |
| **K** | Strikeouts | Times you struck out (looking or swinging) |
| **HBP** | Hit By Pitch | Times you reached base after being hit by pitch |
| **SF** | Sacrifice Fly | Fly ball out that scores a runner |
| **SB** | Stolen Bases | Times you successfully stole a base |
| **CS** | Caught Stealing | Times you were thrown out stealing |

### 🧤 Fielding Statistics

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **PO** | Putouts | Times you recorded the final out (catch, force, tag) |
| **A** | Assists | Times you helped make an out (throw to first, etc.) |
| **E** | Errors | Times you made a fielding mistake |
| **TC** | Total Chances | Total fielding opportunities (PO + A + E) |
| **DP** | Double Plays | Times you participated in turning a double play |

### ⚾️ Pitching Statistics

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **IP** | Innings Pitched | Innings completed (use 4.1 for 4⅓ innings, 4.2 for 4⅔) |
| **H_p** | Hits Allowed | Hits given up while pitching |
| **R_p** | Runs Allowed | Total runs scored against you |
| **ER** | Earned Runs | Runs that scored without defensive errors |
| **BB_p** | Walks Given | Batters you walked (4 balls) |
| **K_p** | Strikeouts | Batters you struck out |
| **HR_p** | Home Runs Allowed | Home runs hit against you |
| **BF** | Batters Faced | Total number of batters you faced |
| **PC** | Pitch Count | Total pitches thrown |

## Calculated Rate Statistics

The season cards automatically calculate these advanced metrics:

### Hitting Rates
- **AVG** (Batting Average): H ÷ AB
- **OBP** (On-Base Percentage): (H + BB + HBP) ÷ (AB + BB + HBP + SF)
- **SLG** (Slugging Percentage): Total Bases ÷ AB
- **OPS** (On-Base Plus Slugging): OBP + SLG

### Fielding Rates
- **Fld%** (Fielding Percentage): (PO + A) ÷ TC

### Pitching Rates
- **ERA** (Earned Run Average): (ER × 9) ÷ IP
- **WHIP** (Walks + Hits per Inning): (BB_p + H_p) ÷ IP
- **K/BB** (Strikeout-to-Walk Ratio): K_p ÷ BB_p

## Quick Tips

- **Leave fields blank** if they don't apply (e.g., no stolen bases = leave SB blank)
- **Innings Pitched format**: Use decimals (.1 = ⅓ inning, .2 = ⅔ inning)
- **Pitching field names**: Note the "_p" suffix to distinguish from hitting stats
- **Rate calculations**: All done automatically by the season card templates

## File Structure

```
/
├── games/YYYY/season/        # Individual game logs
├── templates/                # Templates for new games/seasons
└── [Season] Baseball Card.md # Season summary files
```