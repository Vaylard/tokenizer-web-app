from flask import Flask, render_template, request, jsonify

from morph_jp import analyzer

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.before_first_request
def _load_models():
    analyzer.load_keras_models()

@app.route('/', methods=['GET'])
def main_page():
    return render_template('main.html')

@app.route('/api/tokenize', methods=['POST'])
def tokenize_sentence():
    try:
        raw_sentence = request.get_json()['sentence']
    except Exception:
        return 'Bad Request'
    analysis = analyzer.analyze(raw_sentence)
    return jsonify(analysis)
