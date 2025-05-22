import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import ReviewsList from "../components/ReviewList";
import { Typography, Button,CircularProgress, Box, Divider } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";
import { makeStyles } from "@material-ui/core/styles";
import DateTimePicker from "../components/DateTimePicker";
import { deleteReviewApi } from '../api/reviewApi';
import dayjs from "dayjs";

const useStyles = makeStyles((theme) => ({
    delButton:{
    marginRight: "5px",
    marginTop: "10px",
    backgroundColor: "#fff",
    color: "#000",
    fontSize: "12px",
    fontWeight: "500",
    justifyContent: "center",
    paddingRight: "22px",
    paddingLeft: "22px",
    paddingTop: "8px",
    paddingBottom: "8px",
    width: "auto",
    height: "auto",
    borderRadius: "24px",
    border: "2px solid #1E1E1E",
    boxShadow: "none",
    "&:hover": {
        backgroundColor: "#1E1E1E",
        boxShadow: "none",
        border: "2px solid #1E1E1E",
        color: "#fff"
    },
}
}));

function EditEmployeePage() {
  const { id } = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [employeeReviews, setEmployeeReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // Состояние для ошибок
  const [userRole, setUserRole] = useState();
  const [employeeSchedule, setEmployeeSchedule] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  useEffect(() => {
    // Загрузка данных о сотруднике для редактирования
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/empl/getemplbyid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        console.log(response.data);

        setInitialData(response.data);

        try {
          const scheduleResponse = await axios.get(
            `http://localhost:5000/empl/getavailabledates/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          console.log("Employee Schedule:", scheduleResponse.data);
          setEmployeeSchedule(scheduleResponse.data.dates || []);
        } catch (scheduleFetchError) {
          console.error("Ошибка при загрузке расписания:", scheduleFetchError);
        }

        setLoading(false);
      
        try {
          const reviewsResponse = await axios.get(
            `http://localhost:5000/rev/getrewempl/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          console.log("Employee Reviews:", reviewsResponse.data);
          setEmployeeReviews(reviewsResponse.data || []); // Ensure it's an array
        } 
        catch (reviewFetchError) {
          console.error("Ошибка при загрузке отзывов:", reviewFetchError);
          setReviewsError("Не удалось загрузить отзывы для этого сотрудника.");
        } 
        finally {
           setReviewsLoading(false); // Reviews loading finished (success or fail)
        }
      
      } catch (error) {
        console.error("Ошибка при загрузке данных о сотруднике:", error);
        setErrorMessage("Ошибка при загрузке данных о сотруднике.");

        navigate("/error"); // Укажите нужный маршрут в случае ошибки
      }
    };

    fetchEmployeeData();
  }, [id, navigate]);

  // Обработка отправки формы
  const handleUpdateEmployee = async (employeeData) => {
    try {
      //console.log("qqqqqq " + id);
      //console.log(employeeData);
      const response = await axios.put(
        `http://localhost:5000/empl/updempl/${id}`,
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("Сотрудник успешно обновлен:", response.data);
      navigate("/employees"); // Укажите нужный маршрут после успешного обновления
    } catch (error) {
      console.error("Ошибка при обновлении сотрудника:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при обновлении сотрудника."
      );
    }
  };

  // Обработка удаления сотрудника
  const handleDeleteEmployee = async () => {
    try {
      // Отправка запроса на удаление сотрудника
      await axios.delete(`http://localhost:5000/empl/delempl/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("Сотрудник успешно удален");
      // Успешное удаление, перенаправляем на страницу сотрудников
      navigate("/employees");
    } catch (error) {
      console.error("Ошибка при удалении сотрудника:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при удалении сотрудника."
      );
    }
  };

  const handleDeleteReview = async (reviewId) => {
    console.log(`EditEmployeePage: handleDeleteReview called for ID ${reviewId}`);
    // Опционально: window.confirm(...)
    try {
      await deleteReviewApi(reviewId); // Вызываем API функцию
      // Обновляем стейт этой страницы
      setEmployeeReviews(prevReviews => {
          const newReviews = prevReviews.filter(review => review.reviewID !== reviewId);
          return newReviews;
      });
      setErrorMessage(""); // Сбрасываем ошибку
      console.log(`EditEmployeePage: Review ${reviewId} removed from state.`);
    } catch (error) {
      console.error(`EditEmployeePage: Failed to delete review ${reviewId}`, error);
      setErrorMessage(error.message || "Не удалось удалить отзыв.");
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      <UserRoleCheck userRole={userRole} />
          <NavMenu />
      <Typography variant="h4" style={{textAlign: "left", paddingLeft: "60px", color: "#5d4037"}} gutterBottom>
        Редактирование сотрудника
      </Typography>
      <EmployeeForm
        initialData={initialData}
        onSubmit={handleUpdateEmployee}
        mode="edit"
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={handleDeleteEmployee}
        //className={classes.delButton}
        style={{ marginTop: "20px", height: "40px", borderRadius: "24px", fontSize: "12px", padding: "0px 22px", width:"auto"}}
      >
        Удалить сотрудника
      </Button>
      {errorMessage && (
        <Typography color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}

      <Typography variant="h5" gutterBottom style={{textAlign: "left", marginTop: "40px", paddingLeft: "40px", color: "#5d4037"}}>
              Отзывы о сотруднике
            </Typography>
            {reviewsLoading ? (
              <Box display="flex" alignItems="center">
                  <CircularProgress size={24} />
                  <Typography style={{ marginLeft: '1rem' }}>Загрузка отзывов...</Typography>
              </Box>
            ) : reviewsError ? (
              <Typography color="error">{reviewsError}</Typography>
            ) : employeeReviews.length > 0 ? (
              <ReviewsList
                reviews={employeeReviews}
                onReviewDeleted={handleDeleteReview}
                userRole={userRole}
              />
            ) : (
              <Typography style={{color: "#666"}}>Отзывов для этого сотрудника пока нет.</Typography>
        )}
    </>
  );
}

export default EditEmployeePage;
