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
 
app.use(express.static(__dirname + '/public'))


app.get('/', (req, res) => {
    res.redirect('/about');
});

// Serve the about.html file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Step 2: Route for "/items/add" 
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});

//post item add
app.post('/items/add', upload.single("featureImage"), (req, res) => {
    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        storeService.addItem(req.body)
            .then(() => res.redirect('/items'))
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

// Route for "/shop" (published items)
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(publishedItems => {
            res.json(publishedItems); 
        })
        .catch(err => {
            res.status(500).json({ message: err });
        });
});

// Route for "/items" (all items)
app.get('/items', (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ message: err }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ message: err }));
    }
});


app.post('/items', (req, res) => {
    const newItem = req.body; 

    storeService.addItem(newItem)
        .then(updatedItems => {
            res.json(updatedItems); 
        })
        .catch(err => {
            res.status(500).json({ message: err });
        });
});

//item/value route
app.get('/item/:value', (req, res) => {
    const itemId = req.params.value;

    storeService.getItemById(itemId)
        .then(item => res.json(item))
        .catch(err => res.status(404).json({ message: err }));
});

// Route for "/categories" (all categories)
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => {
            res.json(categories); 
        })
        .catch(err => {
            res.status(500).json({ message: err }); 
        });
});


app.get('*', (req, res) => {
    res.status(404).send('Page Not Found');
});

// Initialize data and start the server only if initialization succeeds
storeService.initialize()
    .then(() => {
        
        console.log('Initialization successful. Starting server...');
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port ${HTTP_PORT}`); 
        });
    })
    .catch(err => {
        // If initialization fails, log the error 
        console.error("Initialization failed:", err);
    });
