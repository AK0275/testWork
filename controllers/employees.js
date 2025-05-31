const router = require("express").Router();
const Employee = require("../models/employee");

// Display Employees
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

// Delete Employee
router.delete("/:employeeId", async (req, res) => {
    const employee = await Employee.findById(req.params.employeeId);
    if (employee.owner.equals(req.session.user._id)) {
        await employee.deleteOne();
        res.redirect("/employees");
    } else {
        res.send("You don't have permission to delete this employee.");
    }
});

// Edit Employee Form
router.get("/:employeeId/edit", async (req, res) => {
    const currentEmployee = await Employee.findById(req.params.employeeId);
    res.render("employees/edit.ejs", { employee: currentEmployee });
});

// Handle Employee Update
router.put("/:employeeId", async (req, res) => {
    const currentEmployee = await Employee.findById(req.params.employeeId);
    if (currentEmployee.owner.equals(req.session.user._id)) {
        await currentEmployee.updateOne(req.body);
        res.redirect("/employees");
    } else {
        res.send("You don't have permission to edit this employee.");
    }
});

module.exports = router;