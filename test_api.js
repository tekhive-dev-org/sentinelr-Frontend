const API_BASE = 'https://sentinelr-backend.onrender.com/api';

async function check(url) {
  try {
    const res = await fetch(url);
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status} ${res.statusText}`);
    try {
      const data = await res.json();
      console.log('Body:', JSON.stringify(data).slice(0, 200));
    } catch {
      const text = await res.text();
      console.log('Text:', text.slice(0, 200));
    }
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
  console.log('-----------------------------------');
}

async function run() {
  await check(`${API_BASE}/alerts?type=sos`);
  await check(`${API_BASE}/alerts/sos`);
  await check(`${API_BASE}/sos-alerts`);
}

run();
