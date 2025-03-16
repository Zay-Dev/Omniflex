process.on('uncaughtException', error => {
  console.error(
    new Date(),
    `Uncaught Exception (${error?.message || 'N/a'}):`,
    error,
  );
});