//quando clicar no botão o card tem que aparecer
//com o nome da cidade,data, temperatura, sol ou chuva, humidade, sensação termica, vento e descrição do clima.

//criação de variaveis
const botaoBuscar = document.querySelector(".botao-buscar")

let input = document.querySelector("input")

const nomeCidade = document.querySelector(".nome-cidade")

const busca = document.querySelector(".busca")

const card = document.querySelector(".card")

//criação de um elemento para erro
const elementoErro = document.createElement("p")
elementoErro.textContent = "Digite o nome de uma cidade válida!"
elementoErro.classList.add("erro")
elementoErro.style.display = "none"
busca.after(elementoErro)

let rotuloCidade = document.querySelector(".rotulo-cidade")

let data = document.querySelector(".data")

let temperatura = document.querySelector(".valor-temperatura")

let imagem = document.querySelector(".imagem")

let humidade = document.querySelector(".valor-humidade")

let sensacaoTermica = document.querySelector(".valor-sensacao")

let vento = document.querySelector(".valor-vento")

let descricaoClima = document.querySelector(".descricao-clima")

let wrapper = document.querySelector(".wrapper")

//criação de array
const todasCategorias = [
    "ceu-limpo",
    "tempestade",
    "chuva",
    "neve",
    "nevoa",
    "nuvens",
    "nublado"
];

//funcões
//a função categoriaTempo tem dois tipos de regra, casos especiais vêm antes da regra geral.
let categoriaTempo = (id)=> {                                     //criando a função e passando o id como parametro para trocar a o background com base no id
    if (id === 800) {                                             // se o id for 800 trocar a classe do wrapper para ceuLimpo
        return ("ceu-limpo")
    }
    if (id === 804) {
        return("nublado")
    }
    if (id >= 801 && id <= 803) {
        return("nuvens")
    }
        
    const grupo = Math.floor(id / 100);                            // criando um grupo de ids com base no numero que vier 

    const categorias = {                                           //aqui crio o objeto com as seguintes chaves que podem cair no id e colocando o valor em cada uma com o mesmo nome da classe criada no css
        2: "tempestade",
        3: "chuva",
        5: "chuva",
        6: "neve",
        7: "nevoa"

    };
        return categorias[grupo] || null;                           // aqui peço o retorno já passando o grupo dos ids para as categorias (ou || -> isso significa ou null caso o id retorne undefined ele não aplicara nada)
}

function atualizarClima(dados) {

    nomeCidade.textContent = dados.name;

    let carimboData = dados.dt                                      //api entrega segundos
    let fusoHorario = dados.timezone                                //fuso horario tbm vem em segundos
    let dataApi = new Date ((carimboData + fusoHorario) * 1000)     //criando um objeto de data e (* 1000) convertendo para milissegundos pq js trabalha com milissegundos e a api com segundos
    let dataFormatada = dataApi.toLocaleDateString("pt-br", {       //convertendo para texto, esse método retorna uma string
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    })
    data.textContent = dataFormatada

    let temperaturaDecimal = dados.main.temp
    let temperaturaFinal = Math.round(temperaturaDecimal)
    temperatura.textContent = `${temperaturaFinal}°C`;

    let icone = dados.weather[0].icon;
    let src = `https://openweathermap.org/img/wn/${icone}@2x.png`    //@2x.png -> para uma melhor resolução
    imagem.setAttribute("src", src)

    humidade.textContent = `${dados.main.humidity}%`;

    let sensacaoTermicaDecimal = dados.main.feels_like
    let sensacaoTermicaFinal = Math.round(sensacaoTermicaDecimal)
    sensacaoTermica.textContent = `${sensacaoTermicaFinal}°C`;

    let ventoMS = dados.wind.speed
    let ventoKmH = ventoMS * 3.6
    let ventoFinal = Math.round(ventoKmH)
    vento.textContent = `${ventoFinal}km/h`;

    descricaoClima.textContent = dados.weather[0].description;
}


const chaveApi = chaveGuardadaApi


botaoBuscar.addEventListener("click", () => {

    wrapper.classList.remove("ativo")
    elementoErro.style.display = "none"
    rotuloCidade.textContent = "Buscando..."
    botaoBuscar.disabled = true
    input.disabled = true

    let cidadeDigitada =input.value.trim()
    if (cidadeDigitada === "") {
        elementoErro.style.display = "block"
        botaoBuscar.disabled = false
        input.disabled = false
        rotuloCidade.textContent = "Digite o nome da cidade:"
        return
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidadeDigitada}&appid=${chaveApi}&units=metric&lang=pt_br`

    async function buscarDados() {
        try {
            const response = await fetch(url)

            if (response.status === 404){   //response.status é uma propriedade do objeto RESPONSE, esta verificando o codigo HTTP
                throw new Error("HTTP_404") //a string dentro de new Error será -> error.message -> é uma propriedade do objeto Error, error.message acessa a string que eu passei ("HTTP_404")
            }
            const dados = await response.json()

            atualizarClima(dados)

            let id = dados.weather[0].id                  //pegando o id para mudar o fundo
            const categoria = categoriaTempo(id)          //chamando a função

            todasCategorias.forEach(classe => {
             wrapper.classList.remove(classe);
            });

            if (categoria) {                             //se existir categoria adiciona, se não existir (null) não faz nada (fallback branco css)
            wrapper.classList.add(categoria)
            }
       
            wrapper.classList.add("ativo")

            botaoBuscar.disabled = false
            input.disabled = false
            rotuloCidade.textContent = "Digite o nome da cidade:"   
            input.value = "" 

            } catch (error) {
                if (error.message === "HTTP_404") {       //a string comparada aqui tem que ser a mesma usada no throw
                    elementoErro.style.display = "block"
                    elementoErro.textContent = "Cidade não encontrada"
                }
                else if (error instanceof TypeError) {   //isso é uma verificação de tipo, esse erro é do tipo TypeError? erro de rede do fetch normalmente gera um typeError (error instanceof TypeError retorna true para erro de conexão)
                    elementoErro.style.display = "block"
                    elementoErro.textContent = "Sem conexão com a internet"
                }
                else {
                    elementoErro.style.display = "block"
                    elementoErro.textContent = "Erro inesperado"
                }

            botaoBuscar.disabled = false
            input.disabled = false
            rotuloCidade.textContent = "Digite o nome da cidade:"    
            input.value = ""
            };
        }

    buscarDados()

    //  tudo que eu for fazer, tenho que fazer aqui dentro, coloquei o console.log fora e não estava aparecendo nada pq, o codigo já tinha rodado (no careggamento da pag) e quando chegou a hora de executar o console log, não tinha nada no input pq eu ainda não tinha escrevido (console.log tava vazio) (então se quero ver/fazer alguma coisa tenho que fazer dentro da função).

})

//não usei mais aprendi sobre finally tbm -> é um bloco que sempre roda, não é obrigatório mas se precisar, é bom pra reativar botão, limpar estado de carregando etc. é tipo um "arrumar a casa"
