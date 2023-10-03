/// <reference types="cypress" />
import contrato from '../contracts/usuarios.contract'
const faker = require('faker')

describe('Testes da Funcionalidade Usuários', () => {


  //------------------------------------------------------------------------------------------------
  //Configurei para sempre que executar o teste, ele fazer login e guardar o token em uma variável
  let token
  before(() => {
    cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn})
  });


    //------------------------------------------------------------------------------------------------
  //Aqui ele valida o contrato de usuário de acordo com o doc em contracts/usuarios.contract.js
  it('Deve validar contrato de usuários', () => {
    cy.request('usuarios').then(response => {
      return contrato.validateAsync(response.body)
    })
  });


  //------------------------------------------------------------------------------------------------
  //Aqui ele faz um GET para usuarios e testa o status, a propriedade usuarios e a performance
  it('Deve listar usuários cadastrados', () => {
    cy.request({
      method: 'GET',
      url: `usuarios`
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('usuarios')
      expect(response.duration).to.be.lessThan(500)
    })
  });


  //------------------------------------------------------------------------------------------------
  /* 
  Nesse passo eu decidi implementar a biblioteca "Faker" para sempre me gerar um nome e um email
  aleatório, para que meu teste nunca dê duplicidade. Eu também criei uma função para criar uma 
  senha aleatória e outra função para ficar alternando o campo "administrator" entre true e false
  aleatoriamente.
  */
  it('Deve cadastrar um usuário com sucesso', () => {
    //função gerar senha aleatório
    function gerarSenhaAleatoria() {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let senha = '';
    
      for (let i = 0; i < 8; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        senha += caracteres.charAt(indiceAleatorio);
      }
    
      return senha;
    }

    //função alternar true e false
    function administratorAlternado() {

      var aleatorio = Math.random();
  
      if (aleatorio < 0.5) {
        return "true";
      } else {
        return "false";
      }
    }
    
    cy.request({
      method: "POST",
      url: "usuarios",
      body: {
        "nome": faker.name.findName(),
        "email": faker.internet.email(),
        "password": gerarSenhaAleatoria(),
        "administrador": administratorAlternado()
      },
      headers: {authorization: token}

    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.message).to.equal('Cadastro realizado com sucesso')
    })
  });



  //------------------------------------------------------------------------------------------------
  it.only('Deve validar um usuário com email inválido', () => {
    cy.cadastrarUsuario(token, faker.name.findName(), "emailerrado.com", "password123", "true").then((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.email).to.equal("email deve ser um email válido")
    })
  });



  //------------------------------------------------------------------------------------------------
  //Aqui resolvi utilizar o commands.js para simplificar o cadastro de usuário e fazer o put posteriormente
  it('Deve editar um usuário previamente cadastrado', () => {
    cy.cadastrarUsuario(token, faker.name.findName(), faker.internet.email(), "password123", "true")
    .then(response => {
      let id = response.body._id

      cy.request({
        method: 'PUT',
        url: `usuarios/${id}`,
        headers: {authorization: token},
        body: {
          "nome": faker.name.findName(),
          "email": faker.internet.email(),
          "password": "password123",
          "administrador": "true"
        }
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.message).to.equal("Registro alterado com sucesso")
      })
    })
  });



  //------------------------------------------------------------------------------------------------
  //Aqui resolvi utilizar o commands.js para simplificar o cadastro de usuário e fazer o delete posteriormente
  it('Deve deletar um usuário previamente cadastrado', () => {

    cy.cadastrarUsuario(token, faker.name.findName(), faker.internet.email(), "password123", "true")
    .then(response => {
      let id = response.body._id

      cy.request({
        method: 'DELETE',
        url: `usuarios/${id}`,
        headers: {authorization: token},
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.message).to.equal("Registro excluído com sucesso")
      })
    })
  });


});
