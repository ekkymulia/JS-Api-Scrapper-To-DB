const mysql = require('mysql');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'your-database-host',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database-name',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// The data to insert
// const fetchedData = [
//   {
//     id: '11',
//     name: 'ACEH',
//   },
// ];

const fetchedData = fetch(`...`)
.then(response => response.json())
.then(provinces => console.log(provinces));

const insertQuery = 'INSERT INTO provinces (id, name) VALUES ?';
connection.query(insertQuery, [fetchedData.map((data) => [data.id, data.name])], (err, results) => {
  if (err) {
    console.error('Error inserting data:', err);
  } else {
    console.log('Data inserted successfully');
  }

  // Close the database connection
  connection.end();
});
