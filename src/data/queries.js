export const queries1 = [
    {
        query: "SELECT * FROM V$SYSSTAT WHERE NAME IN ('physical reads', 'physical writes')",
        name: "tasaLectEscri"
    },
    {
        query: "SELECT COUNT(*) AS conexiones_activas FROM V$SESSION WHERE STATUS = 'ACTIVE'",
        name: "conAct"
    },
    {
        query: "SELECT SQL_TEXT, EXECUTIONS, (ELAPSED_TIME / EXECUTIONS) / 1000 AS LATENCIA_PROMEDIO_MS FROM V$SQL WHERE EXECUTIONS > 1 ORDER BY EXECUTIONS DESC FETCH FIRST 10 ROWS ONLY",
        name: "latPro"
    },
    {
        query: "SELECT COUNT(*) AS sesiones_concurrentes FROM V$SESSION",
        name: "sesCon"
    },
    {
        query: "SELECT END_TIME, START_TIME, STATUS, INPUT_TYPE, ELAPSED_SECONDS, INPUT_BYTES_DISPLAY FROM V$RMAN_BACKUP_JOB_DETAILS WHERE STATUS = 'COMPLETED' ORDER BY END_TIME DESC",
        name: "ultBack"
    },
    {
        query: "SELECT metric_name, end_time , value FROM v$sysmetric WHERE metric_name = 'CPU Usage Per Sec' AND group_id = 2 ORDER BY end_time DESC",
        name: "usoCpu"
    }
];

export const queries2 = [
    {
        query: "SELECT ROUND(SUM(pga_used_mem) / 1024 / 1024, 2) AS \"PGA Used (MB)\", ROUND(SUM(pga_alloc_mem) / 1024 / 1024, 2) AS \"PGA Allocated (MB)\", ROUND(SUM(pga_freeable_mem) / 1024 / 1024, 2) AS \"PGA Freeable (MB)\", ROUND(SUM(pga_max_mem) / 1024 / 1024, 2) AS \"PGA Max (MB)\" FROM v$process",
        name: "usoMem"
    },
    {
        query: "SELECT s.sid, s.serial#, s.username, s.program, p.spid AS \"OS Process ID\", ROUND(p.pga_used_mem / 1024 / 1024, 2) AS \"PGA Used (MB)\", ROUND(p.pga_alloc_mem / 1024 / 1024, 2) AS \"PGA Allocated (MB)\" FROM v$session s JOIN v$process p ON s.paddr = p.addr WHERE s.username IS NOT NULL",
        name: "recSes"
    },
    {
        query: "SELECT EVENT, TOTAL_WAITS, TIME_WAITED_MICRO / 1000 AS TIME_WAITED_MS FROM V$SYSTEM_EVENT WHERE EVENT IN ('latch free', 'buffer busy waits', 'log file sync') ORDER BY TIME_WAITED_MS DESC",
        name: "envCri"
    },
    {
        query: "SELECT SID, SERIAL#, USERNAME, STATUS, EVENT, WAIT_TIME, SECONDS_IN_WAIT, STATE FROM V$SESSION WHERE STATUS = 'ACTIVE'",
        name: "espRec"
    },
    {
        query: `SELECT SQL_TEXT, BUFFER_GETS, DISK_READS, EXECUTIONS, 
                  (BUFFER_GETS / EXECUTIONS) AS BUFFER_GETS_PROMEDIO, 
                  (DISK_READS / EXECUTIONS) AS DISK_READS_PROMEDIO
                  FROM V$SQLAREA
                  ORDER BY BUFFER_GETS DESC
                  FETCH FIRST 10 ROWS ONLY`,
        name: "tenConMem"
    },
    {
        query: `SELECT SQL_TEXT, EXECUTIONS, ELAPSED_TIME / 1000000 AS TIEMPO_TOTAL_SEG, 
                  CPU_TIME / 1000000 AS CPU_TOTAL_SEG, 
                  (ELAPSED_TIME / EXECUTIONS) / 1000000 AS TIEMPO_PROMEDIO_SEG, 
                  (CPU_TIME / EXECUTIONS) / 1000000 AS CPU_PROMEDIO_SEG 
                FROM V$SQL WHERE EXECUTIONS > 1 
                ORDER BY CPU_TIME DESC FETCH FIRST 10 ROWS ONLY`,
        name: "tenMasRec"
    }
]
