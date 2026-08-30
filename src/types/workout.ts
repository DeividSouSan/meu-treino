/**
 * Representa as técnicas avançadas aplicáveis a uma série de treino.
 */
export type AdvancedTechnique = 'RP' | 'DS' | 'FS' | 'ISO';

/**
 * Representa a execução de uma série individual de um exercício.
 */
export interface ExerciseSet {
  /**
   * Carga utilizada na série, expressa em quilogramas (KG).
   */
  weightInKg: number;
  /**
   * Quantidade de repetições realizadas na série.
   */
  repetitions: number;
  /**
   * Tempo de descanso programado após esta série, em segundos.
   */
  restTimeInSeconds: number;
  /**
   * Técnicas avançadas associadas a esta série específica.
   */
  advancedTechniques: AdvancedTechnique[];
}

export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'other';
export type LoadType = 'total' | 'each_side';

/**
 * Representa o registro de um exercício específico realizado na sessão de treino.
 */
export interface WorkoutExercise {
  /**
   * Identificador único do exercício na sessão.
   */
  id: string;
  /**
   * Nome do exercício (ex: "Supino Inclinado").
   */
  name: string;
  /**
   * Carga geral ou de referência do exercício (para exibição rápida).
   */
  weightInKg: number;
  /**
   * Observações rápidas ou dicas de execução deste exercício.
   */
  notes: string;
  /**
   * Lista de séries executadas para este exercício.
   */
  sets: ExerciseSet[];
  /**
   * Tipo de equipamento utilizado para o exercício nesta sessão.
   */
  equipmentType?: EquipmentType;
  /**
   * Tipo de indicação do peso/carga nesta sessão.
   */
  loadType?: LoadType;
}

/**
 * Representa uma sessão de treino completa, podendo ser um treino ativo, passado ou um template.
 */
export interface WorkoutSession {
  /**
   * Identificador único da sessão de treino.
   */
  id: string;
  /**
   * Data e hora do início do treino no formato de string ISO.
   */
  date: string;
  /**
   * Duração total da sessão de treino em segundos.
   */
  durationInSeconds: number;
  /**
   * Nome do treino (ex: "Treino A - Peito" ou "Treino de Quinta").
   */
  name: string;
  /**
   * Lista de lembretes gerais e observações globais para a sessão de treino.
   */
  cues: string[];
  /**
   * Lista de exercícios inclusos nesta sessão de treino.
   */
  exercises: WorkoutExercise[];
  /**
   * Indica se este registro serve como um template reutilizável em vez de um treino concluído.
   */
  isTemplate: boolean;
  /**
   * Status atual do treino.
   */
  status: 'in_progress' | 'completed';
}
