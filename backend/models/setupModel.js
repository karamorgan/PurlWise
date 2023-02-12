const mongoose = require('mongoose');

// Pattern Setup Schema
const setupSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a pattern name']
    },
    description: {
        type: String,
        required: false
    },
    needleType: {
        type: String,
        required: false
    },
    needleSize: {
        type: String,
        required: false
    },
    castOn: {
        type: String,
        required: false
    },

    // This references the root of the pattern tree structure in the Pattern collection
    pattern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pattern',
        default: null
    },

    // Tracks which stitch the user last completed in the pattern to return to that point when the pattern is loaded
    progress: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Setup', setupSchema);