import React, { useState, useEffect } from "react";
import axios from "axios";
import EmployeeForm from "../components/EmployeeForm";
import { Typography } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";

function AddEmployee() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  // Функция для обработки отправки формы
  const handleAddEmployee = async (employeeData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/empl/addempl",
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("Сотрудник успешно добавлен:", response.data);
      navigate("/employees");
    } catch (error) {
      setError(
        error.response?.data?.message || "Ошибка при добавлении сотрудника"
      );

      console.error("Ошибка при добавлении сотрудника:", error);
    }
  };

  return (
    <div>
      <UserRoleCheck userRole={userRole} />
      <NavMenu />
      <Typography variant="h4" gutterBottom style={{color: "#5d4037"}}>
        Добавление сотрудника
      </Typography>
      <EmployeeForm initialData={{}} onSubmit={handleAddEmployee} mode="add" />
      {/* Вывод сообщения об ошибке */}
      {error && <Typography color="error">{error}</Typography>}
    </div>
  );
}

export default AddEmployee;
