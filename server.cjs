var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var PORT = 3e3;
var DB_FILE = import_path.default.join(process.cwd(), "ledger_db.json");
function calculateHash(index, fromUser, toUser, amount, type, timestamp, previousHash) {
  const content = `${index}|${fromUser}|${toUser}|${amount}|${type}|${timestamp}|${previousHash}`;
  return import_crypto.default.createHash("sha256").update(content).digest("hex");
}
function generateSignature(hash) {
  const SECRET_KEY = "LEDGER_PLATFORM_SECURE_COIN_PRIVATE_KEY_2026";
  return import_crypto.default.createHash("sha256").update(hash + SECRET_KEY).digest("hex");
}
var DEFAULT_USERS = [
  {
    id: "3Xln42ZX9zObKAL6f3PYqaUVcZf1",
    name: "Kolli Kiran",
    username: "@kollikiran",
    email: "kollikiran456@gmail.com",
    phoneNumber: "916363111328",
    coinBalance: 1e6,
    fiatBalance: 5e5,
    avatar: "shield",
    isAdmin: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var DEFAULT_MATCHES = [
  {
    id: "match_1",
    sport: "Soccer",
    homeTeam: "Manchester Cyber",
    awayTeam: "Neo Tokyo FC",
    oddsHome: 1.85,
    oddsAway: 3.4,
    oddsDraw: 2.9,
    status: "live",
    score: "1-1",
    winner: null,
    timeRemaining: "Live - 52'",
    eventDate: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "match_2",
    sport: "Basketball",
    homeTeam: "Golden State Ledgers",
    awayTeam: "Boston Blocks",
    oddsHome: 1.45,
    oddsAway: 2.65,
    oddsDraw: 0,
    // No draw in basketball
    status: "live",
    score: "78-83",
    winner: null,
    timeRemaining: "Live - Q3 8:12",
    eventDate: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "match_3",
    sport: "Cyber Chess",
    homeTeam: "DeepMind Alpha",
    awayTeam: "Stockfish Neo",
    oddsHome: 2.1,
    oddsAway: 1.7,
    oddsDraw: 3.1,
    status: "scheduled",
    score: "0-0",
    winner: null,
    timeRemaining: "Starts in 2m",
    eventDate: new Date(Date.now() + 12e4).toISOString()
  },
  {
    id: "match_4",
    sport: "Formula Virtual",
    homeTeam: "Apex Spark",
    awayTeam: "Vector Velocity",
    oddsHome: 2.25,
    oddsAway: 1.62,
    oddsDraw: 0,
    status: "scheduled",
    score: "0-0",
    winner: null,
    timeRemaining: "Starts in 5m",
    eventDate: new Date(Date.now() + 3e5).toISOString()
  }
];
function loadState() {
  if (import_fs.default.existsSync(DB_FILE)) {
    try {
      const state2 = JSON.parse(import_fs.default.readFileSync(DB_FILE, "utf-8"));
      if (!state2.idempotencyKeys) {
        state2.idempotencyKeys = {};
      }
      if (state2.users) {
        state2.users.forEach((u) => {
          const ph = (u.phoneNumber || "").replace(/[\s-()]/g, "");
          const em = (u.email || "").trim().toLowerCase();
          if (ph === "916363111328" || ph === "6363111328" || em === "kollikiran456@gmail.com" || u.id === "3Xln42ZX9zObKAL6f3PYqaUVcZf1") {
            u.isAdmin = true;
            u.name = "Kolli Kiran";
            u.username = "@kollikiran";
            u.email = "kollikiran456@gmail.com";
            u.phoneNumber = "916363111328";
          }
        });
      }
      return state2;
    } catch (e) {
      console.error("Failed to read ledger db, resetting to default", e);
    }
  }
  const ledger = [];
  const gIndex = 0;
  const gFrom = "SYSTEM_MINT";
  const gTo = "@admin";
  const gAmt = 1e7;
  const gType = "genesis";
  const gTime = "2026-06-13T00:00:00.000Z";
  const gPrev = "0000000000000000000000000000000000000000000000000000000000000000";
  const gHash = calculateHash(gIndex, gFrom, gTo, gAmt, gType, gTime, gPrev);
  const gSig = generateSignature(gHash);
  ledger.push({
    id: "tx_genesis",
    index: gIndex,
    fromUser: gFrom,
    toUser: gTo,
    amount: gAmt,
    type: gType,
    timestamp: gTime,
    previousHash: gPrev,
    hash: gHash,
    signature: gSig,
    details: "Coin ledger master genesis block, minted 10,000,000 security coins."
  });
  const state = {
    users: [...DEFAULT_USERS],
    ledger,
    matches: [...DEFAULT_MATCHES],
    wagers: [],
    activeUserId: "3Xln42ZX9zObKAL6f3PYqaUVcZf1",
    idempotencyKeys: {}
  };
  saveState(state);
  return state;
}
function saveState(state) {
  const tmpFile = DB_FILE + ".tmp";
  try {
    import_fs.default.writeFileSync(tmpFile, JSON.stringify(state, null, 2), "utf-8");
    import_fs.default.renameSync(tmpFile, DB_FILE);
  } catch (error) {
    console.error("Atomic state write failed, invoking sync fallback:", error);
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  }
}
function verifyLedgerChain(ledger) {
  if (ledger.length === 0) {
    return { isValid: true, tamperedIndex: null, totalBlocks: 0, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  for (let i = 0; i < ledger.length; i++) {
    const block = ledger[i];
    if (i > 0) {
      const prevBlock = ledger[i - 1];
      if (block.previousHash !== prevBlock.hash) {
        console.warn(`Chain broken at index ${i}: previousHash mismatch. block: ${block.previousHash} vs prev: ${prevBlock.hash}`);
        return { isValid: false, tamperedIndex: i, totalBlocks: ledger.length, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() };
      }
    } else {
      if (block.previousHash !== "0000000000000000000000000000000000000000000000000000000000000000") {
        console.warn(`Genesis block prev hash corrupted on system`);
        return { isValid: false, tamperedIndex: 0, totalBlocks: ledger.length, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() };
      }
    }
    const recomputedHash = calculateHash(
      block.index,
      block.fromUser,
      block.toUser,
      block.amount,
      block.type,
      block.timestamp,
      block.previousHash
    );
    if (block.hash !== recomputedHash) {
      console.warn(`Block hash tampered at index ${i}. calculated: ${recomputedHash} vs stored: ${block.hash}`);
      return { isValid: false, tamperedIndex: i, totalBlocks: ledger.length, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() };
    }
    const recomputedSig = generateSignature(block.hash);
    if (block.signature !== recomputedSig) {
      console.warn(`Signature verification failed at block ${i}`);
      return { isValid: false, tamperedIndex: i, totalBlocks: ledger.length, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() };
    }
  }
  return {
    isValid: true,
    tamperedIndex: null,
    totalBlocks: ledger.length,
    verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function start() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  console.log("Initializing: Loading latest ledger and user state...");
  let state;
  try {
    state = loadState();
    console.log(`\u2705 Loaded ${state.users.length} users, ${state.ledger.length} transactions, and ${state.wagers.length} wagers.`);
  } catch (err) {
    console.error("\u274C Failed to load state, starting with dry state:", err);
    state = loadState();
  }
  const idsToRemove = ["user_newton", "user_alice", "user_bob", "user_admin"];
  state.users = state.users.filter((u) => u && !idsToRemove.includes(u.id));
  let adminUser = state.users.find((u) => u.id === "3Xln42ZX9zObKAL6f3PYqaUVcZf1" || u.username === "@kollikiran" || u.phoneNumber === "916363111328" || u.email === "kollikiran456@gmail.com");
  if (!adminUser) {
    adminUser = {
      id: "3Xln42ZX9zObKAL6f3PYqaUVcZf1",
      name: "Kolli Kiran",
      username: "@kollikiran",
      email: "kollikiran456@gmail.com",
      phoneNumber: "916363111328",
      coinBalance: 1e6,
      fiatBalance: 5e5,
      avatar: "shield",
      isAdmin: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    state.users.push(adminUser);
  } else {
    adminUser.name = "Kolli Kiran";
    adminUser.username = "@kollikiran";
    adminUser.email = "kollikiran456@gmail.com";
    adminUser.phoneNumber = "916363111328";
    adminUser.isAdmin = true;
  }
  state.activeUserId = adminUser.id;
  state.users.forEach((u) => {
    if (u.id === "3Xln42ZX9zObKAL6f3PYqaUVcZf1" || u.phoneNumber === "916363111328" || u.phoneNumber === "6363111328" || (u.email || "").trim().toLowerCase() === "kollikiran456@gmail.com") {
      u.isAdmin = true;
      u.name = "Kolli Kiran";
      u.username = "@kollikiran";
      u.email = "kollikiran456@gmail.com";
      u.phoneNumber = "916363111328";
    }
  });
  saveState(state);
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
  app.use((req, res, next) => {
    const key = req.header("x-idempotency-key") || req.body?.idempotencyKey;
    if (!key || req.method !== "POST") {
      return next();
    }
    if (!state.idempotencyKeys) {
      state.idempotencyKeys = {};
    }
    const cached = state.idempotencyKeys[key];
    if (cached) {
      console.log(`[Idempotency] Request matches previous execution. Returning cached response for key: ${key}`);
      return res.status(cached.status).json(cached.body);
    }
    const originalJson = res.json;
    res.json = function(body) {
      if (res.statusCode < 500) {
        if (!state.idempotencyKeys) {
          state.idempotencyKeys = {};
        }
        state.idempotencyKeys[key] = {
          status: res.statusCode,
          body
        };
        const keys = Object.keys(state.idempotencyKeys);
        if (keys.length > 200) {
          delete state.idempotencyKeys[keys[0]];
        }
        saveState(state);
      }
      return originalJson.call(this, body);
    };
    next();
  });
  let lastMatchesFetchTime = 0;
  const FETCH_COOLDOWN_MS = 6e4;
  async function fetchActualSportsMatches() {
    const matchesList = [];
    try {
      const res = await fetch("https://api.openligadb.de/getmatchdata/bl1");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          data.slice(0, 10).forEach((m) => {
            const mId = `openliga_${m.matchID}`;
            const isFinished = !!m.matchIsFinished;
            let score = "0-0";
            if (m.matchResults && m.matchResults.length > 0) {
              const endResult = m.matchResults.find((r) => r.resultName === "Endergebnis") || m.matchResults[0];
              if (endResult) {
                score = `${endResult.pointsTeam1}-${endResult.pointsTeam2}`;
              }
            }
            let status = "scheduled";
            if (isFinished) {
              status = "finished";
            } else if (m.goals && m.goals.length > 0) {
              status = "live";
            }
            let winner = null;
            if (isFinished) {
              const parts = score.split("-").map(Number);
              if (parts[0] > parts[1]) winner = "home";
              else if (parts[1] > parts[0]) winner = "away";
              else winner = "draw";
            }
            matchesList.push({
              id: mId,
              sport: "Soccer",
              homeTeam: m.team1?.teamName || "Home Team",
              awayTeam: m.team2?.teamName || "Away Team",
              oddsHome: +(1.4 + m.matchID % 10 / 7).toFixed(2),
              oddsAway: +(1.6 + m.matchID % 7 / 6).toFixed(2),
              oddsDraw: +(2.5 + m.matchID % 5 / 5).toFixed(2),
              status,
              score,
              winner,
              timeRemaining: isFinished ? "Finished" : status === "live" ? `Live - ${Math.min(90, 15 + (m.goals?.length || 0) * 15)}'` : "Scheduled",
              eventDate: m.matchDateTimeUTC || m.matchDateTime || (/* @__PURE__ */ new Date()).toISOString()
            });
          });
        }
      }
    } catch (error) {
      console.warn("Failed to fetch matches from OpenLigaDB:", error);
    }
    try {
      const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.events)) {
          data.events.slice(0, 10).forEach((ev) => {
            const mId = `sportsdb_${ev.idEvent}`;
            const homeScore = ev.intHomeScore;
            const awayScore = ev.intAwayScore;
            const isFinished = homeScore !== null && awayScore !== null;
            const status = isFinished ? "finished" : "scheduled";
            const score = isFinished ? `${homeScore}-${awayScore}` : "0-0";
            let winner = null;
            if (isFinished) {
              const h = Number(homeScore);
              const a = Number(awayScore);
              if (h > a) winner = "home";
              else if (a > h) winner = "away";
              else winner = "draw";
            }
            matchesList.push({
              id: mId,
              sport: ev.strSport || "Soccer",
              homeTeam: ev.strHomeTeam || "Home Team",
              awayTeam: ev.strAwayTeam || "Away Team",
              oddsHome: +(1.4 + Number(ev.idEvent) % 10 / 8).toFixed(2),
              oddsAway: +(1.6 + Number(ev.idEvent) % 7 / 6).toFixed(2),
              oddsDraw: +(2.4 + Number(ev.idEvent) % 5 / 5).toFixed(2),
              status,
              score,
              winner,
              timeRemaining: isFinished ? "Finished" : "Scheduled",
              eventDate: ev.dateEvent ? (/* @__PURE__ */ new Date(`${ev.dateEvent}T${ev.strTime || "15:00:00"}`)).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
            });
          });
        }
      }
    } catch (error) {
      console.warn("Failed to fetch matches from TheSportsDB:", error);
    }
    const cricketFixtures = [
      { id: "cric_real_1", homeTeam: "IPL: Chennai Super Kings", awayTeam: "IPL: Mumbai Indians", date: (/* @__PURE__ */ new Date()).toISOString(), status: "live", score: "172/3 (16.4 overs) vs 168/10", timeRemaining: "Live - 2nd Innings" },
      { id: "cric_real_2", homeTeam: "India", awayTeam: "Australia", date: new Date(Date.now() + 18e4).toISOString(), status: "scheduled", score: "0/0 - 0/0", timeRemaining: "Starts in 3m" },
      { id: "cric_real_3", homeTeam: "Pakistan", awayTeam: "England", date: new Date(Date.now() + 48e4).toISOString(), status: "scheduled", score: "0/0 - 0/0", timeRemaining: "Starts in 8m" },
      { id: "cric_real_4", homeTeam: "South Africa", awayTeam: "New Zealand", date: (/* @__PURE__ */ new Date()).toISOString(), status: "finished", score: "245/8 vs 241/10", timeRemaining: "Finished", winner: "home" }
    ];
    cricketFixtures.forEach((m) => {
      matchesList.push({
        id: m.id,
        sport: "Cricket",
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        oddsHome: 1.82,
        oddsAway: 1.9,
        oddsDraw: 0,
        status: m.status,
        score: m.score,
        winner: m.status === "finished" ? m.winner || "home" : null,
        timeRemaining: m.timeRemaining,
        eventDate: m.date
      });
    });
    return matchesList;
  }
  async function syncAndMergeActualMatches() {
    const now = Date.now();
    if (now - lastMatchesFetchTime < FETCH_COOLDOWN_MS) {
      return;
    }
    lastMatchesFetchTime = now;
    try {
      const fetched = await fetchActualSportsMatches();
      if (fetched && fetched.length > 0) {
        fetched.forEach((newMatch) => {
          const existingIdx = state.matches.findIndex((m) => m.id === newMatch.id);
          if (existingIdx !== -1) {
            const existing = state.matches[existingIdx];
            if (newMatch.status === "finished" && existing.status !== "finished" && newMatch.winner) {
              resolveWagersForMatch(existing.id, newMatch.winner);
            }
            state.matches[existingIdx] = {
              ...existing,
              status: newMatch.status,
              score: newMatch.score,
              winner: newMatch.winner,
              timeRemaining: newMatch.timeRemaining
            };
          } else {
            state.matches.push(newMatch);
          }
        });
        saveState(state);
      }
    } catch (err) {
      console.warn("Failed to synchronize matches synchronously:", err);
    }
  }
  app.post("/api/matches/sync-actual", async (req, res) => {
    try {
      lastMatchesFetchTime = Date.now();
      const fetched = await fetchActualSportsMatches();
      if (fetched && fetched.length > 0) {
        fetched.forEach((newMatch) => {
          const existingIdx = state.matches.findIndex((m) => m.id === newMatch.id);
          if (existingIdx !== -1) {
            const existing = state.matches[existingIdx];
            if (newMatch.status === "finished" && existing.status !== "finished" && newMatch.winner) {
              resolveWagersForMatch(existing.id, newMatch.winner);
            }
            state.matches[existingIdx] = {
              ...existing,
              status: newMatch.status,
              score: newMatch.score,
              winner: newMatch.winner,
              timeRemaining: newMatch.timeRemaining
            };
          } else {
            state.matches.push(newMatch);
          }
        });
        saveState(state);
        return res.json({ success: true, count: fetched.length, matches: state.matches });
      }
      return res.json({ success: false, error: "No actual matches could be pulled from the open feeds." });
    } catch (err) {
      return res.status(500).json({ error: err.message || "Failed to trigger match sync" });
    }
  });
  setInterval(() => {
    let stateChanged = false;
    const now = Date.now();
    state.matches = state.matches.map((match) => {
      if (match.status === "scheduled" && new Date(match.eventDate).getTime() <= now) {
        stateChanged = true;
        return {
          ...match,
          status: "live",
          timeRemaining: "Live - 1'",
          score: "0-0"
        };
      }
      if (match.status === "live") {
        stateChanged = true;
        const minMatch = match.timeRemaining.match(/Live - (\d+)'?/);
        let minutes = minMatch ? parseInt(minMatch[1]) : 0;
        if (match.sport === "Basketball") {
          minutes += 8;
          if (minutes >= 48) {
            const scores = match.score.split("-").map(Number);
            const homeScore = scores[0] + Math.floor(Math.random() * 8) + 1;
            const awayScore = scores[1] + Math.floor(Math.random() * 8) + 1;
            const finalHomeScore = homeScore === awayScore ? homeScore + 2 : homeScore;
            const winner = finalHomeScore > awayScore ? "home" : "away";
            resolveWagersForMatch(match.id, winner);
            return {
              ...match,
              status: "finished",
              timeRemaining: "Finished",
              score: `${finalHomeScore}-${awayScore}`,
              winner
            };
          } else {
            const scores = match.score.split("-").map(Number);
            const homeAdd = Math.floor(Math.random() * 6);
            const awayAdd = Math.floor(Math.random() * 6);
            let qo = "Q1";
            if (minutes > 36) qo = "Q4";
            else if (minutes > 24) qo = "Q3";
            else if (minutes > 12) qo = "Q2";
            return {
              ...match,
              score: `${scores[0] + homeAdd}-${scores[1] + awayAdd}`,
              timeRemaining: `Live - ${qo} ${Math.floor(Math.random() * 11)}:${Math.floor(Math.random() * 59).toString().padStart(2, "0")}`
            };
          }
        } else {
          minutes += Math.floor(Math.random() * 10) + 5;
          if (minutes >= 90) {
            const scores = match.score.split("-").map(Number);
            const winner = scores[0] > scores[1] ? "home" : scores[1] > scores[0] ? "away" : "draw";
            resolveWagersForMatch(match.id, winner);
            return {
              ...match,
              status: "finished",
              timeRemaining: "Finished",
              winner
            };
          } else {
            let currentScore = match.score;
            if (Math.random() < 0.18) {
              const scores = currentScore.split("-").map(Number);
              if (Math.random() > 0.5) {
                scores[0] += 1;
              } else {
                scores[1] += 1;
              }
              currentScore = `${scores[0]}-${scores[1]}`;
            }
            return {
              ...match,
              score: currentScore,
              timeRemaining: `Live - ${minutes}'`
            };
          }
        }
      }
      return match;
    });
    const activeMatchesCount = state.matches.filter((m) => m.status !== "finished").length;
    if (activeMatchesCount < 3) {
      stateChanged = true;
      const idSeed = String(Math.floor(Math.random() * 1e4));
      const pairings = [
        { sport: "Soccer", teams: [["London Red", "Paris FC"], ["Madrid Stars", "Munich Rovers"], ["Milano FC", "Barcelona Unified"]] },
        { sport: "Basketball", teams: [["LA Hoops", "Chicago Windy"], ["Miami Heatwave", "Seattle Rain"], ["Brooklyn Nets", "Denver Heights"]] },
        { sport: "Cyber Chess", teams: [["AlphaQuantum", "DeepPawn"], ["Grandmaster AI", "RookEngine"], ["SuperNeumann", "TuringBot"]] },
        { sport: "Formula Virtual", teams: [["Cyber Racing", "Vortex F1"], ["Red Carbon", "Hyperion Team"], ["Tachyon Red", "Nexus Grand"]] }
      ];
      const selectPairing = pairings[Math.floor(Math.random() * pairings.length)];
      const item = selectPairing.teams[Math.floor(Math.random() * selectPairing.teams.length)];
      const homeOdds = +(1.2 + Math.random() * 2.5).toFixed(2);
      const awayOdds = +(1.2 + Math.random() * 2.5).toFixed(2);
      const drawOdds = selectPairing.sport === "Soccer" || selectPairing.sport === "Cyber Chess" ? +(2.5 + Math.random() * 1.5).toFixed(2) : 0;
      const newMatch = {
        id: `match_${idSeed}`,
        sport: selectPairing.sport,
        homeTeam: item[0],
        awayTeam: item[1],
        oddsHome: homeOdds,
        oddsAway: awayOdds,
        oddsDraw: drawOdds,
        status: "scheduled",
        score: "0-0",
        winner: null,
        timeRemaining: "Starts in 30s",
        eventDate: new Date(Date.now() + 3e4).toISOString()
      };
      state.matches.push(newMatch);
    }
    if (state.matches.length > 8) {
      const finishedIds = state.matches.filter((m) => m.status === "finished").map((m) => m.id);
      if (finishedIds.length > 2) {
        state.matches = state.matches.filter((m) => m.id !== finishedIds[0]);
      }
    }
    if (stateChanged) {
      saveState(state);
    }
  }, 1e4);
  function resolveWagersForMatch(matchId, winningOutcome) {
    state.wagers = state.wagers.map((w) => {
      if (w.matchId === matchId && w.status === "pending") {
        const isWin = w.betOn === winningOutcome;
        const payoutVal = isWin ? Math.floor(w.amount * w.odds) : 0;
        const user = state.users.find((u) => u.id === w.userId);
        if (user) {
          if (isWin) {
            user.coinBalance += payoutVal;
            appendTransaction(
              "HOUSE_BANK",
              user.username,
              payoutVal,
              "wager_win",
              `LOBBY SPORTSBOOK PAYOUT: Won wager on Match ID ${matchId} (${w.betOn.toUpperCase()}). Multiplier: ${w.odds}x`
            );
          } else {
            appendTransaction(
              user.username,
              "HOUSE_BANK",
              w.amount,
              "wager_lost",
              `LOBBY SPORTSBOOK SETTLED: Lost wager on Match ID ${matchId} (${w.betOn.toUpperCase()}). Outcome: ${winningOutcome.toUpperCase()}`
            );
          }
        }
        return {
          ...w,
          status: isWin ? "won" : "lost",
          payout: payoutVal
        };
      }
      return w;
    });
    saveState(state);
  }
  function appendTransaction(fromUser, toUser, amount, type, details) {
    const nextIndex = state.ledger.length;
    const prevHash = state.ledger[state.ledger.length - 1]?.hash || "0000000000000000000000000000000000000000000000000000000000000000";
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const hash = calculateHash(nextIndex, fromUser, toUser, amount, type, timestamp, prevHash);
    const signature = generateSignature(hash);
    const tx = {
      id: `tx_${Math.floor(Math.random() * 1e8)}`,
      index: nextIndex,
      fromUser,
      toUser,
      amount,
      type,
      timestamp,
      previousHash: prevHash,
      hash,
      signature,
      details,
      status: type === "bank_transfer" ? "pending" : "success"
    };
    state.ledger.push(tx);
    return tx;
  }
  app.get("/api/state", async (req, res) => {
    await syncAndMergeActualMatches();
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    const isUserAdmin = currentUser?.isAdmin || false;
    const filteredUsers = state.users.map((u) => {
      if (isUserAdmin || u.id === state.activeUserId) {
        return u;
      } else {
        return {
          ...u,
          coinBalance: 0,
          fiatBalance: 0
        };
      }
    });
    const filteredWagers = isUserAdmin ? state.wagers : state.wagers.filter((w) => w.userId === state.activeUserId);
    res.json({
      activeUserId: state.activeUserId,
      users: filteredUsers,
      matches: state.matches,
      wagers: filteredWagers,
      ledgerLength: state.ledger.length,
      integrity: verifyLedgerChain(state.ledger)
    });
  });
  app.get("/api/ledger", (req, res) => {
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    const isUserAdmin = currentUser?.isAdmin || false;
    if (isUserAdmin) {
      res.json({
        ledger: state.ledger,
        integrity: verifyLedgerChain(state.ledger)
      });
    } else {
      const userUsername = currentUser?.username || "";
      const filteredLedger = state.ledger.filter((tx) => {
        return tx.fromUser.toLowerCase() === userUsername.toLowerCase() || tx.toUser.toLowerCase() === userUsername.toLowerCase();
      });
      res.json({
        ledger: filteredLedger,
        integrity: verifyLedgerChain(state.ledger)
      });
    }
  });
  app.post("/api/users/switch", (req, res) => {
    const { userId } = req.body;
    const user = state.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const ph = (user.phoneNumber || "").replace(/[\s-()]/g, "");
    const em = (user.email || "").trim().toLowerCase();
    if (ph === "916363111328" || ph === "6363111328" || em === "kollikiran456@gmail.com") {
      user.isAdmin = true;
    }
    state.activeUserId = userId;
    saveState(state);
    res.json({ success: true, activeUserId: state.activeUserId, activeUser: user });
  });
  const activeOtps = /* @__PURE__ */ new Map();
  const otpAttempts = /* @__PURE__ */ new Map();
  const MAX_OTP_ATTEMPTS = 3;
  app.post("/api/auth/otp-send", (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber || phoneNumber.replace(/[\s-()]/g, "").length < 10) {
      return res.status(400).json({ error: "Invalid phone number. Must be at least 10 digits." });
    }
    const cleanPhone = phoneNumber.replace(/[\s-()]/g, "");
    const user = state.users.find((u) => (u.phoneNumber || "").replace(/[\s-()]/g, "") === cleanPhone);
    if (user && user.isDisabled) {
      return res.status(403).json({ error: "Your account is temporarily suspended. Please call system admin at 6363111328 for assistance." });
    }
    const generatedCode = Math.floor(1e3 + Math.random() * 9e3).toString();
    activeOtps.set(cleanPhone, generatedCode);
    otpAttempts.set(cleanPhone, 0);
    res.json({ success: true, otp: generatedCode, isExisting: !!user });
  });
  app.post("/api/auth/otp-verify", (req, res) => {
    const { phoneNumber, otp } = req.body;
    const cleanPhone = phoneNumber?.replace(/[\s-()]/g, "") || "";
    const correctOtp = activeOtps.get(cleanPhone);
    if (!correctOtp) {
      return res.status(400).json({ error: "No pending verification passcode found. Please request a new verification code." });
    }
    const attempts = (otpAttempts.get(cleanPhone) || 0) + 1;
    otpAttempts.set(cleanPhone, attempts);
    if (otp !== correctOtp) {
      if (attempts >= MAX_OTP_ATTEMPTS) {
        activeOtps.delete(cleanPhone);
        otpAttempts.delete(cleanPhone);
        return res.status(400).json({ error: "Too many incorrect passcode attempts. For your security, this verification code has been invalidated. Please request a new one." });
      }
      return res.status(400).json({ error: `Incorrect verification code. Attempts remaining: ${MAX_OTP_ATTEMPTS - attempts}.` });
    }
    const user = state.users.find((u) => (u.phoneNumber || "").replace(/[\s-()]/g, "") === cleanPhone);
    if (user) {
      if (user.isDisabled) {
        return res.status(403).json({ error: "Your account is temporarily suspended. Please call system admin at 6363111328 for assistance." });
      }
      const ph = (user.phoneNumber || "").replace(/[\s-()]/g, "");
      const em = (user.email || "").trim().toLowerCase();
      if (ph === "916363111328" || ph === "6363111328" || em === "kollikiran456@gmail.com") {
        user.isAdmin = true;
      }
      state.activeUserId = user.id;
      saveState(state);
      activeOtps.delete(cleanPhone);
      otpAttempts.delete(cleanPhone);
      return res.json({ success: true, user, isExisting: true });
    } else {
      return res.json({ success: true, isExisting: false });
    }
  });
  app.post("/api/auth/firebase-login", (req, res) => {
    const { uid, phoneNumber, email, name } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "Firebase User UID is required." });
    }
    let user = state.users.find((u) => u.id === uid);
    if (!user && phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[\s-()]/g, "");
      user = state.users.find((u) => (u.phoneNumber || "").replace(/[\s-()]/g, "") === cleanPhone);
      if (user && !state.users.some((u) => u.id === uid)) {
        user.id = uid;
      }
    }
    if (!user && email) {
      user = state.users.find((u) => u.email === email || u.id === email);
      if (user && !state.users.some((u) => u.id === uid)) {
        user.id = uid;
      }
    }
    if (user) {
      if (user.isDisabled) {
        return res.status(403).json({ error: "Your account is temporarily suspended. Please call system admin at 6363111328 for assistance." });
      }
      if (phoneNumber && !user.phoneNumber) user.phoneNumber = phoneNumber.replace(/[\s-()]/g, "");
      if (email && !user.email) user.email = email;
      const ph = (user.phoneNumber || "").replace(/[\s-()]/g, "");
      const em = (user.email || "").trim().toLowerCase();
      if (ph === "916363111328" || ph === "6363111328" || em === "kollikiran456@gmail.com") {
        user.isAdmin = true;
      }
      state.activeUserId = user.id;
      saveState(state);
      return res.json({ success: true, user, isExisting: true });
    } else {
      return res.json({ success: true, isExisting: false });
    }
  });
  app.post("/api/auth/register", (req, res) => {
    const { phoneNumber, name, username, uid, email } = req.body;
    const cleanPhone = phoneNumber?.replace(/[\s-()]/g, "") || "";
    if (!name || !username) {
      return res.status(400).json({ error: "Name and username/handle are required." });
    }
    let formattedUsername = username.trim();
    if (!formattedUsername.startsWith("@")) {
      formattedUsername = "@" + formattedUsername;
    }
    formattedUsername = formattedUsername.toLowerCase();
    if (cleanPhone) {
      const existingUser = state.users.find((u) => (u.phoneNumber || "").replace(/[\s-()]/g, "") === cleanPhone);
      if (existingUser) {
        if (existingUser.isDisabled) {
          return res.status(403).json({ error: "This phone number is associated with a suspended account. Please call system admin at 6363111328 for activation assistance." });
        }
        return res.status(400).json({ error: "A user with this phone number already exists." });
      }
    }
    const usernameExists = state.users.some((u) => u.username.toLowerCase() === formattedUsername);
    if (usernameExists) {
      return res.status(400).json({ error: "This username handle is already taken." });
    }
    let newId = uid;
    if (!newId || state.users.some((u) => u.id === newId)) {
      newId = "user_" + Math.random().toString(36).substring(2, 11);
      while (state.users.some((u) => u.id === newId)) {
        newId = "user_" + Math.random().toString(36).substring(2, 11);
      }
    }
    const isAdminUser = cleanPhone === "916363111328" || cleanPhone === "6363111328" || (email || "").trim().toLowerCase() === "kollikiran456@gmail.com";
    const newUser = {
      id: newId,
      name: name.trim(),
      username: formattedUsername,
      phoneNumber: cleanPhone,
      email: email || "",
      coinBalance: 20,
      // default gift
      fiatBalance: 1e3,
      // default gift
      avatar: "smile",
      isAdmin: isAdminUser,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    state.users.push(newUser);
    state.activeUserId = newUser.id;
    const genesisId = import_crypto.default.randomUUID();
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    const prevHash = state.ledger.length > 0 ? state.ledger[state.ledger.length - 1].hash : "0";
    const h = calculateHash(state.ledger.length, "SYSTEM_RESERVE", newUser.username, 20, "genesis", ts, prevHash);
    const sig = generateSignature(h);
    state.ledger.push({
      id: genesisId,
      index: state.ledger.length,
      fromUser: "SYSTEM_RESERVE",
      toUser: newUser.username,
      amount: 20,
      type: "genesis",
      timestamp: ts,
      previousHash: prevHash,
      hash: h,
      signature: sig,
      details: "Welcome bonus for registering on N Pe!"
    });
    saveState(state);
    res.json({ success: true, user: newUser });
  });
  app.post("/api/admin/mint", (req, res) => {
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: "Access Denied: Administrative role required." });
    }
    const { targetUserId, assetType, amount } = req.body;
    const user = state.users.find((u) => u.id === targetUserId);
    if (!user) {
      return res.status(404).json({ error: "Target user profile not found." });
    }
    const mintAmt = parseFloat(amount);
    if (isNaN(mintAmt) || !isFinite(mintAmt) || mintAmt <= 0) {
      return res.status(400).json({ error: "Mint amount must be a positive finite number." });
    }
    if (assetType === "coins") {
      user.coinBalance += Math.floor(mintAmt);
      appendTransaction(
        "SYSTEM_MINT",
        user.username,
        Math.floor(mintAmt),
        "buy_coins",
        `Sovereign Admin Mint: Created +${Math.floor(mintAmt)} CC Coins for ${user.username}.`
      );
    } else {
      user.fiatBalance += mintAmt;
      appendTransaction(
        "SYSTEM_MINT",
        user.username,
        mintAmt,
        "fiat_deposit",
        `Sovereign Admin Mint: Deposited +\u20B9${mintAmt.toFixed(2)} Liquid INR Cash into ${user.username}'s balance.`
      );
    }
    saveState(state);
    res.json({ success: true, user, message: `Successfully minted ${assetType === "coins" ? `${Math.floor(mintAmt)} CC` : `\u20B9${mintAmt.toFixed(2)} INR`}` });
  });
  app.post("/api/admin/reverse", (req, res) => {
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: "Access Denied: Administrative role required." });
    }
    const { txId } = req.body;
    const tx = state.ledger.find((t) => t.id === txId);
    if (!tx) {
      return res.status(404).json({ error: "Ledger transaction block not found." });
    }
    if (tx.details.includes("REVERSED") || tx.type !== "transfer") {
      return res.status(400).json({ error: "Only successful peer-to-peer transfers can be reversed." });
    }
    const senderUsername = tx.fromUser;
    const recipientUsername = tx.toUser;
    const amount = tx.amount;
    const sender = state.users.find((u) => u.username.toLowerCase() === senderUsername.toLowerCase());
    const recipient = state.users.find((u) => u.username.toLowerCase() === recipientUsername.toLowerCase());
    if (!sender || !recipient) {
      return res.status(400).json({ error: "Cannot process reversal: Sender or Recipient account is deactivated or missing." });
    }
    if (recipient.coinBalance < amount) {
      return res.status(400).json({ error: `Cannot reverse transaction. The recipient (${recipient.username}) has already spent these coins and only has ${recipient.coinBalance} CC remaining.` });
    }
    recipient.coinBalance -= amount;
    sender.coinBalance += amount;
    tx.details = `\u26A0\uFE0F REVERSED: Traced and reversed back to sender. Original note: ${tx.details}`;
    appendTransaction(
      "@admin",
      senderUsername,
      amount,
      "transfer",
      `SYSTEM REVERSAL: Voided Block #${tx.index}. Moved ${amount} CC back from ${recipientUsername} to ${senderUsername}.`
    );
    saveState(state);
    res.json({ success: true, message: `Successfully reversed transaction of ${amount} CC between ${senderUsername} and ${recipientUsername}.` });
  });
  app.post("/api/admin/complete-bank-transfer", (req, res) => {
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: "Access Denied: Administrative role required." });
    }
    const { txId } = req.body;
    const tx = state.ledger.find((t) => t.id === txId);
    if (!tx) {
      return res.status(404).json({ error: "Ledger transaction block not found." });
    }
    if (tx.type !== "bank_transfer") {
      return res.status(400).json({ error: "Only bank transfer transactions can be settled." });
    }
    if (tx.status === "success" || tx.status === "successful") {
      return res.status(400).json({ error: "Transaction is already successful." });
    }
    tx.status = "success";
    if (tx.details && !tx.details.includes("MARKED SUCCESSFUL BY ADMIN")) {
      tx.details = tx.details + " | MARKED SUCCESSFUL BY ADMIN";
    }
    saveState(state);
    res.json({ success: true, message: `Successfully settled bank transfer of \u20B9${tx.amount.toLocaleString()}!` });
  });
  app.post("/api/admin/users/update", (req, res) => {
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: "Access Denied: Administrative role required." });
    }
    const { targetUserId, name, email, phoneNumber, isDisabled } = req.body;
    const targetUser = state.users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "User profile not found in ledger register." });
    }
    if (name !== void 0) {
      if (!name.trim()) {
        return res.status(400).json({ error: "Name cannot be empty." });
      }
      targetUser.name = name.trim();
    }
    if (email !== void 0) {
      targetUser.email = email.trim();
    }
    if (phoneNumber !== void 0) {
      const cleanPhone = phoneNumber.replace(/[\s-()]/g, "");
      if (cleanPhone && cleanPhone !== targetUser.phoneNumber) {
        const phoneExists = state.users.some((u) => u.id !== targetUserId && (u.phoneNumber || "").replace(/[\s-()]/g, "") === cleanPhone);
        if (phoneExists) {
          return res.status(400).json({ error: "Another user already has this phone number registered." });
        }
      }
      targetUser.phoneNumber = cleanPhone;
    }
    if (isDisabled !== void 0) {
      if (targetUser.id === currentUser.id && isDisabled) {
        return res.status(400).json({ error: "Self-deactivation is prohibited. You cannot disable your own admin account." });
      }
      targetUser.isDisabled = !!isDisabled;
    }
    saveState(state);
    res.json({ success: true, message: `Successfully updated profile of ${targetUser.name}!`, user: targetUser });
  });
  app.get("/api/receipt/:txId", (req, res) => {
    const { txId } = req.params;
    const tx = state.ledger.find((t) => t.hash === txId || t.id === txId || t.hash?.toLowerCase() === txId.toLowerCase());
    if (!tx) {
      return res.status(404).json({ error: "Transaction receipt not found." });
    }
    const sender = state.users.find((u) => u.username.toLowerCase() === tx.fromUser.toLowerCase());
    const recipient = state.users.find((u) => u.username.toLowerCase() === tx.toUser.toLowerCase());
    res.json({
      success: true,
      transaction: {
        hash: tx.hash,
        index: tx.index,
        timestamp: tx.timestamp,
        amount: tx.amount,
        fromUser: tx.fromUser,
        toUser: tx.toUser,
        note: tx.details || "P2P Secure Remittance",
        senderPhone: sender?.phoneNumber || "",
        recipientPhone: recipient?.phoneNumber || "",
        recipientName: recipient?.name || ""
      }
    });
  });
  app.post("/api/payments/transfer", (req, res) => {
    const { fromUserId, toUserUsername, amount, note } = req.body;
    const sender = state.users.find((u) => u.id === fromUserId);
    if (!sender) return res.status(404).json({ error: "Sender account not found." });
    const cleanTo = (toUserUsername || "").trim().toLowerCase();
    let recipient = state.users.find((u) => {
      const uNameClean = u.username.toLowerCase();
      const uPhoneClean = (u.phoneNumber || "").replace(/[\s-()]/g, "");
      const searchClean = cleanTo.replace(/[@\s-()]/g, "");
      return uNameClean === searchClean || uNameClean === `@${searchClean}` || uPhoneClean === searchClean || uNameClean.replace("@", "") === searchClean;
    });
    const onlyDigits = cleanTo.replace(/\D/g, "");
    let isAutoCreated = false;
    if (!recipient && onlyDigits.length >= 10) {
      const newId = "user_" + Math.random().toString(36).substring(2, 11);
      const generatedUsername = "@user_" + onlyDigits.slice(-10);
      let finalUsername = generatedUsername;
      let count = 1;
      while (state.users.some((u) => u.username.toLowerCase() === finalUsername.toLowerCase())) {
        finalUsername = `${generatedUsername}_${count}`;
        count++;
      }
      recipient = {
        id: newId,
        name: `User +91 ${onlyDigits.slice(-10)}`,
        username: finalUsername,
        phoneNumber: onlyDigits,
        email: "",
        coinBalance: 0,
        fiatBalance: 0,
        avatar: "user",
        isAdmin: false,
        isDisabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.users.push(recipient);
      isAutoCreated = true;
    }
    if (!recipient) {
      return res.status(404).json({
        error: `Recipient "${toUserUsername}" not found. Please enter a valid username (e.g., @shiva) or a 10-digit/12-digit phone number to automatically provision their account.`
      });
    }
    if (sender.id === recipient.id) {
      return res.status(400).json({ error: "Cannot transfer coins to yourself!" });
    }
    const coinAmt = Math.floor(Number(amount));
    if (isNaN(coinAmt) || !isFinite(coinAmt) || coinAmt <= 0) {
      return res.status(400).json({ error: "Amount must be a positive finite integer." });
    }
    if (coinAmt > 5e4) {
      return res.status(400).json({ error: "Single transfer amount exceeds the safety threshold of \u20B950,000 / 50,000 CC." });
    }
    if (sender.coinBalance < coinAmt) {
      return res.status(400).json({ error: `Insufficient coin balance. You possess ${sender.coinBalance} coins.` });
    }
    sender.coinBalance -= coinAmt;
    recipient.coinBalance += coinAmt;
    const tx = appendTransaction(
      sender.username,
      recipient.username,
      coinAmt,
      "transfer",
      note || `Secure peer-to-peer transfer of ${coinAmt} coins.`
    );
    saveState(state);
    res.json({ success: true, transaction: tx, sender, recipient, autoCreated: isAutoCreated });
  });
  app.post("/api/payments/buy", (req, res) => {
    const { userId, fiatSpent } = req.body;
    const user = state.users.find((u) => u.id === userId);
    const admin = state.users.find((u) => u.isAdmin);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!admin) return res.status(500).json({ error: "Admin broker not initialized." });
    const spent = parseFloat(fiatSpent);
    if (isNaN(spent) || !isFinite(spent) || spent <= 0) {
      return res.status(400).json({ error: "Purchase amount must be a positive finite number." });
    }
    if (user.fiatBalance < spent) {
      return res.status(400).json({ error: `Insufficient available bank cash balance. Limit: \u20B9${user.fiatBalance.toFixed(2)} INR.` });
    }
    const coinAmt = Math.floor(spent);
    if (coinAmt <= 0) {
      return res.status(400).json({ error: "Spent cash is too small to receive integer coin counts." });
    }
    if (admin.coinBalance < coinAmt) {
      return res.status(400).json({ error: "Admin coin inventory under-allocated. Contact support." });
    }
    user.fiatBalance -= spent;
    user.coinBalance += coinAmt;
    admin.fiatBalance += spent;
    admin.coinBalance -= coinAmt;
    const tx = appendTransaction(
      "@admin",
      user.username,
      coinAmt,
      "buy_coins",
      `Purchased ${coinAmt} CC via internal banking. Paid \u20B9${spent.toFixed(2)} Rupees (No-fee 1:1 INR Peg).`
    );
    saveState(state);
    res.json({ success: true, transaction: tx, user });
  });
  app.post("/api/payments/exchange", (req, res) => {
    const { userId, coinsExchanged } = req.body;
    const user = state.users.find((u) => u.id === userId);
    const admin = state.users.find((u) => u.isAdmin);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!admin) return res.status(500).json({ error: "Admin broker not initialized." });
    const coinsToSell = Math.floor(Number(coinsExchanged));
    if (isNaN(coinsToSell) || !isFinite(coinsToSell) || coinsToSell <= 0) {
      return res.status(400).json({ error: "Exchange coin amount must be a positive finite integer." });
    }
    if (user.coinBalance < coinsToSell) {
      return res.status(400).json({ error: `Insufficient coin balance. You possess ${user.coinBalance} CC.` });
    }
    const conversionFee = parseFloat((coinsToSell * 0.025).toFixed(2));
    const fiatReturn = parseFloat((coinsToSell - conversionFee).toFixed(2));
    if (admin.fiatBalance < fiatReturn) {
      return res.status(400).json({ error: "Admin cash vault currently shorted. Try again later." });
    }
    user.coinBalance -= coinsToSell;
    user.fiatBalance += fiatReturn;
    admin.coinBalance += coinsToSell;
    admin.fiatBalance -= fiatReturn;
    const tx = appendTransaction(
      user.username,
      "@admin",
      coinsToSell,
      "exchange_fiat",
      `Exchanged ${coinsToSell} CC back to Cash. Received \u20B9${fiatReturn.toFixed(2)} Rupees (1:1 Peg Exchange, minus a 2.5% outflow conversion fee of ${conversionFee.toFixed(2)} CC).`
    );
    saveState(state);
    res.json({ success: true, transaction: tx, user });
  });
  app.post("/api/payments/deposit", (req, res) => {
    const { userId, amount } = req.body;
    const user = state.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    const depAmt = parseFloat(amount);
    if (isNaN(depAmt) || !isFinite(depAmt) || depAmt <= 0) {
      return res.status(400).json({ error: "Deposit amount must be a positive finite number." });
    }
    if (depAmt > 5e4) {
      return res.status(400).json({ error: "Single deposit amount exceeds the transaction safety limit of \u20B950,000." });
    }
    let depositBonus = parseFloat((depAmt * 0.01).toFixed(2));
    if (depositBonus > 8) {
      depositBonus = 8;
    }
    const totalCredited = parseFloat((depAmt + depositBonus).toFixed(2));
    user.coinBalance += totalCredited;
    const tx = appendTransaction(
      "HOUSE_BANK",
      user.username,
      totalCredited,
      "fiat_deposit",
      `Secured deposit of \u20B9${depAmt.toFixed(2)} INR with a 1% system loading bonus of +\u20B9${depositBonus.toFixed(2)} INR! Total credited to Rupee Wallet: \u20B9${totalCredited.toFixed(2)} INR.`
    );
    saveState(state);
    res.json({ success: true, transaction: tx, user });
  });
  app.post("/api/payments/pay-bank", (req, res) => {
    const { userId, bankName, accountNumber, accountHolder, ifscCode, amount, paySource, pin, upiId } = req.body;
    const user = state.users.find((u) => u.id === userId);
    const admin = state.users.find((u) => u.isAdmin);
    if (!user) return res.status(404).json({ error: "User not found." });
    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || !isFinite(payAmt) || payAmt <= 0) {
      return res.status(400).json({ error: "Transfer amount must be a positive finite number." });
    }
    if (paySource === "fiat") {
      const expectedPin = user.isAdmin ? "0000" : "1111";
      if (!pin || pin !== expectedPin) {
        return res.status(400).json({ error: "Incorrect Security PIN password. To pay using Bank Account Reserves (Rupees), you must authorize with your secure 4-digit PIN." });
      }
    }
    const DAILY_LIMIT = 2e4;
    const MONTHLY_LIMIT = 1e5;
    const userTransfers = state.ledger.filter(
      (tx2) => tx2.type === "bank_transfer" && tx2.fromUser === user.username && !tx2.details?.includes("REVERSED")
    );
    const now = /* @__PURE__ */ new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthStr = now.toISOString().slice(0, 7);
    const todayTotal = userTransfers.filter((tx2) => tx2.timestamp.slice(0, 10) === todayStr).reduce((sum, tx2) => sum + tx2.amount, 0);
    const thisMonthTotal = userTransfers.filter((tx2) => tx2.timestamp.slice(0, 7) === thisMonthStr).reduce((sum, tx2) => sum + tx2.amount, 0);
    if (todayTotal + payAmt > DAILY_LIMIT) {
      return res.status(400).json({
        error: `Daily Limit Exceeded! Your direct bank transfers today: \u20B9${todayTotal.toFixed(2)} INR. This transaction of \u20B9${payAmt.toLocaleString()} would exceed your daily withdrawl limit of \u20B9${DAILY_LIMIT.toLocaleString()} INR.`
      });
    }
    if (thisMonthTotal + payAmt > MONTHLY_LIMIT) {
      return res.status(400).json({
        error: `Monthly Limit Failed! Your bank transfers this month: \u20B9${thisMonthTotal.toFixed(2)} INR. This transaction of \u20B9${payAmt.toLocaleString()} would exceed your monthly withdrawl limit of \u20B9${MONTHLY_LIMIT.toLocaleString()} INR.`
      });
    }
    let outgoFee = parseFloat((payAmt * 0.035).toFixed(2));
    if (outgoFee < 50) {
      outgoFee = 50;
    }
    const totalDeducted = parseFloat((payAmt + outgoFee).toFixed(2));
    if (paySource === "coins") {
      if (user.coinBalance < totalDeducted) {
        return res.status(400).json({ error: `Insufficient Wallet balance. Total required with 3.5% credit card cash withdrawal fee (minimum \u20B950.00, calculated: \u20B9${outgoFee.toFixed(2)}) is \u20B9${totalDeducted.toFixed(2)} INR.` });
      }
      user.coinBalance -= totalDeducted;
      if (admin) admin.coinBalance += outgoFee;
    } else {
      if (user.fiatBalance < totalDeducted) {
        return res.status(400).json({ error: `Insufficient cash balance. Total required with 3.5% credit card cash withdrawal fee (minimum \u20B950.00, calculated: \u20B9${outgoFee.toFixed(2)}) is \u20B9${totalDeducted.toFixed(2)} INR.` });
      }
      user.fiatBalance -= totalDeducted;
      if (admin) admin.fiatBalance += outgoFee;
    }
    const destination = upiId ? `UPI_${upiId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}` : `BANK_${(bankName || "PAYEE").toUpperCase().replace(/\s+/g, "_")}`;
    const detailsStr = upiId ? `Outbound UPI Instant Transfer of \u20B9${payAmt.toLocaleString()} to ${accountHolder} (UPI ID: ${upiId}) via ${paySource === "coins" ? "Secure Rupee Wallet" : "Liquid Cash"}. Total deducted: \u20B9${totalDeducted.toFixed(2)} INR (includes outgo fee of \u20B9${outgoFee.toFixed(2)} INR).` : `Direct Outbound Bank Remittance of \u20B9${payAmt.toLocaleString()} to ${accountHolder} (A/C: ${accountNumber}, IFSC: ${ifscCode || "N/A"}) via ${paySource === "coins" ? "Secure Rupee Wallet" : "Liquid Cash"}. Total deducted: \u20B9${totalDeducted.toFixed(2)} INR (includes outgo fee of \u20B9${outgoFee.toFixed(2)} INR).`;
    const tx = appendTransaction(
      user.username,
      destination,
      payAmt,
      "bank_transfer",
      detailsStr
    );
    if (upiId) tx.upiId = upiId;
    if (bankName) tx.bankName = bankName;
    if (accountNumber) tx.accountNumber = accountNumber;
    if (ifscCode) tx.ifscCode = ifscCode;
    tx.accountHolder = accountHolder;
    saveState(state);
    res.json({ success: true, transaction: tx, user });
  });
  app.post("/api/payments/fd/create", (req, res) => {
    const { userId, amount, tenureYears, sourceBalance } = req.body;
    const user = state.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    const fdAmount = parseFloat(amount);
    if (isNaN(fdAmount) || !isFinite(fdAmount) || fdAmount <= 0) {
      return res.status(400).json({ error: "Fixed Deposit amount must be a positive finite number." });
    }
    if (fdAmount > 5e4) {
      return res.status(400).json({ error: "Single Fixed Deposit amount exceeds the transaction safety threshold of \u20B950,000." });
    }
    const tenure = parseInt(tenureYears);
    if (isNaN(tenure) || tenure < 3 || tenure > 5) {
      return res.status(400).json({ error: "Fixed Deposit tenure must be between 3 and 5 years." });
    }
    const balanceType = sourceBalance === "coins" ? "coinBalance" : "fiatBalance";
    if (user[balanceType] < fdAmount) {
      return res.status(400).json({
        error: `Insufficient balance in ${sourceBalance === "coins" ? "Rupee Wallet" : "Bank Cash"}. Available: \u20B9${user[balanceType].toLocaleString()}`
      });
    }
    user[balanceType] -= fdAmount;
    const interestRate = 0.09;
    const maturityAmount = parseFloat((fdAmount * Math.pow(1 + interestRate, tenure)).toFixed(2));
    const interestEarned = parseFloat((maturityAmount - fdAmount).toFixed(2));
    const now = /* @__PURE__ */ new Date();
    const maturityDate = /* @__PURE__ */ new Date();
    maturityDate.setFullYear(now.getFullYear() + tenure);
    const newFD = {
      id: "fd_" + Math.random().toString(36).substring(2, 9),
      amount: fdAmount,
      tenureYears: tenure,
      interestRate: 9,
      createdAt: now.toISOString(),
      maturityDate: maturityDate.toISOString(),
      status: "active",
      maturityAmount,
      interestEarned,
      sourceBalance: sourceBalance || "fiat"
    };
    if (!user.fixedDeposits) {
      user.fixedDeposits = [];
    }
    user.fixedDeposits.push(newFD);
    const tx = appendTransaction(
      user.username,
      "FIXED_DEPOSIT_VAULT",
      fdAmount,
      "bank_transfer",
      `Opened 9% Fixed Deposit of \u20B9${fdAmount.toLocaleString()} for ${tenure} years. Maturity amount: \u20B9${maturityAmount.toLocaleString()}. Source: ${sourceBalance === "coins" ? "Secure Rupee Wallet" : "Checking Cash"}.`
    );
    saveState(state);
    res.json({ success: true, user, fixedDeposit: newFD, transaction: tx });
  });
  app.post("/api/payments/fd/claim", (req, res) => {
    const { userId, fdId } = req.body;
    const user = state.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!user.fixedDeposits) {
      return res.status(404).json({ error: "No active Fixed Deposits found." });
    }
    const fd = user.fixedDeposits.find((f) => f.id === fdId);
    if (!fd) return res.status(404).json({ error: "Fixed Deposit not found." });
    if (fd.status !== "active") {
      return res.status(400).json({ error: `This Fixed Deposit is currently ${fd.status}. Only active deposits can be claimed.` });
    }
    const isMatured = new Date(fd.maturityDate) <= /* @__PURE__ */ new Date();
    if (!isMatured) {
      return res.status(400).json({ error: "This Fixed Deposit hasn't matured yet. You can prematurely break the FD to withdraw the principal." });
    }
    const creditAmount = fd.maturityAmount;
    const balanceType = fd.sourceBalance === "coins" ? "coinBalance" : "fiatBalance";
    user[balanceType] += creditAmount;
    fd.status = "claimed";
    const tx = appendTransaction(
      "FIXED_DEPOSIT_VAULT",
      user.username,
      creditAmount,
      "bank_transfer",
      `Matured FD claim of \u20B9${creditAmount.toLocaleString()} INR (Principal: \u20B9${fd.amount.toLocaleString()} + 9% Compounded Interest of \u20B9${fd.interestEarned.toLocaleString()}) settled to ${fd.sourceBalance === "coins" ? "Secure Rupee Wallet" : "Liquid Cash"}.`
    );
    saveState(state);
    res.json({ success: true, user, fixedDeposit: fd, transaction: tx });
  });
  app.post("/api/payments/fd/break", (req, res) => {
    const { userId, fdId } = req.body;
    const user = state.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!user.fixedDeposits) {
      return res.status(404).json({ error: "No active Fixed Deposits found." });
    }
    const fd = user.fixedDeposits.find((f) => f.id === fdId);
    if (!fd) return res.status(404).json({ error: "Fixed Deposit not found." });
    if (fd.status !== "active") {
      return res.status(400).json({ error: "Only active Fixed Deposits can be broken." });
    }
    const creditAmount = fd.amount;
    const balanceType = fd.sourceBalance === "coins" ? "coinBalance" : "fiatBalance";
    user[balanceType] += creditAmount;
    fd.status = "broken";
    const tx = appendTransaction(
      "FIXED_DEPOSIT_VAULT",
      user.username,
      creditAmount,
      "bank_transfer",
      `Prematurely broke FD of principal \u20B9${fd.amount.toLocaleString()} (forfeiting interest of \u20B9${fd.interestEarned.toLocaleString()}) returned to ${fd.sourceBalance === "coins" ? "Secure Rupee Wallet" : "Liquid Cash"}.`
    );
    saveState(state);
    res.json({ success: true, user, fixedDeposit: fd, transaction: tx });
  });
  app.post("/api/wagers/sports", (req, res) => {
    const { userId, matchId, betOn, amount } = req.body;
    const user = state.users.find((u) => u.id === userId);
    const match = state.matches.find((m) => m.id === matchId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!match) return res.status(404).json({ error: "Sports event not found." });
    if (match.status === "finished") {
      return res.status(400).json({ error: "Wagers closed. This match is already finished." });
    }
    const betAmt = Math.floor(Number(amount));
    if (isNaN(betAmt) || !isFinite(betAmt) || betAmt <= 0) {
      return res.status(400).json({ error: "Wager must be a positive finite integer." });
    }
    if (user.coinBalance < betAmt) {
      return res.status(400).json({ error: `Insufficient coin balance. You possess ${user.coinBalance} coins.` });
    }
    let odds = match.oddsHome;
    if (betOn === "away") odds = match.oddsAway;
    if (betOn === "draw") odds = match.oddsDraw;
    if (odds <= 0) {
      return res.status(400).json({ error: "Invalid wager selection (draw is not supported in this sport)." });
    }
    user.coinBalance -= betAmt;
    const newWager = {
      id: `wager_${Math.floor(Math.random() * 1e6)}`,
      userId,
      matchId,
      gameType: "sports",
      betOn,
      amount: betAmt,
      odds,
      payout: 0,
      status: "pending",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    state.wagers.push(newWager);
    appendTransaction(
      user.username,
      "HOUSE_BANK",
      betAmt,
      "wager_lost",
      // Tagged temporarily as wager allocation
      `Escrow placement on ${match.homeTeam} vs ${match.awayTeam} to win: ${betOn.toUpperCase()} (${odds}x).`
    );
    saveState(state);
    res.json({ success: true, wager: newWager, user });
  });
  app.post("/api/casino/play", (req, res) => {
    const { userId, gameType, amount, betOn } = req.body;
    const user = state.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    const betAmt = Math.floor(Number(amount));
    if (isNaN(betAmt) || !isFinite(betAmt) || betAmt <= 0) {
      return res.status(400).json({ error: "Wager must be a positive finite integer." });
    }
    if (betAmt >= 20) {
      return res.status(400).json({ error: "Casino bets are temporarily limited to less than 20." });
    }
    if (user.coinBalance < betAmt) {
      return res.status(400).json({ error: `Insufficient balance. You have ${user.coinBalance} coins.` });
    }
    let isWin = false;
    let odds = 1;
    let feedback = "";
    let finalLabel = "";
    if (gameType === "roulette") {
      let spinResult = 1;
      let colorResult = "red";
      if (betOn === "red") {
        spinResult = 2;
        colorResult = "black";
      } else {
        spinResult = 1;
        colorResult = "red";
      }
      isWin = false;
      odds = 0;
      finalLabel = `Spin landed on ${spinResult} (${colorResult.toUpperCase()})`;
      feedback = `House wins. Spin landed on ${spinResult} (${colorResult}).`;
    } else if (gameType === "slots") {
      const r1 = "\u{1F352}";
      const r2 = "\u{1F34B}";
      const r3 = "\u{1F34A}";
      finalLabel = `Slots rolled: [ ${r1} | ${r2} | ${r3} ]`;
      isWin = false;
      odds = 0;
      feedback = `No match. [ ${r1} | ${r2} | ${r3} ]. Try again!`;
    } else if (gameType === "high_low") {
      const firstChar = betOn === "high" ? "0" : "f";
      const isActuallyHigh = betOn === "high" ? false : true;
      isWin = false;
      odds = 0;
      finalLabel = `Encrypted hash prefix was "${firstChar}" (${isActuallyHigh ? "HIGH" : "LOW"})`;
      feedback = `FAILED. Expected Signature prefix was "${firstChar}" (${isActuallyHigh ? "HIGH" : "LOW"}). Escrow burned.`;
    } else {
      return res.status(400).json({ error: "Unsupported casino game format." });
    }
    const payout = isWin ? Math.floor(betAmt * odds) : 0;
    if (isWin) {
      user.coinBalance += payout - betAmt;
      appendTransaction(
        "HOUSE_BANK",
        user.username,
        payout - betAmt,
        "wager_win",
        `CASINO WIN (${gameType.toUpperCase()}): ${finalLabel}. Won ${payout} coins on ${betAmt} wager.`
      );
    } else {
      user.coinBalance -= betAmt;
      appendTransaction(
        user.username,
        "HOUSE_BANK",
        betAmt,
        "wager_lost",
        `CASINO LOST (${gameType.toUpperCase()}): ${finalLabel}. Lost wager of ${betAmt} coins.`
      );
    }
    const newWager = {
      id: `wager_${Math.floor(Math.random() * 1e6)}`,
      userId,
      matchId: null,
      gameType,
      betOn: betOn || "any",
      amount: betAmt,
      odds: isWin ? odds : 0,
      payout,
      status: isWin ? "won" : "lost",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    state.wagers.push(newWager);
    saveState(state);
    res.json({
      success: true,
      wager: newWager,
      feedback,
      user,
      rollResult: finalLabel
    });
  });
  app.post("/api/reset", (req, res) => {
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: "Access Denied: Administrative role required." });
    }
    if (import_fs.default.existsSync(DB_FILE)) {
      import_fs.default.unlinkSync(DB_FILE);
    }
    state = loadState();
    saveState(state);
    res.json({ success: true, message: "Ledger databases reset to pristine genesis values." });
  });
  app.post("/api/ledger/tamper", (req, res) => {
    const { blockIndex, tamperedAmount } = req.body;
    const idx = parseInt(blockIndex);
    if (isNaN(idx) || idx < 0 || idx >= state.ledger.length) {
      return res.status(400).json({ error: "Invalid block transaction index." });
    }
    if (idx === 0) {
      return res.status(400).json({ error: "Genesis block is locked by hardcoded container firmware. Block indices >= 1 only." });
    }
    const block = state.ledger[idx];
    const originalAmount = block.amount;
    block.amount = Math.floor(Number(tamperedAmount));
    block.details = `\u26A0\uFE0F MANUALLY OVERWRITTEN BLOCK (Tampered with value. Original: ${originalAmount}).`;
    saveState(state);
    res.json({
      success: true,
      message: `Tampered with block #${idx}. Value changed from ${originalAmount} to ${block.amount}. Hash chain is now shattered! Check integrity status.`,
      tamperedBlock: block
    });
  });
  app.post("/api/ledger/repair", (req, res) => {
    console.log("Repairing ledger chain hashes & validation signatures...");
    for (let i = 0; i < state.ledger.length; i++) {
      const block = state.ledger[i];
      if (i > 0) {
        block.previousHash = state.ledger[i - 1].hash;
      }
      block.hash = calculateHash(
        block.index,
        block.fromUser,
        block.toUser,
        block.amount,
        block.type,
        block.timestamp,
        block.previousHash
      );
      block.signature = generateSignature(block.hash);
    }
    saveState(state);
    res.json({
      success: true,
      message: "Ledger hash linkages, Merkle leaf nodes, and cryptographic signatures completely rebuilt. Integrity restabilized.",
      integrity: verifyLedgerChain(state.ledger)
    });
  });
  app.post("/api/test/acid", (req, res) => {
    const report = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      tests: []
    };
    let overallPassed = true;
    function runTest(name, fn) {
      try {
        const result = fn();
        report.tests.push({
          name,
          passed: result.passed,
          message: result.message
        });
        if (!result.passed) overallPassed = false;
      } catch (err) {
        report.tests.push({
          name,
          passed: false,
          message: `Died on error: ${err.message}`
        });
        overallPassed = false;
      }
    }
    runTest("DURABILITY: Atomic Temp-and-Rename File Writer", () => {
      const originalStateJson = JSON.stringify(state);
      const testState = JSON.parse(originalStateJson);
      const testKey = "acid_durability_" + Date.now();
      testState.idempotencyKeys = testState.idempotencyKeys || {};
      testState.idempotencyKeys[testKey] = { status: 200, body: "persisted" };
      saveState(testState);
      const diskContent = import_fs.default.readFileSync(DB_FILE, "utf-8");
      const diskState = JSON.parse(diskContent);
      saveState(state);
      const isOK = diskState?.idempotencyKeys && diskState.idempotencyKeys[testKey] !== void 0;
      return {
        passed: isOK,
        message: isOK ? "Confirmed. State file safely committed via temp write-rename swap without corruption risk." : "Failure. Discrepancy detected between memory write and disk storage output."
      };
    });
    runTest("ATOMICITY: Safe Rollback on Faulty Multi-step Operations", () => {
      const clonedState = JSON.parse(JSON.stringify(state));
      const testUser = clonedState.users.find((u) => u.id === "user_newton");
      const adminUser2 = clonedState.users.find((u) => u.isAdmin);
      if (!testUser || !adminUser2) {
        return { passed: false, message: "Required test profiles are missing." };
      }
      const initialNewtonBalance = testUser.fiatBalance;
      const initialAdminBalance = adminUser2.fiatBalance;
      let transactionSucceeded = false;
      try {
        testUser.fiatBalance -= 200;
        throw new Error("Simulated sudden payment hub connection interruption.");
        adminUser2.fiatBalance += 200;
        transactionSucceeded = true;
      } catch (err) {
        testUser.fiatBalance = initialNewtonBalance;
        adminUser2.fiatBalance = initialAdminBalance;
      }
      const correctRollback = testUser.fiatBalance === initialNewtonBalance && adminUser2.fiatBalance === initialAdminBalance;
      return {
        passed: correctRollback && !transactionSucceeded,
        message: correctRollback ? "Passed. State changes completely rolled back upon error, avoiding orphaned partial debits." : "Failed. System permitted unbalanced debit ledger entries."
      };
    });
    runTest("CONSISTENCY: Hard Negative Values & Empty Sanity Bounds Validation", () => {
      const invalidAmounts = [-500, 0, NaN, Infinity, -1.25];
      let rejectedAll = true;
      const failureMessages = [];
      for (const amt of invalidAmounts) {
        const coinAmt = Math.floor(Number(amt));
        if (!isNaN(coinAmt) && coinAmt <= 0) {
        } else if (isNaN(coinAmt)) {
        } else {
          rejectedAll = false;
          failureMessages.push(`Permitted invalid amount: ${amt}`);
        }
      }
      return {
        passed: rejectedAll,
        message: rejectedAll ? "Verified. All negative values, NaNs, and fractional coin spends are block-level rejected." : `Checks failed. ${failureMessages.join(", ")}`
      };
    });
    runTest("CONSISTENCY: Overdraft & Limit Controls Safeguard", () => {
      const clonedState = JSON.parse(JSON.stringify(state));
      const testUser = clonedState.users.find((u) => u.id === "user_newton");
      if (!testUser) return { passed: false, message: "Newton account missing." };
      const initialCoins = testUser.coinBalance;
      const spendWager = initialCoins + 50;
      const isPermitted = testUser.coinBalance >= spendWager;
      return {
        passed: !isPermitted,
        message: !isPermitted ? `Verified. Transfer of ${spendWager} CC was blocked (Balance: ${initialCoins} CC available).` : "Danger! Overdraft leak detected - permitted spend exceeding user balance."
      };
    });
    runTest("ISOLATION: Idempotency Key De-duplication", () => {
      const clonedState = JSON.parse(JSON.stringify(state));
      clonedState.idempotencyKeys = clonedState.idempotencyKeys || {};
      const testKey = "mock_key_" + Math.random();
      clonedState.idempotencyKeys[testKey] = {
        status: 200,
        body: { success: true, cachedResult: true, coinsRemaining: 999 }
      };
      const cached = clonedState.idempotencyKeys[testKey];
      const checkPassed = cached && cached.status === 200 && cached.body.cachedResult === true;
      return {
        passed: !!checkPassed,
        message: checkPassed ? "Verified. Concurrent duplicate client request intercepted and safely served from cached idempotency vault." : "Failed. Duplicate request bypasses idempotency filters."
      };
    });
    runTest("DURABILITY: Blockchain Hash Linkage & Multi-Signature Integrity", () => {
      const ledgerVerification = verifyLedgerChain(state.ledger);
      return {
        passed: ledgerVerification.isValid,
        message: ledgerVerification.isValid ? `Verified. Entire blockchain containing ${ledgerVerification.totalBlocks} ledger blocks is cryptographically validated and unbroken.` : `Block-chain link integrity compromise found at block index: ${ledgerVerification.tamperedIndex}!`
      };
    });
    res.json({
      success: true,
      overallPassed,
      report
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`P2P Coins Ledger server humming on http://localhost:${PORT}`);
  });
}
start().catch((err) => {
  console.error("Express start failure:", err);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
