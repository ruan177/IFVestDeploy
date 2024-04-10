const table      = document.querySelector(".icon-table")
const editor     = document.querySelector("#editor")
const paleta     = document.querySelector("#paleta")
const fontColor  = document.querySelector("#fontColor")
const backColor  = document.querySelector("#backColor")
const upload     = document.querySelector("#upload")

table.addEventListener("click", () => {
    let linha = +prompt('Qual número de linhas?')
    let coluna= +prompt('Qual número de colunas?')

    if(linha && coluna)
    {
        let t    = document.createElement("table")
        t.border = "1"
        t.style.borderCollapse = "collapse"
        t.style.border = "1px solid #ccc"
	t.style.margin = "auto"

        for( let l=0; l<linha; l++)
        {
            let tr   = document.createElement("tr")
            tr.style.border = "1px solid #ccc"

            for( let c=0; c<coluna; c++)
            {
                let td   = document.createElement("td")
                td.style.border = "1px solid #ccc"
                td.innerHTML = " - "
                tr.appendChild(td)
            }
            t.appendChild(tr)
        }
        editor.appendChild(t)
		
		let small  = document.createElement("small")
		small.innerHTML = "Fonte:"
        editor.appendChild(small)
    }
})

upload.addEventListener("change", e => {
    let file    = e.currentTarget.files[0]
    let reader  = new FileReader()
    let img     = new Image(100, 100)
    reader.onloadend = () => {
        img.src = reader.result
        editor.appendChild(img)
        upload.value=""
    }
    reader.readAsDataURL(file)
})

const rgbToHex = (r, g, b) => '#' + [r,g,b].map( x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex   
}).join('')

fontColor.addEventListener("click", () => {
    let color = paleta.style.backgroundColor.replace("rgb(", "").replace(")", "").split(",")
    document.execCommand('foreColor', false, rgbToHex( parseInt(color[0]), parseInt(color[1]), parseInt(color[2]) ) )
})
backColor.addEventListener("click", () => document.execCommand('backColor', false, paleta.style.backgroundColor ))

const link = () => document.execCommand('createlink', false, prompt('Enter a URL:', 'http://') )
const alterFont    = size => document.execCommand("fontSize", false, parseInt(size) )
const applyCommand = comand => document.execCommand(comand)
function updateRespostaItems() {
    const respostaItems = document.querySelectorAll('.resposta-item');
    console.log(respostaItems.length); // Deve mostrar o número correto de itens

    // Restante do código para manipular os itens...
}
document.querySelector('form').addEventListener('submit', function(event) {
    // Obtém o conteúdo do editor de texto
    var pergunta = document.querySelector('#editor').innerHTML;
    
    // Atualiza o valor do campo de entrada oculto com o conteúdo do editor de texto
    document.querySelector('#pergunta').value = pergunta;
});
function addResposta() {
    const container = document.getElementById("respostas-container");
    const div = document.createElement("div");
    div.className = "resposta-item";
    div.id = "resposta-item-" + new Date().getTime(); // Add a class for styling if needed

    const input = document.createElement("input");
    input.type = "text"; // This should be "text" for the input field
    input.name = "respostas[]";
    input.placeholder = "Sua resposta";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox"; // Correctly set the type to "checkbox"
    checkbox.name = "correta[]"; 
    checkbox.value = true;// Optionally, you might want to give it a unique name

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Remover resposta";
    button.onclick = function() {
        div.remove();
    };

    div.appendChild(checkbox);
    div.appendChild(input);
    div.appendChild(button);
    container.appendChild(div);
    updateRespostaItems();
    handleRespostaItems();
}
// Função para manipular os checkboxes e inputs de texto
function handleRespostaItems() {
    const respostaItems = document.querySelectorAll('.resposta-item');
    const respostasSelecionadasInput = document.getElementById('respostasSelecionadas');

    respostaItems.forEach((item, index) => {
      
        const checkbox = item.querySelector('input[type="checkbox"]');
        const inputTexto = item.querySelector('input[type="text"]');
        console.log(inputTexto.value)
        // Atualize o valor do input de texto com o estado do checkbox
        inputTexto.name = `respostas[${index}][texto]`;
        checkbox.name = `respostas[${index}][correta]`;


    });
}

// Chame a função no evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    handleRespostaItems();

    // Função para enviar o formulário
    document.querySelector('form').addEventListener('submit', function(event) {
        // Impede o envio do formulário para poder testar

        // Aqui você pode adicionar qualquer lógica adicional antes de enviar o formulário

        // Permita que o formulário seja enviado normalmente
        this.submit(); // Descomente esta linha para enviar o formulário após o teste
    });
});

// Chame a função após adicionar um novo elemento
