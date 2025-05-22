import React, { useState } from "react";
import {
  LocalizationProvider,
  DatePicker,
  TimeField,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, TextField } from "@mui/material";
import dayjs from 'dayjs';
import { useEffect } from "react";

function DateTimePicker({ index, onUpdateSchedule, initialDate, initialStartTime, initialEndTime }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || null);
  const [selectedStartTime, setSelectedStartTime] = useState(initialStartTime || null);
  const [selectedEndTime, setSelectedEndTime] = useState(initialEndTime || null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setErrorMessage("");
    onUpdateSchedule(index, "date", newDate);
  };

  const handleStartTimeChange = (newTime) => {
    if (selectedEndTime && newTime.isAfter(selectedEndTime)) {
      setErrorMessage("Start time cannot be after end time.");
    }
    setErrorMessage("");
    setSelectedStartTime(newTime);
    onUpdateSchedule(index, "startTime", newTime);
  };

  const handleEndTimeChange = (newTime) => {
    if (selectedStartTime && newTime.isBefore(selectedStartTime)) {
      setErrorMessage("Время окончания не может быть раньше времени начала.");
      return;
    }
    setErrorMessage("");
    setSelectedEndTime(newTime);
    onUpdateSchedule(index, "endTime", newTime);
  };

  useEffect(() => {
  setSelectedDate(initialDate || null);
  }, [initialDate]);

  useEffect(() => {
    setSelectedStartTime(initialStartTime || null);
  }, [initialStartTime]);

  useEffect(() => {
    setSelectedEndTime(initialEndTime || null);
  }, [initialEndTime]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <DatePicker
            label="Выберите день"
            value={selectedDate}
            onChange={handleDateChange}
            minDate={dayjs()}
            renderInput={(props) => <TextField {...props} />}
          />
        </Grid>

        <Grid item xs={4}>
          <TimeField
            label="Время начала"
            value={selectedStartTime}
            format="HH:mm"
            onChange={handleStartTimeChange}
          />
        </Grid>

        <Grid item xs={4}>
          <TimeField
            label="Время окончания"
            value={selectedEndTime}
            format="HH:mm"
            onChange={handleEndTimeChange}
          />
        </Grid>

        <p fullWidth style={{color: "red"}} >{errorMessage}</p>

      </Grid>
    </LocalizationProvider>
  );
}

export default DateTimePicker;

