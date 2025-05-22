import React, { useState, useEffect } from "react";
import "./App.css";
import RegistrationForm from "../src/pages/Registr";
import LoginForm from "../src/pages/Login";
import ServicesPage from "../src/pages/ServicePage";
import { Container } from "@material-ui/core";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
//import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import EmployeePage from "./pages/EmployeePage";
import EditService from "./pages/EditService";
import EditEmployee from "./pages/EditEmployee";
import ReviewPage from "./pages/ReviewPage";
import BookingForm from "./pages/BookForm";
import AddEmployee from "./pages/AddEmployee";
import CategoryPage from "./pages/CategoryPage";
// import AddService from "./pages/AddService";
import NotFoundPage from "./pages/404";
import ClientsBookings from "./pages/ClientsBookings"
import ShedulePage from "./pages/ShedulePage"
import { jwtDecode } from "jwt-decode";
import AddServiceForm from "./pages/AddService";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("USER");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Текущее время в секундах

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log("Token expired on client side.");
            localStorage.removeItem("authToken");
            setIsAuthenticated(false);
            setUserRole(null);
          } else {
            console.log("Token is valid on client side.");
            setIsAuthenticated(true);
            if (decodedToken && decodedToken.role) {
            setUserRole(decodedToken.role);
            } else {
               setUserRole(null);
             }
          }
        } catch (error) {
          // Ошибка декодирования или другая ошибка при обработке токена
          console.error("Error processing token:", error);
          localStorage.removeItem("authToken"); // Удаляем, т.к. токен невалидный
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        // Токена вообще нет
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
    checkAuth();
  }, []);


const handleLoginSuccess = (token) => {
    console.log("handleLoginSuccess: Token received. Updating state.");
    localStorage.setItem("authToken", token);
    try {
      const decodedToken = jwtDecode(token);
      setIsAuthenticated(true); 
      setUserRole(decodedToken.role || null);

      navigate('/user');

    } catch (error) {
        console.error("handleLoginSuccess: Error decoding token:", error);
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUserRole(null);
        navigate('/login', { replace: true });
    }
  };

  const handleLogout = () => {
    console.log("handleLogout: Logging out. Clearing state and token.");
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };


  console.log("App is rendering. Current isAuthenticated:", isAuthenticated, "Current userRole:", userRole);
  return (
    <div className="App">
      <Container>
        <Routes>
          <Route path='/' element={<Navigate to="/main" />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess}/>} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/serv/updserv/:id" element={<EditService />} />
          <Route path="/serv/addserv" element={<AddServiceForm/>} />
          <Route path="/user" element={isAuthenticated ? <UserPage onLogout={handleLogout}/> : <LoginForm/>} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/empl/updempl/:id" element={<EditEmployee />} />
          <Route path="/empl/addempl" element={<AddEmployee />} />
          <Route path="empl/stats" element={<ClientsBookings />}/>
          <Route path="/rev/getrewempl/:id" element={<ReviewPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/bookingform" element={isAuthenticated ? <BookingForm /> : <LoginForm />}/>{" "}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/shedule" element={<ShedulePage/>}/>
        </Routes>
      </Container>
    </div>
  );
}

export default App;
