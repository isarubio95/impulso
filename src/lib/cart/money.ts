export const formatEUR = (v: number, opts: { cents?: boolean } = {}) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
    .format(opts.cents ? v / 100 : v);
