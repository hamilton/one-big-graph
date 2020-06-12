const { BigQuery } = require("@google-cloud/bigquery");
const fs = require("fs");

const f = process.argv[2];

let currentQuery;

async function query(q) {
  const bigqueryClient = new BigQuery();
  const options = {
    query: q,
    location: "US",
  };
  const [job] = await bigqueryClient.createQueryJob(options).catch((err) => {
    console.log(err);
  });
  console.log(`Job ${job.id} started.`);
  console.log(q);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  return rows;
}

let output;

async function runQueryAndDoSomething(fileName) {
  const sql = fs.readFileSync(fileName).toString().trim();
  // currentQuery = sql.trim();
  if (currentQuery !== sql && !output) {
    const results = await query(sql);
    currentQuery = sql;
    // save resultSet.
    console.log(results.slice(0, 5));
    const keys = Object.keys(results[0]);
    keys.forEach((k) => {
      if (results[0][k].constructor.toString().includes("BigQueryDate")) {
        results.forEach((r) => {
          r[k] = r[k].value;
        });
      }
    });
    const asString = JSON.stringify(results);
    const newFile = `${fileName.split("/").slice(-1)[0].split(".sql")[0]}.json`;
    fs.writeFileSync(`public/data/${newFile}`, asString);
  }
}

runQueryAndDoSomething(f);
