const { auth } = require("../db");

const authenticate = async (req, res, next) => {
  let uid = (
    await auth
      .signInWithEmailAndPassword(req.body.userEmail, req.body.userPassword)
      .catch((error) => {
        res.send({ error: `error while signing in, ${error}` });
      })
  );
  if(uid){
    uid = uid.user.uid
    await auth.signOut();
    res.send(JSON.stringify(uid));
  }
};

const signUp = async (req, res, next) => {
  const email = req.body.uEmail;
  const password = req.body.uPassword;
  let uid;
  await auth
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      uid = user.user.uid;
    })
    .catch((error) => {
      console.log(error.message);
      res.send({ error: "true" });
    });
  console.log(uid);
  res.send(JSON.stringify(uid));
};

module.exports = { authenticate, signUp };
