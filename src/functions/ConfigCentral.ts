import configJson from "../../ConfigCentral.json" with { type: "json" };

export interface ConfigCentral {
  canalRegistro: string;
  canalFarm: string;
  cargos: {
    aprovado: string;
    membroFarm: string;
    temporario: string;
  };
  keys: {
    active: string[];
    used: string[];
  };
}

export const configCentral = configJson as ConfigCentral;
