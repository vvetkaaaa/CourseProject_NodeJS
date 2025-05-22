import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Grid,
} from "@material-ui/core";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: "rgba(239, 239, 239, 0.8)",
    width: "100%",
    height: "80px",
    //marginTop: "10px",
    //marginRight: "140px",
    display: "flex",
    justifyContent: "center",
    color: "#1E1E1E",
    boxShadow: "none",
    //borderRadius: "24px",
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
    color: "#1E1E1E",
    textDecoration: "none",
  },
  button: {
    color: "#1E1E1E",
  },
  sectionContainer: {
    marginTop: theme.spacing(8), // Установить отступ от верхнего меню
    backgroundColor: "#ffffff", // Белый фон
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    marginLeft: theme.spacing(15),
  },
  link: {
    color: "#000000",
    textDecoration: "none",
    marginRight: theme.spacing(28),
  },
}));

const socket = io.connect("http://localhost:5000");

socket.on("message", (data) => {
  console.log("Получено сообщение от сервера:", data);
  alert(data);
});

const sendMessage = () => {
  console.log("Отправлено сообщение на сервер:", "message");
  socket.emit("message", "message");
};

export default function NavMenu({ sections = [], buttonPath, buttonText }) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const classes = useStyles();

  useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setUserRole(decodedToken?.role);
        } catch (error) {
          console.error("Ошибка декодирования токена:", error);
        }
      }
    }, []);
  // const { nav } = props;
  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Container fixed>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <Link to="/main" className={classes.title}>
                <img
                  src="/images/logo.png"
                  alt="Салон красоты"
                  style={{ height: "70px", objectFit: "contain", marginLeft: "60px" }}
                />
              </Link>
            </Typography>

            {userRole === "ADMIN" && (
              <Link to="/shedule" className={classes.button}>
                    <Button color="inherit"> {/* Используем Button для стилизации */}
                        Расписание мастеров
                    </Button>
              </Link>
            )}

            <Box>
              <Link to={buttonPath}>
                <Button color="inherit" className={classes.button}>
                  {buttonText}
                </Button>
              </Link>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Разделы под навигационным меню */}
      <Box className={classes.sectionContainer}>
        <Container>
          <Grid container spacing={2}>
            {sections.map((section) => (
              <Grid item key={section.title}>
                <Link to={section.url} className={classes.link}>
                  {section.title}
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </div>
  );
}