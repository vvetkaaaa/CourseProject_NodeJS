import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NavMenu from "./NavMenu";

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#fff9f9',
      '& fieldset': {
        borderColor: '#d7ccc8',
      },
      '&:hover fieldset': {
        borderColor: '#a1887f',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#8d6e63', // focus состояние
        borderWidth: '1px',
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
  },
  button: {
    backgroundColor: '#f5e9e9',
    color: '#5d4037',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 24px',
    borderRadius: '24px',
    border: '1px solid #d7ccc8',
    boxShadow: 'none',
    marginRight: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#e8d5d5',
      color: '#3e2723',
    },},
}));


function ServiceForm({
  initialName = "",
  initialDescription = "",
  initialPrice = 0,
  initialCategory,
  initialDuration,
  mode = "add",
  onSubmit,
}) {
  const classes = useStyles();

  console.log("initialCategory при рендере ServiceForm:", initialCategory);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(initialPrice);
  const [categoryId, setCategoryId] = useState(initialCategory?.category || "");
  console.log("Начальное состояние categoryId:", categoryId); 
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState("");
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      const initialCategoryId = initialCategory.categoryID !== undefined ? initialCategory.categoryID : initialCategory;
      const categoryExists = categories.some(cat => cat.categoryID === initialCategoryId);
      if (categoryExists) {
        setCategoryId(initialCategoryId);
      }
    }
  }, [initialCategory, categories]);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setPrice(initialPrice);
    setDuration(initialDuration ?? 60);
  }, [initialName, initialDescription, initialPrice, initialDuration]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/serv/categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
        setLoadingCategories(false);
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error);
        setErrorCategories("Не удалось загрузить категории.");
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "price":
        setPrice(parseFloat(value));
        break;
      case "categoryId":
        setCategoryId(value);
        break;
      case "duration":
        setDuration(parseInt(value, 10));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Пожалуйста, введите название услуги.");
      return;
    }

    if (price === null || price <= 0 || isNaN(price)) {
      setError("Пожалуйста, введите корректную цену услуги.");
      return;
    }

    if (!categoryId) {
      setError("Пожалуйста, выберите сферу услуг.");
      return;
    }

    if (duration === null || duration <= 0 || isNaN(duration)) {
      setError("Пожалуйста, введите корректную длительность.");
      return;
    }

    // if (!name || price <= 0) {
    //   setError("Введите корректные данные.");
    //   return;
    // }

    // if(!categoryId){
    //   setError("Введите корректные данные.");
    //   return;
    // }

    setError("");

    const serviceData = {
      name,
      description,
      price,
      categoryID: categoryId,
      duration,
    };

    try {
      await onSubmit(serviceData, mode);

      if (mode === "add") {
        setName("");
        setDescription("");
        setPrice(0);
        setCategoryId("");
        setDuration(60);
      }
      setError("");
    } catch (error) {
      console.error("Ошибка при обработке формы:", error);
      setError(error.response?.data?.message || "Ошибка при обработке формы");
    }
  };

  if (loadingCategories) {
    return <Typography>Загрузка сфер услуг...</Typography>;
  }

  if (errorCategories) {
    return <Typography color="error">{errorCategories}</Typography>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        variant="outlined"
        fullWidth
        label="Название услуги"
        value={name}
        onChange={handleChange}
        onKeyPress={(e) => {
          const regex = /^[a-zA-Zа-яА-ЯёЁ\s]$/;
            if (!regex.test(e.key)) {
              e.preventDefault(); // блокируем ввод символа
            }
        }}
        name="name"
        className={classes.formControl}
      />
      <TextField
        variant="outlined"
        fullWidth
        label="Описание услуги"
        multiline
        rows={1}
        value={description}
        onChange={handleChange}
        name="description"
        className={classes.formControl}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          fullWidth
          label="Цена услуги"
          type="number"
          value={price}
          onChange={handleChange}
          name="price"
          className={classes.formControl}
        />
        <span style={{ marginLeft: 8, whiteSpace: 'nowrap' }}>BYN</span>
      </div>

      <FormControl fullWidth className={classes.formControl}>
        <InputLabel id="category-label">Сфера услуг</InputLabel>
        <Select
          labelId="category-label"
          id="categoryId"
          name="categoryId"
          value={categoryId}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>Выберите сферу</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.categoryID} value={category.categoryID}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField fullWidth
        variant="outlined" 
        label="Длительность (в минутах)"
        type="number"
        value={duration}
        onKeyPress={(e) => {
          const regex =  /^[0-9]$/;
            const currentValue = e.target.value;
            if (!regex.test(e.key) || (currentValue.length >= 3)) {
              e.preventDefault();
            }
        }}
        onChange={handleChange}
        name="duration"
        className={classes.formControl}
      />

      {error && <Typography color="error">{error}</Typography>}
      
      <Button
        variant="contained"
        color="primary"
        type="submit"
        className={classes.button}
      >
        {mode === "add" ? "Добавить услугу" : "Изменить услугу"}
      </Button>
    </form>
  );
}

export default ServiceForm;