import React from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavMenu from "../components/NavMenu";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(3),
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
  marginTop: "10px",
},
}));

function SignUp() {
  const classes = useStyles();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвратить перезагрузку страницы

    const userData = {
      name: name,
      phone: phone,
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/registration",
        userData
      );
      console.log("User registered successfully:", response.data);
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data) {
        setError(
          error.response.data.message || "Неизвестная ошибка при регистрации."
        );
      }
      console.error("Неизвестная ошибка при регистрации:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <NavMenu />
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Регистрация
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Имя"
                name="name"
                autoComplete="given-name"
                autoFocus
                value={name}
                className={classes.button}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="phone"
                label="Номер телефона"
                name="phone"
                autoComplete="phone"
                value={phone}
                className={classes.button}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                className={classes.button}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
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
            </Grid>
            <Grid item xs={12}></Grid>
          </Grid>
          {/* Отображение ошибки */}
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
            Зарегистрироваться
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2" style={{color: "black"}}>
                Уже есть аккаунт?
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}></Box>
    </Container>
  );
}
export default SignUp;
