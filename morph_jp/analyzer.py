import numpy as np
from scipy import stats
from tensorflow.keras.preprocessing.sequence import pad_sequences

char2ind, ind2tag, tokenizer_model, pos_tagger_model = None, None, None, None

def load_keras_models():
    from tensorflow.keras.models import load_model
    from os import path
    
    resources_dir = path.join(path.dirname(__file__), 'resources')
    
    global char2ind
    char2ind = {}
    with open(resources_dir + '/char2ind.txt') as f:
        for kv in f.readlines():
            k, v = kv.split()
            char2ind[k] = int(v)

    global ind2tag
    ind2tag = {}
    with open(resources_dir + '/ind2tag.txt') as f:
        for kv in f.readlines():
            k, v = kv.split()
            ind2tag[int(k)] = v
    
    global tokenizer_model
    tokenizer_model = load_model(resources_dir + '/tokenizer')
    global pos_tagger_model
    pos_tagger_model = load_model(resources_dir + '/pos_tagger')
    

def analyze(sentence):
    char_vector = []
    for c in list(sentence):
        try:
            char_vector.append(char2ind[c])
        except KeyError:
            char_vector.append(char2ind['unk'])
            
    char_vector = np.array(pad_sequences([char_vector], maxlen=240, padding='pre', truncating='post'))
    y_b_tags = np.squeeze(tokenizer_model.predict(char_vector)).argmax(axis=1)[-len(sentence):]
    y_p_tags = np.squeeze(pos_tagger_model.predict(char_vector)).argmax(axis=1)[-len(sentence):]

    tokens = []
    current_token = []
    for i, c in enumerate(list(sentence)):
        current_token.append((c, y_p_tags[i]))
        if y_b_tags[i] == 2:
            token = ''.join([c[0] for c in current_token])
            tag = stats.mode([c[1] for c in current_token]).mode[0]
            try:
                tokens.append((token, ind2tag[tag]))
            except KeyError:
                tokens.append((token, '名詞'))
            current_token = []
    
    analysis_object = {
        'sentence': sentence,
        'tokens': [{'token': t[0], 'pos': t[1]} for t in tokens]}
        
    return analysis_object
