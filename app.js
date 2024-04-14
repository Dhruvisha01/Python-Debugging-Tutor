import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render('index')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});