from flask import Flask
import firebase_admin
from firebase_admin import credentials, messaging, db

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://scrapfielddatabase-default-rtdb.firebaseio.com"
})

app = Flask(__name__)

@app.route("/send")
def send():

    tokens_ref = db.reference("tokens")
    tokens_data = tokens_ref.get() or {}

    tokens = list(tokens_data.values())

    if not tokens:
        return "Sem tokens"

    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title="New post!",
            body="Check out the blog."
        ),
        tokens=tokens
    )

    response = messaging.send_each_for_multicast(message)

    return f"Enviadas: {response.success_count}"

app.run(port=5000)