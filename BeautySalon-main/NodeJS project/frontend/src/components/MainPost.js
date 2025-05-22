import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Button, Box } from "@material-ui/core";
import { Link } from "react-router-dom";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import manicureImage from "../nails.jpg";
import mastersImage from "../workers.jpg";
import mainImage from "../main-photo.jpg";
import NavMenu from "./NavMenu";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    minHeight: "100vh",
    //alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  leftBlock: {
    maxWidth: 600,
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    minHeight: "100%",
  },
  rightBlock: {
    flexGrow: 1,
    maxWidth: 600,
    padding: theme.spacing(3),
    marginLeft: theme.spacing(4),
    borderRadius: "20px",
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: "20px",
  },
  title: {
    fontSize: "72px",
    fontWeight: "bold",
    color: " #1E1E1E",
    marginBottom: theme.spacing(2),
    textAlign: "left",
  },
  slogan: {
    fontSize: "16px",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    textAlign: "left",
  },
  linkContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  linkCard: {
    position: "relative",
    marginTop: "20px",
    borderRadius: "20px",
    overflow: "hidden",
    minHeight: "250px",
    width: "280px"
    // "&:last-child": {
    //   marginBottom: 0,
    // },
  },
  linkImage: {
    width: "280px",
    height: "100%",
    display: "block",
    objectFit: "cover",
    filter: "brightness(90%)",
  },
  linkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "280px",
    height: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    color: theme.palette.common.white,
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
  },
  linkText: {
    fontSize: "16px",
    paddingLeft: "16px",
    paddingTop: "16px",
  },
  arrowIcon: {
    marginLeft: theme.spacing(1),
    width: "20px",
    height: "20px",
    paddingTop: "20px",
    paddingRight: "16px",
  },
  button: {
    marginTop: "20px",
    backgroundColor: "#fff",
    color: "#000",
    fontSize: "14px",
    width: "240px",
    borderRadius: "24px",
    padding: "10px",
    border: "2px solid #1E1E1E",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#1E1E1E",
      boxShadow: "none",
      color: "#fff"
    }
  },
}));

function MainPost() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <div className={classes.leftBlock}>
        <Typography variant="h2" className={classes.title}>
          UPGRADES
        </Typography>
        <Typography variant="subtitle1" className={classes.slogan}>
          Погрузись в мир красоты вместе с нами
        </Typography>
        <Link to="/bookingform">
          <Button variant="contained" className={classes.button}>
            Записаться
          </Button>
        </Link>
        <div className={classes.linkContainer}>
          <div className={classes.linkCard}>
            <img
              src={manicureImage}
              alt="Маникюр"
              className={classes.linkImage}
            />
            <Link to="/categories" className={classes.linkOverlay}>
              <Typography variant="h6" className={classes.linkText}>
                Услуги
              </Typography>
              <ArrowForwardIcon className={classes.arrowIcon} />
            </Link>
          </div>
          <div className={classes.linkCard}>
            <img
              src={mastersImage}
              alt="Мастера"
              className={classes.linkImage}
            />
            <Link to="/employees" className={classes.linkOverlay}>
              <Typography variant="h6" className={classes.linkText}>
                Мастера
              </Typography>
              <ArrowForwardIcon className={classes.arrowIcon} />
            </Link>
          </div>
        </div>
      </div>
      <div className={classes.rightBlock}>
        <img src={mainImage} alt="Салон красоты" className={classes.mainImage} />
      </div>
    </Box>
  );
}

export default MainPost;