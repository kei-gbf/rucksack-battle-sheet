const db = new Dexie(DBNAME);

db.version(1).stores({ records: "++id, job, time, jw, w, rp, rank, totalRp, note" });
