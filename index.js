const express = require("express")
const axios = require("axios")
const cors = require("cors")
const admin = require("firebase-admin")
const dotenv = require("dotenv")
const codeStore = require("./utils/codeStore")

dotenv.config()
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
})

const app = express()
app.use(cors())
app.use(express.json())

app.post("/sendCode", async (req, res) => {
  const { phone } = req.body
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  codeStore.set(phone, code)

  const text = `ACTA.Pro: ваш код — ${code}`
  await axios.get("https://sms.ru/sms/send", {
    params: {
      api_id: process.env.SMS_API_ID,
      to: phone,
      msg: text,
      from: process.env.SENDER_NAME,
      json: 1
    }
  })

  res.json({ success: true })
})

app.post("/verifyCode", async (req, res) => {
  const { phone, code } = req.body
  if (codeStore.get(phone) !== code) return res.status(403).json({ error: "Неверный код" })

  const uid = `phone_${phone}`
  const token = await admin.auth().createCustomToken(uid)
  codeStore.delete(phone)

  res.json({ token })
})

app.listen(process.env.PORT || 3000, () => console.log("🔥 ACTA.SMS running"))
