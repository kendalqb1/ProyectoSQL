import { Box, CardActions, CardContent, Fade, Skeleton, Typography, Zoom } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import './styles.css'
import { GetAllData } from "../../data/operations";
import { queries1, queries2 } from "../../data/queries";
import { BackupInfo, ConsultaTiempoCPU, EventData, RecursosSesion, SessionData, SqlData } from "../../types/types";

const Home = () => {

  const [allData, setallData] = useState({ statusDesc: 'EMPTY', tenMasRec: [], tenConMem: [], espRec: [], envCri: [], recSes: [], usoMem: [], usoCpu: [], ultBack: [], sesCon: [{ SESIONES_CONCURRENTES: 0 }], latPro: [], tasaLectEscri: [{ VALUE: 0 }], conAct: [{ CONEXIONES_ACTIVAS: 0 }] })
  const [query1, setQuery1] = useState({})
  const [query2, setQuery2] = useState({})


  const { queryData: queryData1, error, isLoading } = GetAllData(true, { queries: queries1 })
  const { queryData: queryData2 } = GetAllData(true, { queries: queries2 })

  if (queryData1 && queryData2 && !(query1 === queryData1) && !(query2 === queryData2)
    && !isLoading && (allData.statusDesc === 'EMPTY' || allData.statusDesc === 'SUCCESS')) {
    setQuery1(queryData1)
    setQuery2(queryData2)
    setallData({ ...queryData1, ...queryData2 });
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
      const physicalReads = allData.tasaLectEscri[0]?.VALUE || 0;
      const physicalWrites = allData.tasaLectEscri[1]?.VALUE || 0;
      setbarChartDataLectura([
        { name: " ", data: [physicalReads, physicalWrites] },
      ]);

      //Conexiones activas
      const conexiones = allData.conAct[0]?.CONEXIONES_ACTIVAS || 0;
      setbarChartDataConxiones([
        { name: " ", data: [conexiones] },
      ]);

      //Latencia Promedio
      const latencias = allData.latPro.map((item: any) => item.LATENCIA_PROMEDIO_MS.toFixed(2));
      const categorias = allData.latPro.map((item: any) => item.SQL_TEXT);
      setbarChartDataLatencia([{ name: "Latencia Promedio", data: latencias as never[] }]);
      barChartOptionsLatencia.xaxis!.categories = categorias;

      //Sesiones Concurrentes
      const sesiones = allData.sesCon[0].SESIONES_CONCURRENTES || 0;
      setBarChartDataSesiones([{ name: " ", data: [sesiones] }]);

      // Última Fecha de Backup Realizado
      setUltimaFechaBackup(allData.ultBack?.[0] ?? {});
      //

      //Uso CPU
      const aggregatedData: Record<string, number> = {};
      allData.usoCpu.forEach((item: any) => {
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
          data: Object.values(allData.usoMem[0]).map((value: any) => parseFloat(value)),
        },
      ];
      setLineChartDataMemoria(chartData);

      //Recursos por sesion
      const items = Array.isArray(allData.recSes) ? allData.recSes : [];
      setData(items);

      //Eventos de Espera Críticos
      setEventData(allData.envCri);

      //Monitoreo de Esperas y Recursos 
      setSessionData(allData.espRec);

      //Primeras 10 Consultas que mas consumen memoria
      setPrimerasConsultas(allData.tenConMem);

      // Primeras 10 consultas que consumen mas recuros
      setPrimerasConsultasRecursos(allData.tenMasRec);
    }


  }, [allData])

  const boxStyle = {
    boxShadow: "0px 0px 5px #00000026",
    background: "#fff",
    minHeight: "350px",
    border: "1px solid #ddd", borderRadius: 4
  };

  return (
    <Box p={3} sx={{ background: "#737b8b" }}>
      <Box p={3} sx={{ maxWidth: "1300px", margin: "0 auto" }}>
        <Typography
          variant="h3"
          mb={3}
          sx={{ fontWeight: 800, color: "white" }}
        >
          Proyecto de Administracion de Bases de Datos
        </Typography>
        <Typography
          variant="h6"
          mb={3}
          sx={{ fontWeight: 500, color: "white" }}
        >
          Integrantes: Aaron Gutierrez, Diego Morales, Kendal Quesada, Luis Aguilar
        </Typography>
        <Grid
          container
          spacing={3}
          sx={{ maxWidth: "1300px", margin: "0 auto" }}
        >
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
                    Latencia Promedio
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
                          <th>TOTAL_WAITS</th>
                          <th>TIME_WAITED_MS</th>
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
                          <th>SERIAL_NUMBER</th>
                          <th>USERNAME</th>
                          <th>STATUS</th>
                          <th>EVENT</th>
                          <th>WAIT_TIME</th>
                          <th>SECONDS_IN_WAIT</th>
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
                          <th>SQL_TEXT</th>
                          <th>BUFFER_GETS</th>
                          <th>DISK_READS</th>
                          <th>EXECUTIONS</th>
                          <th>BUFFER_GETS_PROMEDIO</th>
                          <th>DISK_READS_PROMEDIO</th>
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
                            <td>{row.BUFFER_GETS_PROMEDIO}</td>
                            <td>{row.DISK_READS_PROMEDIO}</td>
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
                          <th>SQL_TEXT</th>
                          <th>EXECUTIONS</th>
                          <th>TIEMPO_TOTAL_SEG</th>
                          <th>CPU_TOTAL_SEG</th>
                          <th>TIEMPO_PROMEDIO_SEG</th>
                          <th>CPU_PROMEDIO_SEG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {primerasConsultasRecursos.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '200px' }}>
                              {row.SQL_TEXT}
                            </td>
                            <td>{row.EXECUTIONS}</td>
                            <td>{row.TIEMPO_TOTAL_SEG}</td>
                            <td>{row.CPU_TOTAL_SEG}</td>
                            <td>{row.TIEMPO_PROMEDIO_SEG}</td>
                            <td>{row.CPU_PROMEDIO_SEG}</td>
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
  );
};

export default Home;

