// Veri katmanı: Upstash Redis (üretim) + dosya tabanlı JSON (lokal geliştirme).
// UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN tanımlıysa Redis kullanılır;
// değilse data/db.json'a okuma/yazma yapılır. Arayüz her iki modda da aynıdır.

import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const KEY = "betlens:db";

function redisClient() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
  }
  return null;
}

function readSeed() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

export async function readDB() {
  const redis = redisClient();
  if (redis) {
    let db = await redis.get(KEY);
    if (!db) {
      // İlk çalıştırma: tohum veriyi Redis'e yükle
      db = readSeed();
      await redis.set(KEY, db);
    }
    return db;
  }
  return readSeed();
}

export async function writeDB(db) {
  const redis = redisClient();
  if (redis) {
    await redis.set(KEY, db);
    return;
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function fmtUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}Mr`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n}`;
}

export function fmtViewers(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}
