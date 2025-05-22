import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles, styled } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavMenu from "../components/NavMenu";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    marginRight: "5px",
    marginTop: "10px",
    marginBottom: "10px",
    backgroundColor: "#fff",
    color: "#000",
    fontSize: "12px",
    fontWeight: "500",  
    paddingRight: "16px",
    paddingLeft: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
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
  },

  button: {
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
}
}));

function SignIn({ onLoginSuccess }) {
  const classes = useStyles();
  //const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        userData
      );
      const token = response.data.token;

      console.log("User logged in successfully:", token);

      //  токен в локальное хранилище
      //localStorage.setItem("authToken", token);
      //navigate("/main");
      if (onLoginSuccess) {
        onLoginSuccess(token);
      }else {
          console.error("onLoginSuccess prop is missing in LoginForm!");
          localStorage.setItem("authToken", token);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(
          error.response.data.message || "Неизвестная ошибка при входе."
        );
      } else {
         setError("Ошибка сети или сервера.");
      }
      console.error("Error logging in user:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <NavMenu />
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Войти
        </Typography>

        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            className={classes.button}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            className={classes.button}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Войти
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/register" variant="body2" style={{color: "black"}}>
                Нет аккаунта? Зарегистрироваться
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}></Box>
    </Container>
  );
}
export default SignIn;
