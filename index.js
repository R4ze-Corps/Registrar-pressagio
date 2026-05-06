import('./build/index.js')
  .then(() => console.log('Bot iniciado com sucesso!'))
  .catch(err => {
    console.error('Erro ao iniciar o bot:', err);
    process.exit(1);
  });
