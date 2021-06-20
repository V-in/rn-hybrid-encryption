const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");

const secret = "top secret";
const AES_KEY_SIZE = 256 * 8;
const PKCS_PADDING = 11 * 8;

// const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
//   modulusLength: 4096,
//   publicKeyEncoding: {
//     type: "spki",
//     format: "pem",
//   },
//   privateKeyEncoding: {
//     type: "pkcs8",
//     format: "pem",
//     cipher: "aes-256-cbc",
//     passphrase: "top secret",
//   },
// });

// console.log(publicKey);
// console.log(privateKey);

const pubKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxLAS/00oc/K5H06tmGJw
mTfRJ9UsBKontSw/SPGcLCtvxJSK5LnAajnm6Ce3mz2M7yz2Afz0ZOoF7k7QSWLV
HYxdrP5qVX7rjx0LVL6fXADcz1v0fq60r10Ou2T6+8rUD9er6zxXxpcXAnALsMcd
WlW79FYz7LLcM5AJeFWAjP9Kjn3I7zsUegco0nM6ZNNMB5tcawTxDzH+CH+st1LO
18IodPkXumbn9WF8VlWD55wxw5he5bgyMVTJILjjcCJtivPvDXnYCACSrbsxcM7C
pZR+UE7JMT1MNSyiCJ/2Ppvlw381J5s/zEUKws7prU1Wll0bAKuI69I4/pQtkE5U
At1EKaaeL/eSw1oGOMCXYIwBUeKiHfvER8eaasjcching8yCUggnA4xIgfY6vYv6
rAClWqO4ciscNT2clAsXHvp6JMUzO4oJyPh710vgQjYRsz2M6i8mAJkhBoIe12h6
FENDFWj85UdC87X42lQ3i4fCXEIszUAvxK2Pj8LJ5Vb5Kv5IuZWbB30k5Mzmxp1p
IxiXLLzJTNlKeFnh8wyuZvs6044sFFe5Rkw1uD8zCS6IdbjiBnkNaA8sTtRKWt7D
T18MUxLzJSQEYaULUI3Azp5AbgEem2poQvk0spyoPkqBnxHi5Q+yKLDdL/jsZ8Yp
tEStg0al1AM9DReLQsS2xbkCAwEAAQ==
-----END PUBLIC KEY-----`;

const privKey = `-----BEGIN ENCRYPTED PRIVATE KEY-----
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
-----END ENCRYPTED PRIVATE KEY-----`;

const app = express();

app.use(bodyParser.json({}));
app.post("/", (req, res) => {
  try {
    const bits = req.body.data.split("|");
    const [encryptedKeyBase64, iv, cypher] = bits;
    const encryptedKey = Buffer.from(encryptedKeyBase64, "base64");

    const key = crypto.privateDecrypt(
      {
        key: privKey,
        passphrase: "top secret",
        padding: crypto.constants.RSA_SSLV23_PADDING,
      },
      Buffer.from(encryptedKey, "utf-8")
    );

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(key.toString(), "hex"),
      Buffer.from(iv, "base64")
    );

    let decrypted = "";
    decrypted += decipher.update(cypher, "hex", "utf8");
    decrypted += decipher.final("utf8");
    decrypted = JSON.parse(decrypted);

    res.json(decrypted);
  } catch (err) {
    res.status(400).json({ message: "Bad request" });
  }
});

app.listen("3000", "0.0.0.0", () => console.log("Listening"));
