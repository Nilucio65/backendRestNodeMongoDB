const urlBase = 'http://localhost:4000/api'
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))
const access_token = localStorage.getItem("token") || null

//evento submit do formulário
document.getElementById('formCliente').addEventListener('submit', function (event) {
    event.preventDefault() // evita o recarregamento
    const idCliente = document.getElementById('id').value
    let cliente = {}

    if (idCliente.length > 0) { //Se possuir o ID, enviamos junto com o objeto
        cliente = {
            "_id": idCliente,
            "cpf": document.getElementById('cpf').value,
            "nome": document.getElementById('nome').value,
            "moradores_residencia": document.getElementById('mr').value,
            "telefone": document.getElementById('tel').value,
            "dtNasc": document.getElementById('dtNasc').value,
            "medSalario": document.getElementById('medSalario').value
            
        }
    } else {
        cliente = {
            "cpf": document.getElementById('cpf').value,
            "nome": document.getElementById('nome').value,
            "moradores_residencia": document.getElementById('mr').value,
            "telefone": document.getElementById('tel').value,
            "dtNasc": document.getElementById('dtNasc').value,
            "medSalario": document.getElementById('medSalario').value
            
        }
    }
    salvaCliente(cliente)
})

async function salvaCliente(cliente) {    
    if (cliente.hasOwnProperty('_id')) { //Se o cliente tem o id iremos alterar os dados (PUT)
        // Fazer a solicitação PUT para o endpoint dos clientes
        await fetch(`${urlBase}/clientes`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(cliente)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Cliente alterado com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formCliente').reset()
                    //Atualiza a UI
                    carregaClientes()
                } else if (data.errors) {
                    // Caso haja erros na resposta da API
                    const errorMessages = data.errors.map(error => error.msg).join("\n");
                    // alert("Falha no login:\n" + errorMessages);
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${errorMessages}</span>`
                    resultadoModal.show();
                } else {
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`
                    resultadoModal.show();
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o cliente: ${error.message}</span>`
                resultadoModal.show();
            });

    } else { //caso não tenha o ID, iremos incluir (POST)
        // Fazer a solicitação POST para o endpoint dos clientes
        await fetch(`${urlBase}/clientes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(cliente)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Cliente incluído com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formCliente').reset()
                    //Atualiza a UI
                    carregaClientes()
                } else if (data.errors) {
                    // Caso haja erros na resposta da API
                    const errorMessages = data.errors.map(error => error.msg).join("\n");
                    // alert("Falha no login:\n" + errorMessages);
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${errorMessages}</span>`
                    resultadoModal.show();
                } else {
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`
                    resultadoModal.show();
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o cliente: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function carregaClientes() {
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '' //Limpa a tabela antes de recarregar
    // Fazer a solicitação GET para o endpoint dos clientes
    await fetch(`${urlBase}/clientes`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token //envia o token na requisição
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(cliente => {
                tabela.innerHTML += `
                <tr>
                   <td>${cliente.nome}</td>
                   <td>${cliente.telefone}</td>
                   <td>${cliente.moradores_residencia}</td>
                   <td>${cliente.dtNasc}</td>                   
                   <td>${cliente.medSalario}</td>   
                   <td>
                       <button class='btn btn-danger btn-sm' onclick='removeCliente("${cliente._id}")'>🗑 Excluir </button>
                       <button class='btn btn-warning btn-sm' onclick='buscaClientePeloId("${cliente._id}")'>📝 Editar </button>
                    </td>           
                </tr>
                `
            })
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o cliente: ${error.message}</span>`
            resultadoModal.show();
        });
}

async function removeCliente(id) {
    if (confirm('Deseja realmente excluir o cliente?')) {
        await fetch(`${urlBase}/clientes/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    //alert('Registro Removido com sucesso')
                    carregaClientes() // atualiza a UI
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o cliente: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function buscaClientePeloId(id) {
    await fetch(`${urlBase}/clientes/id/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token //envia o token na requisição
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data[0]) { //Iremos pegar os dados e colocar no formulário.
                document.getElementById('id').value = data[0]._id
                document.getElementById('nome').value = data[0].nome
                document.getElementById('cpf').value = data[0].cpf
                document.getElementById('tel').value = data[0].telefone
                document.getElementById('mr').value = data[0].moradores_residencia
                document.getElementById('dtNasc').value = data[0].dtNasc
                document.getElementById('medSalario').value = data[0].medSalario
               
            }
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o cliente: ${error.message}</span>`
            resultadoModal.show();
        });

}

function formatDateForDisplay(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Date(dateString).toLocaleDateString('pt-BR', options);
    return formattedDate;
}