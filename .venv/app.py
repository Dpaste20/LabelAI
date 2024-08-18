from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import tempfile

app = Flask(__name__)

# Configure CORS to allow requests from your frontend origin
CORS(app, resources={r"/chat": {"origins": "http://localhost:5173"}})

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY"))

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

def upload_to_gemini(file_content, mime_type):
    """Uploads the given file content to Gemini."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{mime_type.split('/')[-1]}") as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name

    try:
        file = genai.upload_file(temp_file_path, mime_type=mime_type)
        print(f"Uploaded file as: {file.uri}")
        return file
    finally:
        os.unlink(temp_file_path)

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        # Respond to preflight request
        return '', 204

    message = request.form.get('message', '')
    file = request.files.get('file')
    
    content = []
    
    if file:
        file_content = file.read()
        mime_type = file.content_type
        uploaded_file = upload_to_gemini(file_content, mime_type)
        content.append(uploaded_file)
        
    if message:
        content.append(message)

    if not content:
        return jsonify({'response': 'No message or file received'}), 400

    try:
        response = model.generate_content(content)
        return jsonify({'response': response.text})
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return jsonify({'response': 'An error occurred while processing your request'}), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)