import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Container, Grid, Paper, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Rating from "@mui/material/Rating";
import { Button } from "@mui/material";
//import axios from "axios";


const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    cursor: "pointer",
  },
  rating: {
    fontWeight: "bold",
  },
  button: {
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
    },
}));

////////////////////////////////////////
function ReviewsList({ reviews, onReviewDeleted, userRole }) {
  const classes = useStyles();
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
      const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            // Предполагается, что ID пользователя в токене хранится под ключом 'userID' или 'id'
            setLoggedInUserId(decodedToken.userID || decodedToken.id);
            } catch (error) {
            console.error("Ошибка декодирования токена:", error);
          }
        }
      }, []);

  return (
    <Container style={{width:"60%"}}>
      <Grid container spacing={3}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.reviewID}>
            <Paper className={classes.paper}>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body1" style={{ textAlign: "left" }}>
                      Оценка:
                    </Typography>
                    <Rating
                      name={`rating-${review.id}`}
                      value={review.rating}
                      readOnly
                    />
                  </Box>
                  <Typography variant="body2" style={{ textAlign: "left" }}>
                    {review.comm}
                  </Typography>
                  {/* Отображение информации о пользователе и сотруднике */}
                  {review.user && (
                    <Typography variant="body2" style={{ textAlign: "right" }}>
                      Пользователь: {review.user.name}
                    </Typography>
                  )}
                  {review.employee && (
                    <Typography variant="body2" style={{ textAlign: "left" }}>
                      Сотрудник: {review.employee.name}
                    </Typography>
                  )}
                  {
                    (loggedInUserId === review.userID || userRole === 'ADMIN') && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => {
                          console.log(`ReviewList: Button clicked for ${review.reviewID}. Calling onReviewDeleted prop.`);
                          onReviewDeleted(review.reviewID);
                        }}
                      >
                        Удалить
                      </Button>
                )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ReviewsList;
