from flask import Flask, render_template, request, jsonify, session
from werkzeug.utils import secure_filename
import os
import openai
from dotenv import load_dotenv

import fitz  
from docx import Document  
from PIL import Image  
import pytesseract  

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'jpeg'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

openai.api_key = os.getenv('OPENAI_API_KEY')
openai.api_base = "https://openrouter.ai/api/v1"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def initialize_chat_history():
    if 'chat_history' not in session:
        session['chat_history'] = [
            {"role": "system", "content": "You are a helpful assistant. Analyze and answer based on uploaded files and user queries."}
        ]

def extract_text_from_file(filepath, filename):
    ext = filename.rsplit('.', 1)[1].lower()
    text = ""

    if ext == 'pdf':
        doc = fitz.open(filepath)
        for page in doc:
            text += page.get_text()
    elif ext == 'docx':
        doc = Document(filepath)
        for para in doc.paragraphs:
            text += para.text + '\n'
    elif ext == 'txt':
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    elif ext in ['jpg', 'jpeg', 'png']:
        img = Image.open(filepath)
        text = pytesseract.image_to_string(img)
    else:
        text = "Unsupported file format."

    return text

def process_text_message(message):
    try:
        initialize_chat_history()
        session['chat_history'].append({"role": "user", "content": message})
        session.modified = True

        response = openai.ChatCompletion.create(
            model="mistralai/mixtral-8x7b-instruct",
            messages=session['chat_history']
        )

        assistant_reply = response['choices'][0]['message']['content']
        session['chat_history'].append({"role": "assistant", "content": assistant_reply})
        session.modified = True

        return assistant_reply
    except Exception as e:
        return f"I couldn't process your message. Error: {str(e)}"

def process_file(file):
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        content = extract_text_from_file(filepath, filename)

        initialize_chat_history()
        session['chat_history'].append({"role": "user", "content": f"Please analyze this file content:\n{content}"})
        session.modified = True

        response = openai.ChatCompletion.create(
            model="mistralai/mixtral-8x7b-instruct",
            messages=session['chat_history']
        )

        assistant_reply = response['choices'][0]['message']['content']
        session['chat_history'].append({"role": "assistant", "content": assistant_reply})
        session.modified = True

        return assistant_reply
    except Exception as e:
        return f"There was an error processing your file: {str(e)}"

@app.route('/')
def index():
    initialize_chat_history()
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '' and allowed_file(file.filename):
                response = process_file(file)
                return jsonify({'response': response})

        message = request.form.get('message', '')
        if message:
            reply = process_text_message(message)
            return jsonify({'response': reply})

        return jsonify({'response': "Please provide a message or file."})
    except Exception as e:
        return jsonify({'response': f"Sorry, I encountered an error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)