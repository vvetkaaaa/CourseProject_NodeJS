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

function ClientBookingsCard({ registrations, onCancel }) {
  return (
    <Box sx={{ mt: 3 }}>
      {registrations.map((registration, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                {/* Услуга и мастер слева */}
                <Typography style={{textAlign: "left"}}>
                  <strong>Услуга:</strong> {registration.service}
                </Typography>
                <Typography style={{textAlign: "left"}}>
                  <strong>Клиент:</strong> {registration.clientName}
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

ClientBookingsCard.propTypes = {
  registrations: PropTypes.arrayOf(
    PropTypes.shape({
      registrationID: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      service: PropTypes.string.isRequired,
      clientName: PropTypes.string.isRequired,
    })
  ).isRequired,
  onCancel: PropTypes.func.isRequired, // Пропс для функции отмены услуги
};

export default ClientBookingsCard;
