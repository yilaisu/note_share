'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * School Schema
 */
var SchoolSchema = new Schema({
    name: {
        type: String,
        trim: true,
        default: '',
        required: 'Name cannot be blank',
        unique: true,
        index: true
    },
    domain: {
        type: String,
        trim: true,
        default: ''
    }
});

mongoose.model('School', SchoolSchema);