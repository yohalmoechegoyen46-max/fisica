/**
 * Circuit and Ohm's Law data structures and types
 */

export type CircuitTopology = 'series' | 'parallel' | 'mixed' | 'mixed_branches' | 'custom';

export type ComponentKind = 'resistor' | 'lamp' | 'fuse';

export interface Resistor {
  id: string;
  name: string; // e.g. "R1", "R2", "L1"
  label: string; // e.g. "En serie", "Rama 1", "Rama 2"
  resistance: number; // in Ohms (Ω)
  maxPowerRating: number; // e.g. 0.5 W rating
  kind?: ComponentKind;
  branch?: string;
}

export interface SafetyLimits {
  enabled: boolean;
  maxCurrent_mA: number; // e.g. 200 mA threshold
  maxPowerPerResistor_W: number; // e.g. 0.5 W threshold
  fuseEnabled: boolean; // Virtual circuit breaker that trips
  fuseTripped: boolean;
}

export interface ResistorAnalysis {
  id: string;
  name: string;
  label: string;
  resistance: number;
  voltageDrop: number; // V
  current_A: number; // A
  current_mA: number; // mA
  power_W: number; // W
  isOverloaded: boolean;
  overloadReason?: string;
  kind?: ComponentKind;
  branch?: string;
  colorBands: { name: string; hex: string }[];
  brightness?: number; // 0 to 1 for lamps
}

export interface CircuitAnalysis {
  voltage: number; // V
  equivalentResistance: number; // Ω
  totalCurrent_A: number; // A
  totalCurrent_mA: number; // mA
  totalPower_W: number; // W
  resistors: ResistorAnalysis[];
  isClosed: boolean;
  hasOverload: boolean;
  overloadedResistors: string[];
  stepByStep: {
    step1Title: string;
    step1Formula: string;
    step1Explanation: string;
    step2Title: string;
    step2Formula: string;
    step2Explanation: string;
    step3Title: string;
    step3Formula: string;
    step3Explanation: string;
    caidasSummary: string;
  };
  pedagogicalNote: string;
  takeaway: string;
}
