export interface SherutMfeConfig {
  remoteUrl: string;
  scope: string;
  module: string;
}

// In production this would be a real API call:
// fetch(`/api/sherutim/${idntSheryut}/mfe-config`)
export async function getSherutMfeConfig(_idntSheryut: string): Promise<SherutMfeConfig> {
  await new Promise(r => setTimeout(r, 300));
  return {
    remoteUrl: 'http://localhost:3005/assets/remoteEntry.js',
    scope: 'mfe_sherut_exemplat',
    module: './App',
  };
}
