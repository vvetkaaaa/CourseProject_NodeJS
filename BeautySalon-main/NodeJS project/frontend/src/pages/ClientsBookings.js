import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  styled,
  CircularProgress
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NavMenu from "../components/NavMenu";
import dayjs from "dayjs";


const StatButton = styled(Button)(({ theme }) => ({
  marginRight: "5px",
  backgroundColor: "#f5e9e9", // светлый розовый
  color: "#5d4037", // коричневый текст
  fontSize: "12px",
  fontWeight: "500",  
  paddingRight: "16px",
  paddingLeft: "16px",
  paddingTop: "8px",
  paddingBottom: "8px",
  height: "auto",
  borderRadius: "24px",
  border: "1px solid #d7ccc8", // светлая граница
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#e8d5d5", // чуть темнее при наведении
    boxShadow: "none",
    color: "#3e2723" // темнее текст при наведении
  },
}));


function ClientsStats() {
  const defaultStartDate = dayjs().startOf('month');
  const defaultEndDate = dayjs();
  const [employees, setEmployees] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");

  const getBookingCount = (employeeId) => {
    const stat = employeeStats.find(stat => stat.employeeId === employeeId);
    return stat ? stat.bookingCount : 0;
  };

  const fetchBookingStats = async () => {
    if (!startDate || !endDate) {
      alert("Пожалуйста, выберите начальную и конечную дату.");
      return;
    }

    setLoadingStats(true);
    setEmployeeStats([]);

    try {
      const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
      const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");

      const response = await axios.get("http://localhost:5000/book/statistics", {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

      setEmployeeStats(response.data.stats || []);

    } catch (error) {
      console.error("Ошибка при загрузке статистики записей:", error);
      setEmployeeStats([]);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingEmployees(true);
      try {
        const { data } = await axios.get("http://localhost:5000/empl/getempl");
        setEmployees(data);
        fetchBookingStats(defaultStartDate, defaultEndDate);
      } catch (error) {
        console.error("Ошибка при загрузке списка сотрудников:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };
     fetchInitialData();
  }, []); 

  const handleFetchStatsButtonClick = () => {
      if (!startDate.isBefore(endDate)) {
            setError(`Начальное время должно быть раньше конечного.`);
            return;
      }
      setError("");
      fetchBookingStats(startDate, endDate); // Вызываем с текущими выбранными датами
  };

  if (loadingEmployees) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Загрузка списка мастеров...</Typography>
      </Container>
    );
  }


  return (
    <Container maxWidth="md">
      <NavMenu />
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3, textAlign: 'left', color: "#5d4037" }}>
        Статистика записей по мастерам
      </Typography>

      <Box sx={{ mb: 4 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Начальная дата"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Конечная дата"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                 slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>

        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ textAlign: 'center', mt: 3 }}>
            <StatButton
                variant="contained"
                color="primary"
                onClick={handleFetchStatsButtonClick}
                disabled={loadingStats || !startDate || !endDate} // Используем loadingStats
                size="large"
            >
                Показать статистику
            </StatButton>
        </Box>
      </Box>

      {loadingStats && ( // Используем loadingStats для индикатора статистики
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="h6" color="textSecondary" display="inline">Загрузка статистики...</Typography>
        </Box>
      )}

      {!loadingStats && employees.length > 0 && (
        <Box>
          {employees.map(employee => {
            const avatarSrc = employee.photoBase64
              ? `data:image/jpeg;base64,${employee.photoBase64}`
              : undefined;

            // Получаем количество записей для этого мастера за выбранный период
            const bookingCount = getBookingCount(employee.id);

            return (
              <Card key={employee.id} sx={{ mb: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      alt={`${employee.name} ${employee.surname}`}
                      src={avatarSrc}
                      sx={{ width: 60, height: 60, mr: 3 }}
                    >
                        {!avatarSrc && `${employee.name[0]}${employee.surname[0]}`}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6" component="div">
                        {employee.name} {employee.surname}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Количество записей за период: <strong>{bookingCount}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

       {!loadingStats && employees.length === 0 && !loadingEmployees && (
             <Box sx={{ textAlign: 'center', mt: 4 }}>
               <Typography variant="h6" color="textSecondary">
                   Не удалось загрузить список мастеров или список пуст.
               </Typography>
            </Box>
       )}

       {!loadingStats && employees.length > 0 && (!startDate || !endDate) && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
               <Typography variant="h6" color="textSecondary">
                   Выберите диапазон дат и нажмите "Показать статистику".
               </Typography>
            </Box>
       )}

    </Container>
  );
}

export default ClientsStats;