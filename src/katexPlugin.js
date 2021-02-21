import katex from 'katex';

// if you wanna set options of katex, please set to variable: options_katex

function katexReplacer(katexOptions = {throwOnError: false}) {
    return (code) => {
        let renderedHTML;
        try {
            if (!katex) {
                throw new Error('Katex required. Please insert this into your HTML file.');
            }
            renderedHTML = katex.renderToString(code, katexOptions);
            } catch (err) {
            renderedHTML = `Error occurred on process katex: ${err.message}`;
        }
        return renderedHTML;
    }
}

export function katexPlugin(katexOptions = {throwOnError: false}) {
    return () => {
        toastui.Editor.codeBlockManager.setReplacer('katex', katexReplacer(katexOptions));
    }
}

export function registerTUIKatexBtn(tuiEditor){
    const toolbar = tuiEditor.getUI().getToolbar();
    tuiEditor.eventManager.addEventType('clickKatexButton');
    tuiEditor.eventManager.listen('clickKatexButton', function() {
        let content = [
            '```' + 'katex',
            '',
            '```',
        ].join('\n');
        tuiEditor.insertText(content);
    });
    toolbar.insertItem(0, {
        type: 'button',
        options: {
          event: 'clickKatexButton',
          tooltip: 'Insert Katex',
          text: '∑',
          style: 'background:none; color: black;'
        }
    });
    const option = {
        delimiters:[
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true}
    ]}
    const previewElem = document.getElementsByClassName('te-preview')[0];
    tuiEditor.addHook('change', () => {
        renderMathInElement(previewElem, option);
        
    } );
}

