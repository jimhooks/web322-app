/*********************************************************************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source 
(including 3rd party web sites) or distributed to other students.

Name: AMINU JIM OLUWAFERANMI
Student ID: 131301236
Date: march 15, 2025
Vercel Web App URL: https://vercel.com/jimhooks-projects/web322-app
GitHub Repository URL: https://github.com/jimhooks/web322-app
********************************************************************************/ 

const express = require('express'); 
const path = require('path'); 
const storeService = require('./store-service'); 

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const sanitizeHtml = require("sanitize-html");
const { sequelize, Item } = require('./models/Item');
const { Op } = require('sequelize');



const app = express();
const HTTP_PORT = process.env.PORT || 8080; 


cloudinary.config({
    cloud_name: 'dkpqyfte6',
    api_key: '398977368316756',
    api_secret: 'JZV4IaZPF_G2PtVoyYtsXDhLfw0',
    secure: true
});


// Multer setup (no disk storage)
const upload = multer(); 


app.set('views', __dirname + '/views')
app.set('view engine', 'ejs');

 
app.use(express.static(__dirname + '/public'))
app.use((req, res, next) => {
    let route = req.path;
    // Normalize the route (ignore trailing slashes)
    if (route !== "/" && route.slice(-1) === "/") {
        route = route.slice(0, -1);
    }
    res.locals.activeRoute = route;
    next();
});



app.get('/', (req, res) => {
    res.redirect('/about');
});

// Serve the about.html file
app.get('/about', (req, res) => {
    res.render('about');

});

// Step 2: Route for "/items/add" 
app.get('/items/add', (req, res) => {
    res.render('addItem');

});

//post item add
app.post('/items/add', upload.single("featureImage"), (req, res) => {
    function processItem(imageUrl) {
        Item.create({
            title: req.body.title,
            price: req.body.price,
            category: req.body.category,
            featureImage: imageUrl,
            published: req.body.published === "on", // checkbox
            postDate: new Date(),
            body: req.body.body // this is your description textarea
        })
        .then(() => {
            res.redirect('/items');
        })
        .catch(err => {
            console.error("Error adding item:", err);
            res.status(500).send("Error adding item");
        });
    }

    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        streamUpload(req)
            .then((uploaded) => processItem(uploaded.url))
            .catch((err) => {
                console.error("Cloudinary Upload Error:", err);
                processItem(""); 
            });
    } else {
        processItem("");
    }
});



function sanitize(content) {
    return sanitizeHtml(content, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'],
        allowedAttributes: {
            a: ['href']
        }
    });
}


// Route for "/shop" (published items)
app.get('/shop', (req, res) => {
    const { category } = req.query;

    const query = {
        where: {
            published: true
        }
    };

    if (category) {
        query.where.category = category;
    }

    Item.findAll(query)
        .then(items => {
            res.render("shop", {
                items,
                sanitize: sanitize,
                message: items.length === 0 ? "No items available." : null
            });
        })
        .catch(err => {
            res.render("shop", {
                items: [],
                sanitize: sanitize,
                message: "Error: " + err
            });
        });
});



// Route for "/items" (all items)
// Rendered Items Page


app.get('/items', (req, res) => {
    const { category, minDate } = req.query;
    let where = {};

    if (category) where.category = category;
    if (minDate) where.postDate = { [Op.gte]: new Date(minDate) };

    Item.findAll({ where })
        .then(items => {
            res.render('items', {
                items,
                message: items.length === 0 ? "No items found" : null
            });
        })
        .catch(err => {
            console.error("Error fetching items:", err);
            res.render("items", {
                items: [],
                message: "Error loading items"
            });
        });
});




app.post('/items', (req, res) => {
    Item.create(req.body)
        .then(item => res.json(item))
        .catch(err => res.status(500).json({ message: "Error creating item" }));
});


//item/value route
app.get('/item/:value', (req, res) => {
    const itemId = req.params.value;

    Item.findByPk(itemId)
        .then(item => {
            if (item) res.json(item);
            else res.status(404).json({ message: "Item not found" });
        })
        .catch(err => res.status(500).json({ message: "Error retrieving item" }));
});


// Route for "/categories" (all categories)
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => {
            res.render("categories", {
                categories: categories,
                message: categories.length === 0 ? "No categories found." : null
            });
        })
        .catch(err => {
            res.render("categories", {
                categories: [],
                message: "Error loading categories: " + err
            });
        });
});


app.get('*', (req, res) => {
    res.status(404).send('Page Not Found');
});

// Initialize data and start the server only if initialization succeeds
sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
    return storeService.initialize();
  }).then(() => {
    console.log('StoreService initialized (categories loaded)');
    app.listen(HTTP_PORT, () => {
      console.log(`Server running on port ${HTTP_PORT}`);
    });
  }).catch(err => {
    console.error('Initialization failed:', err);
  });
  
  
