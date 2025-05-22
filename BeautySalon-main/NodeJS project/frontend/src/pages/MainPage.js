import React, { useState, useEffect } from "react";
//import MainPost from "../src/components/MainPost";
import MainPost from "../components/MainPost";
import NavMenu from "../components/NavMenu";
import { Container } from "@material-ui/core";
import { jwtDecode } from "jwt-decode";

function MainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("USER");

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
        const decodedToken = jwtDecode(token);
        if (decodedToken && decodedToken.role) {
          setUserRole(decodedToken.role);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const post = {
    title: "Добро пожаловать в салон красоты!",
    description: "Насладитесь лучшим сервисом в нашем городе",
    // image: "http://source.unsplash.com/random",
    imageText: "salon",
  };

  const sections = [
    { title: "Услуги", url: "/services" },
    { title: "Сотрудники", url: "/employees" },
  ];

  const buttonPath = isAuthenticated ? "/user" : "/login";
  const buttonText = isAuthenticated ? "Профиль" : "Вoйти";

  return (
    <div className="App">
      <Container>
        <NavMenu
          //sections={userRole === "ADMIN" ? sectionsAdmin : sections}
          buttonPath={buttonPath}
          buttonText={buttonText}
        />
      </Container>

      <div>
        <MainPost/> {/* Используйте компонент, содержащий всю страницу */}
      </div>
    </div>

    
  );
}
export default MainPage;
