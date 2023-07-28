const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const CryptoJS = require('crypto-js');

const app = express();
app.use(cors());
app.use(express.json());

// Definindo um token JWT estático.
const staticJwtToken = jwt.sign({ app: 'CassinoApp' }, 'lakoq847AKvmaiU1947makSOyf9fvAaV');

const lugarOculto = 'LugarOculto';
const lugarEscolhido = 'LugarEscolhido';

const defaultBoardState = Array(25).fill(lugarOculto);

// Função para embaralhar o array de lugares
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Função para criar um novo jogo
function createNewGame() {
  let lugares = defaultBoardState.slice();

  // Decida quantos LugaresEscolhidos teremos
  let numLugaresEscolhidos = Math.floor(Math.random() * 2) + 4; // Gera um número aleatório entre 4 e 5

  for(let i = 0; i < numLugaresEscolhidos; i++) {
    lugares[i] = lugarEscolhido;
  }

  shuffleArray(lugares);
  
  const gameToken = CryptoJS.AES.encrypt(JSON.stringify(lugares), 'a random password').toString();
  return gameToken;
}


app.get('/token', (req, res) => {
  res.json({ token: staticJwtToken });
});

app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token === staticJwtToken) {
            next();
        } else {
            res.status(403).send('Invalid token');
        }
    } else {
        res.status(401).send('No token provided');
    }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token === staticJwtToken) {
      next();
    } else {
      res.status(403).send('Invalid token');
    }
  } else {
    res.status(401).send('No token provided');
  }
}

app.use(verifyToken);

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token === staticJwtToken) {
            next();
        } else {
            res.status(403).send('Invalid token');
        }
    } else {
        res.status(401).send('No token provided');
    }
});


app.get('/game', (req, res) => {
  const gameToken = req.headers.gametoken;
  if (!gameToken) {
    res.status(400).send('No game token provided');
  } else {
    try {
      const decryptedGame = JSON.parse(CryptoJS.AES.decrypt(gameToken, 'a random password').toString(CryptoJS.enc.Utf8));
      res.json(decryptedGame);
    } catch (error) {
      res.status(400).send('Invalid game token');
    }
  }
});


app.post('/newgame', (req, res) => {
  const gameToken = createNewGame();
  res.json({ gameToken });
});

const port = 3001;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
