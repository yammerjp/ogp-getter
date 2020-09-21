`use strict`

const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

const express = require('express');
const app = express();

app.get('/', async (req,res) => {
  res.status(200).json({
    live:true,
    message: "The API server is living!"
  }).end();
});

app.get('/meta', async (req,res) => {
  const url = req.query.url;

  const fetchedText = await fetch(url).then(res=>res.text());
  const root = parse(fetchedText);
  const metas = root.querySelectorAll("meta");
  const metajson = metas.map(meta => ({meta: meta.rawAttrs}));

  res.status(200).json({url, metas: metajson}).end();
});

const port = process.env.PORT || 3000;
app.listen(3000, () => console.log(`listening on port ${port}`));
