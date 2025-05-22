import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  styled,
  Paper,
  Rating,
} from "@mui/material";
import { Link } from "react-router-dom";

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const StyledSortButtonContainer = styled(Box)(({ theme }) => ({
  width: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",  
  padding: "0px",
}));

const StyledSortButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "auto",
  marginLeft: "10px",
  fontSize: "14px",
  color: "#5d4037", // коричневый цвет
  borderColor: "#d7ccc8", // светлый коричневый
  "&:hover": {
    borderColor: "#a1887f", // средний коричневый при наведении
  }
}));

const StyledSortIcon = styled("svg")(({theme}) => ({
  marginLeft: theme.spacing(1),
  width: "1em",
  height: "1em",
}));

const EmployeeCard = styled(Paper)(({ theme }) => ({
  height: "auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  justifyContent: "space-between",
  borderRadius: "16px",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  backgroundColor: "#fff9f9", // очень светлый розовый фон
  border: "1px solid #f5e9e9", // светлая граница
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
  }
}));

const AddEmployeeButton = styled(Button)(({ theme }) => ({
  marginRight: "5px",
  backgroundColor: "#f5e9e9", // светлый розовый
  color: "#5d4037", // коричневый текст
  fontSize: "12px",
  fontWeight: "500",  
  paddingRight: "16px",
  paddingLeft: "16px",
  paddingTop: "8px",
  paddingBottom: "8px",
  height: "auto",
  borderRadius: "24px",
  border: "1px solid #d7ccc8", // светлая граница
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#e8d5d5", // чуть темнее при наведении
    boxShadow: "none",
    color: "#3e2723" // темнее текст при наведении
  },
}));

const CardContent = styled("container")(({ theme }) => ({
  textAlign: "left",
  width: "100%",
  padding: theme.spacing(2),
}));

const StyledEmployeeName = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit",
  display: "block",
  height: "100%",
  "&:hover": {
    textDecoration: "none",
  }
}));

function EmployeeList({ employees, userRole, averageRatings }) {
  const [sortedEmployees, setSortedEmployees] = useState([...employees]);
  const [sortDirection, setSortDirection] = useState(null);
  const navigate = useNavigate();

  const handleSortToggle = () => {
    let newSortDirection;
    const sorted = [...sortedEmployees];

    if (sortDirection === null || sortDirection === "desc") {
      sorted.sort(
        (a, b) => (averageRatings[a.id] || 0) - (averageRatings[b.id] || 0)
      );
      newSortDirection = "asc";
    } else {
      sorted.sort(
        (a, b) => (averageRatings[b.id] || 0) - (averageRatings[a.id] || 0)
      );
      newSortDirection = "desc";
    }

    setSortedEmployees(sorted);
    setSortDirection(newSortDirection);
  };

  useEffect(() => {
    setSortedEmployees([...employees]);
    setSortDirection(null);
  }, [employees]);

  const renderSortIcon = () => (
    <StyledSortIcon
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 14H2M8 10H2M6 6H2M12 18H2M19 20V4M19 20L22 17M19 20L16 17M19 4L22 7M19 4L16 7"
        stroke="#5d4037" // коричневый цвет иконки
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StyledSortIcon>
  );

  const isAdmin = userRole === 'ADMIN';
  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <StyledContainer>
      <Container style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "36px", margin:"40px 0px", padding: "0px"}}>
        
        <StyledSortButtonContainer>
          <Typography variant="h4" style={{ color: "#5d4037" }}>
            Наши мастера
          </Typography>

          <StyledSortButton variant="outlined" onClick={handleSortToggle}>
              Рейтинг:{" "}
              {sortDirection === "asc"
                ? "по возрастанию"
                : sortDirection === "desc"
                ? "по убыванию"
                : ""}
              {renderSortIcon()}
            </StyledSortButton>
          </StyledSortButtonContainer>
        
        <StyledSortButtonContainer>
          {isAuthenticated && isAdmin && (
            <>
              <AddEmployeeButton variant="contained" color="primary" size="small" onClick={() => navigate('/empl/stats')} style={{ marginRight: "10px" }}>
                Статистика
              </AddEmployeeButton>

              <AddEmployeeButton variant="contained" color="primary" size="small" onClick={() => navigate('/empl/addempl')}>
                Добавить мастера
              </AddEmployeeButton>
            </>
              
          )}
        </StyledSortButtonContainer>
      </Container>

      <Grid container spacing={4}>
        {sortedEmployees.map((employee) => (
          <Grid item xs={12} sm={6} md={4} key={employee.id}>
            <StyledEmployeeName
              to={
                userRole === "ADMIN"
                  ? `/empl/updempl/${employee.id}`
                  : `/rev/getrewempl/${employee.id}`
              }
            >
              <EmployeeCard elevation={0}>
                <img
                  src={
                    employee.photoBase64
                      ? `data:image/*;base64,${employee.photoBase64}`
                      : "/placeholder.png"
                  }
                  alt={`${employee.name} ${employee.surname}`}
                  style={{
                    width: "100%",
                    height: "280px",
                    borderRadius: "16px 16px 0 0",
                    objectFit: "cover",
                    filter: "brightness(0.95)",
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 'auto', marginBottom: "12px", paddingRight: "5px", paddingLeft: "5px"}}>
                    <Typography style={{
                      fontSize: "20px", 
                      fontWeight: 500,
                      color: "#5d4037",
                      lineHeight: "130%"
                    }}>
                      {employee.name} {employee.surname}
                    </Typography>
                    <Rating 
                      value={averageRatings[employee.id] || 0} 
                      readOnly 
                      precision={0.5}
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#bcaaa4", // светлый коричневый для заполненных звезд
                        },
                        "& .MuiRating-iconEmpty": {
                          color: "#d7ccc8", // еще светлее для пустых звезд
                        }
                      }}
                    />
                  </Box>

                  <Typography variant="body1" sx={{ 
                    fontSize: "14px",  
                    marginBottom: "8px", 
                    color: "#8d6e63",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    paddingRight: "5px",
                    paddingLeft: "5px"
                  }}>
                    <span style={{ fontWeight: 500 }}>Email:</span> {employee.email}
                  </Typography>
                  
                  <Typography variant="body1" sx={{
                    fontSize: "14px",  
                    marginBottom: "8px", 
                    color: "#8d6e63",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    width: "100%",
                    whiteSpace: "pre-line",
                    paddingRight: "5px",
                    paddingLeft: "5px"
                  }}>
                    <span style={{ fontWeight: 500 }}>Услуги:</span> {employee.services.join(", ")}
                  </Typography>
                </CardContent>
              </EmployeeCard>
            </StyledEmployeeName>
          </Grid>
        ))}
      </Grid>
    </StyledContainer>
  );
}

export default EmployeeList;
