import React from "react";
//import MainPost from "../src/components/MainPost";
import NavMenu from "../components/NavMenu";
import { Container } from "@material-ui/core";
import AddServiceForm from "./AddService";
import AddEmployeeForm from "./AddEmployee";

function AdminPage() {
  const sections = [
    { title: "Услуги", url: "/services" },
    // { title: "Отзывы", url: "#" },
    { title: "Сотрудники", url: "/employees" },
  ];
  return (
    <div className="App">
      <Container>
        <NavMenu sections={sections} />
        <AddServiceForm />
        <AddEmployeeForm />
      </Container>
    </div>
  );
}
export default AdminPage;
