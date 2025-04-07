const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

// Sample data for flowers and baskets.
const flowerItems = [
  { name: "Red Rose", img: "/images/flowers/redrose.png", model: "/models/redrose.glb", type: "3d", scale: [8, 8, 8] },
  { name: "Paniculata", img: "/images/flowers/paniculata.png", model: "/models/paniculata.glb", type: "3d", scale: [5, 5, 5] },
  { name: "Orangelily", img: "/images/flowers/orangelily.png", type: "image" },
  { name: "Pink Peony", img: "/images/flowers/pinkpeony.png", type: "image" },
  { name: "Blue Rose", img: "/images/flowers/bluerose.png", type: "image" },
  { name: "Dahlia", img: "/images/flowers/dahlia.png", type: "image" },
  { name: "Camellia", img: "/images/flowers/camellia.png", type: "image" },
  { name: "Madonna", img: "/images/flowers/madonna.png", model: "/models/madonna.glb", type: "3d", scale: [7, 7, 7] },
];

const basketItems = [
  { name: "Basket", img: "/images/baskets/basket.png", model: "/models/basket.glb", scale: [1, 1, 1] },
  { name: "Boucket", img: "/images/baskets/boucket.png", model: "/models/boucket.glb", scale: [1, 1, 1] },
];

app.get('/api/items', (req, res) => res.json(flowerItems));
app.get('/api/baskets', (req, res) => res.json(basketItems));

let flowerDesign = null;
app.get('/api/flowerdesign', (req, res) => {
  if (flowerDesign) res.json(flowerDesign);
  else res.status(404).json({ message: 'No design found' });
});
app.post('/api/flowerdesign', (req, res) => {
  flowerDesign = req.body;
  res.status(201).json(flowerDesign);
});

// Ground detection endpoint using detect_ground.py.
app.post('/api/detect', (req, res) => {
  const base64Data = req.body.image;
  if (!base64Data) {
    return res.status(400).json({ error: 'No image provided' });
  }
  const buffer = Buffer.from(base64Data, 'base64');
  const inputFilePath = path.join(__dirname, 'temp_input.jpg');

  fs.writeFile(inputFilePath, buffer, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({ error: 'Failed to write image file' });
    }
    execFile('python', [path.join(__dirname, 'detect_ground.py'), inputFilePath], (error, stdout, stderr) => {
      // Remove the temporary file.
      fs.unlink(inputFilePath, () => {});
      if (error) {
        console.error('Error executing python script:', error);
        return res.status(500).json({ error: 'Detection failed' });
      }
      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        res.status(500).json({ error: 'Invalid detection output' });
      }
    });
  });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
