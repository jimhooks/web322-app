const fs = require('fs').promises;
const path = require('path'); 

let items = [];
let categories = [];

function initialize() {
    return fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8')
        .then(data => {
            items = JSON.parse(data);
            return fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8');
        })
        .then(data => {
            categories = JSON.parse(data);
            return 'Initialization successful';
        })
        .catch(err => {
            throw new Error("Unable to read JSON files: " + err.message);
        });
}

module.exports = {
    initialize,
    getAllItems: () => items.length ? Promise.resolve(items) : Promise.reject('No results returned for items'),
    getPublishedItems: () => {
        const publishedItems = items.filter(item => item.published === true);
        return publishedItems.length ? Promise.resolve(publishedItems) : Promise.reject('No published items found');
    },
    getCategories: () => categories.length ? Promise.resolve(categories) : Promise.reject('No results returned for categories')
};
