export type EventData = {
    EVENT: string;
    TOTAL_WAITS: number;
    TIME_WAITED_MS: number;
};

export type SessionData = {
    SID: number;
    "SERIAL#": number; // Cambié SERIAL# por SERIAL_NUMBER
    USERNAME: string | null;
    STATUS: string;
    EVENT: string;
    WAIT_TIME: number;
    SECONDS_IN_WAIT: number;
    STATE: string;
};

export type RecursosSesion = {
    SID: number;
    "SERIAL#": number;
    USERNAME: string;
    PROGRAM: string;
    "OS Process ID": string;
    "PGA Used (MB)": number;
    "PGA Allocated (MB)": number;

}

export type SqlData = {
    SQL_TEXT: string;
    BUFFER_GETS: number;
    DISK_READS: number;
    EXECUTIONS: number;
    BUFFER_GETS_PROMEDIO: number;
    DISK_READS_PROMEDIO: number;
};

export type ConsultaTiempoCPU = {
    SQL_TEXT: string;
    EXECUTIONS: number;
    TIEMPO_TOTAL_SEG: number;
    CPU_TOTAL_SEG: number;
    TIEMPO_PROMEDIO_SEG: number;
    CPU_PROMEDIO_SEG: number;
}

export type BackupInfo = {
    END_TIME: string;
    START_TIME: string;
    STATUS: string;
    INPUT_TYPE: string;
    ELAPSED_SECONDS: number;
    INPUT_BYTES_DISPLAY: string;
}

export interface DataStructure {
    statusDesc: string;
    consultas_uso_recurso: never[];
    consultas_uso_memoria: never[];
    esperas_recursos: never[];
    eventos_espera_critico: never[];
    recursos_sesion: never[];
    uso_memoria: never[];
    uso_cpu: never[];
    conexiones_activas: { /* define inner structure here */ }[];
    // Add other properties as needed
  }

