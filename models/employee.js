const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18 }, // Ensures age is at least 18
    id: { type: Number, required: true, unique: true, min: 0 },
    records: [{
        checkIn: { type: Date },
        checkOut: { type: Date }
    }]
}, { timestamps: true });

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;