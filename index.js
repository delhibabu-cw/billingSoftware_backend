const { express, bodyParser, helmet, xss, dotenv, morgan, cors } = require('./app/services/imports')
const app = express();
dotenv.config()
const { port } = require('./app/config/config')



const responseHandler = require('./app/middlewares/response-handler');

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
// app.use(cors({
//   origin: "*", // Allow all origins (change "" to your frontend URL for better security)
//   methods: "GET,POST,PUT,DELETE",
//   allowedHeaders: "Content-Type,Authorization"
// }));

require('./db_connection')
app.use(responseHandler())


app.use(morgan('tiny'));

// adding Helmet to enhance your API's security
app.use(helmet());

// sanitize request data
app.use(xss());

app.use('/demo', (req, res) => {
    return res.json({ msg: `Port successfully running on ${port} `})
})

const rout = require('./app/routes/__index');
app.use('/', rout)

app.listen(port, () => { console.log(`Port successfully running on ${port}`)})
