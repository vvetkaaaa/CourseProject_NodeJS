import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from "@mui/material";

function BookCard({ registrations, onCancel }) {
  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom style={{textAlign: "Center", color: "#5d4037"}}>
        Ваши записи
      </Typography>
      {registrations.length === 0 ? (
        <Typography sx={{ mt: 2, textAlign: "center", color: "#666" }}>
          На данный момент записей нет
        </Typography>
      ) : (
      registrations.map((registration, index) => (
        <Card key={index} sx={{ mb: 2, width: "60%", ml: "20%" }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                {/* Услуга и мастер слева */}
                <Typography style={{textAlign: "left"}}>
                  <strong>Услуга:</strong> {registration.service}
                </Typography>
                <Typography style={{textAlign: "left"}}>
                  <strong>Мастер:</strong> {registration.employee}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: "right" }}>
                {/* Дата, время и кнопка отмены справа */}
                <Typography style={{textAlign: "right"}}>
                  <strong>Дата:</strong> {registration.date}
                </Typography>
                <Typography>
                  <strong>Время:</strong> {registration.time}
                </Typography>
                {/* Кнопка отмены */}
                <Button
                  variant="outlined"
                  style={{ color: "#FF006E", borderColor: "#FF006E" }}
                  onClick={() => onCancel(registration.registrationID)}
                  sx={{ mt: 1 }}
                >
                  Отменить
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )))}
    </Box>
  );
}

BookCard.propTypes = {
  registrations: PropTypes.arrayOf(
    PropTypes.shape({
      registrationID: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      service: PropTypes.string.isRequired,
      employee: PropTypes.string.isRequired,
    })
  ).isRequired,
  onCancel: PropTypes.func.isRequired, // Пропс для функции отмены услуги
};

export default BookCard;
