import React, { useState, useEffect } from "react";
import ServiceForm from "../components/ServiceForm";
import axios from "axios";
import { Typography, Box } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";
import { makeStyles } from "@material-ui/core/styles";
import mainImage from "../main-photo.jpg"; // замените на актуальный путь

const useStyles = makeStyles((theme) => ({
  container: {
    width: "60%",
    marginLeft: "20%",
    display: "flex",
    padding: theme.spacing(4),
  },
  leftBlock: {
    flex: 1,
    padding: theme.spacing(3),
    height: "auto",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
}));

function AddService() {
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState();
  const navigate = useNavigate();
  const classes = useStyles();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  const handleSubmit = async (serviceData, mode) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/serv/addservice",
        serviceData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("Услуга успешно добавлена:", response.data.newService);
      navigate("/categories");
      setError("");
    } catch (error) {
      console.error("Ошибка при добавлении услуги:", error);
      setError(error.response?.data?.message || "Ошибка при добавлении услуги.");
    }
  };

  return (
    <>
      <UserRoleCheck userRole={userRole} />
      <NavMenu/>
      <Box className={classes.container}>
        <div className={classes.leftBlock}>
          <Typography variant="h5" gutterBottom style={{color: "#5d4037"}}>
            Добавить новую услугу
          </Typography>
          <ServiceForm
            initialName=""
            initialDescription=""
            initialPrice={0}
            mode="add"
            onSubmit={handleSubmit}
          />
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
        </div>
        {/* <div className={classes.rightBlock}>
          <img src={mainImage} alt="Салон красоты" className={classes.image} />
        </div> */}
      </Box>
    </>
  );
}

export default AddService;

