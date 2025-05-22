import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography } from "@material-ui/core";
import EmployeeList from "../components/EmployeeList";
import { makeStyles } from "@material-ui/core/styles";
import { jwtDecode } from "jwt-decode";
import NavMenu from "../components/NavMenu";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  employeeName: {
    textDecoration: "none",
    color: "inherit",
  },
}));

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const classes = useStyles();
  const navigate = useNavigate();
  const [averageRatings, setAverageRatings] = useState({});

  const token = localStorage.getItem("authToken");
  let userRole = "USER";

  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken && decodedToken.role) {
      userRole = decodedToken.role;
    }
  }

  useEffect(() => {
    axios
      .get("http://localhost:5000/empl/getempl")
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных о сотрудниках:", error);
      });
  }, []);

  useEffect(() => {
    const fetchAverageRatings = async () => {
      try {
        const ratings = {};
        for (const employee of employees) {
          const response = await axios.get(
            `http://localhost:5000/rev/getrating/${employee.id}`
          );
          ratings[employee.id] = response.data.averageRating;
        }
        setAverageRatings(ratings);
      } catch (error) {
        console.error(
          "Ошибка при получении среднего рейтинга для сотрудников:",
          error
        );
      }
    };

    fetchAverageRatings();
  }, [employees]);

  return (
    <Container>
      <NavMenu />
      <EmployeeList
          employees={employees}
          userRole={userRole}
          averageRatings={averageRatings}
        />
    </Container>
  );
}

export default EmployeesPage;
