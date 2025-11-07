// Estes são os dados que você me mostrou no arquivo de mock antigo.
// Vamos usá-los para simular a resposta do banco de dados.

export const mockEmployees = [
    {
        id: 1,
        name: "João Silva",
        function: "Encanador",
        cellphone: "(11) 91111-1111", // <-- ADICIONADO
        constraints: ["Final de Semana", "Feriados"],
        disponibility: ["Plantão da Tarde"]
    },
    {
        id: 2,
        name: "Mário Oliveira",
        function: "Operador da ETA",
        cellphone: "(21) 92222-2222", // <-- ADICIONADO
        constraints: ["Final de Semana", "Plantão da ETA"],
        disponibility: ["Plantão da Tarde", "Feriados"]
    },
    {
        id: 3,
        name: "Carlos Pereira",
        function: "Encanador",
        cellphone: "(31) 93333-3333", // <-- ADICIONADO
        constraints: ["Final de Semana", "Feriados"],
        disponibility: ["Plantão da Manhã"]
    },
    {
        id: 4,
        name: "Diogo Nogueira",
        function: "Encanador",
        cellphone: "(41) 94444-4444", // <-- ADICIONADO
        constraints: ["Final de Semana", "Feriados"],
        disponibility: ["Plantão da Manhã"]
    },
    {
        id: 5,
        name: "Tiago Souza",
        function: "Operador da ETA",
        cellphone: "(51) 95555-5555", // <-- ADICIONADO
        constraints: ["Final de Semana", "Plantão da ETA"],
        disponibility: ["Plantão da Manhã", "Feriados"]
    },
    {
        id: 6,
        name: "Francisco Henrique",
        function: "Encanador",
        cellphone: "(61) 96666-6666", // <-- ADICIONADO
        constraints: ["Final de Semana", "Feriados"],
        disponibility: ["Plantão da Manhã"]
    },
    {
        id: 7,
        name: "Tobias Alves",
        function: "Encanador",
        cellphone: "(71) 97777-7777", // <-- ADICIONADO
        constraints: ["Final de Semana", "Feriados"],
        disponibility: ["Plantão da Manhã"]
    }
]