export interface DetectResponse {
  message: string;
  plate: string | null;
  confidence: number;
}
