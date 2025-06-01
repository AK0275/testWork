const router = require("express").Router();
const Employee = require("../models/employee");

// Display All Employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render("employees/index.ejs", { employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Add New Employee Form
router.get("/new", (req, res) => {
    res.render("employees/new.ejs");
});

// Handle New Employee Creation (Includes Validation)
router.post("/", async (req, res) => {
    try {
        if (!req.body.age || req.body.age < 18) {
            return res.send("Error: Employee must be at least 18 years old.");
        }

        const newEmployee = await Employee.create(req.body);
        res.redirect("/employees");
    } catch (error) {
        console.error("Error creating employee:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Show Employee Details
router.get("/:employeeId", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.send("Employee not found.");
        res.render("employees/show.ejs", { employee });
    } catch (error) {
        console.error("Error fetching employee details:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Edit Employee Form
router.get("/:employeeId/edit", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.send("Employee not found.");
        res.render("employees/edit.ejs", { employee });
    } catch (error) {
        console.error("Error fetching employee for edit:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Handle Employee Update
router.put("/:employeeId", async (req, res) => {
    try {
        if (!req.body.age || req.body.age < 18) {
            return res.send("Error: Employee age must be at least 18.");
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.employeeId, req.body, { new: true });
        if (!updatedEmployee) return res.send("Employee not found.");

        res.redirect(`/employees/${updatedEmployee._id}`);
    } catch (error) {
        console.error("Error updating employee:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Employee Check-In
router.post("/:employeeId/check-in", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.send("Employee not found.");

        employee.records.push({ checkIn: new Date() });
        await employee.save();

        res.redirect(`/employees/${employee._id}/records`);
    } catch (error) {
        console.error("Error checking in:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Employee Check-Out
router.post("/:employeeId/check-out", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.send("Employee not found.");

        const lastRecord = employee.records[employee.records.length - 1];
        if (!lastRecord || lastRecord.checkOut) {
            return res.send("Employee hasn't checked in or has already checked out.");
        }

        lastRecord.checkOut = new Date();
        await employee.save();

        res.redirect(`/employees/${employee._id}/records`);
    } catch (error) {
        console.error("Error checking out:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Show Employee Records
router.get("/:employeeId/records", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.send("Employee not found.");
        
        res.render("employees/records.ejs", { employee });
    } catch (error) {
        console.error("Error fetching records:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Edit Specific Attendance Record
// router.get("/:employeeId/records/:recordIndex/edit", async (req, res) => {
//     try {
//         const employee = await Employee.findById(req.params.employeeId);
//         if (!employee) return res.send("Employee not found.");

//         const record = employee.records[req.params.recordIndex];
//         if (!record) return res.send("Record not found.");

//         res.render("employees/editRecord.ejs", { employee, record, recordIndex: req.params.recordIndex });
//     } catch (error) {
//         console.error("Error fetching record for edit:", error);
//         res.send("An error occurred. Please try again.");
//     }
// });

router.get("/:employeeId/records/:recordIndex/edit", async (req, res) => {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.send("Employee not found.");

    const record = employee.records[req.params.recordIndex];
    if (!record) return res.send("Record not found.");

    res.render("employees/editRecord.ejs", { employee, record, recordIndex: req.params.recordIndex });
});

// Update Attendance Record
router.put("/:employeeId/records/:recordIndex", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.send("Employee not found.");

        const record = employee.records[req.params.recordIndex];
        if (!record) return res.send("Record not found.");

        record.checkIn = req.body.checkIn ? new Date(req.body.checkIn) : record.checkIn;
        record.checkOut = req.body.checkOut ? new Date(req.body.checkOut) : record.checkOut;

        await employee.save();
        res.redirect(`/employees/${employee._id}/records`);
    } catch (error) {
        console.error("Error updating record:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Delete Attendance Record
router.delete("/:employeeId/records/:recordIndex", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.send("Employee not found.");

        employee.records.splice(req.params.recordIndex, 1); // Remove specific record
        await employee.save();

        res.redirect(`/employees/${employee._id}/records`);
    } catch (error) {
        console.error("Error deleting record:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Delete the Employee
router.delete("/:employeeId", async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.employeeId);
        if (!deletedEmployee) return res.send("Employee not found.");

        res.redirect("/employees");
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.send("An error occurred. Please try again.");
    }
});

module.exports = router;