import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ServiceForm from "../components/ServiceForm";
import axios from "axios";
import { Button, Typography, Box } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";
import { makeStyles } from "@material-ui/core/styles";
import mainImage from "../main-photo.jpg";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    width: "60%",
    marginLeft: "20%",
    padding: theme.spacing(4),
  },
  leftBlock: {
    flex: 1,
    padding: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
}));

function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const classes = useStyles();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userRole, setUserRole] = useState();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/serv/getservbyid/${id}`
        );
        setService(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке данных услуги:", error);
        setErrorMessage("Ошибка при загрузке данных услуги.");
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleSubmit = async (serviceData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/serv/updserv/${id}`,
        serviceData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("Услуга успешно изменена:", response.data);
      navigate("/categories");
    } catch (error) {
      console.error("Ошибка при изменении услуги:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при изменении услуги."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/serv/delserv/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log(`Услуга с id ${id} успешно удалена.`);
      navigate("/categories");
    } catch (error) {
      console.error("Ошибка при удалении услуги:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при удалении услуги."
      );
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!service) return <div>Услуга не найдена</div>;

  return (
    <>
      <UserRoleCheck userRole={userRole} />
      <NavMenu />
        <Box className={classes.container}>
        <div className={classes.leftBlock}>
          <Typography variant="h5" gutterBottom style={{color: "#5d4037"}}>
            Редактирование услуги
          </Typography>
          <ServiceForm
            initialName={service.name}
            initialDescription={service.description}
            initialPrice={service.price}
            initialCategory={service.category}
            initialDuration={service.duration}
            mode="edit"
            onSubmit={handleSubmit}
          />
          <Button
            variant="contained"
            color="secondary"
            style={{ marginTop: "20px", height: "40px", borderRadius: "24px", fontSize: "12px", padding: "0px 22px", width:"auto"}}
            onClick={handleDelete}
          >
            Удалить услугу
          </Button>
          {errorMessage && (
            <Typography color="error" gutterBottom>
              {errorMessage}
            </Typography>
          )}
        </div>
      </Box>
    </>
  );
}

export default EditService;

