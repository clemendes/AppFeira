// Models da aplicação
class Expense {
  constructor(id, year, month, day, type, description, val, filtro) {
    this.id = id,
      this.year = year,
      this.month = month,
      this.day = day,
      this.type = type,
      this.description = description,
      this.val = val,
      this.filtro = filtro
  }
  // Validando se todos os campos foram preenchidos
  validator() {
    for (const i in this) {
      if (this[i] == undefined || this[i] == '' || this[i] == null) {
        return false
      }
    }
    return true
  }
}

// Classe que simula um banco de dados com localStorage
class DB {
  constructor() {
    let id = localStorage.getItem('id')

    if (id === null) {
      localStorage.setItem('id', 0)
    }
  }

  getId() {
    // Gerencia o id das despesas
    let nextId = localStorage.getItem('id')
    return parseInt(nextId) + 1
  }

  setStorage(expense) {
    // Armazena a despesa em localStorage
    let id = this.getId()

    localStorage.setItem(`${id}`, JSON.stringify(expense)) // Transforma o objeto literal em um json string

    localStorage.setItem('id', id)
  }

  getAllExpense() {
    let expenses = []

    let id = localStorage.getItem('id')

    for (let i = 1; i <= id; i++) {
      // Busca as despesas por id
      let expense = JSON.parse(localStorage.getItem(i)) // Transforma um json em objeto literal
      if (expense === null) {
        continue
      }
      expenses.push(expense) //Adiciona todas as despesas no array
    }
    return expenses
  }

  getExpense(id) {
    let expense = JSON.parse(localStorage.getItem(id))

    return expense
  }
  // Filtra as despesas para pesquisa
  search(expense) {
    let filtredExpenses = []

    filtredExpenses = this.getAllExpense()
    // ano
    if (expense.year != '') {
      filtredExpenses = filtredExpenses.filter(el => el.year == expense.year)
    }
    // Mês
    if (expense.month != '') {
      filtredExpenses = filtredExpenses.filter(el => el.month == expense.month)
    }
    // Dia
    if (expense.day != '') {
      filtredExpenses = filtredExpenses.filter(el => el.day == expense.day)
    }
    // Tipo
    if (expense.type != '') {
      filtredExpenses = filtredExpenses.filter(el => el.type == expense.type)
    }
    // Descrição
    if (expense.description != '') {
      filtredExpenses = filtredExpenses.filter(
        el => el.description == expense.description
      )
    }
    // Valor
    if (expense.val != '') {
      filtredExpenses = filtredExpenses.filter(el => el.val == expense.val)
    }

    return filtredExpenses // Retorna um novo array com as despesas filtradas
  }

  searchByMonth(month) {
    let filtered = []

    filtered = this.getAllExpense()

    if(month != '') {
      filtered = filtered.filter(el => el.month == month)
    }

    return filtered
  }

  delete(id) {
    localStorage.removeItem(id)
  }

  update(_id, // _year, _month,
    _day, _type, _description, _val, _filtro) {
    let expenseToUpdate = this.getExpense(_id)
    let {
      id,
      day,
      year,
      month,
      type,
      description,
      val,
      filtro,
    } = expenseToUpdate
    // Compara se os valores foram alterados
    year = year == _year ? year : _year
    month = month == _month ? month : _month
    day = day == _day ? day : _day
    type = type == _type ? type : _type
    description = description == _description ? description : _description
    val = val == _val ? val : _val
    filtro = filtro == _filtro ? filtro : _filtro
    let expense = {
      id,
      year,
      month,
      day,
      type,
      description,
      val,
      filtro
    }
    localStorage.setItem(`${id}`, JSON.stringify(expense))
  }
}
/*------------------------------
    Controllers da aplicação
*/

let db = new DB()

// Cadastrando nova despesa
function registerExpense() {
  //let year = document.querySelector('#year') // Acessando os elementos do formulário
  //let month = document.querySelector('#month')
  let datepicker = document.querySelector('#day')
  let type = document.querySelector('#type')
  let description = document.querySelector('#description')
  let val = document.querySelector('#val')
  let filtro = document.querySelector('#filtro')

  let date = String(datepicker.value).split('/') // Adicionada por causa do datepicker
  let [day, month, year] = date

  let expense = new Expense(
    db.getId(),
    year,
    month,
    day,
    type.value,
    description.value,
    val.value,
    filtro.value
  )

  let getURL, depRec = 'Despesa'
  getURL = window.location.pathname
  getURL = getURL.substring(String(getURL).lastIndexOf('/') + 1)
  if (getURL == 'cadastro_receitas.html') {
    depRec = 'Receita'
  }

  if (expense.validator()) {
    db.setStorage(expense)
    messageAlert('success', `${depRec} cadastrada com sucesso!`)
    // Limpando os campos do formulário
    //year.value = ''
    //month.value = ''
    datepicker.value = ''
    type.value = ''
    description.value = ''
    val.value = ''
  } else {
    messageAlert(
      'danger',
      `Não foi possível cadastrar sua ${depRec}! Verifique se os campos foram preenchidos!`
    )
  }
}

function messageAlert(type, message) {
  // Alert
  let alert = document.querySelector('#messageAlert')

  if (alert.classList.contains('fade')) {
    // Verificando se o alert está em modo fade(escondido)
    alert.classList.remove('fade')
    setTimeout(() => {
      alert.classList.add('fade')
      alert.classList.remove(`alert-${type}`)
    }, 3000) // Visível por 3s
  }

  alert.classList.add(`alert-${type}`)
  alert.textContent = message
}
// Função que mostra a tabela das despesas
function getListDespesas(expense = [], filtred = false) {
  let tableExpenses = document.querySelector('#tableExpenses')
  tableExpenses.innerHTML = '' // Limpando a tabela

  if (expense.length == 0 && filtred === false) { // Caso não haja nenhuma solicitação de pesquisa
    expense = db.getAllExpense()
  }
  else if (expense.length == 0 && filtred == true) { // Pesquisa solicitada, mas não encontrada
    messageAlert('danger', 'Nenhuma despesa encontrada!')
  }

  expense.forEach(el => {
    // Testa se cada elemento campo filtro = "Despesa"
    if (el.filtro == "despesa") {
      let row = tableExpenses.insertRow() // Insere linhas <tr> no body da tabela

      // Insere colunas <td> nas linhas <tr>
      row.insertCell(0).innerHTML = `${el.day}/${el.month}/${el.year}`
      // Tratativa do campo tipo
      switch (el.type) {
        case '1':
          el.type = 'Alimentação'
          break
        case '2':
          el.type = 'Educação'
          break
        case '3':
          el.type = 'Lazer'
          break
        case '4':
          el.type = 'Saúde'
          break
        case '5':
          el.type = 'Transporte'
          break
      }
      row.insertCell(1).innerHTML = el.type
      row.insertCell(2).innerHTML = el.description
      row.insertCell(3).innerHTML = el.val

      let buttonDelete = document.createElement('button')
      buttonDelete.className = 'btn btn-danger'
      buttonDelete.innerHTML = '<i class="fa fa-trash-o"></i>'
      buttonDelete.onclick = () => { // Função que vai deletar despesa
        db.delete(el.id)
        messageAlert('success', 'Despesa excluída com sucesso!')
        setTimeout(() => {
          document.location.reload()
        }, 3000)
      }

      let buttonUpdate = document.createElement('button')
      buttonUpdate.className = 'btn btn-success '
      buttonUpdate.id = 'update'
      buttonUpdate.innerHTML = '<i class="fa fa-edit"</i>'
      buttonUpdate.onclick = async () => {
        await showExpenseModal(el.id) //  Aguarda o retorno dos valores para o modal
        $('#modal').modal('show') // Abre o modal
        sessionStorage.setItem('update', el.id) // Salva o "id" da despesa que vai ser atualizada
      }

      row.insertCell(4).append(buttonDelete, " ", buttonUpdate) // Alocando o elemento button na tabela

      // let buttonUpdate = document.createElement('button')
      // buttonUpdate.className = 'btn btn-success '
      // buttonUpdate.id = 'update'
      // buttonUpdate.innerHTML = '<i class="fa fa-edit"</i>'
      // buttonUpdate.onclick = async () => {
      //   await showExpenseModal(el.id) //  Aguarda o retorno dos valores para o modal
      //   $('#modal').modal('show') // Abre o modal
      //   sessionStorage.setItem('update', el.id) // Salva o "id" da despesa que vai ser atualizada
      // }
      // row.insertCell(5).append(buttonDelete)
    }
  })
}

// Função que mostra a tabela das despesas
function getListReceitas(expense = [], filtred = false) {
  let tableExpenses = document.querySelector('#tableExpenses')
  tableExpenses.innerHTML = '' // Limpando a tabela

  if (expense.length == 0 && filtred === false) { // Caso não haja nenhuma solicitação de pesquisa
    expense = db.getAllExpense()
  }
  else if (expense.length == 0 && filtred == true) { // Pesquisa solicitada, mas não encontrada
    messageAlert('danger', 'Nenhuma receita encontrada!')
  }

  expense.forEach(el => {
    // Testa se cada elemento campo filtro = "Receita"
    if (el.filtro == "receita") {
      let row = tableExpenses.insertRow() // Insere linhas <tr> no body da tabela

      // Insere colunas <td> nas linhas <tr>
      row.insertCell(0).innerHTML = `${el.day}/${el.month}`
      // Tratativa do campo tipo
      switch (el.type) {
        case '1':
          el.type = 'Salário'
          break
        case '2':
          el.type = 'Adiantamento'
          break
        case '3':
          el.type = '13º Salário'
          break
        case '4':
          el.type = 'Aplicações'
          break
        case '5':
          el.type = 'Outros'
          break
      }
      row.insertCell(1).innerHTML = el.type
      row.insertCell(2).innerHTML = el.description
      row.insertCell(3).innerHTML = el.val

      let buttonDelete = document.createElement('button')
      buttonDelete.className = 'btn btn-danger'
      buttonDelete.innerHTML = '<i class="fa fa-trash-o"></i>'
      buttonDelete.onclick = () => { // Função que vai deletar despesa
        db.delete(el.id)
        messageAlert('success', 'Despesa excluída com sucesso!')
        setTimeout(() => {
          document.location.reload()
        }, 3000)
      }

      let buttonUpdate = document.createElement('button')
      buttonUpdate.className = 'btn btn-success '
      buttonUpdate.id = 'update'
      buttonUpdate.innerHTML = '<i class="fa fa-edit"</i>'
      buttonUpdate.onclick = async () => {
        await showExpenseModal(el.id) //  Aguarda o retorno dos valores para o modal
        $('#modal').modal('show') // Abre o modal
        sessionStorage.setItem('update', el.id) // Salva o "id" da despesa que vai ser atualizada
      }

      row.insertCell(4).append(buttonDelete, " ", buttonUpdate) // Alocando o elemento button na tabela

      // let buttonUpdate = document.createElement('button')
      // buttonUpdate.className = 'btn btn-success '
      // buttonUpdate.id = 'update'
      // buttonUpdate.innerHTML = '<i class="fa fa-edit"</i>'
      // buttonUpdate.onclick = async () => {
      //   await showExpenseModal(el.id) //  Aguarda o retorno dos valores para o modal
      //   $('#modal').modal('show') // Abre o modal
      //   sessionStorage.setItem('update', el.id) // Salva o "id" da despesa que vai ser atualizada
      // }
      // row.insertCell(5).append(buttonDelete)
    }
  })
}

// Função que pesquisa as despesas
function searchExpense() {
  //let year = document.querySelector('#year') // Acessando os elementos do formulário
  //let month = document.querySelector('#month')
  let datepicker = document.querySelector('#day')
  let type = document.querySelector('#type')
  let description = document.querySelector('#description')
  let val = document.querySelector('#val')

  let date = String(datepicker.value).split('/')
  let [day, month, year] = date

  let expense = new Expense(
    id = '',
    year,
    month,
    day,
    type.value,
    description.value,
    val.value
  )

  let filtredExpenses = db.search(expense)

  getListDespesas(filtredExpenses, true)

}

// Função que pesquisa as despesas
function searchReceita() {
  //let year = document.querySelector('#year') // Acessando os elementos do formulário
  //let month = document.querySelector('#month')
  let datepicker = document.querySelector('#day')
  let type = document.querySelector('#type')
  let description = document.querySelector('#description')
  let val = document.querySelector('#val')

  let date = String(datepicker.value).split('/')
  let [day, month, year] = date

  let expense = new Expense(
    id = '',
    year,
    month,
    day,
    type.value,
    description.value,
    val.value
  )

  let filtredExpenses = db.search(expense)

  getListReceitas(filtredExpenses, true)

}

// Função que calcula receitas
$(document).ready(function somaReceitas() {

  let soma_rc = 0

  let receita = db.getAllExpense()

  receita.forEach(rc => {
    if (rc.filtro == "receita") {
      soma_rc += parseFloat(rc.val)
    }
  })
  document.querySelector('#total_receitas').innerHTML = "R$ " + parseFloat(soma_rc)

});

// Função que calcula despesas
$(document).ready(function somaDespesas() {

  let soma_dp = 0

  let despesa = db.getAllExpense()

  despesa.forEach(dp => { // Podemos trocar por map e usar reduce
    if (dp.filtro == "despesa") {
      soma_dp += parseFloat(dp.val)
    }
  })
  document.querySelector('#total_despesas').innerHTML = "R$ " + parseFloat(soma_dp)

});

// Função que calcula balanço
$(document).ready(function balanco() {

  let balanco = 0

  //somando receitas
  let soma_rc = 0
  let receita = db.getAllExpense()
  receita.forEach(rc => {
    if (rc.filtro == "receita") {
      soma_rc += parseFloat(rc.val)
    }
  })

  //somando despesas
  let soma_dp = 0
  let despesa = db.getAllExpense()
  despesa.forEach(dp => {
    if (dp.filtro == "despesa") {
      soma_dp += parseFloat(dp.val)
    }
  })

  //calculando balanço
  balanco = parseFloat(soma_rc) - parseFloat(soma_dp)
  document.querySelector('#balanco').innerHTML = "R$ " + parseFloat(balanco)
});

// Função que traz os valores da despesa para dentro do modal
async function showExpenseModal(id) {
  $('#modal').on('show.bs.modal', function () {
    let expense = db.getExpense(id)

    let modal = $(this)
    //modal.find('#mYear').val(expense.year)
    //modal.find('#mMonth').val(expense.month)
    modal.find('#mDay').val(expense.day)
    modal.find('#mType').val(expense.type)
    modal.find('#mDescription').val(expense.description)
    modal.find('#mVal').val(expense.val)
  }) // Abrindo o modal
}

// Função que atualiza a despesa
async function updateExpense() {
  //let year = document.querySelector('#mYear') // Acessando os elementos do formulário
  //let month = document.querySelector('#mMonth')
  let day = document.querySelector('#mDay')
  let type = document.querySelector('#mType')
  let description = document.querySelector('#mDescription')
  let val = document.querySelector('#mVal')
  let filtro = document.querySelector('#mFiltro')

  let id = sessionStorage.getItem('update') // retorna o "id" da despesa que vai ser atualizada
  await db.update(id, //year.value, month.value,
    day.value, type.value, description.value, val.value, filtro.value)

  await $('#modal').modal('hide')
  // Precisamos mudar este comentário
  messageAlert('success', 'Despesa atualizada com sucesso!')
  setTimeout(() => {
    document.location.reload()
  }, 3000)
}

function filterExpense() {
  let filter = document.querySelector('#filter')
  
  let filtered = db.searchByMonth(filter.value)
  
  
  return filtered
}
