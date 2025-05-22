import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  styled,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavMenu from "../components/NavMenu";
import BookCard from "../components/BookCard";
import { jwtDecode } from "jwt-decode";

const CustomButton = styled(Button)(({ theme }) => ({
  marginRight: "5px",
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

const DeleteButton = styled(Button)(({ theme }) => ({
  marginRight: "5px",
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
  border: "2px solid rgb(109, 0, 0)",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "rgb(109, 0, 0)",
    boxShadow: "none",
    border: "2px solid rgb(109, 0, 0)",
    color: "#fff"
  },

}));

function UserPage({onLogout}) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);

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

  // Функция для загрузки текущего пользователя
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/getuser", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setUser(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        email: response.data.email,
        password: "********",
      });
    } catch (error) {
      console.error("Error fetching current user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [navigate]);

  const fetchUserRegistrations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/book/getbook", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error(
        "Ошибка при получении информации о записях на услуги:",
        error
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setError("");
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateName = (name) => {
    return /^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(name);
  };

  const validatePhone = (phone) => {
    return /^\+?\d{12}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, phone, email, password } = formData;

    if (!name || !phone || !email) {
      setError("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    if (!validateName(name)) {
      setError("Имя должно содержать только буквы и пробелы.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Введите корректный email.");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Введите корректный номер телефона.");
      return;
    }

    if (password && password !== "********" && password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов.");
      return;
    }

    if (!user || !user.userID) {
      console.error("User ID is not defined.");
      return;
    }
    console.log("user.userID:", user.userID);

    const dataToSend = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
    };

    if (formData.password && formData.password !== "********") {
      dataToSend.password = formData.password;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/auth/upduser/${user.userID}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("User updated successfully:", response.data);
      fetchCurrentUser();
    } catch (error) {
      console.error("Error updating user:", error);
      setError(
        error.response?.data?.message || "Ошибка при обновлении пользователя"
      );
    }
  };

  const onCancel = async (registrationID) => {
    try {
      console.log(registrationID);
      await axios.delete(
        `http://localhost:5000/book/delbook/${registrationID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("Запись успешно отменена");
      window.location.reload();

      fetchUserRegistrations();
    } catch (error) {
      console.error("Ошибка при отмене регистрации:", error);
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("authToken");
  //   setUser(null);
  //   navigate("/main");
  // };

  const handleDeleteAccount = async () => {
    if (!user || !user.userID) {
      console.error("User ID is not defined.");
      return;
    }

    if (window.confirm("Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.")) {
      try {
        await axios.delete(`http://localhost:5000/auth/deluser/${user.userID}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        console.log("Аккаунт успешно удален");
        localStorage.removeItem("authToken");
        navigate("/main");
      } catch (error) {
        console.error("Ошибка при удалении аккаунта:", error);
        setError(error.response?.data?.message || "Ошибка при удалении аккаунта");
      }
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Typography>Ошибка загрузки данных о пользователе.</Typography>;
  }

  return (
    <Container>
      <NavMenu />
      <form onSubmit={handleSubmit} style={{width: "60%", marginLeft: "20%"}}>
        <CustomTextField
          label="Имя"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          onKeyPress={(e) => {
          const regex = /^[a-zA-Zа-яА-ЯёЁ\s]$/;
            if (!regex.test(e.key)) {
              e.preventDefault(); // блокируем ввод символа
            }
          }}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <CustomTextField
          label="Телефон"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          fullWidth
          onKeyPress={(e) => {
          const allowedChars = /^[0-9+]$/;
            if (!allowedChars.test(e.key)) {
              e.preventDefault(); // блокируем ввод недопустимых символов
            }
          }}
          margin="normal"
          variant="outlined"
        />
        <CustomTextField
          label="Email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {userRole === "USER" && (
        <CustomTextField
          label="Пароль"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          helperText="Оставьте без изменений, если не хотите менять пароль"
        />
        )}

          {error && <Typography color="error">{error}</Typography>}
        
          <CustomButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Сохранить изменения
          </CustomButton>

          <Box sx={{ display: 'flex', gap: 2}}>
            <CustomButton
              onClick={onLogout}
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
            >
              Выйти
            </CustomButton>
        
            {userRole === "USER" && (
            <DeleteButton
              onClick={handleDeleteAccount}
              fullWidth
              variant="outlined"
              color="error"
              sx={{ mt: 2}}
            >
              Удалить аккаунт
            </DeleteButton>
          )}
        </Box>
      </form>
      <BookCard registrations={registrations} onCancel={onCancel} />
    </Container>
  );
}

export default UserPage;
