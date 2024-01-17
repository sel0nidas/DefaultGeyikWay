const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const urlModule = require('url');

const app = express();
const port = 3000; // You can change this to your desired port

app.get('/:link', async (req, res) => {
  // Replace this URL with the one you want to scrape
  //res.send(req.params.link)
  if(req.params.link.length < 1)
    const urlToScrape = `https://eksisozluk111.com`;
  else{
    const urlToScrape = `https://eksisozluk111.com/${req.params.link}`;
  }

  // Fetch the page
  const $ = await fetchPage(urlToScrape);

  if ($) {
    $('#onetrust-consent-sdk').attr('style', 'display: none !important;');

    // Extract information as needed
    const htmlContent = $('html').html();

    // Fetch and include external stylesheets
    const stylesheets = [];
    $('link[rel="stylesheet"]').each((index, element) => {
      const href = $(element).attr('href');
      const absoluteUrl = resolveUrl(urlToScrape, href);
      stylesheets.push(axios.get(absoluteUrl));
    });

    Promise.all(stylesheets)
  .then((stylesheetResponses) => {
    const stylesheetContents = stylesheetResponses.map((response) => response.data);
    // Include the HTML content and external stylesheets in the response
    res.send(`${htmlContent}\n<style>${stylesheetContents.join('\n')}#onetrust-consent-sdk{display:none !important;}</style>`);
  })
  .catch((error) => {
    console.error(`Error fetching stylesheets: ${error.message}`);
    if (!res.headersSent) {
      // Send an error response only if headers have not been sent
      res.status(500).json({ error: 'Error fetching stylesheets' });
    }
  });
  } else {
    res.status(500).json({ error: 'Error fetching the page' });
  }
});

async function fetchPage(url) {
  try {
    // Send an HTTP request to the URL
    const response = await axios.get(url);

    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    return $;
  } catch (error) {
    console.error(`Error fetching the page: ${error.message}`);
    return null;
  }
}

function resolveUrl(baseUrl, relativeUrl) {
  return urlModule.resolve(baseUrl, relativeUrl);
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/scrape`);
});
