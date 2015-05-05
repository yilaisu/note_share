'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SectionSchema = new Schema({
    year: {
        type: String,
        trim: true,
        required: 'section year cannot be blank'
    },
    term:{
        type: [{
			type: String,
			enum: ['Winter', 'Fall']
		}],
        required: 'section term cannot be blank'
    },
    section: {
        type: String,
        trim: true,
        required: 'Section number cannot be blank'
    },
    course: {
        type: Schema.ObjectId,
        ref: 'Course',
        required: 'Course cannot be blank'
    },
    notes: [{
        type: Schema.ObjectId,
        ref: 'Note'
    }]
});

SectionSchema.index({year: 1, term: 1, section: 1}, {unique: true});

mongoose.model('Section', SectionSchema);
