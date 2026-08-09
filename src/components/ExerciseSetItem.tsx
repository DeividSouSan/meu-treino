import type { CSSProperties } from 'react';
import type { ExerciseSet } from '../types/workout';
import { X } from 'lucide-react';

export interface ExerciseSetItemProps {
  set: ExerciseSet;
  index: number;
  onDelete: (index: number) => void;
  style?: CSSProperties;
}

export function ExerciseSetItem({
  set,
  index,
  onDelete,
  style,
}: ExerciseSetItemProps) {
  return (
    <li style={{ fontSize: '0.95rem', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          <strong>{set.repetitions} reps</strong> @ {set.weightInKg}kg
          {set.restTimeInSeconds > 0 && ` - ${set.restTimeInSeconds}s`}
          {set.advancedTechniques.length > 0 && (
            <span style={{ marginLeft: 'var(--spacing-sm)' }}>
              {set.advancedTechniques.map((tech) => (
                <span
                  key={tech}
                  className="badge completed"
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 4px',
                    marginRight: '2px',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent-color)',
                    borderColor: 'var(--accent-color)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </span>
          )}
        </span>
        <button
          className="text text-danger"
          style={{ padding: '2px 6px', fontSize: '0.8rem' }}
          onClick={() => onDelete(index)}
          title="Excluir série"
        >
          <X size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </button>
      </div>
    </li>
  );
}