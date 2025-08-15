// TODO: Sustituir por NextAuth o tu sistema de sesiones.
// De momento, permitir en local y bloquear en producción.
export const auth = {
  async requireAdmin() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Admin protegido: configura autenticación antes de publicar.');
    }
    return { user: { role: 'admin' as const } };
  },
};
