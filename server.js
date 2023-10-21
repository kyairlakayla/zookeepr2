const fs = require('fs');
const path = require('path');

const { animals } = require('./data/animals');
const express = require('express');
const res = require('express/lib/response');
const { addAbortSignal } = require('stream');
const PORT = process.env.PORT || 3001;
const app = express();

// parse incoming string or array data
app.use(express.urlencoded({ extended: true}));
// parse incoming JSON data
app.use(express.json());
app.use(express.static('public'));

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

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    console.log(req.query)

    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
    
});

function createNewAnimal(body, animalsArray) {
    console.log(body);
    const animal = body;
    animalsArray.push(animal);
    
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    
    return animal;
}

app.post('/api/animals', (req, res) => {
    // req.body is where incoming content will be 
    console.log(req.body);
    req.body.id = animals.length.toString();

    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted');
    } else {

    // add animal to JSON file and animals array
    const animal = createNewAnimal(req.body, animals);
    res.json(req.body);
    }
}); 

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

app.listen(PORT, () => {
    console.log('API server now on port ${PORT}!');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
