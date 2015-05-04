'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NoteSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name cannot be blank'
    },
    location: {
        type: String,
        trim: true,
        required: 'File location cannot be blank',
        unique: true
    },
    course: {
        type: Schema.ObjectId,
        ref: 'Course',
        required: 'Course cannot be blank'
    },
    section: {
        type: String,
        trim: true,
        required: 'Section cannot be blank'
    },
    tags: [{
        type: String,
        trim: true
    }],
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Note', NoteSchema);
