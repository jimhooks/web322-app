/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source 
(including 3rd party web sites) or distributed to other students.

Name: AMINU JIM OLUWAFERANMI
Student ID: 131301236
Date: February 13, 2025
Vercel Web App URL: 
GitHub Repository URL: https://github.com/jimhooks/web322-app
********************************************************************************/ 

const express = require('express'); 
const path = require('path'); 
const storeService = require('./store-service'); 

const app = express();
const HTTP_PORT = process.env.PORT || 8080; 



app.set('views', __dirname + '/views')
 
app.use(express.static(__dirname + '/public'))


app.get('/', (req, res) => {
    res.redirect('/about');
});

// Serve the about.html file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
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
    storeService.getAllItems()
        .then(items => {
            res.json(items); 
        })
        .catch(err => {
            res.status(500).json({ message: err }); 
        });
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

// Handle unrecognized routes (404)
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
