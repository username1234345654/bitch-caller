require('dotenv').config();
const record = Boolean(process.env.TWILIO_RECORD);
const accountSid = String(process.env.TWILIO_ACCOUNT_SID);
const authToken = String(process.env.TWILIO_AUTH_TOKEN);
const from = String(process.env.TWILIO_FROM_NUMBER);
const message = String(process.env.TWILIO_MESSAGE);
const fs = require('fs');
const path = require('path');
const asyncPool = require('tiny-async-pool');
const client = require('twilio')(accountSid, authToken);

const filePath = path.join(__dirname, '/resources/GOV_RU_DNR_MSK.txt');
const data = fs.readFileSync(filePath).toString('utf-8');
const numbers = data.match(/pref:\+7(.+)\n?/gm);

const clean = (number) => {
  const cleanNumber = number.replace(/(pref:|\(|\)|-|\/| | )/gm, '');
  return cleanNumber.length === 12 ? cleanNumber : null;
}
const call = (number) => {
  const to = clean(number);
  if (to === null) return;
  const opts = {
    record,
    to,
    from,
    twiml: `<Response><Say loop="2" language="ru-RU">${message}</Say></Response>`,
   }
  return client.calls.create(opts).catch(e => console.error(e));
}

asyncPool(5, numbers, call);
