
## CPF Block

Essa aplicação permite que os usuários realizem as operações de CRUD (Create, Read, Update e Delete), integrando-se ao Firebase Firestore para armazenamento e recuperação dos dados.

O desafio consistia em:
1. Criar CPF Block: permite que os usuários criem um registro contendo um CPF e uma descrição.
2. Listar CPF Blocks: exibe uma lista com todos os CPF Blocks cadastrados.
3. Detalhar CPF Block: exibe os detalhes de um CPF Block específico.
4. Atualizar CPF Block: permite a edição de um CPF Block existente.
5. Excluir CPF Block: permite que o usuário exclua um CPF Block específico.

### Como configurar e rodar o projeto localmente
Após fazer o clone desse repositório para sua máquina, será necessário usar alguns comandos para instalação das depedências necessárias para que o projeto rode localmente.

#### 1. Instalação das depedências do projeto:
```npm install```

#### 2. Instalação do Angular CLI globalmente:
```npm install -g @angular/cli```

#### 3. Iniciar o servidor de desenvolvimento do Angular:
```ng serve -o```

Com esse comando, iniciará o servidor de desenvolvimento e abrirá a aplicação no localhost: ```http://localhost:4200``` 

#### 4. Adicionando os emuladores do Firebase:
Na pasta raíz do projeto, execute o comando:

```firebase init emulators```

Selecionar os seguintes emuladores: Authentication, Firestore e Functions.

#### 5. Iniciando os emuladores do Firebase:
Para iniciar os emuladores adicionados:

```firebase emulators:start```

Os emuladores serão iniciados e, com isso, você poderá acessar a interface do usuário, que estará disponível em ```http://localhost:4000```, onde você pode ver os emuladores que foram configurados e quais estão funcionando. 

### Demonstração das funcionalidades
#### 1. Criação de um CPF Block

```Enquanto não digitamos todas as informações corretamente, não é possível criar um novo CPF Block, depois que digitamos as informações e salvamos, vemos um toast informando que o CPF Block foi criado com sucesso e conseguimos vê-lo na lista de Candidatos Bloqueados.```

<p align="center">
  <img src="/src/assets/images/cpf-block/create-cpf-errors.png" alt="Creating a CPF Block errors" width="600"/>
  <img src="/src/assets/images/cpf-block/create-cpf.png" alt="Creating a CPF Block" width="600"/>
  <img src="/src/assets/images/cpf-block/create-cpf-success.png" alt="Creating a CPF Block" width="600"/>
</p>

#### 2. Listagem de todos os CPFs Blocks que foram configurados

```Aqui conseguimos ver a lista de todos os CPFs Blocks que já foram criados.```

<p align="center">
  <img src="/src/assets/images/cpf-block/list-cpf.png" alt="Listing all CPFs Blocks" width="600"/>
</p>

#### 3. Detalhar um CPF Block específico

```Podemos ver os detalhes que cadastramos do candidato que quisermos quando o modal é aberto.```

<p align="center">
  <img src="/src/assets/images/cpf-block/details-cpf.png" alt="CPF Block details" width="600"/>
</p>

#### 4. Atualizar um CPF Block existente

```Podemos alterar todos os dados de todos os candidatos. Nesse exemplo, vamos alterar os dois últimos dígitos do CPF da candidata.```

<p align="center">
  <img src="/src/assets/images/cpf-block/update-cpf.png" alt="Updating a CPF Block" width="600"/>
  <img src="/src/assets/images/cpf-block/update-cpf-success.png" alt="Updating a CPF Block success" width="600"/>
</p>

#### 5. Excluir um CPF Block específico

```Podemos também excluir qualquer candidato que foi cadastrado, basta clicarmos no botão deletar. E quando excluímos o CPF Block, ele já não aparece mais na nossa lista de Candidatos Bloqueados.```

<p align="center">
  <img src="/src/assets/images/cpf-block/delete-cpf.png" alt="Delete a CPF Block" width="600"/>
  <img src="/src/assets/images/cpf-block/delete-cpf-success.png" alt="Delete a CPF Block success" width="600"/>
</p>

### Vídeo de demonstração

```Vídeo de demonstração de todas as operações. P.S.: por algum motivo que eu não consegui descobrir, no vídeo não apareceu as opções dos selects de motivo e status.```

___

[@lettycodes](https://www.github.com/lettycodes)
