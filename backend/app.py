from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes

# Load pre-trained model and tokenizer
model_name = 'gpt2'
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)

@app.route('/generate', methods=['POST'])
def generate_response():
    
    data = request.json
    input_text = data.get('text', '')
    input_ids = tokenizer.encode(input_text, return_tensors='pt')
    with torch.no_grad():
        output = model.generate(input_ids, max_length=100, num_return_sequences=1)
    response = tokenizer.decode(output[0], skip_special_tokens=True)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
