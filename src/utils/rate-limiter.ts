import {ALPHA_VANTAGE_MIN_INTERVAL_MS} from '@/constants/api';

type QueuedRequest = {
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

class RateLimiter {
  private queue: QueuedRequest[] = [];
  private lastRequestTime = 0;
  private processing = false;
  private minIntervalMs: number;

  constructor(minIntervalMs: number) {
    this.minIntervalMs = minIntervalMs;
  }

  schedule<T>(execute: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({execute, resolve: resolve as (value: unknown) => void, reject});
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      const waitTime = Math.max(0, this.minIntervalMs - elapsed);

      if (waitTime > 0) {
        await new Promise<void>(r => setTimeout(r, waitTime));
      }

      const request = this.queue.shift()!;
      this.lastRequestTime = Date.now();

      try {
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }

    this.processing = false;
  }
}

export const alphaVantageLimiter = new RateLimiter(
  ALPHA_VANTAGE_MIN_INTERVAL_MS,
);
