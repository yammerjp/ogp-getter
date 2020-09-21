`use strict`

const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

const express = require('express');
const app = express();

// $ curl http://localhost:3000/
app.get('/', async (req,res) => {
  res.status(200).json({
    live:true,
    message: "The API server is living!"
  }).end();
});

const createMetaStrings = async (url) => {
  const fetchedText = await fetch(url).then(res=>res.text());
  const root = parse(fetchedText);
  const metas = root.querySelectorAll("meta");
  const metaStrings = metas.map(meta => meta.rawAttrs);
  return metaStrings;
};

// $ curl http://localhost:3000/meta?url=https://basd4g.net/
app.get('/meta', async (req,res) => {
  const url = req.query.url

  createMetaStrings(url).then( meta => {
    res.status(200).json({url, meta}).end();
  }).catch( () => {
    res.status(500).end();
  });
});

const ogpString2ogpObject = ogpString => {
  const propLength= "property=".length
  const colonOrSemicolon = ogpString[propLength];
  const property = ogpString.slice(
    propLength + colonOrSemicolon.length
  ).split(colonOrSemicolon, 2)[0];

  const contentWithSeparator = ogpString.split("content=", 2)[1];
  const content = contentWithSeparator.slice(1, -1);

  return { property, content };
};

// $ curl http://localhost:3000/ogp?url=https://basd4g.net/
app.get('/ogp', async (req,res) => {
  const url = req.query.url

  createMetaStrings(url).then( metaStrings => {

    const regex = /^property=('|")og:[a-z_]+('|")( )+content=('|").*('|")$/;

    const ogpStrings = metaStrings.
      map( s => s.trim() ).
      filter( s => regex.test(s)
    );

    const ogp = ogpStrings.map(ogpString2ogpObject);

    res.status(200).json({url, ogp}).end();
  }).catch( () => {
    res.status(500).end();
  });
});

const port = process.env.PORT || 3000;
app.listen(3000, () => console.log(`listening on port ${port}`));
