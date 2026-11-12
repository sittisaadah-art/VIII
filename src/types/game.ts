export interface Question {
  id: string;
  submateri: string;
  q: string;
  options: string[];
  key: string;
  explanation: string;
}

export interface BuildingData {
  code: string;
  title: string;
  icon: string;
  color: number;
  colorHex: string;
  pos: { x: number; z: number };
  questions: Question[];
}

export interface Player {
  id: number;
  name: string;
  color: number;
  colorHex: string;
  avatar: string;
  score: number;
  coins: number;
  pos: { x: number; z: number };
  rot: number;
  auto: boolean;
}

export interface RecapItem {
  time: string;
  school: string;
  player: string;
  building: string;
  materi: string;
  question: string;
  userAns: string;
  key: string;
  status: 'BENAR' | 'SALAH';
  points: number;
}

export interface OrnamentItem {
  id: string;
  name: string;
  emoji: string;
  category: 'literacy' | 'nature' | 'decoration';
}

export interface HostingInfo {
  status: string;
  platform: string;
  region: string;
  liveSharedUrl: string;
  devUrl: string;
  sslEnabled: boolean;
  protocol: string;
  canonicalHost: string;
  defaultPort: number;
  appTitle: string;
  uptime: number;
}

export interface DNSRecord {
  type: string;
  name: string;
  target: string;
  ttl: number;
  description: string;
}
