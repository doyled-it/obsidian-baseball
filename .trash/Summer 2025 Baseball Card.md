```yaml
---
type: baseball-season-summary
year: 2025
player: Michael Doyle
team: Happy Sox
position: IF/P
path: games/2025/summer
---
```

# 🧾 Season Baseball Card – 2025

> [!info]+ Player Profile
**Player:** `=this.player`  
**Team:** `=this.team`  
**Position:** `=this.position`  
**Season:** `=this.year`  

---

```dataview
TABLE sum(AB) as AB, sum(H) as H, sum("2B") as Doubles, sum("3B") as Triples, sum(HR) as HR, sum(RBI) as RBI, sum(R) as Runs, sum(BB) as BB, sum(K) as K, sum(SB) as SB
FROM "this.path"
WHERE type="baseball-stats"
FLATTEN AB, H, "2B", "3B", HR, RBI, R, BB, K, SB
```
**AVG** = `=round(sum(rows.H)/sum(rows.AB),3)`  
**OBP** = `(H+BB+HBP)/(AB+BB+HBP+SF)`  
**SLG** = `(1B + (2*2B) + (3*3B) + (4*HR))/AB`  
**OPS** = `OBP + SLG`  

---

> [!note] 🧤 Fielding Totals  
```dataview
TABLE sum(PO) as PO, sum(A) as A, sum(E) as E, sum(TC) as TC, sum(DP) as DP
FROM "this.path"
WHERE type="baseball-stats"
FLATTEN PO, A, E, TC, DP
```
**Fielding %** = `(PO + A) / TC`

---

> [!tip] ⚾️ Pitching Totals  
```dataview
TABLE sum(IP) as IP, sum(H) as H, sum(R) as R, sum(ER) as ER, sum(BB) as BB, sum(K) as K, sum(HR) as HR, sum(BF) as BF, sum(PC) as Pitches
FROM "this.path"
WHERE type="baseball-stats"
FLATTEN IP, H, R, ER, BB, K, HR, BF, PC
```
**ERA** = `(ER * 9) / IP`  
**WHIP** = `(BB + H) / IP`  
**K/BB** = `K / BB`

---

> [!star] 🏆 Highlights
- Best Game:  
- Key Moments:  
- Goals for Next Season: