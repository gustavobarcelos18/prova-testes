import { validar } from '../framework-teste'

// 🎬 Cenário 02 — Sistema de Venda de Ingressos de Cinema
//
// Regras de Negócio:
// 1. Ingresso inteira: R$ 40,00
// 2. Meia-entrada (estudante ou idoso 60+): 50% de desconto
// 3. Sessão 3D: acréscimo de R$ 10,00 por ingresso
// 4. Terça-feira (diaSemana === 2): 30% de desconto no valor base (aplicado ANTES da meia-entrada)
// 5. Máximo de 6 ingressos por compra
// 6. Menores de 16 anos não podem assistir na sessão 'noite'
// 7. A classificação indicativa do filme deve ser respeitada (idade >= classificacao)

// ==================== INTERFACES ====================

interface IFilme {
    id: number
    titulo: string
    eh3D: boolean
    classificacao: number
}

interface IEspectador {
    nome: string
    idade: number
    ehEstudante: boolean
}

interface ICompraIngresso {
    filmeId: number
    sessao: 'manha' | 'tarde' | 'noite'
    diaSemana: number
    espectadores: IEspectador[]
}

interface IResultadoCompra {
    valorTotal: number
    quantidadeIngressos: number
    ehValida: boolean
}

// ==================== DADOS ====================

const filmes: IFilme[] = [
    { id: 1, titulo: 'Aventura Espacial', eh3D: true, classificacao: 12 },
    { id: 2, titulo: 'Comédia Romântica', eh3D: false, classificacao: 10 },
    { id: 3, titulo: 'Terror Noturno', eh3D: false, classificacao: 18 },
    { id: 4, titulo: 'Animação Divertida', eh3D: true, classificacao: 0 },
    { id: 5, titulo: 'Ação Total', eh3D: false, classificacao: 16 },
]

// ==================== FUNÇÃO A IMPLEMENTAR ====================

function comprarIngressos(compra: ICompraIngresso): IResultadoCompra {
    let filmeEncontrado: IFilme | undefined = undefined

    for (let i = 0; i < filmes.length; i++) {
        if (filmes[i].id === compra.filmeId) {
            filmeEncontrado = filmes[i]
        }
    }

    if (filmeEncontrado === undefined) {
        return {
            valorTotal: 0,
            quantidadeIngressos: 0,
            ehValida: false
        }
    }

    if (compra.espectadores.length > 6) {
        return {
            valorTotal: 0,
            quantidadeIngressos: compra.espectadores.length,
            ehValida: false
        }
    }

    for (let i = 0; i < compra.espectadores.length; i++) {
        const espectador = compra.espectadores[i]

        if (compra.sessao === 'noite' && espectador.idade < 16) {
            return {
                valorTotal: 0,
                quantidadeIngressos: compra.espectadores.length,
                ehValida: false
            }
        }

        if (espectador.idade < filmeEncontrado.classificacao) {
            return {
                valorTotal: 0,
                quantidadeIngressos: compra.espectadores.length,
                ehValida: false
            }
        }
    }

    let valorTotal = 0

    for (let i = 0; i < compra.espectadores.length; i++) {
        const espectador = compra.espectadores[i]
        let valorIngresso = 40

        if (compra.diaSemana === 2) {
            valorIngresso = valorIngresso * 0.70
        }

        if (espectador.ehEstudante === true || espectador.idade >= 60) {
            valorIngresso = valorIngresso * 0.50
        }

        if (filmeEncontrado.eh3D === true) {
            valorIngresso = valorIngresso + 10
        }

        valorTotal = valorTotal + valorIngresso
    }

    return {
        valorTotal: valorTotal,
        quantidadeIngressos: compra.espectadores.length,
        ehValida: true
    }
}

// ==================== TESTES ====================

// Teste 1: Compra de 1 ingresso inteira (dia normal, sessão tarde, filme 2D)
// Filme: Comédia Romântica (id: 2, 2D, classificação 10)
// 1 espectador adulto, não estudante, quarta-feira
// Valor: R$ 40,00
const teste1 = comprarIngressos({
    filmeId: 2,
    sessao: 'tarde',
    diaSemana: 3,
    espectadores: [{ nome: 'Carlos', idade: 25, ehEstudante: false }]
})
validar({ descricao: 'comprarIngressos() - Ingresso inteira dia normal 2D', atual: teste1.valorTotal, esperado: 40 })

// Teste 2: Compra com meia-entrada para estudante
// Filme: Comédia Romântica (id: 2, 2D)
// 1 estudante, quarta-feira
// Valor: 40 * 0.50 = R$ 20,00
const teste2 = comprarIngressos({
    filmeId: 2,
    sessao: 'tarde',
    diaSemana: 3,
    espectadores: [{ nome: 'Ana', idade: 20, ehEstudante: true }]
})
validar({ descricao: 'comprarIngressos() - Meia-entrada estudante', atual: teste2.valorTotal, esperado: 20 })

// Teste 3: Compra com meia-entrada para idoso (60+)
// Filme: Comédia Romântica (id: 2, 2D)
// 1 idoso de 65 anos, não estudante, quarta-feira
// Valor: 40 * 0.50 = R$ 20,00
const teste3 = comprarIngressos({
    filmeId: 2,
    sessao: 'tarde',
    diaSemana: 3,
    espectadores: [{ nome: 'José', idade: 65, ehEstudante: false }]
})
validar({ descricao: 'comprarIngressos() - Meia-entrada idoso 60+', atual: teste3.valorTotal, esperado: 20 })

// Teste 4: Ingresso para sessão 3D (inteira)
// Filme: Aventura Espacial (id: 1, 3D, classificação 12)
// 1 adulto, quarta-feira
// Valor: 40 + 10 (3D) = R$ 50,00
const teste4 = comprarIngressos({
    filmeId: 1,
    sessao: 'tarde',
    diaSemana: 3,
    espectadores: [{ nome: 'Pedro', idade: 30, ehEstudante: false }]
})
validar({ descricao: 'comprarIngressos() - Sessão 3D inteira', atual: teste4.valorTotal, esperado: 50 })

// Teste 5: Compra na terça-feira com meia-entrada
// Filme: Comédia Romântica (id: 2, 2D)
// 1 estudante, terça-feira (diaSemana: 2)
// Valor: 40 * 0.70 (terça) = 28 → 28 * 0.50 (meia) = R$ 14,00
const teste5 = comprarIngressos({
    filmeId: 2,
    sessao: 'tarde',
    diaSemana: 2,
    espectadores: [{ nome: 'Maria', idade: 22, ehEstudante: true }]
})
validar({ descricao: 'comprarIngressos() - Terça-feira + meia-entrada', atual: teste5.valorTotal, esperado: 14 })

// Teste 6: Compra de 6 ingressos (máximo permitido)
// Filme: Comédia Romântica (id: 2, 2D)
// 6 adultos, quarta-feira
// Valor: 6 × R$ 40,00 = R$ 240,00
const teste6 = comprarIngressos({
    filmeId: 2,
    sessao: 'tarde',
    diaSemana: 3,
    espectadores: [
        { nome: 'P1', idade: 25, ehEstudante: false },
        { nome: 'P2', idade: 30, ehEstudante: false },
        { nome: 'P3', idade: 28, ehEstudante: false },
        { nome: 'P4', idade: 35, ehEstudante: false },
        { nome: 'P5', idade: 40, ehEstudante: false },
        { nome: 'P6', idade: 22, ehEstudante: false },
    ]
})
validar({ descricao: 'comprarIngressos() - 6 ingressos (máximo)', atual: teste6.valorTotal, esperado: 240 })

// Teste 7: Compra de 7 ingressos — deve retornar inválido
const teste7 = comprarIngressos({
    filmeId: 2,
    sessao: 'tarde',
    diaSemana: 3,
    espectadores: [
        { nome: 'P1', idade: 25, ehEstudante: false },
        { nome: 'P2', idade: 30, ehEstudante: false },
        { nome: 'P3', idade: 28, ehEstudante: false },
        { nome: 'P4', idade: 35, ehEstudante: false },
        { nome: 'P5', idade: 40, ehEstudante: false },
        { nome: 'P6', idade: 22, ehEstudante: false },
        { nome: 'P7', idade: 27, ehEstudante: false },
    ]
})
validar({ descricao: 'comprarIngressos() - 7 ingressos deve ser inválido', atual: teste7.ehValida, esperado: false })

// Teste 8: Menor de 16 anos na sessão noturna — deve retornar inválido
// Filme: Comédia Romântica (id: 2, classificação 10)
// 1 espectador de 15 anos, sessão noite
const teste8 = comprarIngressos({
    filmeId: 2,
    sessao: 'noite',
    diaSemana: 3,
    espectadores: [{ nome: 'João', idade: 15, ehEstudante: true }]
})
validar({ descricao: 'comprarIngressos() - Menor 16 sessão noite inválido', atual: teste8.ehValida, esperado: false })

// Teste 9: Sessão 3D na terça-feira (inteira)
// Filme: Aventura Espacial (id: 1, 3D)
// 1 adulto, terça-feira
// Valor: 40 * 0.70 (terça) = 28 + 10 (3D) = R$ 38,00
const teste9 = comprarIngressos({
    filmeId: 1,
    sessao: 'tarde',
    diaSemana: 2,
    espectadores: [{ nome: 'Lucas', idade: 28, ehEstudante: false }]
})
validar({ descricao: 'comprarIngressos() - Sessão 3D na terça-feira', atual: teste9.valorTotal, esperado: 38 })

// Teste 10: Compra mista — 1 inteira + 1 meia-estudante (dia normal, 2D)
// Filme: Comédia Romântica (id: 2, 2D)
// Adulto: R$ 40,00 + Estudante: R$ 20,00 = R$ 60,00
const teste10 = comprarIngressos({
    filmeId: 2,
    sessao: 'tarde',
    diaSemana: 3,
    espectadores: [
        { nome: 'Carlos', idade: 30, ehEstudante: false },
        { nome: 'Ana', idade: 20, ehEstudante: true },
    ]
})
validar({ descricao: 'comprarIngressos() - Compra mista inteira + meia', atual: teste10.valorTotal, esperado: 60 })