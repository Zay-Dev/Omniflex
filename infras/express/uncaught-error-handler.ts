process.on('uncaughtException', error => {
  console.error(
    new Date(),
    `Uncaught Exception (${error?.message || 'N/a'}):`,
    error,
  );

  try {
    logger.error('Uncaught Exception', { error });
  } catch { }
});