import type { CSSProperties } from 'react';
import type { AdvancedTechnique } from '../types/workout';
import { MtPill } from './ui';

export interface ExerciseTechniquePillsProps {
  selectedTechniques: AdvancedTechnique[];
  onToggle: (technique: AdvancedTechnique) => void;
  label?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  itemStyle?: CSSProperties;
}

const TECHNIQUES: AdvancedTechnique[] = ['FS', 'RP', 'DS', 'ISO'];

export function ExerciseTechniquePills({
  selectedTechniques,
  onToggle,
  label,
  style,
  labelStyle,
  itemStyle,
}: ExerciseTechniquePillsProps) {
  return (
    <div style={style}>
      {label && (
        <label style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-xs)', display: 'block', ...labelStyle }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
        {TECHNIQUES.map((technique) => {
          const isActive = selectedTechniques.includes(technique);
          return (
            <MtPill
              key={technique}
              isActive={isActive}
              onClick={() => onToggle(technique)}
              style={itemStyle}
            >
              {technique}
            </MtPill>
          );
        })}
      </div>
    </div>
  );
}