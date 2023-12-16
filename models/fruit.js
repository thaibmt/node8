const mongoose = require('mongoose');

const fruitSchema = new mongoose.Schema({
    title: String,
    price: {
        type: String,
        default: 0
    },
    description: String,
});

const Fruirt = mongoose.model('Fruirt', fruitSchema);

module.exports = Fruirt;
