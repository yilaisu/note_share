'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CourseSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name cannot be blank'
    },
    code: {
        type: String,
        trim: true,
        required: 'Course code cannot be blank'
    },
    term:{
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String
    },
    school: {
        type: Schema.ObjectId,
        ref: 'School'
    }
});

CourseSchema.index({code: 1, school: 1}, {unique: true});

mongoose.model('Course', CourseSchema);
