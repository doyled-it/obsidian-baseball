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

#### 🎯 Advanced Hitting Metrics

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **RISP** | Runners In Scoring Position | At-bats with runners on 2nd or 3rd base |
| **RISP_H** | RISP Hits | Hits when you had runners in scoring position |
| **hard_contact** | Hard Contact | Well-struck balls regardless of outcome |
| **pitches_seen** | Pitches Seen | Total pitches faced during plate appearances |

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

### 📊 Game Quality Tracking

| Field | Description |
|-------|-------------|
| **game_rating** | Overall performance rating (1-10 scale) |
| **leverage_situations** | Game situation pressure (high/medium/low) |
| **notable_moments** | Memorable plays or key situations |
| **lessons_learned** | What to work on or focus areas |

## Calculated Rate Statistics

The season cards automatically calculate these advanced metrics:

### Standard Hitting Rates
- **AVG** (Batting Average): H ÷ AB
- **OBP** (On-Base Percentage): (H + BB + HBP) ÷ (AB + BB + HBP + SF)
- **SLG** (Slugging Percentage): Total Bases ÷ AB
- **OPS** (On-Base Plus Slugging): OBP + SLG

### Advanced Hitting Metrics
- **BABIP** (Batting Average on Balls in Play): (H - HR) ÷ (AB - K - HR + SF)
- **ISO** (Isolated Power): SLG - AVG (measures extra-base hit ability)
- **XBH%** (Extra Base Hit %): (2B + 3B + HR) ÷ H
- **BB%** (Walk Rate): BB ÷ (AB + BB + HBP + SF)
- **K%** (Strikeout Rate): K ÷ (AB + BB + HBP + SF)
- **Clutch Average**: RISP_H ÷ RISP (batting with runners in scoring position)
- **Contact Quality**: hard_contact ÷ AB (percentage of well-struck balls)

### Fielding Rates
- **Fld%** (Fielding Percentage): (PO + A) ÷ TC
- **Range Factor**: (PO + A) ÷ Games (fielding activity per game)

### Pitching Rates
- **ERA** (Earned Run Average): (ER × 9) ÷ IP
- **WHIP** (Walks + Hits per Inning): (BB_p + H_p) ÷ IP
- **K/BB** (Strikeout-to-Walk Ratio): K_p ÷ BB_p
- **K/9** (Strikeouts per 9 innings): (K_p × 9) ÷ IP
- **BB/9** (Walks per 9 innings): (BB_p × 9) ÷ IP
- **Pitches per Batter**: PC ÷ BF (pitch efficiency)

## Enhanced Features (New!)

### 🏆 Signature Moments Detection
The enhanced season card automatically identifies great games based on:
- **3+ hits** in a game
- **Home runs** hit
- **3+ RBI** games
- **Perfect batting** (hits = at-bats with 4+ AB)
- **Outstanding games** (9+ rating)

### 📈 Performance Trends
- **Monthly progression** showing batting average and power trends over time
- **Recent vs season** performance comparison with trend indicators
- **Game ratings** tracking with overall season average
- **Hot/cold streaks** identification

### 🎯 Advanced Analytics
- **Clutch performance** tracking (batting with runners in scoring position)
- **Contact quality** analysis (hard-hit balls vs soft contact)
- **Plate discipline** metrics (pitches per plate appearance)
- **Goal tracking** with visual progress indicators

### 📊 Season Overview
- **Home vs away** performance splits
- **Team record** tracking when you play
- **Monthly breakdown** of key statistics
- **Signature games** highlight reel

## Quick Tips

- **Leave fields blank** if they don't apply (e.g., no stolen bases = leave SB blank)
- **Innings Pitched format**: Use decimals (.1 = ⅓ inning, .2 = ⅔ inning)
- **Pitching field names**: Note the "_p" suffix to distinguish from hitting stats
- **Game ratings**: Use 1-10 scale (1=terrible, 5=average, 10=perfect)
- **RISP tracking**: Count at-bats with runners on 2nd/3rd base only
- **Hard contact**: Include well-struck balls even if they're outs
- **Rate calculations**: All done automatically by the season card templates

## File Structure

```
/
├── games/YYYY/season/              # Individual game logs
├── templates/                      # Templates for new games/seasons
│   ├── game template.md           # Standard game log template
│   ├── season baseball card.md    # Basic season summary
│   └── enhanced season baseball card.md  # Advanced analytics version
└── [Season] Baseball Card.md       # Season summary files
```