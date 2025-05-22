import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  styled,
  Paper,
  CircularProgress,
} from "@mui/material";

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const ServiceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  cursor: "pointer",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderRadius: "16px",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  backgroundColor: "#fff9f9",
  border: "1px solid #f5e9e9",
  overflow: "hidden",
  maxHeight: "300px",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
    maxHeight: "500px",
  },
}));

const ServiceDescription = styled(Typography)(({ theme }) => ({
  textAlign: "left",
  color: "#8d6e63",
  fontSize: "14px",
  flexGrow: 1,
  marginBottom: theme.spacing(1),
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  transition: "all 0.3s ease",
  ".MuiPaper-root:hover &": { // Измененный селектор для реагирования на hover карточки
    WebkitLineClamp: "unset",
    overflow: "visible",
    whiteSpace: "normal",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginRight: theme.spacing(1),
  "& .MuiOutlinedInput-root": {
    borderRadius: "24px",
    backgroundColor: "#fff9f9",
    "& fieldset": {
      borderColor: "#d7ccc8",
    },
    "&:hover fieldset": {
      borderColor: "#a1887f",
    },
  },
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
  textAlign: "left",
  fontWeight: 500,
  fontSize: "16px",
  marginBottom: theme.spacing(1),
  color: "#5d4037",
}));

const StyledServiceDescription = styled(Typography)(({ theme }) => ({
  textAlign: "left",
  display: "flex",
  lineHeight: 1.6,
  color: "#8d6e63",
  maxHeight: "3.6em",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: "24px",
  backgroundColor: "#f5e9e9",
  color: "#5d4037",
  border: "1px solid #d7ccc8",
  "&:hover": {
    backgroundColor: "#e8d5d5",
  },
}));

const FilterButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  backgroundColor: "#f5e9e9",
  color: "#5d4037",
  fontSize: "12px",
  fontWeight: 500,
  padding: "8px 16px",
  borderRadius: "24px",
  border: "1px solid #d7ccc8",
  boxShadow: "none",
  "&.active": {
    backgroundColor: "#e8d5d5",
    color: "#3e2723",
  },
  "&:hover": {
    backgroundColor: "#e8d5d5",
    color: "#3e2723",
  },
}));

const PriceFilterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: "#fff9f9",
  borderRadius: "16px",
  border: "1px solid #f5e9e9",
}));

function ServicesList({ userRole }) {
  const [allServices, setAllServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryIDs = queryParams.get("categoryIDs");

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/serv/categories');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCategories(data.map(cat => ({ id: cat.categoryID || cat.id, name: cat.name })));
      } catch (e) {
        console.error("Error fetching categories:", e);
        setError("Не удалось загрузить категории.");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      setError(null);
      setAllServices([]);

      const url = categoryIDs
        ? `http://localhost:5000/serv/serviceByCategory?categoryIDs=${categoryIDs}`
        : 'http://localhost:5000/serv/getservices';

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAllServices(data);
      } catch (e) {
        console.error("Error fetching services:", e);
        setError("Не удалось загрузить услуги.");
        setAllServices([]);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, [categoryIDs]);

  useEffect(() => {
    const newFilteredServices = allServices.filter((service) => {
      const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
      if (isNaN(price)) return false;
      const min = minPrice === "" ? -Infinity : parseFloat(minPrice);
      const max = maxPrice === "" ? Infinity : parseFloat(maxPrice);
      return price >= min && price <= max;
    });
    setFilteredServices(newFilteredServices);
  }, [minPrice, maxPrice, allServices]);

  const handleMinPriceChange = (event) => setMinPrice(event.target.value);
  const handleMaxPriceChange = (event) => setMaxPrice(event.target.value);
  const clearPriceFilters = () => {
    setMinPrice("");
    setMaxPrice("");
  };

  const handleCategoryClick = (id) => {
    if (id === null) {
      navigate("/categories");
    } else {
      navigate(`/services/category/${id}`);
    }
  };

  return (
    <StyledContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" style={{ color: "#5d4037" }}>
          Наши услуги
        </Typography>
      </Box>

      <PriceFilterContainer>
        <Typography variant="body1" style={{ color: "#5d4037", fontWeight: 500 }}>
          Фильтр по цене:
        </Typography>
        <StyledTextField
          label="Мин. цена"
          value={minPrice}
          onChange={handleMinPriceChange}
          type="number"
          size="small"
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          InputProps={{ inputProps: { min: 0 } }}
          disabled={isLoadingServices}
        />
        <StyledTextField
          label="Макс. цена"
          value={maxPrice}
          onChange={handleMaxPriceChange}
          type="number"
          size="small"
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          InputProps={{ inputProps: { min: 0 } }}
          disabled={isLoadingServices}
        />
        <StyledButton
          onClick={clearPriceFilters}
          size="small"
          disabled={isLoadingServices || (!minPrice && !maxPrice)}
        >
          Сбросить
        </StyledButton>
      </PriceFilterContainer>

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      {isLoadingServices ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress style={{ color: "#a1887f" }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                {userRole === "ADMIN" ? (
                  <Link
                    to={`/serv/updserv/${service.id}`}
                    style={{ textDecoration: "none", display: "flex", height: "100%" }}
                  >
                    <ServiceCard>
                      <Typography variant="h6" style={{ fontWeight: 'bold', color: "#5d4037", textAlign: "left" }}>
                        {service.name}
                      </Typography>
                      <Typography variant="h6" style={{ color: "#8d6e63", marginBottom: "12px", textAlign: "left" }}>
                        {service.price} BYN {service.duration ? `/ ${service.duration} мин` : ""}
                      </Typography>
                      <Typography variant="subtitle2" style={{ fontWeight: 500, color: "#5d4037", textAlign: "left"}}>
                        Описание:
                      </Typography>
                      <ServiceDescription variant="body2">
                        {service.description || "Описание отсутствует"}
                      </ServiceDescription>
                    </ServiceCard>
                  </Link>
                ) : (
                   <ServiceCard>
                      <Typography variant="h6" style={{ fontWeight: 'bold', color: "#5d4037", textAlign: "left" }}>
                        {service.name}
                      </Typography>
                      <Typography variant="h6" style={{ color: "#8d6e63", marginBottom: "12px", textAlign: "left" }}>
                        {service.price} BYN {service.duration ? `/ ${service.duration} мин` : ""}
                      </Typography>
                      <Typography variant="subtitle2" style={{ fontWeight: 500, color: "#5d4037", textAlign: "left"}}>
                        Описание:
                      </Typography>
                      <ServiceDescription variant="body2">
                        {service.description || "Описание отсутствует"}
                      </ServiceDescription>
                    </ServiceCard>
                )}
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center" mt={4} style={{ color: "#8d6e63" }}>
                Нет услуг, соответствующих выбранным фильтрам.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </StyledContainer>
  );
}

export default ServicesList;
