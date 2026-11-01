/**
 * Mathematical calculations for Ohm's Law and DC circuit topologies
 */
import { CircuitAnalysis, CircuitTopology, Resistor, ResistorAnalysis, SafetyLimits } from '../types/circuit';

const COLOR_MAP: Record<number, { name: string; hex: string }> = {
  0: { name: 'Negro', hex: '#111827' },
  1: { name: 'Marrón', hex: '#854D0E' },
  2: { name: 'Rojo', hex: '#DC2626' },
  3: { name: 'Naranja', hex: '#EA580C' },
  4: { name: 'Amarillo', hex: '#FACC15' },
  5: { name: 'Verde', hex: '#16A34A' },
  6: { name: 'Azul', hex: '#2563EB' },
  7: { name: 'Violeta', hex: '#7C3AED' },
  8: { name: 'Gris', hex: '#6B7280' },
  9: { name: 'Blanco', hex: '#F9FAFB' },
};

/**
 * Returns 4-band color codes for a resistance value in Ohms
 */
export function getResistorColorBands(ohms: number): { name: string; hex: string }[] {
  if (ohms <= 0) {
    return [
      COLOR_MAP[0],
      COLOR_MAP[0],
      COLOR_MAP[0],
      { name: 'Oro (5%)', hex: '#D97706' },
    ];
  }

  const rounded = Math.round(ohms);
  const str = rounded.toString();
  const d1 = parseInt(str[0], 10) || 0;
  const d2 = parseInt(str[1], 10) || 0;
  const numZeroes = Math.max(0, str.length - 2);

  return [
    COLOR_MAP[d1] || COLOR_MAP[1],
    COLOR_MAP[d2] || COLOR_MAP[0],
    COLOR_MAP[Math.min(9, numZeroes)] || COLOR_MAP[0],
    { name: 'Oro (±5%)', hex: '#D97706' },
  ];
}

/**
 * Solves circuit electrical values and step-by-step reasoning
 */
export function solveCircuit(
  topology: CircuitTopology,
  voltage: number,
  resistors: Resistor[],
  isClosed: boolean,
  safety: SafetyLimits
): CircuitAnalysis {
  if (resistors.length === 0) {
    return {
      voltage,
      equivalentResistance: 0,
      totalCurrent_A: 0,
      totalCurrent_mA: 0,
      totalPower_W: 0,
      resistors: [],
      isClosed,
      hasOverload: false,
      overloadedResistors: [],
      stepByStep: {
        step1Title: 'Circuito sin componentes',
        step1Formula: 'Req = 0 Ω',
        step1Explanation: 'Añade una o más resistencias desde el panel para armar tu circuito.',
        step2Title: 'Corriente nula',
        step2Formula: 'I = 0 A',
        step2Explanation: 'Se requiere al menos una resistencia para cerrar el lazo.',
        step3Title: 'Ley de Ohm',
        step3Formula: 'V = I × R',
        step3Explanation: 'Define tus componentes de prueba para simular.',
        caidasSummary: 'Sin componentes activos.',
      },
      pedagogicalNote: 'Utiliza el panel izquierdo para añadir resistencias o bombillas de prueba.',
      takeaway: 'Arma tu circuito conectando componentes en serie o en ramas paralelas.',
    };
  }

  if (!isClosed || safety.fuseTripped || voltage <= 0) {
    // Open circuit or 0V
    const zeroResistors: ResistorAnalysis[] = resistors.map((r) => ({
      id: r.id,
      name: r.name,
      label: r.label,
      resistance: r.resistance,
      voltageDrop: 0,
      current_A: 0,
      current_mA: 0,
      power_W: 0,
      isOverloaded: false,
      kind: r.kind || 'resistor',
      branch: r.branch,
      brightness: 0,
      colorBands: getResistorColorBands(r.resistance),
    }));

    let req = 0;
    if (topology === 'series') {
      req = resistors.reduce((sum, r) => sum + r.resistance, 0);
    } else if (topology === 'parallel') {
      const invSum = resistors.reduce((sum, r) => sum + (r.resistance > 0 ? 1 / r.resistance : 0), 0);
      req = invSum > 0 ? 1 / invSum : 0;
    } else {
      // Mixed
      const mainResistors = resistors.filter((r) => r.branch === 'main' || (!r.branch && r.id === resistors[0].id));
      const branchResistors = resistors.filter((r) => !mainResistors.includes(r));
      const rMain = mainResistors.reduce((sum, r) => sum + r.resistance, 0);
      const invBranches = branchResistors.reduce((sum, r) => sum + (r.resistance > 0 ? 1 / r.resistance : 0), 0);
      const rParallel = invBranches > 0 ? 1 / invBranches : 0;
      req = rMain + rParallel;
    }

    return {
      voltage,
      equivalentResistance: Number(req.toFixed(2)),
      totalCurrent_A: 0,
      totalCurrent_mA: 0,
      totalPower_W: 0,
      resistors: zeroResistors,
      isClosed: false,
      hasOverload: false,
      overloadedResistors: [],
      stepByStep: {
        step1Title: 'Circuito abierto',
        step1Formula: 'I = 0 A',
        step1Explanation: safety.fuseTripped 
          ? 'El disyuntor de seguridad ha saltado por sobrecarga térmica. Restablezca el disyuntor para reanudar.'
          : 'El circuito está abierto. Sin un camino continuo cerrado hasta la fuente, la corriente eléctrica no fluye.',
        step2Title: 'Tensión sin carga',
        step2Formula: `V = ${voltage} V`,
        step2Explanation: 'La fuente mantiene su diferencia de potencial, pero no entrega corriente ni disipa potencia.',
        step3Title: 'Resistencia equivalente',
        step3Formula: `Req = ${Number(req.toFixed(2))} Ω`,
        step3Explanation: 'La configuración resistiva permanece intacta calculada desde los bornes de la fuente.',
        caidasSummary: 'Todas las caídas de tensión son 0 V y corrientes 0 mA.',
      },
      pedagogicalNote: 'Cierra el interruptor para que los electrones comiencen a fluir y se energice el circuito.',
      takeaway: 'Un circuito requiere un lazo cerrado conductor continuo para que exista circulación de corriente.',
    };
  }

  let eqResistance = 0;
  let totalCurrent_A = 0;
  const analyzedResistors: ResistorAnalysis[] = [];

  if (topology === 'series') {
    eqResistance = resistors.reduce((acc, r) => acc + Math.max(0.1, r.resistance), 0);
    totalCurrent_A = eqResistance > 0 ? voltage / eqResistance : 0;

    resistors.forEach((r) => {
      const rVal = Math.max(0.1, r.resistance);
      const vDrop = totalCurrent_A * rVal;
      const power = vDrop * totalCurrent_A;
      const isOverloaded = safety.enabled && (
        (totalCurrent_A * 1000 > safety.maxCurrent_mA) ||
        (power > (r.maxPowerRating || safety.maxPowerPerResistor_W))
      );

      const brightness = Math.min(1, Math.max(0.1, power / (r.maxPowerRating || 0.5)));

      analyzedResistors.push({
        id: r.id,
        name: r.name,
        label: r.label || 'En serie',
        resistance: r.resistance,
        voltageDrop: Number(vDrop.toFixed(2)),
        current_A: totalCurrent_A,
        current_mA: Number((totalCurrent_A * 1000).toFixed(1)),
        power_W: Number(power.toFixed(3)),
        isOverloaded,
        kind: r.kind || 'resistor',
        branch: r.branch || 'main',
        brightness,
        overloadReason: isOverloaded
          ? power > (r.maxPowerRating || safety.maxPowerPerResistor_W)
            ? `Disipación excesiva: ${power.toFixed(2)} W > ${(r.maxPowerRating || safety.maxPowerPerResistor_W)} W máx`
            : `Corriente excesiva: ${(totalCurrent_A * 1000).toFixed(0)} mA > ${safety.maxCurrent_mA} mA máx`
          : undefined,
        colorBands: getResistorColorBands(r.resistance),
      });
    });
  } else if (topology === 'parallel') {
    const invSum = resistors.reduce((acc, r) => acc + (1 / Math.max(0.1, r.resistance)), 0);
    eqResistance = invSum > 0 ? 1 / invSum : 0;
    
    let sumCurrent = 0;
    resistors.forEach((r, idx) => {
      const rVal = Math.max(0.1, r.resistance);
      const branchCurrent = voltage / rVal;
      sumCurrent += branchCurrent;
      const power = voltage * branchCurrent;
      const isOverloaded = safety.enabled && (
        (branchCurrent * 1000 > safety.maxCurrent_mA) ||
        (power > (r.maxPowerRating || safety.maxPowerPerResistor_W))
      );

      const brightness = Math.min(1, Math.max(0.1, power / (r.maxPowerRating || 0.5)));

      analyzedResistors.push({
        id: r.id,
        name: r.name,
        label: r.label || `Rama ${idx + 1}`,
        resistance: r.resistance,
        voltageDrop: Number(voltage.toFixed(2)),
        current_A: branchCurrent,
        current_mA: Number((branchCurrent * 1000).toFixed(1)),
        power_W: Number(power.toFixed(3)),
        isOverloaded,
        kind: r.kind || 'resistor',
        branch: r.branch || `branch${idx + 1}`,
        brightness,
        overloadReason: isOverloaded
          ? power > (r.maxPowerRating || safety.maxPowerPerResistor_W)
            ? `Disipación excesiva: ${power.toFixed(2)} W > ${(r.maxPowerRating || safety.maxPowerPerResistor_W)} W máx`
            : `Corriente de rama: ${(branchCurrent * 1000).toFixed(0)} mA > ${safety.maxCurrent_mA} mA máx`
          : undefined,
        colorBands: getResistorColorBands(r.resistance),
      });
    });
    totalCurrent_A = sumCurrent;
  } else {
    // Mixed topology (Series + Parallel bank)
    const mainList = resistors.filter((r) => r.branch === 'main' || (!r.branch && r.id === resistors[0]?.id));
    const branchList = resistors.filter((r) => !mainList.includes(r));

    // If no branch resistors, behave as series
    if (branchList.length === 0) {
      eqResistance = mainList.reduce((acc, r) => acc + Math.max(0.1, r.resistance), 0);
      totalCurrent_A = eqResistance > 0 ? voltage / eqResistance : 0;
      mainList.forEach((r) => {
        const vDrop = totalCurrent_A * r.resistance;
        const p = vDrop * totalCurrent_A;
        analyzedResistors.push({
          id: r.id,
          name: r.name,
          label: r.label || 'En serie',
          resistance: r.resistance,
          voltageDrop: Number(vDrop.toFixed(2)),
          current_A: totalCurrent_A,
          current_mA: Number((totalCurrent_A * 1000).toFixed(1)),
          power_W: Number(p.toFixed(3)),
          isOverloaded: safety.enabled && (totalCurrent_A * 1000 > safety.maxCurrent_mA || p > safety.maxPowerPerResistor_W),
          kind: r.kind || 'resistor',
          branch: 'main',
          colorBands: getResistorColorBands(r.resistance),
        });
      });
    } else {
      // Calculate parallel equivalent
      const invParallel = branchList.reduce((acc, r) => acc + (1 / Math.max(0.1, r.resistance)), 0);
      const rParallel = invParallel > 0 ? 1 / invParallel : 0;
      const rMain = mainList.reduce((acc, r) => acc + Math.max(0.1, r.resistance), 0);

      eqResistance = rMain + rParallel;
      totalCurrent_A = eqResistance > 0 ? voltage / eqResistance : 0;

      // Solve main series resistors
      let vMainUsed = 0;
      mainList.forEach((r) => {
        const rVal = Math.max(0.1, r.resistance);
        const vDrop = totalCurrent_A * rVal;
        vMainUsed += vDrop;
        const p = vDrop * totalCurrent_A;
        const isOverloaded = safety.enabled && (
          (totalCurrent_A * 1000 > safety.maxCurrent_mA) ||
          (p > (r.maxPowerRating || safety.maxPowerPerResistor_W))
        );
        analyzedResistors.push({
          id: r.id,
          name: r.name,
          label: r.label || 'En serie',
          resistance: r.resistance,
          voltageDrop: Number(vDrop.toFixed(2)),
          current_A: totalCurrent_A,
          current_mA: Number((totalCurrent_A * 1000).toFixed(1)),
          power_W: Number(p.toFixed(3)),
          isOverloaded,
          kind: r.kind || 'resistor',
          branch: 'main',
          brightness: Math.min(1, Math.max(0.1, p / (r.maxPowerRating || 0.5))),
          overloadReason: isOverloaded
            ? p > (r.maxPowerRating || safety.maxPowerPerResistor_W)
              ? `Disipación: ${p.toFixed(2)} W > ${(r.maxPowerRating || safety.maxPowerPerResistor_W)} W`
              : `Corriente: ${(totalCurrent_A * 1000).toFixed(0)} mA > ${safety.maxCurrent_mA} mA`
            : undefined,
          colorBands: getResistorColorBands(r.resistance),
        });
      });

      // Remaining voltage across the parallel bank
      const vParallel = Math.max(0, voltage - vMainUsed);

      branchList.forEach((r, idx) => {
        const rVal = Math.max(0.1, r.resistance);
        const iBranch = vParallel / rVal;
        const p = vParallel * iBranch;
        const isOverloaded = safety.enabled && (
          (iBranch * 1000 > safety.maxCurrent_mA) ||
          (p > (r.maxPowerRating || safety.maxPowerPerResistor_W))
        );
        analyzedResistors.push({
          id: r.id,
          name: r.name,
          label: r.label || `Rama ${idx + 1}`,
          resistance: r.resistance,
          voltageDrop: Number(vParallel.toFixed(2)),
          current_A: iBranch,
          current_mA: Number((iBranch * 1000).toFixed(1)),
          power_W: Number(p.toFixed(3)),
          isOverloaded,
          kind: r.kind || 'resistor',
          branch: r.branch || `branch${idx + 1}`,
          brightness: Math.min(1, Math.max(0.1, p / (r.maxPowerRating || 0.5))),
          overloadReason: isOverloaded
            ? p > (r.maxPowerRating || safety.maxPowerPerResistor_W)
              ? `Disipación: ${p.toFixed(2)} W > ${(r.maxPowerRating || safety.maxPowerPerResistor_W)} W`
              : `Corriente: ${(iBranch * 1000).toFixed(0)} mA > ${safety.maxCurrent_mA} mA`
            : undefined,
          colorBands: getResistorColorBands(r.resistance),
        });
      });
    }
  }

  const totalCurrent_mA = totalCurrent_A * 1000;
  const totalPower_W = voltage * totalCurrent_A;
  const overloadedResistors = analyzedResistors.filter((r) => r.isOverloaded).map((r) => r.name);
  const circuitOverloaded = safety.enabled && (
    totalCurrent_mA > safety.maxCurrent_mA ||
    overloadedResistors.length > 0
  );

  // Generate step-by-step mathematical explanation matching page 5
  let stepByStep = {
    step1Title: '',
    step1Formula: '',
    step1Explanation: '',
    step2Title: '',
    step2Formula: '',
    step2Explanation: '',
    step3Title: '',
    step3Formula: '',
    step3Explanation: '',
    caidasSummary: '',
  };

  let pedagogicalNote = '';
  let takeaway = '';

  if (topology === 'series') {
    const rNames = analyzedResistors.map((r) => `${r.resistance}`).join(' + ');
    const vDrops = analyzedResistors.map((r) => `${r.name}: ${r.voltageDrop} V`).join(' · ');

    stepByStep = {
      step1Title: '01 Suma de resistencias en serie',
      step1Formula: `Req = ${rNames} = ${eqResistance.toFixed(1)} Ω`,
      step1Explanation: 'En un circuito serie la corriente solo tiene un único camino, por lo que las resistencias se acumulan una tras otra.',
      step2Title: '02 Aplica la Ley de Ohm',
      step2Formula: `I = V / Req = ${voltage} V / ${eqResistance.toFixed(1)} Ω = ${totalCurrent_A.toFixed(4)} A = ${totalCurrent_mA.toFixed(1)} mA`,
      step2Explanation: 'La misma corriente total calculada atraviesa idénticamente cada uno de los componentes de la serie.',
      step3Title: '03 Caídas de tensión por componente',
      step3Formula: analyzedResistors.map((r) => `${r.name} = ${r.voltageDrop} V`).join(' | '),
      step3Explanation: `La suma de tensiones se conserva: ${analyzedResistors.map((r) => `${r.voltageDrop}`).join(' + ')} V = ${voltage} V.`,
      caidasSummary: `Caídas: ${vDrops}`,
    };

    pedagogicalNote = `En serie, las resistencias se suman y la corriente se conserva. Req = ${eqResistance.toFixed(0)} Ω. Los ${voltage} V se reparten entre las ${resistors.length} resistencias. I = ${totalCurrent_A.toFixed(3)} A (${totalCurrent_mA.toFixed(0)} mA).`;
    takeaway = `Mayor resistencia en una serie provoca una mayor caída de tensión en ese componente (divisor de voltaje), manteniendo constante la corriente I en todo el lazo.`;
  } else if (topology === 'parallel') {
    stepByStep = {
      step1Title: '01 Tensión común a cada rama',
      step1Formula: `V_rama = V_fuente = ${voltage} V`,
      step1Explanation: 'Todas las resistencias comparten directamente los dos nodos principales de la fuente, por lo que reciben exactamente la misma diferencia de potencial.',
      step2Title: '02 Corrientes individuales de rama',
      step2Formula: analyzedResistors.map((r) => `${r.name}: ${r.current_mA.toFixed(0)} mA`).join(' | '),
      step2Explanation: 'A menor resistencia en una rama, mayor flujo de electrones elegirá circular por ella (Ley de Ohm independiente por rama).',
      step3Title: '03 Corriente total del nodo y Req',
      step3Formula: `Itotal = ${analyzedResistors.map((r) => `${r.current_mA.toFixed(0)}`).join(' + ')} = ${totalCurrent_mA.toFixed(1)} mA  |  Req = ${eqResistance.toFixed(2)} Ω`,
      step3Explanation: `La corriente entregada por la fuente es la suma de las corrientes de todas las ramas en paralelo.`,
      caidasSummary: `Tensión común de ${voltage} V en todas las ramas. Corrientes: ${analyzedResistors.map((r) => `${r.name}: ${r.current_mA.toFixed(0)} mA`).join(', ')}.`,
    };

    pedagogicalNote = `En paralelo, la tensión es común y las corrientes de rama se suman. Cada rama recibe ${voltage} V. Itotal = ${totalCurrent_mA.toFixed(0)} mA.`;
    takeaway = `En paralelo, la resistencia equivalente siempre es MENOR que la menor de las resistencias conectadas, aumentando la corriente total extraída a la fuente.`;
  } else {
    // Mixed
    const mainList = analyzedResistors.filter((r) => r.branch === 'main');
    const branchList = analyzedResistors.filter((r) => r.branch !== 'main');
    const r1 = mainList[0]?.resistance || 100;
    const v1 = mainList[0]?.voltageDrop || 0;
    const vPar = branchList[0]?.voltageDrop || 0;

    stepByStep = {
      step1Title: '01 Reduce el bloque paralelo',
      step1Formula: `R_paralelo = 1 / (${branchList.map((r) => `1/${r.resistance}`).join(' + ')})`,
      step1Explanation: 'Se resuelve primero el bloque en paralelo para transformarlo en una única resistencia equivalente R_paralelo.',
      step2Title: '02 Suma la serie restante',
      step2Formula: `Req = R_serie + R_paralelo = ${eqResistance.toFixed(1)} Ω`,
      step2Explanation: 'La resistencia total vista por la fuente es la suma de los componentes en serie más el equivalente del bloque en paralelo.',
      step3Title: '03 Aplica la Ley de Ohm global',
      step3Formula: `I = V / Req = ${voltage} V / ${eqResistance.toFixed(1)} Ω = ${totalCurrent_A.toFixed(3)} A = ${totalCurrent_mA.toFixed(1)} mA`,
      step3Explanation: 'Esta es la corriente total que entrega la fuente y que atraviesa los componentes principales antes de bifurcarse.',
      caidasSummary: `Caídas: Serie → ${v1} V · Bloque paralelo → ${vPar} V (Total: ${voltage} V)`,
    };

    pedagogicalNote = `Circuito mixto resuelto: Req = ${eqResistance.toFixed(1)} Ω. Serie recibe ${v1} V y el paralelo ${vPar} V. Corriente total: ${totalCurrent_mA.toFixed(0)} mA.`;
    takeaway = `Misma tensión en el bloque paralelo (${vPar} V) reparte la corriente según la resistencia de cada ramal.`;
  }

  return {
    voltage,
    equivalentResistance: Number(eqResistance.toFixed(2)),
    totalCurrent_A: Number(totalCurrent_A.toFixed(4)),
    totalCurrent_mA: Number(totalCurrent_mA.toFixed(1)),
    totalPower_W: Number(totalPower_W.toFixed(3)),
    resistors: analyzedResistors,
    isClosed,
    hasOverload: circuitOverloaded,
    overloadedResistors,
    stepByStep,
    pedagogicalNote,
    takeaway,
  };
}
