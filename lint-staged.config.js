module.exports = {
  '*.ts': [
    () => 'npm run check',
    'npm run lint',
    'npm run prettify',
    'npm run test:integration -- related --run',
  ],
}
