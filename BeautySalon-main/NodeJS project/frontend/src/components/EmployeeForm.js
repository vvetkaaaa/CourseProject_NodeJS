import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Box,
    Avatar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DateTimePicker from "./DateTimePicker";
import axios from "axios";
import dayjs from 'dayjs';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#fff9f9',
      '& fieldset': {
        borderColor: '#d7ccc8',
      },
      '&:hover fieldset': {
        borderColor: '#a1887f',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#8d6e63', // focus состояние
        borderWidth: '1px',
      },
    },
     '& .MuiInputLabel-root': {
      color: '#8d6e63', // цвет лейбла
      '&.Mui-focused': {
        color: '#5d4037', // цвет лейбла в фокусе
      },
      '&.Mui-error': {
        color: '#d32f2f', // цвет лейбла при ошибке
      },
    },
  },
  selectControl: {
    marginTop: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#fff9f9',
      '& fieldset': {
        borderColor: '#d7ccc8',
      },
      '&:hover fieldset': {
        borderColor: '#a1887f',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#8d6e63',
        borderWidth: '1px',
      },
    },
     '& .MuiInputLabel-root': {
      color: '#8d6e63', // цвет лейбла
      '&.Mui-focused': {
        color: '#5d4037', // цвет лейбла в фокусе
      },
      '&.Mui-error': {
        color: '#d32f2f', // цвет лейбла при ошибке
      },
    },
  },
  button: {
    marginTop: theme.spacing(3),
    borderRadius: '24px',
    padding: '8px 24px',
  },
  container: {
    display: 'flex',
    gap: theme.spacing(4),
    flexWrap: 'wrap',
    height: 'auto',
    padding: theme.spacing(4),
    backgroundColor: '#fafafa',
  },
  leftBlock: {
    flex: 1,
    minWidth: '300px',
    padding: theme.spacing(4),
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #f5e9e9',
  },
  rightBlock: {
    flex: 1,
    minWidth: '300px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #f5e9e9',
  },
  avatar: {
    width: '100%',
    height: '300px',
    marginBottom: theme.spacing(3),
    borderRadius: '16px',
    objectFit: 'cover',
    border: '1px solid #f5e9e9',
  },
  addButton: {
    backgroundColor: '#f5e9e9',
    color: '#5d4037',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 24px',
    borderRadius: '24px',
    border: '1px solid #d7ccc8',
    boxShadow: 'none',
    marginRight: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#e8d5d5',
      color: '#3e2723',
    },
  },
  delButton: {
    backgroundColor: '#f5e9e9',
    color: '#5d4037',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 24px',
    borderRadius: '24px',
    border: '1px solid #d7ccc8',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#e8d5d5',
      color: '#3e2723',
    },
  },
  photoInput: {
    display: 'none',
  },
  photoInputLabel: {
    display: 'inline-block',
    backgroundColor: '#f5e9e9',
    color: '#5d4037',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'center',
    padding: '8px 24px',
    borderRadius: '24px',
    border: '1px solid #d7ccc8',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#e8d5d5',
      color: '#3e2723',
    },
    marginBottom: theme.spacing(2),
  },
  photoFileName: {
    color: '#8d6e63',
    fontSize: '12px',
    marginTop: theme.spacing(1),
  },
  scheduleContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: '#fff9f9',
    borderRadius: '12px',
    border: '1px solid #f5e9e9',
  },
  errorText: {
    color: '#d32f2f',
    marginTop: theme.spacing(1),
  },
}));

function EmployeeForm({ initialData = {}, mode = "add", onSubmit }) {
    const classes = useStyles();
    console.log(initialData);

    const [name, setName] = useState(initialData.name || "");
    const [surname, setSurname] = useState(initialData.surname || "");
    const [email, setEmail] = useState(initialData.email || "");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(
        initialData.photoBase64
            ? `data:image/*;base64,${initialData.photoBase64}`
            : initialData.photo 
            ? initialData.photo
            : null
    );
    const [photoUrlToSend, setPhotoUrlToSend] = useState(initialData.photoBase64 || initialData.photo || null);    const [selectedServiceCategories, setSelectedServiceCategories] = useState(initialData.serviceCategories?.map(sc => sc.categoryID) || []);
    const [selectedServices, setSelectedServices] = useState(
        initialData.services?.map(s => s.serviceID) ||
        []);
    const [schedules, setSchedules] = useState(() => {
        if (mode === "edit" && initialData.availability?.length > 0) {
            const futureAvailability = initialData.availability.filter(item => {
                if (!item.date) return false;
                return dayjs(item.date).isAfter(dayjs().startOf('day'));
            }).map(item => ({ 
                 date: dayjs(item.date),
                 startTime: dayjs(item.startTime),
                 endTime: dayjs(item.endTime),
            }));
             // Если после фильтрации остались записи, используем их, иначе добавляем пустую
            return futureAvailability.length > 0 ? futureAvailability : [{ date: "", startTime: "", endTime: "" }];
        } else {
             // В режиме добавления или если нет исходного расписания, добавляем одно пустое
            return [{ date: "", startTime: "", endTime: "" }];
        }
    });
    const [availableServiceCategories, setAvailableServiceCategories] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [selectedServiceValue, setSelectedServiceValue] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Загружаем категории
                const serviceCategoriesResponse = await axios.get(
                    "http://localhost:5000/serv/categories"
                );
                setAvailableServiceCategories(serviceCategoriesResponse.data);

                let allRelevantServices = [];

                if (mode === "edit") {
                    // В режиме редактирования:
                    let servicesFromCategories = [];
                    if (initialData.serviceCategories && initialData.serviceCategories.length > 0) {
                        const initialCategoryIDs = initialData.serviceCategories.map(sc => sc.categoryID);
                        const servicesResponse = await axios.get(
                            `http://localhost:5000/serv/serviceByCategory?categoryIDs=${initialCategoryIDs.join(',')}`
                        );
                        servicesFromCategories = servicesResponse.data.map(s => ({ ...s, serviceID: s.id }));
                    }

                    const servicesFromInitialData = initialData.services || [];
                    allRelevantServices = [...servicesFromCategories];
                    servicesFromInitialData.forEach(service => {
                        if (service.serviceID !== undefined && !allRelevantServices.some(s => s.serviceID === service.serviceID)) {
                            allRelevantServices.push(service);
                        } else if (service.serviceID === undefined) {
                            console.warn("Initial employee service object missing 'id' property:", service);
                        }
                    });

                    setAvailableServices(allRelevantServices);

                    if (initialData.serviceCategories) {
                        setSelectedServiceCategories(initialData.serviceCategories.map(sc => sc.categoryID));
                    }
                    if (initialData.services) {
                        setSelectedServices(initialData.services.map(s => s.serviceID));
                    }
                    if (initialData.photoBase64) {
                      setPhotoPreviewUrl(`data:image/*;base64,${initialData.photoBase64}`);
                      setPhotoUrlToSend(initialData.photoBase64);
                    } else if (initialData.photo) {
                      setPhotoPreviewUrl(initialData.photo);
                      setPhotoUrlToSend(initialData.photo);
                    }
                } else {
                    setAvailableServices([]);
                    setPhotoPreviewUrl(null);
                     setPhotoFile(null);
                     setPhotoUrlToSend(null);
                }

            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                setError("Ошибка при загрузке данных.");
            }
        };
        fetchInitialData();
    }, [mode, initialData.serviceCategories, initialData.services, initialData.photo]);


    useEffect(() => {
        const fetchServicesByCategory = async () => {
            if (selectedServiceCategories.length > 0) {
                try {
                    const response = await axios.get(
                        `http://localhost:5000/serv/serviceByCategory?categoryIDs=${selectedServiceCategories.join(',')}`
                    );
                    const normalizedServices = response.data.map(s => ({ ...s, serviceID: s.id }));
                    setAvailableServices(normalizedServices);
                } catch (error) {
                    console.error("Ошибка при загрузке услуг по категориям:", error);
                    setError("Ошибка при загрузке услуг.");
                }
            } else {
                setAvailableServices([]);
            }
        };

        fetchServicesByCategory();
    }, [selectedServiceCategories]);

    const handleDelete = async () => {
        try {
            const response = await axios.delete(
            `http://localhost:5000/empl/delshedule/${initialData.employeeID}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`
                }
            }
            );
            setSchedules([{ date: "", startTime: "", endTime: "" }]);
        } catch (error) {
            console.error("Ошибка при удалении расписания:", error);
            alert("Не удалось удалить расписание.");
        }
    };

    const handleServiceChange = (e) => {
        const value = e.target.value;
        setSelectedServices(value);

        const selectedNames = availableServices
            .filter((service) => value.includes(service.serviceID))
            .map((service) => service.name);

        setSelectedServiceValue(selectedNames);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoUrlToSend(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            //setPhotoUrlToSend(file);
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Введите корректный email.");
      return;
    }

    if (!name || !surname || !email) {
        setError("Заполните все обязательные поля.");
        return;
    }

    if (mode === "add" && !photoFile) {
        setError("Пожалуйста, выберите фотографию.");
        return;
    }


    const validSchedules = schedules.filter(item => item.date && item.startTime && item.endTime);

    for (let i = 0; i < schedules.length; i++) {
        const { date, startTime, endTime } = schedules[i];

        // Пропускаем пустые строки
        if (!date && !startTime && !endTime) continue;

        if (!date || !startTime || !endTime) {
            setError(`Заполните дату и время в расписании или оставьте все поля пустыми.`);
            return;
        }

        const start = dayjs(startTime);
        const end = dayjs(endTime);

        if (!start.isValid() || !end.isValid()) {
            setError(`Некорректное время в расписании.`);
            return;
        }

        if (!start.isBefore(end)) {
            setError(`Начальное время должно быть раньше конечного.`);
            return;
        }
    }


    const schedulesByDate = validSchedules.reduce((acc, schedule) => {
        const dateKey = dayjs(schedule.date).format('YYYY-MM-DD');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        // Normalize time to the date of the schedule for comparison
        const startTimeWithDate = dayjs(schedule.date).hour(dayjs(schedule.startTime).hour()).minute(dayjs(schedule.startTime).minute());
        const endTimeWithDate = dayjs(schedule.date).hour(dayjs(schedule.endTime).hour()).minute(dayjs(schedule.endTime).minute());

        acc[dateKey].push({
            ...schedule,
            startTime: startTimeWithDate,
            endTime: endTimeWithDate,
        });
        return acc;
    }, {});

    for (const date in schedulesByDate) {
        const dailySchedules = schedulesByDate[date];

        const today = dayjs().startOf('day');
        const currentScheduleDate = dayjs(date).startOf('day');

        if (currentScheduleDate.isSame(today)) {
            setError(`Нельзя добавить расписание на сегодняшнюю дату (${today.format('YYYY-MM-DD')}).`);
            return;
        }

        // Check for duplicates on the same day
        const scheduleStrings = dailySchedules.map(s => `${s.startTime.format('HH:mm')}-${s.endTime.format('HH:mm')}`);
        const uniqueScheduleStrings = new Set(scheduleStrings);
        if (uniqueScheduleStrings.size !== scheduleStrings.length) {
            setError(`На дату ${dayjs(date).format('YYYY-MM-DD')} добавлено одинаковое время расписания.`);
            return;
        }

        // Check for overlapping times on the same day
        dailySchedules.sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());

        for (let i = 0; i < dailySchedules.length - 1; i++) {
            const currentSchedule = dailySchedules[i];
            const nextSchedule = dailySchedules[i + 1];

            // Overlap occurs if the start of the next schedule is before the end of the current schedule
            if (nextSchedule.startTime.isBefore(currentSchedule.endTime)) {
                setError(`Расписание на дату ${dayjs(date).format('YYYY-MM-DD')} пересекается во времени.`);
                return;
            }
        }
    }


    const formData = new FormData();
    formData.append("name", name);
    formData.append("surname", surname);
    formData.append("email", email);

    if (photoFile) {
        formData.append("photo", photoFile);
    } else if (photoUrlToSend && typeof photoUrlToSend === 'string') {
        formData.append("photo", photoUrlToSend);
    }



    formData.append("serviceCategories", JSON.stringify(selectedServiceCategories));
    formData.append("services", JSON.stringify(selectedServices));

    const availabilitiesToSend = schedules
    .filter(item => {
        if (!item.date || !item.startTime || !item.endTime) return false;
             const date = dayjs(item.date);
             const start = dayjs(item.startTime);
             const end = dayjs(item.endTime);
             const endTimeWithDate = date.hour(end.hour()).minute(end.minute());
             return date.isValid() && start.isValid() && end.isValid() && endTimeWithDate.isAfter(dayjs());
            })
            .map(scheduleItem => {
            const date = dayjs(scheduleItem.date);
            const start = dayjs(scheduleItem.startTime);
            const end = dayjs(scheduleItem.endTime);

            if (!date.isValid() || !start.isValid() || !end.isValid()) {
            throw new Error("Некорректная дата или время в расписании.");
            }

            const startTime = date
            .hour(start.hour())
            .minute(start.minute())
            .second(0)
            .millisecond(0)
            .toISOString();

            const endTime = date
            .hour(end.hour())
            .minute(end.minute())
            .second(0)
            .millisecond(0)
            .toISOString();

            return {
            date: date.toISOString(),
            startTime,
            endTime,
            };
        });

    if (availabilitiesToSend.length > 0) {
        formData.append("availabilities", JSON.stringify(availabilitiesToSend));
    }

    try {
        await onSubmit(formData, mode);
        setError("");
    } catch (error) {
        console.error("Ошибка при обработке формы:", error);
        setError(error.response?.data?.message || "Ошибка при обработке формы");
    }
};

    const handleServiceCategoryChange = (e) => {
        setSelectedServiceCategories(e.target.value);
        setSelectedServices([]);
    };


    const handleAddSchedule = () => {
        setSchedules([...schedules, { date: "", startTime: "", endTime: "" }]);
    };

    const handleScheduleChange = (index, field, value) => {
        const updatedSchedules = [...schedules];
        updatedSchedules[index][field] = value;
        setSchedules(updatedSchedules);
    };

    return (
        <form onSubmit={handleSubmit}>
        <Box className={classes.container}>
            <div className={classes.leftBlock}>
            <TextField
                variant="outlined"
                fullWidth
                label="Имя"
                value={name}
                onKeyPress={(e) => {
                const regex = /^[a-zA-Zа-яА-ЯёЁ\s]$/;
                    if (!regex.test(e.key)) {
                    e.preventDefault(); // блокируем ввод символа
                    }
                }}
                onChange={(e) => setName(e.target.value)}
                className={classes.formControl}
                required
            />
            <TextField
                variant="outlined"
                fullWidth
                label="Фамилия"
                value={surname}
                onKeyPress={(e) => {
                const regex = /^[a-zA-Zа-яА-ЯёЁ\s]$/;
                    if (!regex.test(e.key)) {
                    e.preventDefault(); // блокируем ввод символа
                    }
                }}
                onChange={(e) => setSurname(e.target.value)}
                className={classes.formControl}
                required
            />
            <TextField
                variant="outlined"
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={classes.formControl}
                required
            />

            <FormControl fullWidth className={classes.selectControl}>
                <InputLabel id="service-categories-label">Сферы услуг</InputLabel>
                <Select
                    labelId="service-categories-label"
                    multiple
                    value={selectedServiceCategories}
                    onChange={handleServiceCategoryChange}
                    renderValue={(selected) =>
                        selected
                            .map((categoryId) => {
                                const category = availableServiceCategories.find((sc) => sc.categoryID === categoryId);
                                return category ? category.name : "";
                            })
                            .filter(Boolean)
                            .join(", ")
                    }
                    style={{textAlign: "left", paddingLeft: "10px"}}
                >
                    {availableServiceCategories.map((category) => (
                        <MenuItem key={category.categoryID} value={category.categoryID}>
                            {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth className={classes.formControl}>
                <InputLabel id="services-label">Услуги</InputLabel>
                <Select
                    labelId="services-label"
                    multiple
                    value={selectedServices}
                    onChange={handleServiceChange}
                    renderValue={(selected) =>
                        selected
                            .map((serviceId) => {
                                const service = availableServices.find((s) => s.serviceID === serviceId);
                                console.log("Выбранная услуга serviceID:", service?.serviceID, "name:", service?.name);
                                return service ? service.name : "";
                            })
                            .filter(Boolean)
                            .join(", ")
                    }
                    style={{textAlign: "left", paddingLeft: "10px"}}
                >
                    {availableServices.map((service) => (
                        <MenuItem key={service.serviceID} value={service.serviceID}>
                            {service.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {schedules.map((schedule, index) => (
                <div key={index} style={{marginTop: "20px"}}>
                    <DateTimePicker
                        index={index}
                        initialDate={schedule.date}
                        initialStartTime={schedule.startTime}
                        initialEndTime={schedule.endTime}
                        onUpdateSchedule={handleScheduleChange}
                    />
                </div>
            ))}

            <div style={{ display: "flex", justifyContent: "right", alignItems: "center", height: "36px", width: "100%", margin:"20px 10px", padding:"0px" }}>
                <Button
                    variant="contained"
                    color="black"
                    onClick={handleAddSchedule}
                    className={classes.addButton}
                >
                    Добавить расписание
                </Button>

                <Button
                    variant="outlined"
                    color="black"   
                    onClick={handleDelete}
                    className={classes.delButton}
                >
                    Удалить расписание
                </Button>
            <div/>
            </div>
                {error && <Typography color="error">{error}</Typography>}
            </div>

            <div className={classes.rightBlock}>
                {photoPreviewUrl && (
                    <div className={classes.avatar}
                    style={{
                        backgroundImage: `url(${photoPreviewUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        }}
                    alt="Превью фото"/>
                )}

                <div className={classes.photoInputContainer}>
                    <input
                        type="file"
                        accept="image/*"
                        className={classes.photoInput}
                        onChange={handlePhotoChange}
                        id="photo-upload"
                    />

                    <label htmlFor="photo-upload" className={classes.photoInputLabel}>
                        {/* Текст на кнопке зависит от режима */}
                        {mode === 'add' ? 'Выбрать фото' : 'Изменить фото'}
                    </label>

                    {photoFile && (
                        <Typography variant="body2" className={classes.photoFileName}>
                            Выбран файл: {photoFile.name}
                        </Typography>
                    )}
                </div>
            </div>
          </Box>

            <Button
                variant="contained"
                color="primary"
                type="submit"
                className={classes.addButton}
            >
                {mode === "add" ? "Добавить сотрудника" : "Изменить сотрудника"}
            </Button>
        </form>
    );
}

export default EmployeeForm;