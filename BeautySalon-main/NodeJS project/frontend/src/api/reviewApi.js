// src/api/reviewsApi.js
import axios from 'axios';

export const deleteReviewApi = async (reviewId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Отсутствует токен авторизации");
    }
    console.log(`API Call: Deleting review ID ${reviewId}`);
    const response = await axios.delete('http://localhost:5000/rev/delreview', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { reviewId: reviewId },
    });
    console.log(`API Call Success: Review ${reviewId} deleted`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Call Error: Deleting review ${reviewId}`, error);
    if (error.response) {
      throw new Error(error.response.data?.message || error.response.data?.error || `Ошибка сервера: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("Нет ответа от сервера при удалении отзыва.");
    } else {
      throw new Error(error.message || "Ошибка при отправке запроса на удаление.");
    }
  }
};