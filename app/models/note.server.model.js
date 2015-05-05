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
        required: 'number cannot cannot be blank'
    },
    noteType:{
        type: [{
			type: String,
			enum: ['Lecture', 'Tutorial', 'HomeWork', 'Exam', 'Other']
		}],
		required: 'note type cannot be blank'
    },
    fileType: {
        type: [{
			type: String,
			enum: ['Image', 'Doc']
		}],
        required: 'file type cannot be blank'
    },
    number: {
        type: String
    },
    date:{
        type: Date
    },
    rating: {
        type: String
    },
    location: {
        type: String,
        trim: true,
        required: 'File location cannot be blank',
        unique: true
    },
    thumbNail: {
        type: String,
        trim: true,
        required: 'Thumb Nail location cannot be blank',
        unique: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    section: {
        type: Schema.ObjectId,
        ref: 'Section',
        required: 'Section cannot be blank'
    }
});

mongoose.model('Note', NoteSchema);
