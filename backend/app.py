import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole

from prompts import COMMON_PROMPT, TOOL_PROMPTS


load_dotenv()

app = Flask(__name__)
CORS(app)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_FILES = {
    "index.html",
    "style.css",
    "script.js",
    "background-frames.js",
    "back-desktop.webp",
    "back-mobile.webp",
    "orbital-drift.mp3",
}

GIGACHAT_AUTH_KEY = os.getenv("GIGACHAT_AUTH_KEY")

if not GIGACHAT_AUTH_KEY:
    raise RuntimeError("GIGACHAT_AUTH_KEY is missing in .env")


client = GigaChat(
    base_url="https://api.giga.chat/v1",
    credentials=GIGACHAT_AUTH_KEY,
    scope="GIGACHAT_API_PERS",
    verify_ssl_certs=False,
)


@app.get("/")
def index():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.get("/<path:filename>")
def public_file(filename):
    if filename not in PUBLIC_FILES:
        return jsonify({"ok": False, "error": "Not found"}), 404
    return send_from_directory(PROJECT_ROOT, filename)


@app.get("/api/health")
def health():
    return jsonify({
        "ok": True,
        "message": "AI Toolkit backend is running"
    })


@app.post("/api/generate")
def generate():
    data = request.get_json(silent=True) or {}

    tool = data.get("tool", "").strip()
    user_text = data.get("text", "").strip()

    if tool not in TOOL_PROMPTS:
        return jsonify({
            "ok": False,
            "error": "Unknown tool"
        }), 400

    if not user_text:
        return jsonify({
            "ok": False,
            "error": "Text is empty"
        }), 400

    system_prompt = (
        COMMON_PROMPT
        + "\n\n"
        + TOOL_PROMPTS[tool]
    )

    chat = Chat(
        model="GigaChat-2-Pro",
        messages=[
            Messages(
                role=MessagesRole.SYSTEM,
                content=system_prompt
            ),
            Messages(
                role=MessagesRole.USER,
                content=user_text
            ),
        ],
        temperature=0.7,
        max_tokens=700,
    )

    try:
        response = client.chat(chat)

        answer = response.choices[0].message.content

        return jsonify({
            "ok": True,
            "tool": tool,
            "answer": answer
        })

    except Exception as error:
        print("GigaChat error:", error)

        return jsonify({
            "ok": False,
            "error": "GigaChat request failed"
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=False
    )
