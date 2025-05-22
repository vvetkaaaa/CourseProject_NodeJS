// import React, { useState } from "react";
// import { Card, CardContent, Typography, Button } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";
// import dayjs from "dayjs";
// import timezone from "dayjs/plugin/timezone";
// import utc from "dayjs/plugin/utc";
// import "dayjs/locale/ru";

// dayjs.extend(utc);
// dayjs.extend(timezone);

// dayjs.locale("ru");

// const useStyles = makeStyles((theme) => ({
//   card: {
//     marginBottom: theme.spacing(2),
//   },
//   timeButton: {
//     margin: theme.spacing(0.5),
//     "&.selected": {
//       backgroundColor: theme.palette.primary.light,
//       color: theme.palette.common.white,
//     },
//   },
// }));

// // Компонент для отображения мастера с доступными временами
// const EmployeeCard = ({
//   name,
//   surname,
//   employeeID,
//   timeSlots,
//   selectedTime,
//   onTimeSlotClick,
// }) => {
//   const classes = useStyles();

//   const [localSelectedTime, setLocalSelectedTime] = useState(selectedTime);
//   const handleTimeSlotClick = (time) => {
//     // Если текущее время равно времени на кнопке, то отменяем выбор
//     if (localSelectedTime === time) {
//       setLocalSelectedTime(null);
//     } else {
//       setLocalSelectedTime(time);
//     }
//     onTimeSlotClick(time, employeeID);
//   };

//   return (
//     <Card className={classes.card}>
//       <CardContent>
//         <Typography variant="h6">{name}</Typography>
//         <div>
//           {timeSlots.map((slot) => (
//             <Button
//               key={slot.id}
//               variant="outlined"
//               color="inherit"
//               className={`${classes.timeButton} ${
//                 slot.startTime === localSelectedTime ? "selected" : ""
//               }`}
//               onClick={() => {
//                 console.log(
//                   "Нажатие на время:",
//                   slot.startTime,
//                   "для мастера:",
//                   employeeID
//                 );
//                 handleTimeSlotClick(slot.startTime);
//               }}
//             >
//               {dayjs(slot.startTime).tz("UTC", true).format("HH:mm")}
//             </Button>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default EmployeeCard;


import React, { useState } from "react";
import { Card, CardContent, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2),
  },
  timeButton: {
    margin: theme.spacing(0.5),
    "&.selected": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.common.white,
    },
  },
}));

const EmployeeCard = ({
  name,
  employeeID,
  timeSlots,
  selectedTime,
  onTimeSlotClick,
}) => {
  const classes = useStyles();
  const [localSelectedTime, setLocalSelectedTime] = useState(selectedTime);

  const handleTimeSlotClick = (time) => {
    const newTime = localSelectedTime === time ? null : time;
    setLocalSelectedTime(newTime);
    onTimeSlotClick(newTime, employeeID);
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <div>
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant="outlined"
              color="inherit"
              className={`${classes.timeButton} ${
                time === localSelectedTime ? "selected" : ""
              }`}
              onClick={() => handleTimeSlotClick(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;

