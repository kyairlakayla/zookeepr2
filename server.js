const PORT = process.env.PORT || 3001;
const { animals } = require('./data/animals');
const express = require('express');
const res = require('express/lib/response');
const app = express();

function filterByQuery(query, animalsArray) {
    let filteredResults = animalsArray;
    let personalityTraitsArray = [];

if (query.personalityTraits) {
    if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
    } else {
        personalityTraitsArray = query.personalityTraits;
    }
    personalityTraitsArray.forEach(trait => {
        filteredResults = filteredResults.filter(
            animal => animal.personalityTraits.indexOf(trait) !== -1
        );
    });      
}

if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
}
if (query.specis) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
}
if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
}

return filteredResults;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    console.log(req.query)

    res.json(results);
});

//Add a default route handle for other paths 
app.get('*', (req, res) => {
    res.status(404).send("Page not found");
});

app.listen(PORT, () => {
    console.log('API server now on port ${PORT}!');
});

