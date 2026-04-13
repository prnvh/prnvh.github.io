function openClickableCard(card) {
  const href = card.dataset.href;
  if (!href) return;

  if (card.dataset.external === 'true') {
    window.open(href, '_blank', 'noopener');
    return;
  }

  window.location.href = href;
}

document.addEventListener('click', (event) => {
  const card = event.target.closest('[data-href]');
  if (!card) return;
  if (event.target.closest('a, button, input, textarea, select, label')) return;

  openClickableCard(card);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  const card = event.target.closest('[data-href]');
  if (!card || event.target !== card) return;

  event.preventDefault();
  openClickableCard(card);
});
