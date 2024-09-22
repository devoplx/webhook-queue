//@ts-nocheck

const axios = require('axios');

let webhookUrls = [
  'yourURLS'
]

const sendRequest = (url, index) => {
  let data = JSON.stringify({
    "embeds": [
      {
        "title": `Queue #${index + 1}`, // Displaying index number in the title
        "description": `This is request number ${index + 1}`, // Including the index in the description
        "color": 16711680,
        "footer": {
          "text": "Footer text"
        },
        "author": {
          "name": "Author Name"
        },
        "fields": []
      }
    ],
    "content": "Content text"
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      console.log(`Response from ${url}:`, JSON.stringify(response.data));
    })
    .catch((error) => {
      console.error(`Error from ${url}:`, error);
    });
};

(async function alternateRequests() {
  let totalRequests = 10; // Total requests across all webhooks
  let webhookIndex = 0; // Start with the first webhook

  for (let i = 0; i < totalRequests; i++) {
    // Send request with the current index
    sendRequest(webhookUrls[webhookIndex], i);

    // Toggle between 0 and 1 (alternating the webhooks)
    webhookIndex = (webhookIndex + 1) % webhookUrls.length;
  }
})();
