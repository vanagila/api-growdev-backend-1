import express from "express";

const app = express();
app.use(express.json());
app.listen(8080, () => console.log("Servidor iniciado"));

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ status: 200, message: "Bem-vindo! Você está na home da API" });
});
