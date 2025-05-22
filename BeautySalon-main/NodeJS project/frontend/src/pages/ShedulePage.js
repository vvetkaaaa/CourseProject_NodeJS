import React, { useEffect, useState } from "react";
import axios from "axios";
import {
	Container,
	Typography,
	Box,
	Avatar,
	Card,
	CardContent,
	Grid,
	TextField,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	Divider,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NavMenu from "../components/NavMenu";
import dayjs from "dayjs";

function SchedulePage() {
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [scheduleData, setScheduleData] = useState([]);
	const [loadingSchedule, setLoadingSchedule] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchSchedule = async () => {
			if (!selectedDate) {
				setScheduleData([]);
				return;
			}

			setLoadingSchedule(true);
			setScheduleData([]);
			setError(null);

			try {
				const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
				const authToken = localStorage.getItem("authToken");

				if (!authToken) {
					setError("Ошибка: Токен авторизации отсутствует.");
					setLoadingSchedule(false);
					return;
				}

				const response = await axios.get(
					`http://localhost:5000/empl/schedule/daily`,
					{
						params: {
							date: formattedDate,
						},
						headers: {
							Authorization: `Bearer ${authToken}`,
						},
					}
				);

				setScheduleData(response.data || []);

			} catch (err) {
				console.error("Ошибка при загрузке расписания:", err);
				if (err.response && (err.response.status === 401 || err.response.status === 403)) {
					setError("Ошибка авторизации. Возможно, ваш сеанс истек или у вас нет прав доступа.");
				} else if (err.response && err.response.status === 404) {
					setError("На выбранную дату нет данных расписания или мастеров.");
				} else {
					setError("Не удалось загрузить расписание.");
				}
				setScheduleData([]);
			} finally {
				setLoadingSchedule(false);
			}
		};

		if (selectedDate && !loadingSchedule && localStorage.getItem("authToken")) {
			fetchSchedule();
		} else if (!localStorage.getItem("authToken")) {
			setError("Для просмотра расписания необходимо авторизоваться.");
		}

	}, [selectedDate]);

	const handleDateChange = (newValue) => {
		setSelectedDate(newValue);
	};

	return (
		<Container maxWidth="lg">
			<NavMenu />
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mt: 3, mb: 4 }}>
				<Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3, textAlign: 'center', color: "#5d4037"}}>
					Расписание мастеров
				</Typography>

				<Box sx={{ mb: 4, textAlign: 'center', margin: "0px"}}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Дата расписания"
							value={selectedDate}
							onChange={handleDateChange}
							slotProps={{ textField: { fullWidth: true, sx: { maxWidth: 300, margin: '0 auto' } } }}
						/>
					</LocalizationProvider>
				</Box>
			</Box>

			<Box>
				{loadingSchedule ? (
					<Box sx={{ textAlign: 'center', mt: 4 }}>
						<CircularProgress size={24} sx={{ mr: 1 }} />
						<Typography variant="h6" color="textSecondary" display="inline">Загрузка расписания...</Typography>
					</Box>
				) : error ? (
					<Box sx={{ textAlign: 'center', mt: 4 }}>
						<Typography color="error">{error}</Typography>
					</Box>
				) : scheduleData.length > 0 ? (
					<Grid container spacing={3}>
						{scheduleData.map((master) => (
							<Grid item xs={12} md={6} key={master.id}>
								<Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#ddd' }}>
									<CardContent>
										<Box display="flex" alignItems="center" sx={{ mb: 2 }}>
											<Avatar
												alt={`${master.name} ${master.surname}`}
												src={master.photoBase64 ? `data:image/jpeg;base64,${master.photoBase64}` : undefined}
												sx={{ width: 60, height: 60, mr: 2, bgcolor: '#f0f0f0' }}
											>
												{!master.photoBase64 && `${master.name[0]}${master.surname[0]}`}
											</Avatar>
											<Box>
												<Typography variant="h6" component="div" sx={{ color: '#555', textAlign:"left"}}>
													{master.name} {master.surname}
												</Typography>
												{master.workTimes && master.workTimes.length > 0 ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    Рабочие часы:{" "}
                                                    <Box component="span" sx={{ fontWeight: 'bold', display: 'inline' }}>
                                                    {master.workTimes.map(({ startTime, endTime }) => `${startTime} - ${endTime}`).join(", ")}
                                                    </Box>
                                                </Typography>
                                                ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Рабочие часы не указаны
                                                </Typography>
                                                )}
											</Box>
										</Box>

										<Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#555' }}>Записи:</Typography>
										{master.bookings && master.bookings.length > 0 ? (
											<List dense sx={{maxHeight: 300, overflowY: 'auto', borderTop: '1px solid #eee', pt: 1}}>
												{master.bookings.map((booking) => (
													<React.Fragment key={booking.bookingId}>
														<ListItem disablePadding sx={{ py: 0.5 }}>
															<ListItemText
																primary={
																	<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
																		{`${booking.startTime} - ${booking.endTime} | ${booking.serviceName}`}
																	</Typography>
																}
																secondary={
																	<Typography variant="body2" color="text.secondary">
																		{`Клиент: ${booking.clientName} ${booking.notes ? `| Примечание: ${booking.notes}` : ''}`}
																	</Typography>
																}
															/>
														</ListItem>
														<Divider component="li" variant="inset" sx={{ ml: 7 }}/>
													</React.Fragment>
												))}
											</List>
										) : (
											<Typography variant="body2" color="text.secondary">
												На эту дату записей нет.
											</Typography>
										)}
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				) : (
					<Box sx={{ textAlign: 'center', mt: 4 }}>
						<Typography variant="h6" color="textSecondary">
							Нет данных расписания для этой даты.
						</Typography>
					</Box>
				)}
			</Box>
		</Container>
	);
}

export default SchedulePage;
