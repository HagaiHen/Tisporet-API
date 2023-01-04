const { auth } = require("../db");

const authenticate = async (req, res, next) => {
  const uid = (
    await auth
      .signInWithEmailAndPassword(req.body.userEmail, req.body.userPassword)
      .catch((error) => {
        res.status(400).send(`error while signing in, ${error}`);
      })
  ).user.uid;
  await auth.signOut();
  res.send(JSON.stringify(uid));
};

const signUp = async (req, res, next) => {
  const email = req.body.uEmail;
  const password = req.body.uPassword;
  let uid;
  await auth
    .createUserWithEmailAndPassword(email, password)
    .catch((error) => {
      res.status(400).send(`Sign up failed, error: ${error}`);
    }).then((user)=>{
        uid = user.user.uid;
    });
  console.log(uid);
  res.send(JSON.stringify(uid));
};

module.exports = { authenticate, signUp };
