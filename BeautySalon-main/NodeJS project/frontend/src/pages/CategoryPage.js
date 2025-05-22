import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Grid,
  Typography,
  Card,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NavMenu from "../components/NavMenu";

const categoryImages = {
  "Маникюр": "/images/nails.jpg",
  "Педикюр": "/images/pedicure.jpg",
  "Ресницы": "/images/lash.jpg",
  "Брови": "/images/brow.jpg",
  "Стрижки": "/images/hair.jpg",
  default: "/back.jpg",
};

// Стили
const useStyles = makeStyles(() => ({
  customCard: {
    borderRadius: 16,
    overflow: "hidden",
    cursor: "pointer",
    height: 280,
    position: "relative",
    transition: "transform 0.3s ease",
    display: "flex",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  cardBackground: {
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    background: "rgba(0, 0, 0, 0.35)",
    zIndex: 1,
  },
  cardText: {
    position: "relative",
    zIndex: 2,
    color: "white",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 500,
    marginTop: "auto",
  },
  arrow: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  AddServiceButton: {
    marginRight: "5px",
    fontSize: "12px",
    fontWeight: "500",
    justifyContent: "center",
    paddingRight: "16px",
    paddingLeft: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
    width: "auto",
    height: "auto",
    borderRadius: "24px",
    border: "2px solid #1E1E1E",
    backgroundColor: "#f5e9e9",
    color: "#5d4037",
    border: "1px solid #d7ccc8",
    "&:hover": {
      backgroundColor: "#e8d5d5",
    },
  }
}));

export default function CategoriesPage() {
  const classes = useStyles();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/serv/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Ошибка при загрузке категорий:", err));
  }, []);

  useEffect(() => {
    const checkAuth = () => {
        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            if (decodedToken?.role) {
              setUserRole(decodedToken.role);
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.error("Invalid token:", error);
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
        setAuthChecked(true);
      };
    
      checkAuth();
  }, []);

  const handleCategoryClick = (categoryID) => {
    navigate(`/services?categoryIDs=${categoryID}`);
  };

  const buttonPath = isAuthenticated ? "/user" : "/login";
  const buttonText = isAuthenticated ? "Профиль" : "Войти";

  return (
    <div>
      <Container>
        <NavMenu buttonPath={buttonPath} buttonText={buttonText} />
      </Container>

      <Container>
        <Container style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "36px", width: "100%", margin:"40px 10px", padding:"0px" }}>
            <Typography variant="h4" gutterBottom style={{ color: "#5d4037" }}>
            Наши услуги
            </Typography>

            {authChecked && isAuthenticated && userRole === "ADMIN" && (
            <Button className={classes.AddServiceButton} onClick={() => navigate('/serv/addserv')}>
                Добавить услугу
            </Button>
            )}
        </Container>

        <Grid container spacing={4}>
          {categories.map((category) => (
            <Grid item key={category.categoryID} xs={12} sm={6} md={4}>
              <Card
                className={classes.customCard}
                onClick={() => handleCategoryClick(category.categoryID)}
              >
                <div
                  className={classes.cardBackground}
                  style={{
                    backgroundImage: `url(${
                      categoryImages[category.name] || categoryImages.default
                    })`,
                  }}
                >
                  <div className={classes.overlay} />
                  <div className={classes.cardText}>
                    <Typography variant="h6">{category.name}</Typography>
                    <span className={classes.arrow}>→</span>
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}
