const axios = require('axios');

const regexLinks = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gmi;
const regexQuotes = /"(.*?)"|'(.*?)'|href(?:\s*?)=(?:\s*?)"(.*?)"|href(?:\s*?)=(?:\s*?)'(.*?)'/gmi;
const regexUrl = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/gmi;

const toCrawl = [];
const crawled = [];
const threads = 5;

// const startingUrl = 'http://theguidon.com';
// const validDomain = /^http(.{2,8})theguidon\.com/gmi;
// const id = 'theguidon';

const startingUrl = 'https://www.tagaloglang.com';
const validDomain = /^http(.{2,8})tagaloglang\.com/gmi;
const id = 'tagaloglang';

for(let i = 0; i < threads; i++) toCrawl.push(startingUrl);

const loop = () => {
  const url = toCrawl.shift();
  console.log('CRAWLING: ', url);
  url && axios.get(url)
  .then(({data: html}) => {
    let match;

    regexLinks.lastIndex = 0;
    while(match = regexLinks.exec(html)){
      let matchedUrl = match[2];
      if(!matchedUrl.startsWith('http') && !matchedUrl.startsWith('mailto')) matchedUrl = require('url').resolve(url, matchedUrl);
      for(let i = 0; i < 2; i++) matchedUrl = matchedUrl
        .replace(/\/$/, "")
        .replace(/\#.*?$/, "")
        .replace(/\?.*?$/, "")
        .trim();

      if(
        matchedUrl.match(validDomain) &&
        !crawled.includes(matchedUrl) &&
        !toCrawl.includes(matchedUrl)
      ){
        console.log(toCrawl.length, crawled.length, matchedUrl);
        toCrawl.push(matchedUrl);
      }
    }

    if(!crawled.includes(url)){
      crawled.push(url);
    }

    require('fs').writeFileSync(id + '.csv', toCrawl.join('\n'));
  })
  .catch(e => {
    console.log('ERROR: ', url);
    // toCrawl.push(url);
  })
  .finally(() => {
    loop();
  });
};

for(let i = 0; i < threads; i++) loop();
