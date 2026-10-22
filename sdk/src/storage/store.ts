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
      } catch (e) {
        console.warn('[Paythos Store] Stale store corrupted, initializing fresh.');
      }
    }
  }

  save() {
    const obj: Record<string, PersistedChannel> = {};
    for (const [k, v] of this.state.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), 'utf8');
  }

  getChannel(channelKey: string): PersistedChannel | undefined {
    return this.state.get(channelKey);
  }

  setChannel(channelKey: string, channel: PersistedChannel) {
    this.state.set(channelKey, channel);
    this.save();
  }
}
