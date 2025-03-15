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


function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;

        items.push(itemData);

        // Save updated items list to items.json
        fs.writeFile(path.join(__dirname, 'data', 'items.json'), JSON.stringify(items, null, 2), 'utf8')
            .then(() => resolve(items))
            .catch(err => reject('Error saving item: ' + err.message));
    });
}
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        filteredItems.length ? resolve(filteredItems) : reject(`No items found for category ${category}`);
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        if (isNaN(minDate)) {
            reject("Invalid date format. Use YYYY-MM-DD.");
            return;
        }

        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        filteredItems.length ? resolve(filteredItems) : reject(`No items found on or after ${minDateStr}`);
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        const foundItem = items.find(item => item.id == id);
        foundItem ? resolve(foundItem) : reject(`No item found with ID ${id}`);
    });
}


module.exports = {
    initialize,
    getAllItems: () => items.length ? Promise.resolve(items) : Promise.reject('No results returned for items'),
    getPublishedItems: () => {
        const publishedItems = items.filter(item => item.published === true);
        return publishedItems.length ? Promise.resolve(publishedItems) : Promise.reject('No published items found');
    },
    getCategories: () => categories.length ? Promise.resolve(categories) : Promise.reject('No results returned for categories'),
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};

