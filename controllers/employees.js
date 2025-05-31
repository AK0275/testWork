const router = require("express").Router();
const Employee = require("../models/employee");

// Display All Employees
router.get("/", async (req, res) => {
    const employees = await Employee.find();
    res.render("employees/index.ejs", { employees });
});

// Add New Employee Form
router.get("/new", (req, res) => {
    res.render("employees/new.ejs");
});

// Handle New Employee Creation
router.post("/", async (req, res) => {
    req.body.owner = req.session.user._id;
    await Employee.create(req.body);
    res.redirect("/employees");
});

// Show Employee Details
router.get("/:employeeId", async (req, res) => {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.send("Employee not found.");
    res.render("employees/show.ejs", { employee });
});

// Edit Employee Form (Newly Added)
router.get("/:employeeId/edit", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) {
            return res.send("Employee not found.");
        }
        res.render("employees/edit.ejs", { employee });
    } catch (error) {
        console.error("Error fetching employee:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Handle Employee Update (Newly Added)
router.put("/:employeeId", async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.employeeId, req.body, { new: true });
        if (!updatedEmployee) {
            return res.send("Employee not found.");
        }
        res.redirect(`/employees/${updatedEmployee._id}`);
    } catch (error) {
        console.error("Error updating employee:", error);
        res.send("An error occurred. Please try again.");
    }
});

// Employee Check-In
router.post("/:employeeId/check-in", async (req, res) => {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.send("Employee not found.");

    employee.records.push({ checkIn: new Date() });
    await employee.save();

    res.redirect(`/employees/${employee._id}/records`);
});

// Employee Check-Out
router.post("/:employeeId/check-out", async (req, res) => {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.send("Employee not found.");

    const lastRecord = employee.records[employee.records.length - 1];
    if (!lastRecord || lastRecord.checkOut) {
        return res.send("Employee hasn't checked in or has already checked out.");
    }

    lastRecord.checkOut = new Date();
    await employee.save();

    res.redirect(`/employees/${employee._id}/records`);
});

// Show Employee Records
router.get("/:employeeId/records", async (req, res) => {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.send("Employee not found.");

    res.render("employees/records.ejs", { employee });
});

module.exports = router;