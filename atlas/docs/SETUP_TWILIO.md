# Setup — Twilio WhatsApp Sandbox + Squad groups

> Step-by-step for Fanette. ~15 minutes total. Do this AFTER the app is deployed
> to Vercel preview URL (you'll need that URL in step 4).

---

## Part A — Twilio Sandbox (steps 1–7)

### 1. Sign up at twilio.com

https://www.twilio.com/try-twilio  → personal email is fine. Free trial gives
$15 credit, more than enough for the hackathon.

### 2. Open the WhatsApp Sandbox console

https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

You'll see a sandbox number `+1 415 523 8886` and a join code like
`join example-elephant`.

### 3. Join the sandbox from your own phone

Open WhatsApp → new chat to **+1 415 523 8886** → send `join <your-code>`.
Twilio replies "✅ You are connected to the sandbox." You can now message Atlas.

### 4. Set the inbound webhook URL

In the sandbox console, scroll to **"Sandbox Configuration"**.

- **WHEN A MESSAGE COMES IN**: `https://<your-vercel-url>/api/wa/webhook`
- **METHOD**: `HTTP POST`

Click **Save**.

### 5. Grab your credentials

In the Twilio console top bar: **Account Info** panel.
Copy:
- `ACCOUNT SID`  → into Vercel as `TWILIO_ACCOUNT_SID`
- `AUTH TOKEN`   → into Vercel as `TWILIO_AUTH_TOKEN`

(The sandbox sender `whatsapp:+14155238886` is the default in `.env.example`,
no need to change it.)

### 6. Set the salt

Run this locally to make a salt:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste it into Vercel as `WA_PHONE_SALT`.

### 7. Smoke test

```bash
curl https://<your-vercel-url>/api/wa/health
```

You should see `"ok": true` and `"env": { "TWILIO_ACCOUNT_SID": true, ... }`.
Then text **start** to the sandbox number from your phone — Atlas should
reply within 5 seconds with the country picker.

---

## Part B — Squad WhatsApp groups (steps 8–10)

These are the groups players + employers join after the quest. Hackathon-grade
implementation: you create them by hand on your phone; the invite links go in
Vercel env vars. Phase 2 production replaces this with Twilio Conversations
API for dynamic group creation.

### 8. Create the groups in WhatsApp

Open WhatsApp on your phone. New group → name format **`Atlas · <Country> <Trade>`**.
Add yourself + one other team member as starting members (groups can't have
just one).

Required for the demo (6 total — but only the 2 we'll demo on stage matter):

| Group name                           | Country | ISCO | Env var          | Demo? |
|--------------------------------------|---------|------|------------------|-------|
| Atlas · Ghana Phone Repair           | GH      | 7421 | `WA_GROUP_GH_7421` | ✅ yes |
| Atlas · Ghana Tailors                | GH      | 7531 | `WA_GROUP_GH_7531` | optional |
| Atlas · Ghana Software Devs          | GH      | 2519 | `WA_GROUP_GH_2519` | optional |
| Atlas · Ghana Shop Sales             | GH      | 5223 | `WA_GROUP_GH_5223` | optional |
| Atlas · Bangladesh Tailors           | BD      | 7531 | `WA_GROUP_BD_7531` | ✅ yes |
| Atlas · Bangladesh Phone Repair      | BD      | 7421 | `WA_GROUP_BD_7421` | optional |

If you only have 10 minutes, **make the 2 marked ✅ yes**. The other env vars
will fall back to a placeholder URL that opens to a "group not yet created"
page — fine for non-demo paths.

### 9. Copy each group's invite link

Open the group → tap group name → **Invite to group via link** → **Copy link**.
You'll get a `https://chat.whatsapp.com/<token>` URL.

### 10. Set the env vars in Vercel

For each group:

```bash
vercel env add WA_GROUP_GH_7421
# paste the link, hit enter, choose Production + Preview
```

Or via the Vercel dashboard → Project → Settings → Environment Variables.

Re-deploy (`vercel --prod`) so the env vars are picked up.

### 11. Verify

```bash
curl https://<your-vercel-url>/api/wa/health | jq .squadGroups
```

You should see `{ "configured": 3, "missing": [...] }` with the 3 demo groups
removed from the missing list.

---

## Part C — During the live demo

1. Stage laptop opens to `/employer?country=GH`.
2. Click **🤝 Join Madina Repair Squad** on any candidate card.
3. WhatsApp opens (or web.whatsapp.com on the demo laptop). Tap **Join Group**.
4. You're now in the squad group with the Atlas welcome message.

For the player flow:
1. Run the quest on your phone via the sandbox number, OR show the browser
   simulator at `/player`.
2. At the Atlas Card reveal, the squad invite link is the last message.
3. Tap → join → same group as the employer.

This is the magic moment: employer + candidate in the same WA group, talking
in their own channel. Atlas exits the conversation.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `403 invalid signature` in Vercel logs | `TWILIO_AUTH_TOKEN` mismatch or webhook URL doesn't match what Twilio is hitting | Recopy auth token; verify URL in Twilio console exactly matches `https://<vercel>/api/wa/webhook` (no trailing slash) |
| Bot never replies but webhook returns 200 | Twilio sandbox connection expired (24h limit) | Send `join <code>` again from your phone |
| `WA_PHONE_SALT not set` in logs | env var missing in current environment | Add in Vercel for *both* Production AND Preview, redeploy |
| "Sage hit a snag" reply | Anthropic API error or KV unreachable | Check `/api/wa/health` — flips `ok:false` if any required key is missing |
| Squad invite link 404s | env var for that combo is unset | Either set the env var (step 10) or accept the placeholder for non-demo combos |
