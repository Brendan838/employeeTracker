DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;
USE company_db;

CREATE TABLE dept_tab(
  dept_id INT NOT NULL AUTO_INCREMENT,
  dept VARCHAR(30) NOT NULL,
  PRIMARY KEY (dept_id)
);

CREATE TABLE role_tab(
  role_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  dept_id INT
  
);

CREATE TABLE emp_tab(
  emp_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT,
  FOREIGN KEY(role_id) REFERENCES role_tab(role_id)
  
);


    
    