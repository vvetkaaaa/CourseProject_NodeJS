import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Rating, Typography, Box, styled } from "@mui/material";
import { jwtDecode } from "jwt-decode";

const CustomButton = styled(Button)(({ theme }) => ({
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

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff9f9',
    '& fieldset': {
      borderColor: '#d7ccc8', // обычное состояние
    },
    '&:hover fieldset': {
      borderColor: '#a1887f', // hover состояние
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8d6e63', // focus состояние
      borderWidth: '1px',
    },
    '&.Mui-error fieldset': {
      borderColor: '#d32f2f', // error состояние
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
  '& .MuiFormHelperText-root': {
    color: '#8d6e63', // цвет подсказки
    '&.Mui-error': {
      color: '#d32f2f', // цвет текста ошибки
    },
  },
  margin: theme.spacing(1, 0),
}));

const AddReview = ({ employeeID, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const [userID, setUserID] = useState(null);

  const getUserIDFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.userID;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    } else {
      console.error("Auth token not found");
      return null;
    }
  };

  useEffect(() => {
    const userID = getUserIDFromToken();
    setUserID(userID);
  }, []);

  ///////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userID === null) {
      console.log("Error: User ID not found");
      return;
    }

    const reviewData = {
      userID,
      employeeID,
      rating,
      comm: comment,
    };

    console.log("reviewData:", reviewData);

    try {
      const response = await axios.post(
        "http://localhost:5000/rev/addreview",
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 201) {
        onReviewAdded && onReviewAdded(response.data);
        setRating(0);
        setComment("");
        window.location.reload();

        console.log("Review added successfully");
      } else {
        console.log("Error adding review");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      setError(error.response.data.message || "Ошибка добавления отзыва");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{textAlign: "right", width: "60%", marginLeft: "20%"}}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mt: 2, mb: 2}}>
      <Typography variant="h6" component="h2" style={{ color: "#5d4037" }}>
        Оставить отзыв
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mt: 3, mb: 4 }}>
        <Typography variant="body1" component="p">
          Оценка:
        </Typography>
        <Rating
          name="rating"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          precision={1}
        />
      </Box>
      </Box>
      <Box marginBottom={2} >
        <CustomTextField
          label="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
      </Box>
      {error && <Typography color="error">{error}</Typography>}

      <CustomButton type="submit" variant="contained" color="primary" style={{width:"20%"}}>
        Отправить
      </CustomButton>
    </form>
  );
};

export default AddReview;
