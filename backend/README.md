## Detalhes da API (Backend)

## Como contribuir
Por favor, siga estes passos para contribuir com o projeto:

1. Fork do repositório e clone para sua máquina.

2. Crie uma branch para sua feature/bugfix:
```bash
git checkout -b feat/minha-feature
```

3. Instale dependências e rode localmente (opcional - backend):
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

4. Faça commits pequenos e descritivos. Exemplo de convenção simples:
```
feat: adicionar endpoint de exemplo
fix: corrigir validação do login
docs: atualizar README
```

5. Abra um Pull Request contra a branch `main` do repositório original. No PR, descreva a mudança, como testá-la e inclua capturas de tela se houver alteração visual.

6. Após revisão, ajustes e aprovação, faremos o merge.

Observações para mantenedores
- Execute as migrations e seeds antes de revisar alterações que dependam do esquema do banco.
- Se adicionar novas variáveis de ambiente, atualize `backend/.env.example`.