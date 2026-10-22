import fs from 'fs';
import path from 'path';

export interface PersistedChannel {
  channelKey: string;
  lastSettledAmount: string;
  cumulativeAmount: string;
  lastNonce: string;
  updatedAt: number;
}

export class FileLedgerStore {
  private filePath: string;
  private state: Map<string, PersistedChannel> = new Map();

  constructor(storageDir: string = '.paythos-data') {
    const dir = path.resolve(process.cwd(), storageDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.filePath = path.join(dir, 'channels.json');
    this.load();
  }

  private load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          this.state.set(k, v as PersistedChannel);
        }
      } catch {
        console.warn('[Paythos Store] Stale store corrupted or empty, initializing fresh.');
      }
    }
  }

  // ATOMIC WRITE: Write to .tmp and rename to prevent file corruption mid-write
  save() {
    const obj: Record<string, PersistedChannel> = {};
    for (const [k, v] of this.state.entries()) {
      obj[k] = v;
    }
    const tmpPath = `${this.filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(obj, null, 2), 'utf8');
    fs.renameSync(tmpPath, this.filePath);
  }

  getChannel(channelKey: string): PersistedChannel | undefined {
    return this.state.get(channelKey);
  }

  setChannel(channelKey: string, channel: PersistedChannel) {
    this.state.set(channelKey, channel);
    this.save();
  }
}
