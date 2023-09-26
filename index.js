const mysql = require('mysql');
const fetch = require('node-fetch'); 

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'your-database-host',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database-name',
});

// Function to fetch data from the API
async function fetchDataFromAPI(link) {
  try {
    const response = await fetch(link);
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

async function putIntoDB(link, table, columns) {
  try {
    // Fetch data from the API
    const fetchedData = await fetchDataFromAPI(link);

    // The data to insert

    const modifiedData = fetchedData.map(data => {
      if (data.name) {
        data.nama = data.name;
        delete data.name;
      }
      return data;
    });

    // The data to insert
    const insertData = modifiedData.map(data =>
      columns.map(column => data[column])
    );

    // const insertData = fetchedData.map((data) => columns.map(column => data[column]));

    const insertQuery = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ?`;

    // Insert the data into the database
    connection.query(insertQuery, [insertData], (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
      } else {
        console.log('Data inserted successfully');
      }
    });
  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
}

//code below this line!!
async function fetchAndInsertData() {
  try {
    // Fetch data for provinces
    const provincesData = await fetchDataFromAPI('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');

    // Define the table name and columns
    const tableName = 'master_kota';
    const tableColumns = ['id', 'nama', 'province_id'];

    // Connect to the database
    connection.connect(async (err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
      }
      console.log('Connected to MySQL database');

      // Insert data for each province
      for (const province of provincesData) {
        const link = `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${province.id}.json`;
        console.log(link, tableName, tableColumns);
        await putIntoDB(link, tableName, tableColumns);

        const kecamatanData = await fetchDataFromAPI(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${province.id}.json`);
        // Insert data for each kota
        for (const p of kecamatanData) {
          const link = `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${p.id}.json`;
          console.log(link, 'master_kecamatan', ['id', 'nama', 'regency_id']);
          await putIntoDB(link, 'master_kecamatan', ['id', 'nama', 'regency_id']);

          const kelurahanData = await fetchDataFromAPI(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${p.id}.json`);
          // Insert data for each kecamatan
          for (const k of kelurahanData) {
            const link = `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${k.id}.json`;
            console.log(link, 'master_kelurahan', ['id', 'nama', 'district_id']);
            await putIntoDB(link, 'master_kelurahan', ['id', 'nama', 'district_id']);
          }
        }
      }

      // Close the database connection
      connection.end();
    });
  } catch (error) {
    console.error('Error fetching and inserting data for provinces:', error);
  }
  
}

// Call the function to fetch and insert data 
fetchAndInsertData();
