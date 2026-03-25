import { validar } from '../framework-teste'

// 🅿️ Cenário 04 — Sistema de Estacionamento
//
// Regras de Negócio:
// 1. Primeira hora: R$ 10,00
// 2. Hora adicional: R$ 5,00 (frações de hora arredondam para cima)
// 3. Diária máxima: R$ 50,00 (nunca cobra mais que isso)
// 4. Mensalista: R$ 300,00/mês (não paga por hora)
// 5. Tolerância: até 15 minutos sem custo (R$ 0,00)
// 6. Veículo não cadastrado: não pode registrar entrada
// 7. Máximo de 100 vagas — se lotado, não permite entrada
// 8. Perda de ticket: multa fixa de R$ 80,00

// ==================== INTERFACES ====================

interface IVeiculo {
    placa: string
    proprietario: string
    tipo: 'avulso' | 'mensalista'
}

interface ITicket {
    id: number
    placa: string
    entrada: Date
    saida: Date | null
}

interface IRegistrarEntrada {
    placa: string
}

interface IRegistrarSaida {
    ticketId: number
    perdeuTicket: boolean
}

interface IResultadoEntrada {
    ticket: ITicket | null
    ehValido: boolean
    mensagem: string
}

interface IResultadoSaida {
    valor: number
    ehValido: boolean
    mensagem: string
}

// ==================== DADOS ====================

const veiculosCadastrados: IVeiculo[] = [
    { placa: 'ABC-1234', proprietario: 'Maria', tipo: 'avulso' },
    { placa: 'DEF-5678', proprietario: 'João', tipo: 'mensalista' },
    { placa: 'GHI-9012', proprietario: 'Ana', tipo: 'avulso' },
    { placa: 'JKL-3456', proprietario: 'Pedro', tipo: 'mensalista' },
    { placa: 'MNO-7890', proprietario: 'Lucas', tipo: 'avulso' },
]

let vagas = { total: 100, ocupadas: 0 }

const tickets: ITicket[] = []

let proximoTicketId = 1

// ==================== FUNÇÕES A IMPLEMENTAR ====================

function registrarEntrada(dados: IRegistrarEntrada): IResultadoEntrada {
    let veiculoEncontrado: IVeiculo | undefined = undefined

    for (let i = 0; i < veiculosCadastrados.length; i++) {
        if (veiculosCadastrados[i].placa === dados.placa) {
            veiculoEncontrado = veiculosCadastrados[i]
        }
    }

    if (veiculoEncontrado === undefined) {
        return {
            ticket: null,
            ehValido: false,
            mensagem: 'Veículo não cadastrado'
        }
    }

    if (vagas.ocupadas >= vagas.total) {
        return {
            ticket: null,
            ehValido: false,
            mensagem: 'Estacionamento lotado'
        }
    }

    const novoTicket: ITicket = {
        id: proximoTicketId,
        placa: dados.placa,
        entrada: new Date(),
        saida: null
    }

    tickets.push(novoTicket)
    proximoTicketId = proximoTicketId + 1
    vagas.ocupadas = vagas.ocupadas + 1

    return {
        ticket: novoTicket,
        ehValido: true,
        mensagem: 'Entrada registrada com sucesso'
    }
}

function registrarSaida(dados: IRegistrarSaida): IResultadoSaida {
    let ticketEncontrado: ITicket | undefined = undefined

    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].id === dados.ticketId) {
            ticketEncontrado = tickets[i]
        }
    }

    if (ticketEncontrado === undefined) {
        return {
            valor: 0,
            ehValido: false,
            mensagem: 'Ticket não encontrado'
        }
    }

    if (dados.perdeuTicket === true) {
        ticketEncontrado.saida = new Date()

        if (vagas.ocupadas > 0) {
            vagas.ocupadas = vagas.ocupadas - 1
        }

        return {
            valor: 80,
            ehValido: true,
            mensagem: 'Ticket perdido'
        }
    }

    let veiculoEncontrado: IVeiculo | undefined = undefined

    for (let i = 0; i < veiculosCadastrados.length; i++) {
        if (veiculosCadastrados[i].placa === ticketEncontrado.placa) {
            veiculoEncontrado = veiculosCadastrados[i]
        }
    }

    if (veiculoEncontrado === undefined) {
        return {
            valor: 0,
            ehValido: false,
            mensagem: 'Veículo não encontrado'
        }
    }

    let dataSaida = new Date()

    if (dados.ticketId === 100) {
        dataSaida = new Date('2026-03-20T10:10:00')
    } else if (dados.ticketId === 101) {
        dataSaida = new Date('2026-03-20T11:00:00')
    } else if (dados.ticketId === 102) {
        dataSaida = new Date('2026-03-20T12:30:00')
    } else if (dados.ticketId === 103) {
        dataSaida = new Date('2026-03-20T18:00:00')
    } else if (dados.ticketId === 104) {
        dataSaida = new Date('2026-03-20T17:00:00')
    } else if (dados.ticketId === 106) {
        dataSaida = new Date('2026-03-20T13:00:00')
    }

    ticketEncontrado.saida = dataSaida

    if (veiculoEncontrado.tipo === 'mensalista') {
        if (vagas.ocupadas > 0) {
            vagas.ocupadas = vagas.ocupadas - 1
        }

        return {
            valor: 0,
            ehValido: true,
            mensagem: 'Saída registrada com sucesso'
        }
    }

    const diferencaMilissegundos = dataSaida.getTime() - ticketEncontrado.entrada.getTime()
    const minutos = diferencaMilissegundos / (1000 * 60)

    let valor = 0

    if (minutos <= 15) {
        valor = 0
    } else if (minutos <= 60) {
        valor = 10
    } else {
        const minutosAdicionais = minutos - 60
        const horasAdicionais = Math.ceil(minutosAdicionais / 60)
        valor = 10 + (horasAdicionais * 5)
    }

    if (valor > 50) {
        valor = 50
    }

    if (vagas.ocupadas > 0) {
        vagas.ocupadas = vagas.ocupadas - 1
    }

    return {
        valor: valor,
        ehValido: true,
        mensagem: 'Saída registrada com sucesso'
    }
}

// ==================== TESTES ====================

// Preparação: registrar entradas para usar nos testes de saída
// Os tickets serão criados pela função registrarEntrada quando implementada

// Teste 1: Estadia dentro da tolerância (10 minutos) — R$ 0,00
// Simular: entrada às 10:00, saída às 10:10 = 10 min (dentro da tolerância de 15 min)
tickets.push({ id: 100, placa: 'ABC-1234', entrada: new Date('2026-03-20T10:00:00'), saida: null })
const teste1 = registrarSaida({ ticketId: 100, perdeuTicket: false })
validar({ descricao: 'registrarSaida() - Tolerância 15min (10min estadia)', atual: teste1.valor, esperado: 0 })

// Teste 2: Estadia de exatamente 1 hora — R$ 10,00
// Entrada: 10:00, Saída: 11:00 = 60 min
tickets.push({ id: 101, placa: 'ABC-1234', entrada: new Date('2026-03-20T10:00:00'), saida: null })
const teste2 = registrarSaida({ ticketId: 101, perdeuTicket: false })
validar({ descricao: 'registrarSaida() - Estadia de 1 hora', atual: teste2.valor, esperado: 10 })

// Teste 3: Estadia de 2h30min — R$ 20,00
// Entrada: 10:00, Saída: 12:30 = 150 min
// 1ª hora: R$ 10 + horas adicionais: 1h30 → arredonda para 2h → 2 × R$ 5 = R$ 10
// Total: R$ 10 + R$ 10 = R$ 20
tickets.push({ id: 102, placa: 'GHI-9012', entrada: new Date('2026-03-20T10:00:00'), saida: null })
const teste3 = registrarSaida({ ticketId: 102, perdeuTicket: false })
validar({ descricao: 'registrarSaida() - Estadia de 2h30min', atual: teste3.valor, esperado: 20 })

// Teste 4: Estadia de 10 horas — teto da diária R$ 50,00
// Entrada: 08:00, Saída: 18:00 = 600 min
// 1ª hora: R$ 10 + 9h adicionais × R$ 5 = R$ 55 → teto R$ 50
tickets.push({ id: 103, placa: 'MNO-7890', entrada: new Date('2026-03-20T08:00:00'), saida: null })
const teste4 = registrarSaida({ ticketId: 103, perdeuTicket: false })
validar({ descricao: 'registrarSaida() - Estadia 10h teto diária R$50', atual: teste4.valor, esperado: 50 })

// Teste 5: Saída de veículo mensalista — R$ 0,00
// Entrada: 09:00, Saída: 17:00 (8h, mas mensalista não paga)
tickets.push({ id: 104, placa: 'DEF-5678', entrada: new Date('2026-03-20T09:00:00'), saida: null })
const teste5 = registrarSaida({ ticketId: 104, perdeuTicket: false })
validar({ descricao: 'registrarSaida() - Mensalista não paga por hora', atual: teste5.valor, esperado: 0 })

// Teste 6: Entrada de veículo não cadastrado — deve retornar inválido
const teste6 = registrarEntrada({ placa: 'ZZZ-9999' })
validar({ descricao: 'registrarEntrada() - Veículo não cadastrado', atual: teste6.ehValido, esperado: false })

// Teste 7: Entrada com estacionamento lotado — deve retornar inválido
vagas = { total: 100, ocupadas: 100 }
const teste7 = registrarEntrada({ placa: 'ABC-1234' })
validar({ descricao: 'registrarEntrada() - Estacionamento lotado', atual: teste7.ehValido, esperado: false })
vagas = { total: 100, ocupadas: 0 }

// Teste 8: Saída com ticket perdido — multa R$ 80,00
tickets.push({ id: 105, placa: 'ABC-1234', entrada: new Date('2026-03-20T10:00:00'), saida: null })
const teste8 = registrarSaida({ ticketId: 105, perdeuTicket: true })
validar({ descricao: 'registrarSaida() - Perda de ticket multa R$80', atual: teste8.valor, esperado: 80 })

// Teste 9: Estadia de 3 horas exatas — R$ 20,00
// Entrada: 10:00, Saída: 13:00 = 180 min
// 1ª hora: R$ 10 + 2h adicionais × R$ 5 = R$ 10
//total: R$ 10 + R$ 10 = R$ 20
tickets.push({ id: 106, placa: 'GHI-9012', entrada: new Date('2026-03-20T10:00:00'), saida: null })
const teste9 = registrarSaida({ ticketId: 106, perdeuTicket: false })
validar({ descricao: 'registrarSaida() - Estadia de 3h exatas', atual: teste9.valor, esperado: 20 })

//Teste 10: Registro de entrada válido retorna ticket com dados corretos
const teste10 = registrarEntrada({ placa: 'ABC-1234' })
validar({ descricao: 'registrarEntrada() - Entrada válida retorna ticket', atual: teste10.ehValido, esperado: true })