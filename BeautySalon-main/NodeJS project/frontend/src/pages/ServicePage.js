import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ServicesList from "../components/ServiceList";
import NavMenu from "../components/NavMenu";
import { jwtDecode } from "jwt-decode";

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(4),
  },
}));

function ServicesPage() {
  const [services, setServices] = useState([]);
  const classes = useStyles();

  const token = localStorage.getItem("authToken");
  let userRole = "USER"; // Устанавливаем значение по умолчанию

  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken && decodedToken.role) {
      userRole = decodedToken.role;
    }
  }

  useEffect(() => {
    axios
      .get("http://localhost:5000/serv/getservices")
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных об услугах:", error);
      });
  }, []);

  return (
    <Container>
      <NavMenu />
      <ServicesList services={services} userRole={userRole} />
    </Container>
  );
}

export default ServicesPage;



