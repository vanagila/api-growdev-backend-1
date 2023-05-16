import express from "express";

const app = express();
app.use(express.json());
app.listen(8080, () => console.log("Servidor iniciado."));

const users = [];
const messages = [];

function checkUserEmail(req, res, next) {
  const { email } = req.body;
  const user = users.find((user) => user.email === email);

  if (user) {
    return res.status(400).json({ message: "Email já cadastrado." });
  }

  next();
}

function validateUserData(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Todos os campos devem ser preenchidos." });
  }

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ message: "E-mail inválido." });
  }

  next();
}

function autheticateLogin(req, res, next) {
  const { email, password } = req.body;

  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Dados inválidos" });
  }

  req.user = user;
  next();
}

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ status: 200, message: "Bem-vindo! Você está na home da API" });
});

app.get("/users", (req, res) => {
  if (!users.length) {
    return res.status(404).json({
      success: false,
      data: null,
      message: "Não há usuários cadastrados no momento",
    });
  }

  return res.status(200).json({
    success: true,
    data: users,
    message: "Dados de usuários buscados com sucesso!",
  });
});

app.post("/users", validateUserData, checkUserEmail, (req, res) => {
  const { name, email, password } = req.body;
  const newUser = {
    id: new Date().valueOf(),
    name,
    email,
    password,
  };
  users.push(newUser);

  res.status(201).json(newUser);
});

app.post("/login", autheticateLogin, (req, res) => {
  res.status(201).json({ message: "Login bem-sucedido. Seja bem-vindo!" });
});
