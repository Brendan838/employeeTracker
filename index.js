const inquirer = require("inquirer")
const mysql = require('mysql2')
require('console.table');
const db = mysql.createConnection(
{
host: 'localhost',
user: 'root',
password: 'password',
database: 'company_db'
},
console.log('Connected to company_db database')
);

//inquirer question objects
const mainMenu = [
	{
	type: "list",
	name: "mainOptions",
	message: "What would you like to do?",
	choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update employee role", "Quit"]
	}
]

const addDeptQuestion = [
	{
	type: "input",
	name: "deptName",
	message: "What is the name of the department?"
	},
]

const addRoleQuestions = [

	{
	type: "input",
	name: "roleName",
	message: "What is the name of the role?"
	},
	{
	type: "input",
	name: "salaryAmount",
	message: "What is the salary of the role"
	},
	{
	type: "list",
	name: "roleDept",
	message: "Which department does the role belong to?",
	choices: []
	}
]

const addEmployeeQuestions = [

	{
	type: "input",
	name: "firstName",
	message: "What is the employees first name?"
	},
	{
	type: "input",
	name: "lastName",
	message: "What is the employees last name?"
	},
	{
	type: "list",
	name: "role",
	message: "What is the role of the new employee?",
	choices: []
	},
	{
	type: "list",
	name: "manager",
	message: "What manager will the employee report to?",
	choices: []
	}

]

const updateEmployeeQuestions = [

	{
	type: "list",
	name: "employee",
	message: "Which Employee's role do you want to update?",
	choices: []
	},

	{
	type: "list",
	name: "role",
	message: "Which new role would you like to assign to the selected employee?",
	choices: []
	}
]

//objects declared that will store info pulled out of database for use in inquirer & insertion queries

var deptArray, roleArray, managerArray, employeeArray;

//functions to populate data objects and undefined variables that will hold the objects
function getDept(){
db.query(`SELECT * FROM dept_tab;`, function(err,results){
	deptArray = results
	var values = results.map(function(val){
	return val.dept
	});
	addRoleQuestions[2].choices = values
	});
}

function getRoles(){
db.query(`SELECT * FROM role_tab;`, function(err,results){
	roleArray = results;
	var values = results.map(function(val){
	return val.title
	});
	addEmployeeQuestions[2].choices = values;
	updateEmployeeQuestions[1].choices = values;
	});

}
	
function getManagers(){
db.query(`SELECT e.emp_id, CONCAT(e.first_name, ' ', e.last_name) AS manager FROM emp_tab e INNER JOIN emp_tab m ON e.emp_id = m.manager_id;`, function(err,results){
	managerArray = results
	var values = results.map((val) => {
	return val.manager
	})
	addEmployeeQuestions[3].choices = values
	})
};

function getEmployees(){
db.query(`SELECT emp_id, CONCAT(first_name, ' ', last_name) AS employee FROM emp_tab;`, function(err,results){
	employeeArray = results
	var values = results.map((val) => {
	return val.employee
	})
	updateEmployeeQuestions[0].choices = values
	})
};





function populateQuestions(){
getDept();
getRoles();
getManagers();
getEmployees();
}
//main menu inquirer questions
menuScreen = function () {
populateQuestions();



inquirer.prompt(mainMenu).then((responseObj) => {
	switch (responseObj.mainOptions){

	case "View all departments":
	tableView('SELECT * FROM dept_tab')
	break;
	case "View all roles":
	tableView('SELECT * FROM role_tab')
	break;
        case "View all employees":
	tableView(`SELECT 
		e.emp_id,
		e.first_name,
		e.last_name,
		d.dept,
		r.title,
		r.salary,
		CONCAT(m.first_name, ' ', m.last_name) AS manager
		FROM emp_tab e
		LEFT JOIN role_tab r ON e.role_id = r.role_id
		LEFT JOIN emp_tab m ON m.emp_id = e.manager_id
		LEFT JOIN dept_tab d ON r.dept_id = d.dept_id;`)
	break;
  	case "Add a department":
	addDept();
	break;	
	case "Add a role":
	addRole();
	break;	
	//TO-DO: THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
	//create questions and do db query for choices	
	//prompt questions
	//take data from questions and insert into database
	//do a query to match manager to manager id
	case "Add an employee":
	addEmployee();
	break;	
	//TO-DO: THEN I am prompted to select an employee to update and their new role and this information is updated in the database 
	case  "Update employee role":
	updateEmployee();
	break;	
	case "Quit":
	break;
	}


});
}

//functions within menuscreen function

//function for viewing data from first three questions
const tableView = function(query){
db.query(query, async function(err, results){
	console.table(results)
	await menuScreen();
	})
}
//Function for adding department
const addDept = function(){
inquirer.prompt(addDeptQuestion).then((responseObj) => {
const {deptName} = responseObj
db.query(`INSERT INTO dept_tab (dept) VALUES ('${deptName}');`, async function(){
console.log(`Added ${deptName} to the database`)
await menuScreen();
});
})
}

//Function for adding roles
function addRole(){

inquirer.prompt(addRoleQuestions).then(async function(responseObj){

const {roleName, salaryAmount, roleDept} = responseObj;

console.log(`${roleName},${salaryAmount},${roleDept}`)

for (let i = 0; i < deptArray.length; i++){

if(deptArray[i].dept === roleDept){
	var deptID = deptArray[i].dept_id
	db.query(`INSERT INTO role_tab (title, salary, dept_ID) VALUES ('${roleName}', ${salaryAmount},${deptID});`, function(){
	console.log(`Added ${roleName} to the database, with a ${salaryAmount} salary and role ID of ${deptID}`)
	menuScreen();
	});
}
}
});
}
//function for adding an employee
function addEmployee(){

	inquirer.prompt(addEmployeeQuestions).then(function(responseObj){

	const {firstName, lastName, role, manager} = responseObj;

	let managerID, roleID; 

	for (let i = 0; i < managerArray.length; i++){
	if(managerArray[i].manager == manager){
	managerID = managerArray[i].emp_id
	}
	}

	for (let t = 0; t < roleArray.length; t++){
	if(roleArray[t].title == role){
	roleID = roleArray[t].role_id
	}
	}
			

	db.query(`INSERT INTO emp_tab (first_name, last_name, manager_id, role_id) VALUES ('${firstName}', '${lastName}',${managerID}, ${roleID});`, function(){
				
	console.log(`${managerID}, ${roleID}`)
	menuScreen();
	});					
			
	});
}
	

function updateEmployee(){

inquirer.prompt(updateEmployeeQuestions).then(function(responseObj){

const {employee, role} = responseObj;

let employeeID, roleID;

for (let i = 0; i < employeeArray.length; i++){
if(employeeArray[i].employee == employee){
employeeID = employeeArray[i].emp_id
}
}
for (let t = 0; t < roleArray.length; t++){
	if(roleArray[t].title == role){
	roleID = roleArray[t].role_id
}
}

db.query(`UPDATE emp_tab SET role_id = ${roleID} WHERE emp_id = ${employeeID};`, function(){
console.log(`Update ${employee} to new role: ${role}`)
menuScreen();
});




});
}

menuScreen();