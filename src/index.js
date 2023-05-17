import express from "express";

const app = express();
app.use(express.json());
app.listen(8080, () => console.log("Servidor iniciado."));

const users = [];

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
    (usuario) => usuario.email === email && usuario.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Dados inválidos" });
  }

  req.user = user;
  next();
}

function validateMessageData(req, res, next) {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Todos os campos da mensagem devem ser preenchidos." });
  }

  next();
}

function checkUserId(req, res, next) {
  const { userId } = req.params;
  const user = users.find((user) => user.id == userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      message: "Usuário não encontrado",
    });
  }

  req.user = user;
  next();
}

function checkMessage(req, res, next) {
  const { userId, messageId } = req.params;

  checkUserId(req, res, () => {
    const user = req.user;

    const message = user.messages.find((msg) => msg.id == messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Recado não encontrado.",
      });
    }

    req.message = message;
    next();
  });
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

app.get("/users/:userId", checkUserId, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
    message: "Usuário encontrado",
  });
});

app.post("/users", validateUserData, checkUserEmail, (req, res) => {
  const { name, email, password } = req.body;
  const newUser = {
    id: new Date().valueOf(),
    name,
    email,
    password,
    messages: [],
  };
  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser,
    message: "Usuário cadastrado com sucesso!",
  });
});

app.post("/login", autheticateLogin, (req, res) => {
  res
    .status(201)
    .json({ message: "Login bem sucedido. Seja bem-vindo!", user: req.user });
});

//MESSAGES
app.get("/users/:userId/messages", checkUserId, (req, res) => {
  const { userId } = req.params;
  const user = req.user;

  return res.status(200).json({
    success: true,
    data: user.message,
    message: "Recados do usuário obtidos com sucesso!",
  });
});

app.post(
  "/users/:userId/messages",
  checkUserId,
  validateMessageData,
  (req, res) => {
    const { userId } = req.params;
    const { title, description } = req.body;

    const user = req.user;

    const newMessage = {
      id: new Date().valueOf(),
      title,
      description,
    };

    user.messages.push(newMessage);

    return res.status(201).json({
      success: true,
      data: newMessage,
      message: "Recado criado com sucesso!",
    });
  }
);

app.put(
  "/users/:userId/messages/:messageId",
  checkMessage,
  validateMessageData,
  (req, res) => {
    const { userId, messageId } = req.params;
    const { title, description } = req.body;

    const user = req.user;
    const message = req.message;

    message.title = title;
    message.description = description;

    return res.status(200).json({
      success: true,
      data: message,
      message: "Mensagem atualizada com sucesso!",
    });
  }
);

app.delete("/users/:userId/messages/:messageId", checkMessage, (req, res) => {
  const { userId, messageId } = req.params;

  const user = req.user;
  const message = req.message;

  const messageIndex = user.messages.findIndex((msg) => msg.id == messageId);

  if (messageIndex === -1) {
    return res.status(404).json({
      success: false,
      data: null,
      message: "Mensagem não encontrada",
    });
  }

  user.messages.splice(messageIndex, 1);

  return res.status(200).json({
    success: true,
    message: "Mensagem excluída com sucesso!",
  });
});
