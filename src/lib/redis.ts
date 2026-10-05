import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create a fallback in-memory Map for when Redis is not available
class InMemoryCache {
  private store: Map<string, string> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async get(key: string) { return this.store.get(key) || null; }
  async set(key: string, value: string) { this.store.set(key, value); return 'OK'; }
  async setEx(key: string, seconds: number, value: string) {
    this.store.set(key, value);
    if (this.timers.has(key)) clearTimeout(this.timers.get(key)!);
    this.timers.set(key, setTimeout(() => this.store.delete(key), seconds * 1000));
    return 'OK';
  }
  async del(key: string) { this.store.delete(key); return 1; }
  async keys(pattern: string) {
    // Basic regex conversion for '*'
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.store.keys()).filter(k => regex.test(k));
  }
  async hSet(key: string, field: string, value: string) {
    const hash = this.store.get(key) ? JSON.parse(this.store.get(key)!) : {};
    hash[field] = value;
    this.store.set(key, JSON.stringify(hash));
    return 1;
  }
  async hGet(key: string, field: string) {
    const hash = this.store.get(key) ? JSON.parse(this.store.get(key)!) : {};
    return hash[field] || null;
  }
  async hGetAll(key: string) {
    return this.store.get(key) ? JSON.parse(this.store.get(key)!) : {};
  }
  async hDel(key: string, field: string) {
    const hash = this.store.get(key) ? JSON.parse(this.store.get(key)!) : {};
    delete hash[field];
    this.store.set(key, JSON.stringify(hash));
    return 1;
  }
  async incr(key: string) {
    const val = parseInt(this.store.get(key) || '1000000') + 1;
    this.store.set(key, val.toString());
    return val;
  }
}

let isRedisConnected = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: { reconnectStrategy: false }
});

const fallbackCache = new InMemoryCache();

redisClient.on('error', (err) => {
  // Ignore connection errors to prevent unhandled rejections from crashing the server
});

// Connect immediately, but handle failure gracefully
(async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log('✅ Connected to Redis successfully');
  } catch (err) {
    isRedisConnected = false;
    console.log('⚠️ Failed to connect to Redis. Falling back to In-Memory Cache.');
  }
})();

// Helper function to route to Redis or Fallback
export const cache = {
  get: async (key: string) => isRedisConnected ? redisClient.get(key) : fallbackCache.get(key),
  set: async (key: string, value: string) => isRedisConnected ? redisClient.set(key, value) : fallbackCache.set(key, value),
  setEx: async (key: string, seconds: number, value: string) => isRedisConnected ? redisClient.setEx(key, seconds, value) : fallbackCache.setEx(key, seconds, value),
  del: async (key: string) => isRedisConnected ? redisClient.del(key) : fallbackCache.del(key),
  keys: async (pattern: string) => isRedisConnected ? redisClient.keys(pattern) : fallbackCache.keys(pattern),
  hSet: async (key: string, field: string, value: string) => isRedisConnected ? redisClient.hSet(key, field, value) : fallbackCache.hSet(key, field, value),
  hGet: async (key: string, field: string) => isRedisConnected ? redisClient.hGet(key, field) : fallbackCache.hGet(key, field),
  hGetAll: async (key: string) => isRedisConnected ? redisClient.hGetAll(key) : fallbackCache.hGetAll(key),
  hDel: async (key: string, field: string) => isRedisConnected ? redisClient.hDel(key, field) : fallbackCache.hDel(key, field),
  incr: async (key: string) => isRedisConnected ? redisClient.incr(key) : fallbackCache.incr(key)
};

export default cache;
