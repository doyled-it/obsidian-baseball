---

type: baseball-season-summary
season: Summer 2025
player: 
team: 
position: 
games_folder: Baseball/2025/Summer/Games

---


# 📇 Season Baseball Card – `=this.season`

> [!info]+ Player Profile
**Player:** `=this.player`  
**Team:** `=this.team`  
**Position:** `=this.position`  
**Season:** `=this.season`  
**Games folder:** `=this.games_folder`  

---

> [!success] 🥎 Hitting Totals & Rates
```dataview
TABLE WITHOUT ID
	sum(AB) as AB,
	sum(H) as H,
	sum("2B") as "2B",
	sum("3B") as "3B",
	sum(HR) as HR,
	sum(RBI) as RBI,
	sum(R) as R,
	sum(BB) as BB,
	sum(K) as K,
	sum(HBP) as HBP,
	sum(SF) as SF,
	sum(SB) as SB,
	sum(CS) as CS
FROM "Baseball/2025/Summer/Games"
WHERE type = "baseball-stats"
```
```dataviewjs
const cur = dv.current();
const pages = dv.pages('"' + cur.games_folder + '"').where(p => p.type === "baseball-stats");

// Helper to safely coerce numbers
const N = (v) => Number(v ?? 0);

// Sums
let totals = {
  AB: 0, H: 0, "2B": 0, "3B": 0, HR: 0, RBI: 0, R: 0, BB: 0, K: 0, HBP: 0, SF: 0, SB: 0, CS: 0
};

for (const p of pages) {
  totals.AB += N(p.AB); totals.H += N(p.H); totals["2B"] += N(p["2B"]);
  totals["3B"] += N(p["3B"]); totals.HR += N(p.HR); totals.RBI += N(p.RBI);
  totals.R += N(p.R); totals.BB += N(p.BB); totals.K += N(p.K);
  totals.HBP += N(p.HBP); totals.SF += N(p.SF); totals.SB += N(p.SB); totals.CS += N(p.CS);
}

const singles = Math.max(0, totals.H - totals["2B"] - totals["3B"] - totals.HR);

// Rates
const avg = totals.AB ? (totals.H / totals.AB) : 0;
const obpDen = (totals.AB + totals.BB + totals.HBP + totals.SF);
const obp = obpDen ? ((totals.H + totals.BB + totals.HBP) / obpDen) : 0;
const tb = singles + 2*totals["2B"] + 3*totals["3B"] + 4*totals.HR;
const slg = totals.AB ? (tb / totals.AB) : 0;
const ops = obp + slg;

dv.paragraph(`**AVG** ${avg.toFixed(3)} **OBP** ${obp.toFixed(3)} **SLG** ${slg.toFixed(3)} **OPS** ${ops.toFixed(3)}`);
```

---

> [!note] 🧤 Fielding Totals
```dataview
TABLE WITHOUT ID
	sum(PO) as PO,
	sum(A) as A,
	sum(E) as E,
	sum(TC) as TC,
	sum(DP) as DP
FROM "Baseball/2025/Summer/Games"
WHERE type = "baseball-stats"
```
```dataviewjs
const cur2 = dv.current();
const pages2 = dv.pages('"' + cur2.games_folder + '"').where(p => p.type === "baseball-stats");
const N2 = (v) => Number(v ?? 0);
let PO=0,A=0,E=0,TC=0,DP=0;
for (const p of pages2){ PO+=N2(p.PO); A+=N2(p.A); E+=N2(p.E); TC+=N2(p.TC); DP+=N2(p.DP); }
const fldpct = TC ? ( (PO + A) / TC ) : 0;
dv.paragraph(`**Fielding %** ${fldpct.toFixed(3)} (PO ${PO} + A ${A}) / TC ${TC}`);
```

---

> [!tip] ⚾️ Pitching Totals & Rates
```dataview
TABLE WITHOUT ID
	sum(IP) as IP,
	sum(H) as H,
	sum(R) as R,
	sum(ER) as ER,
	sum(BB) as BB,
	sum(K) as K,
	sum(HR) as HR,
	sum(BF) as BF,
	sum(PC) as Pitches
FROM "Baseball/2025/Summer/Games"
WHERE type = "baseball-stats"
```
```dataviewjs
const cur3 = dv.current();
const pages3 = dv.pages('"' + cur3.games_folder + '"').where(p => p.type === "baseball-stats");
const N3 = (v) => Number(v ?? 0);
let IP=0,H=0,R=0,ER=0,BB=0,K=0,HR=0,BF=0,PC=0;
for (const p of pages3){ IP+=N3(p.IP); H+=N3(p.H); R+=N3(p.R); ER+=N3(p.ER); BB+=N3(p.BB); K+=N3(p.K); HR+=N3(p.HR); BF+=N3(p.BF); PC+=N3(p.PC); }
const era = IP ? (ER * 9 / IP) : 0;
const whip = IP ? ((BB + H) / IP) : 0;
const kbb = BB ? (K / BB) : (K ? Infinity : 0);
dv.paragraph(`**ERA** ${era.toFixed(2)} **WHIP** ${whip.toFixed(2)} **K/BB** ${ (kbb===Infinity?'∞':kbb.toFixed(2)) }`);
```

---

> [!star] 🏆 Highlights
- Best Game:  
- Key Moments:  
- Goals for Next Season: