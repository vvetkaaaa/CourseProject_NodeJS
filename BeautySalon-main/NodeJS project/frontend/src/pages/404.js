import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div>
      <h1>404 - Страница не найдена</h1>
      <p>Кажется, вы попали на несуществующую страницу.</p>
      <Link to="/main">Вернуться на главную</Link>
    </div>
  );
};

export default NotFoundPage;
