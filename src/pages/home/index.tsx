import { AppBar, Box, Button, CardContent, Fade, Menu, MenuItem, Skeleton, Toolbar, Typography, Zoom } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import './styles.css'
import { GetAllData } from "../../data/operations";
import { queries1, queries2, queries3 } from "../../data/queries";
import { BackupInfo, ConsultaTiempoCPU, DataStructure, EventData, RecursosSesion, SessionData, SqlData } from "../../types/types";

const exportData = (data: DataStructure[]) => {
  console.log(data);
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "database_report.json"; 
  a.click();
  URL.revokeObjectURL(url);
};


const Home = () => {
  const [allData, setallData] = useState({ statusDesc: 'EMPTY', consultas_uso_recurso: [], consultas_uso_memoria: [], esperas_recursos: [], eventos_espera_critico: [], recursos_sesion: [], uso_memoria: [], uso_cpu: [], ultimo_backup: [], sesiones_concurrentes: [{ SESIONES_CONCURRENTES: 0 }], latencia_promedio: [], tasa_lectura_escritura: [{ VALUE: 0 }], conexiones_activas: [{ CONEXIONES_ACTIVAS: 0 }] })
  const [query1, setQuery1] = useState({})
  const [query2, setQuery2] = useState({})
  const [query3, setQuery3] = useState({})

  const { queryData: queryData1, error, isLoading } = GetAllData(true, { queries: queries1 })
  const { queryData: queryData2 } = GetAllData(true, { queries: queries2 })
  const { queryData: queryData3 } = GetAllData(true, { queries: queries3 })

  if (queryData1 && queryData2 && queryData3 && !(query1 === queryData1) && !(query2 === queryData2) && !(query3 === queryData3)
    && !isLoading && (allData.statusDesc === 'EMPTY' || allData.statusDesc === 'SUCCESS')) {
    setQuery1(queryData1)
    setQuery2(queryData2)
    setQuery3(queryData3)
    setallData({ ...queryData1, ...queryData2, ...queryData3 });
  }

  // Tasa de Lectura y Escritura por Segundo
  const [barChartDataLectura, setbarChartDataLectura] = useState([
    { name: "Lectura y Escritura", data: [0, 0] },
  ]);

  const barChartOptionsLectura: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: ["Physical Reads", "Physical Writes"] },
  };

  //Conexiones Activas
  const [barChartDataConxiones, setbarChartDataConxiones] = useState([
    { name: "Conexiones Activas", data: [0] },
  ]);

  const barChartOptionsConexiones: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: ["Conexiones"] },
  };

  //Latencia Promedio
  const [barChartDataLatencia, setbarChartDataLatencia] = useState([
    { name: "Latencia Promedio", data: [] },
  ]);
  const barChartOptionsLatencia: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: [] },
    title: {
      text: "Top 10 Consultas",
      align: "center",
    },
    dataLabels: {
      enabled: false,
    },
  };

  //Sesiones Concurrentes
  const [barChartDataSesiones, setBarChartDataSesiones] = useState([
    { name: "Sesiones Concurrentes", data: [0] },
  ]);
  const barChartOptionsSesiones: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: ["Sesiones Concurrentes"] },
    dataLabels: {
      enabled: true,
    },
  };

  // Última Fecha de Backup Realizado
  // const [ultimaFechaBackup, setUltimaFechaBackup] = useState<string | null>(null);
  const [ultimaFechaBackup, setUltimaFechaBackup] = useState<BackupInfo>({
    END_TIME: '',
    START_TIME: '',
    STATUS: '',
    INPUT_TYPE: '',
    ELAPSED_SECONDS: 0,
    INPUT_BYTES_DISPLAY: ''
  });

  //Uso del CPU
  const [barChartDataCPU, setBarChartDataCPU] = useState<any[]>([]);
  const chartOptionsCPU: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    xaxis: {
      categories: barChartDataCPU.map(item => item.metric),
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
    },
  };

  //Uso de Memoria
  const [lineChartDataMemoria, setLineChartDataMemoria] = useState<{ name: string; data: number[] }[]>([
    { name: "Series 1", data: [] },
  ]);
  const lineChartOptionsMemoria: ApexOptions = {
    chart: { type: "line", height: 250, toolbar: { show: false } },
    xaxis: { categories: ["PGA Used (MB)", "PGA Allocated (MB)", "PGA Freeable (MB)", "PGA Max (MB)"] },
    stroke: { curve: "smooth" },
  };

  //Recursos por sesion
  const [data, setData] = useState<RecursosSesion[]>([]);

  //Eventos de Espera Críticos
  const [eventData, setEventData] = useState<EventData[]>([]);

  //Monitoreo de Esperas y Recursos 
  const [sessionData, setSessionData] = useState<SessionData[]>([]);

  //Primeras 10 Consultas que mas consumen memoria
  const [primerasConsultas, setPrimerasConsultas] = useState<SqlData[]>([]);

  // Primeras 10 consultas que consumen mas recuros
  const [primerasConsultasRecursos, setPrimerasConsultasRecursos] = useState<ConsultaTiempoCPU[]>([]);

  useEffect(() => {
    if (allData.statusDesc === "SUCCESS") {
      console.log(`Se actualiza la información ${new Date()}`)
      //Tasa de lectura y escritura
      const physicalReads = allData.tasa_lectura_escritura[0]?.VALUE || 0;
      const physicalWrites = allData.tasa_lectura_escritura[1]?.VALUE || 0;
      setbarChartDataLectura([
        { name: " ", data: [physicalReads, physicalWrites] },
      ]);

      //Conexiones activas
      const conexiones = allData.conexiones_activas[0]?.CONEXIONES_ACTIVAS || 0;
      setbarChartDataConxiones([
        { name: " ", data: [conexiones] },
      ]);

      //Latencia Promedio
      const latencias = allData.latencia_promedio.map((item: any) => item.LATENCIA_PROMEDIO_MS.toFixed(2));
      const categorias = allData.latencia_promedio.map((item: any) => item.SQL_TEXT);
      setbarChartDataLatencia([{ name: "Latencia Promedio", data: latencias as never[] }]);
      barChartOptionsLatencia.xaxis!.categories = categorias;

      //Sesiones Concurrentes
      const sesiones = allData.sesiones_concurrentes[0].SESIONES_CONCURRENTES || 0;
      setBarChartDataSesiones([{ name: " ", data: [sesiones] }]);

      // Última Fecha de Backup Realizado
      setUltimaFechaBackup(allData.ultimo_backup?.[0] ?? {});
      //

      //Uso CPU
      const aggregatedData: Record<string, number> = {};
      allData.uso_cpu.forEach((item: any) => {
        if (item["VALUE"]) {
          aggregatedData[item["VALUE"]] = (aggregatedData[item["USERNAME"]] || 0) + (item["CPU Usage (Miliseconds)"] || 0).toFixed(2);
        }
      });
      const formattedData = Object.entries(aggregatedData).map(([cpuUsage, username]) => ({
        metric: 'CPU Usage per second',
        cpuUsage: parseFloat(cpuUsage).toFixed(2),
      }));
      setBarChartDataCPU(formattedData);

      //Uso Memoria
      const chartData = [
        {
          name: " ",
          data: Object.values(allData.uso_memoria[0]).map((value: any) => parseFloat(value)),
        },
      ];
      setLineChartDataMemoria(chartData);

      //Recursos por sesion
      const items = Array.isArray(allData.recursos_sesion) ? allData.recursos_sesion : [];
      setData(items);

      //Eventos de Espera Críticos
      setEventData(allData.eventos_espera_critico);

      //Monitoreo de Esperas y Recursos 
      setSessionData(allData.esperas_recursos);

      //Primeras 10 Consultas que mas consumen memoria
      setPrimerasConsultas(allData.consultas_uso_memoria);

      // Primeras 10 consultas que consumen mas recuros
      setPrimerasConsultasRecursos(allData.consultas_uso_recurso);
    }


  }, [allData])

  const boxStyle = {
    boxShadow: "0px 0px 5px #00000026",
    background: "#fff",
    minHeight: "350px",
    border: "1px solid #ddd", borderRadius: 4
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Monitoreo para base de datos
          </Typography>
          <Button
            onClick={() => {
              let data: DataStructure[] = [];
              data.push(allData);
              exportData(data);
            }}
            disabled={isLoading}
            style={{
              color: 'white'
            }}>
            Exportar
          </Button>
          <Button
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            style={{
              color: 'white'
            }}
          >
            Integrantes
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem>Kendal Quesada</MenuItem>
            <MenuItem>Aaron Gutierrez</MenuItem>
            <MenuItem>Diego Morales</MenuItem>
            <MenuItem>Luis Aguilar</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box p={3} sx={{ background: "#737b8b" }} mt={5}>
        <Box p={3} sx={{ maxWidth: "1300px", margin: "0 auto" }}>
          <Grid
            container
            spacing={3}
            sx={{ maxWidth: "1300px", margin: "0 auto" }}
          >
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 6 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Uso del CPU
                    </Typography>
                    <div>
                      {isLoading && <p>Cargando...</p>}
                      {error && <p>Error: {error}</p>}
                      {!isLoading && !error && barChartDataCPU.length > 0 && (
                        <Chart
                          options={chartOptionsCPU}
                          series={[{ name: 'Uso de CPU (Segundos)', data: barChartDataCPU.map(item => item.cpuUsage) }]}
                          type="bar"
                          height={250}
                        />
                      )}
                      {!isLoading && !error && barChartDataCPU.length === 0 && <p>No hay datos de uso de CPU disponibles.</p>}
                    </div>
                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 6 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Uso de Memoria
                    </Typography>
                    <Chart options={lineChartOptionsMemoria} series={lineChartDataMemoria} type="line" height={250} />
                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 4 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Zoom in>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box p={2} sx={boxStyle}>
                      <Typography variant="h6" mb={2}>
                        Lectura y Escritura
                      </Typography>
                      <Chart
                        options={barChartOptionsLectura}
                        series={barChartDataLectura}
                        type="bar"
                        height={250}
                      />
                    </Box>
                  </Grid>
                </Zoom>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 4 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Fade in>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box p={2} sx={boxStyle}>
                      <Typography variant="h6" mb={2}>
                        Conexiones Activas
                      </Typography>
                      <Chart
                        options={barChartOptionsConexiones}
                        series={barChartDataConxiones}
                        type="bar"
                        height={250}
                      />
                    </Box>
                  </Grid>
                </Fade>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 4 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Ultimo Backup
                    </Typography>
                    <div>
                      {(ultimaFechaBackup !== null) && (
                        <>
                          <CardContent>
                            <Typography sx={{ color: 'text.secondary' }}> Fecha</Typography>
                            <Typography variant="h5" component="div" mb={1.5}>
                              {new Date(ultimaFechaBackup.END_TIME).toLocaleString()}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>Estado</Typography>
                            <Typography variant="h5" component="div" mb={1.5}>
                              {ultimaFechaBackup.STATUS}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>Tipo</Typography>
                            <Typography variant="h5" component="div" mb={1.5}>
                              {ultimaFechaBackup.INPUT_TYPE}
                            </Typography>
                            <Typography variant="body2">
                              Peso: {ultimaFechaBackup.INPUT_BYTES_DISPLAY}
                              <br />
                              Duracion: {ultimaFechaBackup.ELAPSED_SECONDS} s
                            </Typography>
                          </CardContent>
                        </>
                      )}
                    </div>
                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 6 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Sesiones Concurrentes
                    </Typography>
                    <Chart
                      options={barChartOptionsSesiones}
                      series={barChartDataSesiones}
                      type="bar"
                      height={250}
                    />
                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 6 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Latencia Promedio (MS)
                    </Typography>
                    <Chart
                      options={barChartOptionsLatencia}
                      series={barChartDataLatencia}
                      type="bar"
                      height={250}
                    />
                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 12 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 12 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Recursos por sesión
                    </Typography>
                    <div className="tabla-recursos">
                      <table>
                        <thead>
                          <tr>
                            <th>SID</th>
                            <th>Serial#</th>
                            <th>Username</th>
                            <th>Program</th>
                            <th>OS Process ID</th>
                            <th>PGA Used (MB)</th>
                            <th>PGA Allocated (MB)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((session, index) => (
                            <tr key={index}>
                              <td>{session.SID}</td>
                              <td>{session["SERIAL#"]}</td>
                              <td>{session.USERNAME}</td>
                              <td>{session.PROGRAM}</td>
                              <td>{session["OS Process ID"]}</td>
                              <td>{session["PGA Used (MB)"]}</td>
                              <td>{session["PGA Allocated (MB)"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 12 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 12 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Eventos de Espera Críticos
                    </Typography>
                    <div className="tabla-recursos">
                      <table>
                        <thead>
                          <tr>
                            <th>EVENT</th>
                            <th>TOTAL WAITS</th>
                            <th>TIME WAITED MS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventData.map((row, index) => (
                            <tr key={index}>
                              <td>{row.EVENT}</td>
                              <td>{row.TOTAL_WAITS}</td>
                              <td>{row.TIME_WAITED_MS.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>

                      </table>
                    </div>

                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 12 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 12 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Monitoreo de Esperas y Recursos
                    </Typography>
                    <div className="tabla-recursos" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>SID</th>
                            <th>SERIAL NUMBER</th>
                            <th>USERNAME</th>
                            <th>STATUS</th>
                            <th>EVENT</th>
                            <th>WAIT TIME</th>
                            <th>SECONDS IN WAIT</th>
                            <th>STATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionData.map((row, index) => (
                            <tr key={index}>
                              <td>{row.SID}</td>
                              <td>{row["SERIAL#"]}</td>
                              <td>{row.USERNAME}</td>
                              <td>{row.STATUS}</td>
                              <td>{row.EVENT}</td>
                              <td>{row.WAIT_TIME}</td>
                              <td>{row.SECONDS_IN_WAIT}</td>
                              <td>{row.STATE}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 12 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 12 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Las 10 Consultas que Consumen Más Memoria
                    </Typography>
                    <div className="tabla-recursos" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>SQL TEXT</th>
                            <th>BUFFER GETS</th>
                            <th>DISK READS</th>
                            <th>EXECUTIONS</th>
                            <th>BUFFER GETS PROMEDIO</th>
                            <th>DISK READS PROMEDIO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {primerasConsultas.slice(0, 10).map((row, index) => (
                            <tr key={index}>
                              <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '200px' }}>
                                {row.SQL_TEXT}
                              </td>
                              <td>{row.BUFFER_GETS}</td>
                              <td>{row.DISK_READS}</td>
                              <td>{row.EXECUTIONS}</td>
                              <td>{row.BUFFER_GETS_PROMEDIO.toFixed(2)}</td>
                              <td>{row.DISK_READS_PROMEDIO.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </Box>
                </Grid>
              )
            }
            {
              isLoading ? (
                <Grid size={{ xs: 12, md: 12 }}><Skeleton animation='wave' height={375} variant="rounded" /></Grid>
              ) : (
                <Grid size={{ xs: 12, md: 12 }}>
                  <Box p={2} sx={boxStyle}>
                    <Typography variant="h6" mb={2}>
                      Las 10 Consultas que Consumen Más Recursos
                    </Typography>
                    <div className="tabla-recursos" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>SQL TEXT</th>
                            <th>EXECUTIONS</th>
                            <th>TIEMPO TOTAL SEG</th>
                            <th>CPU TOTAL SEG</th>
                            <th>TIEMPO PROMEDIO SEG</th>
                            <th>CPU PROMEDIO SEG</th>
                          </tr>
                        </thead>
                        <tbody>
                          {primerasConsultasRecursos.slice(0, 10).map((row, index) => (
                            <tr key={index}>
                              <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '300px' }}>
                                {row.SQL_TEXT}
                              </td>
                              <td>{row.EXECUTIONS}</td>
                              <td>{row.TIEMPO_TOTAL_SEG}</td>
                              <td>{row.CPU_TOTAL_SEG.toFixed(2)}</td>
                              <td>{row.TIEMPO_PROMEDIO_SEG.toFixed(2)}</td>
                              <td>{row.CPU_PROMEDIO_SEG.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Box>
                </Grid>
              )
            }
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default Home;

