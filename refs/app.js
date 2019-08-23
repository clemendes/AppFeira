// Models da aplicação
class Expense {
  constructor(id, year, month, day, type, description, val) {
      this.id = id,
      this.year = year,
      this.month = month,
      this.day = day,
      this.type = type,
      this.description = description,
      this.val = val
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

  delete(id) {
    localStorage.removeItem(id)
  }

  update(_id, _year, _month, _day, _type, _description, _val) {
    let expenseToUpdate = this.getExpense(_id)
    let {
      id,
      year,
      month,
      day,
      type,
      description,
      val,
    } = expenseToUpdate
    // Compara se os valores foram alterados
      year = year == _year ? year : _year
      month = month == _month ? month : _month
      day = day == _day ? day : _day
      type = type == _type ? type : _type
      description = description == _description ? description : _description
      val = val == _val ? val : _val
    
    let expense = {
      id,
      year,
      month,
      day,
      type,
      description,
      val
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
  let year = document.querySelector('#year') // Acessando os elementos do formulário
  let month = document.querySelector('#month')
  let day = document.querySelector('#day')
  let type = document.querySelector('#type')
  let description = document.querySelector('#description')
  let val = document.querySelector('#val')

  let expense = new Expense(
    db.getId(),
    year.value,
    month.value,
    day.value,
    type.value,
    description.value,
    val.value
  )

  if (expense.validator()) {
    db.setStorage(expense)
    messageAlert('success', 'Despesa cadastrada com sucesso!')
    // Limpando os campos do formulário
    year.value = ''
    month.value = ''
    day.value = ''
    type.value = ''
    description.value = ''
    val.value = ''
  } else {
    messageAlert(
      'danger',
      'Não foi possível cadastrar sua despesa! Verifique se os campos foram preenchidos!'
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
function getList(expense = [], filtred = false) {
  let tableExpenses = document.querySelector('#tableExpenses')
  tableExpenses.innerHTML = '' // Limpando a tabela

  if (expense.length == 0 && filtred === false) { // Caso não haja nenhuma solicitação de pesquisa
    expense = db.getAllExpense()
  }
  else if (expense.length == 0 && filtred == true) { // Pesquisa solicitada, mas não encontrada
    messageAlert('danger', 'Nenhuma despesa encontrada!')
  }

  expense.forEach(el => {
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
    buttonDelete.innerHTML = `<i class="fas fa-trash"></i>`
    buttonDelete.onclick = () => { // Função que vai deletar despesa
      db.delete(el.id)
      messageAlert('success', 'Despesa excluída com sucesso!')
      setTimeout(() => {
        document.location.reload()
      }, 3000)
    }
    row.insertCell(4).append(buttonDelete) // Alocando o elemento button na tabela

    let buttonUpdate = document.createElement('button')
    buttonUpdate.className = 'btn btn-primary'
    buttonUpdate.id = 'update'
    buttonUpdate.innerHTML = '<i class="fas fa-plus"</i>'
    buttonUpdate.onclick = async () => {
      await showExpenseModal(el.id) //  Aguarda o retorno dos valores para o modal
      $('#modal').modal('show') // Abre o modal
      sessionStorage.setItem('update', el.id) // Salva o "id" da despesa que vai ser atualizada
    }
    row.insertCell(5).append(buttonUpdate)
  })
}
// Função que pesquisa as despesas
function searchExpense() {
  let year = document.querySelector('#year') // Acessando os elementos do formulário
  let month = document.querySelector('#month')
  let day = document.querySelector('#day')
  let type = document.querySelector('#type')
  let description = document.querySelector('#description')
  let val = document.querySelector('#val')

  let expense = new Expense(
    id = '',
    year.value,
    month.value,
    day.value,
    type.value,
    description.value,
    val.value
  )

  let filtredExpenses = db.search(expense)

  getList(filtredExpenses, true)

}

// Função que traz os valores da despesa para dentro do modal
async function showExpenseModal(id) {
  $('#modal').on('show.bs.modal', function () {
    let expense = db.getExpense(id)

    let modal = $(this)
    modal.find('#mYear').val(expense.year)
    modal.find('#mMonth').val(expense.month)
    modal.find('#mDay').val(expense.day)
    modal.find('#mType').val(expense.type)
    modal.find('#mDescription').val(expense.description)
    modal.find('#mVal').val(expense.val)
  }) // Abrindo o modal
}

// Função que atualiza a despesa 
async function updateExpense() {
  let year = document.querySelector('#mYear') // Acessando os elementos do formulário
  let month = document.querySelector('#mMonth')
  let day = document.querySelector('#mDay')
  let type = document.querySelector('#mType')
  let description = document.querySelector('#mDescription')
  let val = document.querySelector('#mVal')
  
  let id = sessionStorage.getItem('update') // retorna o "id" da despesa que vai ser atualizada
  await db.update(id, year.value, month.value, day.value, type.value, description.value, val.value)

  await $('#modal').modal('hide')
  // Disparar alerta no caso de mudança
  messageAlert('success', 'Despesa atualizada com sucesso!')
  setTimeout(() => {
    document.location.reload()
  }, 3000)
}