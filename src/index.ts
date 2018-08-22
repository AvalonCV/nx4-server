import app from './app';
const PORT = 4000;

app.listen(PORT, () => {
	console.log('Express server listening on port ' + PORT);
});

// process.on('SIGTERM', () => {
// 	console.info('SIGTERM signal received.');
// });

// process.on('SIGINT', () => {
// 	console.info('SIGINT signal received.');
// });
