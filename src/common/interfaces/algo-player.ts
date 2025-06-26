export interface AlgoPlayer {
  id: string;
  name: string;
  level: number; // 1..N – maior = melhor
  active: boolean;
  /** Quantas partidas já jogou */
  matchCount: number;
  /** Histórico de parcerias: parceiroId → vezes jogadas juntos */
  partnerCounts: Record<string, number>;
  /** Lista de jogadores com quem esse jogador prefere fazr dupla */
  preferredPairs: string[];
}
