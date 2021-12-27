const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 5000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwba5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
client.connect((err) => {
	const GroceryCollection = client
		.db("Grocery-House")
		.collection("products");
	const orderDetailsCollection = client
		.db("Grocery-House")
		.collection("fullOrderDetails");
	// perform actions on the collection object
	console.log("Database Connected");

	// Post New Product:
	app.post("/addNewProduct", (req, res) => {
		GroceryCollection.insertOne(req.body).then((result) => {
			res.send(result.insertedCount > 0);
		});
	});

	//Post Full Order Details:
	app.post("/fullOrderDetails", (req, res) => {
		orderDetailsCollection.insertOne(req.body).then((result) => {
			console.log(result);
		});
	});

	//Get all Products:
	app.get("/allProducts", (req, res) => {
		GroceryCollection.find({}).toArray((arr, documents) => {
			res.send(documents);
		});
	});

	// Get selected Product:
	app.get("/selectedProduct/:name", (req, res) => {
		GroceryCollection.find({ productName: req.params.name }).toArray(
			(arr, documents) => {
				res.send(documents[0]);
			}
		);
	});

	// Get Logged In user Order Products:
	app.get("/my-orders", (req, res) => {
		orderDetailsCollection
			.find({ buyerEmail: req.query.email })
			.toArray((arr, documents) => {
				res.send(documents);
			});
	});

	// Get Selected Order:
	app.get("/my-orders/:selectedOrder", (req, res) => {
		console.log(req.params.selectedOrder);
		orderDetailsCollection
			.find({ _id: ObjectId(`${req.params.selectedOrder}`) })
			.toArray((arr, documents) => {
				res.send(documents[0]);
			});
	});

	// Delete a product:
	app.delete("/deleteProduct/:id", (req, res) => {
		const id = ObjectId(req.params.id);
		GroceryCollection.deleteOne({
			_id: ObjectId(`${req.params.id}`),
		}).then((result) => {
			console.log(result);
		});
	});

	// client.close();
});

app.listen(process.env.PORT || port);
