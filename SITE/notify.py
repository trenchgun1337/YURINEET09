from flask import Flask, request
import firebase_admin
from firebase_admin import credentials, messaging, db

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://scrapfielddatabase-default-rtdb.firebaseio.com"
})

app = Flask(__name__)

def read_tokens():
    tokens_data = db.reference("tokens").get() or {}
    tokens = []
    for value in tokens_data.values():
        if isinstance(value, str):
            tokens.append(value)
        elif isinstance(value, dict) and isinstance(value.get("token"), str):
            tokens.append(value["token"])
    return list(dict.fromkeys(tokens))

@app.route("/send", methods=["GET", "POST"])
def send():
    tokens = read_tokens()

    if not tokens:
        return "Sem tokens salvos. Abra o blog, aceite as notificacoes e tente de novo."

    title = request.values.get("title", "New post!")
    body = request.values.get("body", "Check out the blog.")
    icon = request.values.get("icon", "/FAVICON.jpg")

    success_count = 0
    failure_count = 0

    for i in range(0, len(tokens), 500):
        batch = tokens[i:i + 500]
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(icon=icon)
            ),
            tokens=batch
        )

        response = messaging.send_each_for_multicast(message)
        success_count += response.success_count
        failure_count += response.failure_count

    return f"Enviadas: {success_count}. Falhas: {failure_count}."

if __name__ == "__main__":
    app.run(port=5000)
