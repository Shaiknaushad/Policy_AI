
export interface JustificationItem {
  clause: string;
  text: string;
  reasoning: string;
}

export interface AnalysisResult {
  decision: 'Approved' | 'Rejected' | 'Further Review Required';
  amount: number;
  justification: JustificationItem[];
}
