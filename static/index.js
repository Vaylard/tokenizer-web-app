window.addEventListener('load', () => {
    let typingTimer;
    const doneTypingInterval = 2000;
    const input = document.getElementById('raw-sentence-input');

    input.addEventListener('input', () => {
        const tokensOutput = document.getElementById('tokens-output');
        const legend = document.getElementById('legend');
        clearTimeout(typingTimer);
        tokensOutput.innerHTML = ' . . . ';
        legend.innerHTML = '';
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });
});

async function doneTyping() {
    const input = document.getElementById('raw-sentence-input');
    if (input.value !== '') {
        try {
            const response = await fetch('/api/tokenize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentence: input.value }),
            });
            if (response.ok) {
                const data = await response.json();
                analysisOutput(data);
            }
        }
        catch (err) {
            console.log(err.message);
        }
    }
}

function analysisOutput(analysis) {
    const tokensOutput = document.getElementById('tokens-output');
    const legend = document.getElementById('legend');
    const colorCode = {
        '代名詞': '#67b850',
        '副詞': '#d75d3c',
        '助動詞': '#0000ff',
        '助詞': '#ff0000',
        '動詞': '#00ff00',
        '名詞': '#00ffff',
        '外国語': '#eba7ca',
        '形容詞': '#228b22',
        '形状詞': '#1e90ff',
        '感動詞': '#1619d0',
        '接尾辞': '#ffff00',
        '接続詞': '#c3ead2',
        '接頭辞': '#f51af6',
        '絵文字': '#934662',
        '補助記号': '#9546c4',
        '記号': '#f0c710',
        '連体詞': '#c44179'
    };

    const emphasizeOneTag = postag => {
        const postagEls = document.querySelectorAll('.postag');
        for (let postagEl of postagEls) {
            if (postagEl.getAttribute('data-postag') === postag) {
                postagEl.classList.add('emphasized');
                postagEl.classList.remove('deemphasized');
            }
            else {
                postagEl.classList.add('deemphasized');
                postagEl.classList.remove('emphasized');
            }
        }
    };

    const removeEmphasis = () => {
        const postagEls = document.querySelectorAll('.postag');
        for (let postagEl of postagEls) {
            postagEl.classList.remove('emphasized','deemphasized');
        }
    }

    tokensOutput.innerHTML = '';
    for (let token of analysis['tokens']) {
        const tokenEl = document.createElement('span');
        tokenEl.classList.add('token');
        tokenEl.style.borderColor = colorCode[token['pos']];
        tokenEl.innerHTML = token['token'];

        tokenEl.addEventListener('mouseenter', () => emphasizeOneTag(token['pos']));
        tokenEl.addEventListener('mouseleave', removeEmphasis);

        tokensOutput.appendChild(tokenEl);
    }
    
    const uniquePostags = new Set(analysis['tokens'].map(token => token['pos']));
    for (let postag of uniquePostags) {
        const postagEl = document.createElement('div');
        const postagMark = document.createElement('div');
        const postagName = document.createElement('div');
        
        postagEl.classList.add('postag');
        postagEl.setAttribute('data-postag', postag);
        postagName.innerHTML = postag;
        postagMark.classList.add('dot');
        postagMark.style.backgroundColor = colorCode[postag];
        
        postagEl.appendChild(postagMark);
        postagEl.appendChild(postagName);
        legend.appendChild(postagEl);
    }
}