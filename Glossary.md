---
title: Glossary
type: reference
---

*Comprehensive definitions of all baseball statistics tracked in this system*

---

## 🥎 Hitting Statistics

### Basic Hitting Stats

#### AB
**At Bats** - The number of official at-bats, which includes hits, strikeouts, and fielding outs. Does not include walks, hit-by-pitch, sacrifice flies, or sacrifice bunts.

#### H
**Hits** - A batted ball that allows the batter to reach base safely without the benefit of an error or fielder's choice.

#### 2B
**Doubles** - A hit that allows the batter to safely reach second base. Also called a "two-bagger."

#### 3B
**Triples** - A hit that allows the batter to safely reach third base. Also called a "three-bagger."

#### HR
**Home Runs** - A hit that allows the batter to circle all bases and score in one play, typically by hitting the ball over the outfield fence.

#### RBI
**Runs Batted In** - The number of runs that score as a direct result of the batter's action (hit, walk, sacrifice, etc.).

#### R
**Runs** - The number of times a player crosses home plate to score.

#### BB
**Walks (Base on Balls)** - When a batter receives four balls and is awarded first base.

#### K
**Strikeouts** - When a batter accumulates three strikes and is out. Can occur on a swing and miss, looking at a called strike, or foul tip caught by the catcher.

#### HBP
**Hit By Pitch** - When a batter is struck by a pitched ball and awarded first base.

#### SF
**Sacrifice Flies** - A fly ball that is caught for an out but allows a runner to tag up and score from third base.

#### SB
**Stolen Bases** - When a runner advances to the next base during a pitch without the ball being hit.

#### CS
**Caught Stealing** - When a runner attempts to steal a base but is thrown out.

### Advanced Hitting Stats

#### RISP
**Runners In Scoring Position** - At-bats when there are runners on second or third base (scoring position).

#### RISP_H
**Hits with Runners In Scoring Position** - Hits recorded when there are runners in scoring position.

#### hard_contact
**Hard Contact** - Batted balls that are struck well, typically with an exit velocity over 95 mph.

#### pitches_seen
**Pitches Seen** - Total number of pitches a batter has faced.

---

## 📈 Hitting Rate Statistics

### AVG
**Batting Average** - Hits divided by at-bats (H/AB). Measures the frequency of getting a hit.
- *Good: .280+, Excellent: .300+, Elite: .320+*

### OBP
**On-Base Percentage** - (Hits + Walks + Hit-by-Pitch) / (At-Bats + Walks + Hit-by-Pitch + Sacrifice Flies). Measures how often a player reaches base.
- *Good: .340+, Excellent: .370+, Elite: .400+*

### SLG
**Slugging Percentage** - Total bases divided by at-bats. Measures power by weighting hits by bases gained.
- *Good: .450+, Excellent: .500+, Elite: .550+*

### OPS
**On-Base Plus Slugging** - OBP + SLG. Combines getting on base with power hitting.
- *Good: .800+, Excellent: .900+, Elite: 1.000+*

### BABIP
**Batting Average on Balls In Play** - (Hits - Home Runs) / (At-Bats - Strikeouts - Home Runs + Sacrifice Flies). Measures luck and defensive positioning.
- *Normal range: .290-.320, League average: ~.300*

### ISO
**Isolated Power** - SLG - AVG. Measures raw power by isolating extra-base hits.
- *Good: .150+, Excellent: .200+, Elite: .250+*

### XBH
**Extra-Base Hits** - Doubles + Triples + Home Runs. Total hits for more than one base.

### BB-Rate
**Walk Rate** - Walks / Plate Appearances. Measures plate discipline and selectivity.
- *Good: 8%+, Excellent: 10%+, Elite: 12%+*

### K-Rate
**Strikeout Rate** - Strikeouts / Plate Appearances. Measures contact ability (lower is better).
- *Good: <20%, Excellent: <15%, Elite: <10%*

---

## 🧤 Fielding Statistics

### PO
**Putouts** - The number of opposing batters or baserunners put out by a fielder. Includes catches, tags, and force outs.

### A
**Assists** - The number of outs a fielder helps create by throwing to another fielder who records the putout.

### E
**Errors** - Misplays that allow a batter to reach base or a runner to advance when they should have been out with ordinary effort.

### TC
**Total Chances** - PO + A + E. The total number of fielding opportunities.

### DP
**Double Plays** - The number of double plays a fielder participated in turning.

### Fielding-Percentage
**Fielding Percentage** - (PO + A) / (PO + A + E). Measures defensive reliability.
- *Good: .970+, Excellent: .980+, Elite: .990+*

---

## ⚾️ Pitching Statistics

### Basic Pitching Stats

#### IP
**Innings Pitched** - The number of full innings pitched plus partial innings (recorded as .1 or .2).

#### H-Pitching
**Hits Allowed** - The number of hits given up by the pitcher.

#### R-Pitching
**Runs Allowed** - The total number of runs given up by the pitcher (earned and unearned).

#### ER
**Earned Runs** - Runs that scored without the aid of errors or passed balls.

#### BB-Pitching
**Walks Allowed** - The number of batters walked by the pitcher.

#### K-Pitching
**Strikeouts** - The number of batters struck out by the pitcher.

#### HR-Pitching
**Home Runs Allowed** - The number of home runs given up by the pitcher.

#### BF
**Batters Faced** - The total number of batters the pitcher has faced.

#### PC
**Pitch Count** - The total number of pitches thrown.

### Pitching Rate Statistics

#### ERA
**Earned Run Average** - (Earned Runs × 9) / Innings Pitched. The average number of earned runs allowed per 9 innings.
- *Good: <3.50, Excellent: <3.00, Elite: <2.50*

#### WHIP
**Walks plus Hits per Inning Pitched** - (Walks + Hits) / Innings Pitched. Measures baserunners allowed per inning.
- *Good: <1.30, Excellent: <1.20, Elite: <1.10*

#### KBB
**Strikeout-to-Walk Ratio** - Strikeouts / Walks. Measures command and control.
- *Good: 2.0+, Excellent: 3.0+, Elite: 4.0+*

#### K9
**Strikeouts per 9 Innings** - (Strikeouts × 9) / Innings Pitched. Measures strikeout rate.
- *Good: 7.0+, Excellent: 9.0+, Elite: 11.0+*

#### BB9
**Walks per 9 Innings** - (Walks × 9) / Innings Pitched. Measures control (lower is better).
- *Good: <3.0, Excellent: <2.5, Elite: <2.0*

---

## 🎯 Advanced Metrics

### Clutch Performance
**Performance in high-leverage situations** - Statistics recorded with runners in scoring position or in close games.

### Contact Quality
**Percentage of hard-hit balls** - The rate at which a batter makes solid contact, typically measured by exit velocity.

### Range Factor
**Fielding chances per game** - (PO + A) / Games Played. Measures how much territory a fielder covers.

### Leverage Situations
**High-pressure at-bats** - Situations where the outcome significantly affects win probability (late innings, close games, runners in scoring position).

---

## 📊 Statistical Benchmarks

### Batting Average Benchmarks
- **.200 - Mendoza Line** (poor)
- **.250 - Below Average**
- **.280 - Good**
- **.300 - Excellent**
- **.320 - Elite**
- **.350+ - Historic**

### On-Base Percentage Benchmarks
- **.300 - Poor**
- **.320 - Below Average**
- **.340 - Good**
- **.370 - Excellent**
- **.400 - Elite**
- **.420+ - Historic**

### Slugging Percentage Benchmarks
- **.350 - Poor**
- **.400 - Below Average**
- **.450 - Good**
- **.500 - Excellent**
- **.550 - Elite**
- **.600+ - Historic**

### ERA Benchmarks
- **5.00+ - Poor**
- **4.00-4.99 - Below Average**
- **3.50-3.99 - Average**
- **3.00-3.49 - Good**
- **2.50-2.99 - Excellent**
- **<2.50 - Elite**

---

## 🏆 Understanding the Numbers

### What Makes a Complete Player?

**Excellent Hitter:**
- AVG: .300+
- OBP: .370+
- SLG: .500+
- OPS: .900+

**Good Fielder:**
- Fielding %: .970+
- Low error rate
- Good range factor for position

**Effective Pitcher:**
- ERA: <3.50
- WHIP: <1.30
- K/BB: 2.0+
- K/9: 7.0+

### Context Matters
- **League Level:** Amateur, semi-pro, college, and professional leagues have different benchmarks
- **Position:** Different positions have different offensive expectations
- **Era:** Modern analytics provide more context than traditional stats alone
- **Sample Size:** Small samples can be misleading; look for trends over time

---

## 📈 Using These Stats

### For Performance Analysis:
1. **Track trends** over time rather than single-game numbers
2. **Compare rates** rather than counting stats
3. **Look for context** - park factors, opposition quality, weather
4. **Focus on process** - good at-bats matter more than results

### For Goal Setting:
1. **Set realistic targets** based on current ability
2. **Focus on controllables** - plate discipline, contact quality
3. **Track leading indicators** - hard contact rate, pitch recognition
4. **Celebrate improvement** in key areas

---

*Return to: [Career Stats](index.md) | [Season Cards](seasons/) | [Game Logs](games/)*