---
type: baseball-season-summary
season: Summer 2025
player: Michael Doyle
team: Happy Sox
position: IF
games_folder: games/2025/summer
---

# 📇 Season Baseball Card – `=this.season`

> [!info]+ Player Profile
**Player:** `=this.player`  
**Team:** `=this.team`  
**Position:** `=this.position`  
**Season:** `=this.season`  
**Games folder:** `=this.games_folder`  

---

# 📇 Season Baseball Card – `=this.season`

> [!info]+ Player Profile
**Player:** `=this.player`  
**Team:** `=this.team`  
**Position:** `=this.position`  
**Season:** `=this.season`  
**Source:** `=this.games_folder ? this.games_folder : ('#' + this.season_tag)`  

---

```dataviewjs
/********************************************************************
 * Robust, null-safe season roll-up for adult baseball stats
 * - Filters by folder OR tag
 * - Sums with defaults (blank -> 0) to avoid "number + null" errors
 * - Pitching supports IP (e.g., 4.2) or OUTS (preferred). OUTS wins.
 ********************************************************************/

const cur = dv.current();

// --------- Source selection (folder OR tag) ----------
let pages;
if (cur.games_folder && String(cur.games_folder).trim().length) {
  pages = dv.pages('"' + cur.games_folder + '"');
} else if (cur.season_tag && String(cur.season_tag).trim().length) {
  pages = dv.pages('#' + cur.season_tag);
} else {
  // Fallback: same folder as this note
  pages = dv.pages('"' + dv.current().file.folder + '"');
}

// Only game logs for this season (if "season" is set on game notes)
const seasonName = (cur.season || '').trim();
pages = pages
  .where(p => (p.type === "baseball-stats"))
  .where(p => !seasonName || (String(p.season || '').trim() === seasonName));

// --------- Helpers ----------
const N = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  // strip non-numeric except . and - (keeps "4.2")
  const s = String(v).replace(/[^0-9.\-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// Convert IP (e.g., 4.2) to outs; .1 = 1 out, .2 = 2 outs (MLB scoring)
const ipToOuts = (ipVal) => {
  const raw = String(ipVal ?? '').trim();
  if (!raw) return 0;
  const num = Number(raw);
  if (!Number.isFinite(num)) return 0;
  const innings = Math.trunc(num);
  const frac = Math.round((num - innings) * 10); // 0,1,2 expected
  const outsFromFrac = (frac === 1 ? 1 : (frac === 2 ? 2 : 0));
  return innings * 3 + outsFromFrac;
};

// Convert total outs -> IP display with .1/.2 thirds
const outsToIPDisplay = (outsTotal) => {
  const inn = Math.floor(outsTotal / 3);
  const rem = outsTotal % 3; // 0,1,2
  return `${inn}${rem ? '.' + rem : ''}`;
};

// --------- Totals ----------
let T = {
  AB:0,H:0,T2:0,T3:0,HR:0,RBI:0,R:0,BB:0,K:0,HBP:0,SF:0,SB:0,CS:0,
  PO:0,A:0,E:0,TC:0,DP:0,
  OUTS:0,H_p:0,R_p:0,ER:0,BB_p:0,K_p:0,HR_p:0,BF:0,PC:0
};

for (const p of pages) {
  // Hitting / Baserunning
  T.AB  += N(p.AB);
  T.H   += N(p.H);
  T.T2  += N(p["2B"]);
  T.T3  += N(p["3B"]);
  T.HR  += N(p.HR);
  T.RBI += N(p.RBI);
  T.R   += N(p.R);
  T.BB  += N(p.BB);
  T.K   += N(p.K);
  T.HBP += N(p.HBP);
  T.SF  += N(p.SF);
  T.SB  += N(p.SB);
  T.CS  += N(p.CS);

  // Fielding
  T.PO += N(p.PO);
  T.A  += N(p.A);
  T.E  += N(p.E);
  T.TC += N(p.TC);
  T.DP += N(p.DP);

  // Pitching: prefer OUTS if provided; else derive from IP
  const outs = N(p.OUTS) > 0 ? N(p.OUTS) : ipToOuts(p.IP);
  T.OUTS += outs;

  T.H_p  += N(p.H);
  T.R_p  += N(p.R);
  T.ER   += N(p.ER);
  T.BB_p += N(p.BB);
  T.K_p  += N(p.K);
  T.HR_p += N(p.HR);
  T.BF   += N(p.BF);
  T.PC   += N(p.PC);
}

// --------- Rates ----------
const singles = Math.max(0, T.H - T.T2 - T.T3 - T.HR);
const TB = singles + 2*T.T2 + 3*T.T3 + 4*T.HR;

const AVG = T.AB ? (T.H / T.AB) : 0;
const OBP_DEN = (T.AB + T.BB + T.HBP + T.SF);
const OBP = OBP_DEN ? ((T.H + T.BB + T.HBP) / OBP_DEN) : 0;
const SLG = T.AB ? (TB / T.AB) : 0;
const OPS = OBP + SLG;

const IP_disp = outsToIPDisplay(T.OUTS);
const IP_num = T.OUTS / 3.0;
const ERA = IP_num ? (T.ER * 9 / IP_num) : 0;
const WHIP = IP_num ? ((T.BB_p + T.H_p) / IP_num) : 0;
const KBB = T.BB_p ? (T.K_p / T.BB_p) : (T.K_p ? Infinity : 0);

// --------- Pretty Output ----------
dv.header(3, "🥎 Hitting Totals & Rates");
dv.table(
  ["AB","H","1B","2B","3B","HR","RBI","R","BB","K","HBP","SF","SB","CS","AVG","OBP","SLG","OPS"],
  [[
    T.AB, T.H, singles, T.T2, T.T3, T.HR, T.RBI, T.R, T.BB, T.K, T.HBP, T.SF, T.SB, T.CS,
    AVG.toFixed(3), OBP.toFixed(3), SLG.toFixed(3), OPS.toFixed(3)
  ]]
);

dv.header(3, "🧤 Fielding Totals");
const fldPct = T.TC ? ((T.PO + T.A) / T.TC) : 0;
dv.table(
  ["PO","A","E","TC","DP","Fld%"],
  [[T.PO, T.A, T.E, T.TC, T.DP, fldPct.toFixed(3)]]
);

dv.header(3, "⚾️ Pitching Totals & Rates");
dv.table(
  ["IP","H","R","ER","BB","K","HR","BF","PC","ERA","WHIP","K/BB"],
  [[
    IP_disp, T.H_p, T.R_p, T.ER, T.BB_p, T.K_p, T.HR_p, T.BF, T.PC,
    ERA.toFixed(2), WHIP.toFixed(2), (KBB===Infinity ? "∞" : KBB.toFixed(2))
  ]]
);

// Optional: show game count
dv.paragraph(`**Games counted:** ${pages.length}`);
```
---

> [!star] 🏆 Highlights
- Best Game:  
- Key Moments:  
- Goals for Next Season: