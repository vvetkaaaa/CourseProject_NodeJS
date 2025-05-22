import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputLabel,
  Box,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NavMenu from "../components/NavMenu";
import EmployeeCard from "../components/EmployeeCard";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
    width: "60%",
  },
  button: {
    marginTop: "20px",
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
    },}
  }));

function BookingForm() {
  const classes = useStyles();
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [notes, setNotes] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [employeesWithSlots, setEmployeesWithSlots] = useState([]);
  const [userID, setUserID] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const getUserIDFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.userID;
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    }
    return null;
  };

  useEffect(() => {
    setUserID(getUserIDFromToken());
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/serv/getservices", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setAvailableServices(response.data || []);
      } catch (error) {
        console.error("Ошибка при загрузке списка услуг:", error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchAvailableEmployees = async () => {
      if (selectedService && selectedDate) {
        try {
          const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
          const response = await axios.get(
            `http://localhost:5000/book/availability/${selectedService}/${formattedDate}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          setEmployeesWithSlots(response.data.employees || []);
        } catch (error) {
          console.error("Ошибка при загрузке мастеров и слотов:", error);
        }
      }
    };

    fetchAvailableEmployees();
  }, [selectedService, selectedDate]);

  const handleTimeSlotClick = (time, employeeID) => {
    setSelectedTime(time);
    setSelectedEmployee(employeeID);
  };

  const handleSubmit = async () => {
    if (!userID || !selectedDate || !selectedTime || !selectedEmployee || !selectedService) {
      console.error("Все поля обязательны для заполнения.");
      setError("Все поля обязательны для заполнения.");
      return;
    }

    if (!dayjs(selectedDate).isValid()) {
      console.error("Некорректная дата.");
      return;
    }

    if (!selectedTime.match(/^\d{2}:\d{2}$/)) {
      console.error("Время начала должно быть в формате HH:mm.");
      return;
    }

    const dateValue = dayjs(selectedDate).tz("Europe/Moscow").startOf("day").valueOf();

    const data = {
      userID,
      employeeID: selectedEmployee,
      serviceID: selectedService,
      date: dateValue,
      startTime: selectedTime,
      notes,
    };

    try {
      console.log("Отправляем данные на сервер:", data);
      const response = await axios.post("http://localhost:5000/book/booking", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      console.log("Запись успешно создана:", response.data);
      navigate("/user");
    } catch (error) {
      console.error("Ошибка при создании записи:", error);
    }
  };

  return (
    <Container>
      <NavMenu />
      <Typography variant="h4" gutterBottom style={{color: "#5d4037"}}>
        Запись на услугу
      </Typography>

      <FormControl className={classes.formControl}>
        <InputLabel id="service-label">Услуги</InputLabel>
        <Select
          labelId="service-label"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <MenuItem value="">
            <em>Выберите услугу</em>
          </MenuItem>
          {availableServices.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {service.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormControl className={classes.formControl}>
          <DatePicker
            label="Дата"
            value={selectedDate}
            minDate={dayjs()}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
        </FormControl>
      </LocalizationProvider>

      <div style={{width: "60%", marginLeft: "20%"}}>
        {employeesWithSlots.map((employee) => {
          // Отфильтровываем слоты, оставляя только будущие (если выбрана сегодняшняя дата)
          const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');

          const filteredSlots = isToday
            ? employee.availableSlots.filter((slot) =>
                dayjs(slot, 'HH:mm').isAfter(dayjs())
              )
            : employee.availableSlots;

          return (
            <EmployeeCard
              key={employee.employeeID}
              employeeID={employee.employeeID}
              name={`${employee.name} ${employee.surname}`}
              timeSlots={filteredSlots}
              selectedTime={selectedTime}
              onTimeSlotClick={handleTimeSlotClick}
            />
          );
        })}
      </div>

      <Box  sx={{ display: 'flex', flexDirection: 'column', width: "60%", marginLeft: "20%"}}>
        <TextField
          label="Заметки"
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          //className={classes.formControl}
        />
      </Box>

        {error && <Typography color="error">{error}</Typography>}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={classes.button}
        >
          Записаться
        </Button>
      
    </Container>
  );
}

export default BookingForm;