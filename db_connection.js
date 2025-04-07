const config = require('./app/config/config');
const { mongoose } = require('./app/services/imports');

mongoose.connect(config.DB_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
	console.log('database connected', config.DB_URL);
}).catch((error) => {
	console.log('Error connecting to DB=================');
	console.log(error)
	process.exit(1); // 1 for because since this exception not handled by us
});
// mongoose.set('debug', process.env.NODE_ENV === 'development');
