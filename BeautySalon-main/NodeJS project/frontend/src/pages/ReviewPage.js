import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import ReviewList from "../components/ReviewList"; // Подкорректируйте путь к компоненту
import { Typography } from "@material-ui/core";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddReview from "../components/Review";
import NavMenu from "../components/NavMenu";
import { deleteReviewApi } from '../api/reviewApi';

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: "60px",
    marginBottom: "20px",
    color: "#5d4037",
  },
}));

function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const classes = useStyles();
  const { id } = useParams();
  const employeeID = parseInt(id, 10);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const isAuthenticated = !!localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  const loadReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/rev/getrewempl/${employeeID}`
      );

      setReviews(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке отзывов:", error);

      if (error.response && error.response.status === 403) {
        //  navigate("/login");
      } else {
        console.error("Подробное сообщение об ошибке:", error.response?.data);
      }
    }
  };

  useEffect(() => {
    loadReviews();
  }, [employeeID]);

  // const handleReviewDeleted = (deletedReviewId) => {
  //   setReviews((prevReviews) =>
  //     prevReviews.filter((review) => review.reviewID !== deletedReviewId)
  //   );
  // };

  const handleReviewDeleted = async (deletedReviewId) => {
    console.log(`ReviewPage: handleDeleteReview called for ID ${deletedReviewId}`);
     setErrorMessage(""); // Сброс предыдущей ошибки
    // Опционально: window.confirm(...)
    try {
        await deleteReviewApi(deletedReviewId); // Вызываем ту же API функцию
        // Обновляем стейт ЭТОЙ страницы
        setReviews((prevReviews) =>
            prevReviews.filter((review) => review.reviewID !== deletedReviewId)
        );
        console.log(`ReviewPage: Review ${deletedReviewId} removed from state.`);
    } catch(error) {
        console.error(`ReviewPage: Failed to delete review ${deletedReviewId}`, error);
        setErrorMessage(error.message || "Не удалось удалить отзыв."); // Показываем ошибку
    }
};

  return (
    <div>
      <NavMenu />
      {isAuthenticated && <AddReview employeeID={employeeID} />}
      <Typography variant="h4" className={classes.title}>
        Отзывы
      </Typography>{" "}
      <ReviewList reviews={reviews} onReviewDeleted={handleReviewDeleted} userRole={userRole}/>
    </div>
  );
}

export default ReviewPage;
