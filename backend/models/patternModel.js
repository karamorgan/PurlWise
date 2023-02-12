const mongoose = require('mongoose');

// Each document in the Pattern collection represents a node of a data tree, with references to their immediate child documents
const patternSchema = mongoose.Schema({
    data: String,
    instances: { type: Number, default: 1 },
    children: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('Pattern', patternSchema);